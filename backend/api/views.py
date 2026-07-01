from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import AboutInfo, Skill, Project, Education, ContactMessage
from .serializers import (
    AboutInfoSerializer, SkillSerializer, ProjectSerializer,
    EducationSerializer, ContactMessageSerializer
)
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.exceptions import ValidationError
from rest_framework.authentication import TokenAuthentication

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow admin users to edit objects.
    GET requests are allowed for anyone.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff


class CustomAuthToken(ObtainAuthToken):
    """
    Custom authentication token view to provide detailed error messages
    and return user info along with the token. Supports email login.
    """
    def post(self, request, *args, **kwargs):
        from django.contrib.auth.models import User
        data = request.data.copy()
        username_or_email = data.get('username')
        if username_or_email and '@' in username_or_email:
            # Look up user by email
            user = User.objects.filter(email=username_or_email).first()
            if user:
                data['username'] = user.username

        serializer = self.serializer_class(data=data, context={'request': request})
        try:
            serializer.is_valid(raise_exception=True)
        except ValidationError as e:
            print("Validation Error:", e.detail)
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
    Custom permission for contact form submission.
    POST requests (submitting messages) are public.
    GET and DELETE requests (reading and clearing messages) require admin login.
    """
    def has_permission(self, request, view):
        if request.method == 'POST':
            return True
        return request.user and request.user.is_staff


class AboutInfoViewSet(viewsets.ModelViewSet):
    queryset = AboutInfo.objects.all()
    serializer_class = AboutInfoSerializer
    permission_classes = [IsAdminOrReadOnly]

    # Helper method to get the singleton AboutInfo or create one if it doesn't exist
    def list(self, request, *args, **kwargs):
        about = AboutInfo.objects.first()
        if not about:
            about = AboutInfo.objects.create(
                full_name="Logesh M",
                heading="I AM AVAILABLE FOR FULL STACK DEVELOPMENT",
                bio="Hi, I'm Logesh M. A passionate Full Stack Developer dedicated to creating visually appealing, accessible, and high-performance web applications."
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
    authentication_classes = [TokenAuthentication]

    def create(self, request, *args, **kwargs):
        # Honeypot spam check: bots will autofill hidden fields like 'website'
        honeypot = request.data.get('website', '')
        if honeypot:
            # Silently ignore spam submission and return success status code
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"Spam submission blocked. Honeypot value: '{honeypot}'")
            return Response(
                {"detail": "Message sent successfully!", "spam_blocked": True},
                status=status.HTTP_201_CREATED
            )
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        instance = serializer.save()
        
        # Get submission details and configure email
        from django.utils import timezone
        from django.core.mail import send_mail
        from django.conf import settings
        import logging
        import threading
        
        logger = logging.getLogger(__name__)
        logger.info(f"ContactMessage successfully saved in database for sender: {instance.email}")
        
        submission_time = timezone.now().strftime("%Y-%m-%d %H:%M:%S UTC")
        email_subject = f"Portfolio Contact: {instance.subject}"
        email_body = (
            f"You have received a new contact form submission from your portfolio.\n\n"
            f"Sender Details:\n"
            f"--------------------------------------------------\n"
            f"Name:         {instance.name}\n"
            f"Email:        {instance.email}\n"
            f"Subject:      {instance.subject}\n"
            f"Date & Time:  {submission_time}\n"
            f"--------------------------------------------------\n\n"
            f"Message:\n"
            f"--------------------------------------------------\n"
            f"{instance.message}\n"
            f"--------------------------------------------------\n"
        )
        
        recipient_email = "ml69455737@gmail.com"
        from_email = getattr(settings, 'EMAIL_HOST_USER', '') or 'noreply@portfolio.com'
        
        def send_email_async(subject, message, sender, recipients):
            try:
                send_mail(
                    subject=subject,
                    message=message,
                    from_email=sender,
                    recipient_list=recipients,
                    fail_silently=False,
                )
                logger.info(f"Successfully sent contact email to {recipients} in background thread.")
            except Exception as e:
                logger.error(f"Failed to send email to {recipients} in background thread: {e}")

        # Start background thread to avoid blocking HTTP response
        email_thread = threading.Thread(
            target=send_email_async,
            args=(email_subject, email_body, from_email, [recipient_email])
        )
        email_thread.daemon = True
        email_thread.start()
