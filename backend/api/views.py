from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import AboutInfo, Skill, Project, Education, ContactMessage
from .serializers import (
    AboutInfoSerializer, SkillSerializer, ProjectSerializer,
    EducationSerializer, ContactMessageSerializer
)
from rest_framework.decorators import action
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.exceptions import ValidationError
from rest_framework.authentication import TokenAuthentication, SessionAuthentication
import logging
import os
import threading
import requests

logger = logging.getLogger(__name__)


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff


class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        from django.contrib.auth.models import User
        data = request.data.copy()
        username_or_email = data.get('username')
        if username_or_email and '@' in username_or_email:
            user = User.objects.filter(email=username_or_email).first()
            if user:
                data['username'] = user.username

        serializer = self.serializer_class(data=data, context={'request': request})
        try:
            serializer.is_valid(raise_exception=True)
        except ValidationError as e:
            logger.warning(f"Auth validation error: {e.detail}")
            return Response(
                {"error": "Invalid username/email or password. Please try again."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'username': user.username,
            'email': user.email,
            'is_staff': user.is_staff
        })


class ContactMessagePermission(permissions.BasePermission):
    """
    POST (submit) is public. GET/PATCH/DELETE (inbox management) require staff.
    """
    def has_permission(self, request, view):
        if request.method == 'POST':
            return True
        return bool(request.user and request.user.is_staff)


class AboutInfoViewSet(viewsets.ModelViewSet):
    queryset = AboutInfo.objects.all()
    serializer_class = AboutInfoSerializer
    permission_classes = [IsAdminOrReadOnly]

    def list(self, request, *args, **kwargs):
        about = AboutInfo.objects.first()
        if not about:
            about = AboutInfo.objects.create(
                full_name="Logesh M",
                heading="I AM AVAILABLE FOR FULL STACK DEVELOPMENT",
                bio="Hi, I'm Logesh M. A passionate Full Stack Developer..."
            )
        serializer = self.get_serializer(about)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        if request.data.get('clear_profile_image') in ['true', True]:
            instance = self.get_object()
            if instance.profile_image:
                try:
                    if os.path.exists(instance.profile_image.path):
                        instance.profile_image.delete(save=False)
                except Exception:
                    pass
                instance.profile_image = None
                instance.save()
        return super().update(request, *args, **kwargs)


class SkillViewSet(viewsets.ModelViewSet):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [IsAdminOrReadOnly]


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAdminOrReadOnly]

    def update(self, request, *args, **kwargs):
        if request.data.get('clear_image') in ['true', True]:
            instance = self.get_object()
            if instance.image:
                try:
                    if os.path.exists(instance.image.path):
                        instance.image.delete(save=False)
                except Exception:
                    pass
                instance.image = None
                instance.save()
        return super().update(request, *args, **kwargs)



class EducationViewSet(viewsets.ModelViewSet):
    queryset = Education.objects.all()
    serializer_class = EducationSerializer
    permission_classes = [IsAdminOrReadOnly]


class ContactMessageViewSet(viewsets.ModelViewSet):
    queryset = ContactMessage.objects.all().order_by('-created_at')
    serializer_class = ContactMessageSerializer
    permission_classes = [ContactMessagePermission]
    # Allow BOTH token auth (API clients) and session auth (admin dashboard
    # logged in via Django session/browser). Token-only was likely blocking
    # your admin dashboard from ever authenticating to view the inbox.
    authentication_classes = [TokenAuthentication, SessionAuthentication]

    def get_queryset(self):
        qs = super().get_queryset()
        search = self.request.query_params.get('search')
        if search:
            from django.db.models import Q
            qs = qs.filter(
                Q(name__icontains=search) |
                Q(email__icontains=search) |
                Q(subject__icontains=search) |
                Q(message__icontains=search)
            )
        is_read = self.request.query_params.get('is_read')
        if is_read is not None:
            qs = qs.filter(is_read=is_read.lower() == 'true')
        return qs

    def create(self, request, *args, **kwargs):
        # Honeypot spam check
        honeypot = request.data.get('website', '')
        if honeypot:
            logger.warning(f"Spam submission blocked. Honeypot value: '{honeypot}'")
            return Response(
                {"message": "Message sent successfully!", "spam_blocked": True},
                status=status.HTTP_201_CREATED
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        logger.info(f"ContactMessage saved (id={instance.id}) from {instance.email}")

        threading.Thread(
            target=self._send_notification_email, args=(instance,), daemon=True
        ).start()

        return Response(
            {
                "message": "Message sent successfully.",
                "data": serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )

    def _send_notification_email(self, instance):
        from django.utils import timezone
        from django.conf import settings

        submission_time = timezone.now().strftime("%Y-%m-%d %H:%M:%S UTC")
        recipient_email = os.environ.get('RECIPIENT_EMAIL', 'ml69455737@gmail.com')
        api_key = getattr(settings, 'BREVO_API_KEY', None)

        if not api_key:
            logger.error("BREVO_API_KEY not set — cannot send notification email.")
            return

        html_content = (
            f"<h3>New Portfolio Contact Submission</h3>"
            f"<p><b>Name:</b> {instance.name}</p>"
            f"<p><b>Email:</b> {instance.email}</p>"
            f"<p><b>Subject:</b> {instance.subject}</p>"
            f"<p><b>Date &amp; Time:</b> {submission_time}</p>"
            f"<p><b>Message:</b><br>{instance.message}</p>"
        )
        payload = {
            "sender": {"name": "Portfolio Contact Form", "email": settings.EMAIL_HOST_USER},
            "to": [{"email": recipient_email}],
            "replyTo": {"email": instance.email, "name": instance.name},
            "subject": f"Portfolio Contact: {instance.subject}",
            "htmlContent": html_content,
        }

        try:
            resp = requests.post(
                "https://api.brevo.com/v3/smtp/email",
                json=payload,
                headers={"api-key": api_key, "Content-Type": "application/json"},
                timeout=10,  # fail fast — never hang the worker again
            )
            resp.raise_for_status()
            logger.info(f"Notification email sent via Brevo to {recipient_email}")
        except Exception as e:
            logger.exception(f"Email sending failed: {e}")


class PortfolioDataView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        about = AboutInfo.objects.first()
        if not about:
            about = AboutInfo.objects.create(
                full_name="Logesh M",
                heading="I AM AVAILABLE FOR FULL STACK DEVELOPMENT",
                bio="Hi, I'm Logesh M. A passionate Full Stack Developer..."
            )
        
        skills = Skill.objects.all()
        projects = Project.objects.all()
        education = Education.objects.all()

        about_serializer = AboutInfoSerializer(about, context={'request': request})
        skills_serializer = SkillSerializer(skills, many=True, context={'request': request})
        projects_serializer = ProjectSerializer(projects, many=True, context={'request': request})
        education_serializer = EducationSerializer(education, many=True, context={'request': request})

        response = Response({
            "about": about_serializer.data,
            "skills": skills_serializer.data,
            "projects": projects_serializer.data,
            "education": education_serializer.data
        })
        
        # Cache publicly for 60 seconds
        response['Cache-Control'] = 'public, max-age=60'
        return response