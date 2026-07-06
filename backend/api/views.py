from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
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


class SkillViewSet(viewsets.ModelViewSet):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [IsAdminOrReadOnly]


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAdminOrReadOnly]


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
        target=self._send_notification_email,
        args=(instance,),
        daemon=True,
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
        from django.core.mail import send_mail
        from django.conf import settings

        submission_time = timezone.now().strftime("%Y-%m-%d %H:%M:%S UTC")
        email_subject = f"Portfolio Contact: {instance.subject}"
        email_body = (
            f"You have received a new contact form submission from your portfolio.\n\n"
            f"Name:         {instance.name}\n"
            f"Email:        {instance.email}\n"
            f"Subject:      {instance.subject}\n"
            f"Date & Time:  {submission_time}\n\n"
            f"Message:\n{instance.message}\n"
        )
        recipient_email = os.environ.get(
            "RECIPIENT_EMAIL",
            settings.EMAIL_HOST_USER
        )
        logger.info(f"Sending email from: {settings.DEFAULT_FROM_EMAIL}")
        logger.info(f"Sending email to: {recipient_email}")
        try:
            send_mail(
                subject=email_subject,
                message=email_body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[settings.RECIPIENT_EMAIL] if hasattr(settings, "RECIPIENT_EMAIL") else [recipient_email],
                fail_silently=False,
            )
            logger.info(f"Notification email sent to {recipient_email}")
        except Exception as e:
            # Never let email failure break the API response — the message
            # is already saved. Log it so you can see WHY in Render logs.
            logger.exception(f"Email sending failed: {e}")

    @action(detail=True, methods=['patch'], permission_classes=[ContactMessagePermission])
    def toggle_read(self, request, pk=None):
        msg = self.get_object()
        msg.is_read = not msg.is_read
        msg.save(update_fields=['is_read'])
        return Response(ContactMessageSerializer(msg).data)     