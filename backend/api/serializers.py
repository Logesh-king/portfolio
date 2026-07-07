from rest_framework import serializers
from django.conf import settings
from .models import AboutInfo, Skill, Project, Education, ContactMessage


def _build_absolute_url(relative_url):
    """
    Build an absolute URL for a media file using the configured BACKEND_URL.
    Falls back gracefully if the URL can't be built.
    """
    if not relative_url:
        return None
    # Already absolute
    if relative_url.startswith(('http://', 'https://')):
        return relative_url
    backend_url = getattr(settings, 'BACKEND_URL', 'http://127.0.0.1:8000').rstrip('/')
    # Ensure relative_url starts with /
    if not relative_url.startswith('/'):
        relative_url = '/' + relative_url
    return f"{backend_url}{relative_url}"


class AboutInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = AboutInfo
        fields = '__all__'

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        request = self.context.get('request')

        if instance.profile_image:
            try:
                url = instance.profile_image.url  # e.g. /media/profile/xyz.png
                if request:
                    ret['profile_image'] = request.build_absolute_uri(url)
                else:
                    ret['profile_image'] = _build_absolute_url(url)
            except (ValueError, AttributeError):
                ret['profile_image'] = None

        if instance.resume_file:
            try:
                url = instance.resume_file.url
                if request:
                    ret['resume_file'] = request.build_absolute_uri(url)
                else:
                    ret['resume_file'] = _build_absolute_url(url)
            except (ValueError, AttributeError):
                ret['resume_file'] = None

        return ret


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = '__all__'


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        request = self.context.get('request')

        if instance.image:
            try:
                url = instance.image.url  # e.g. /media/projects/xyz.png
                if request:
                    ret['image'] = request.build_absolute_uri(url)
                else:
                    ret['image'] = _build_absolute_url(url)
            except (ValueError, AttributeError):
                ret['image'] = None

        return ret


class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = '__all__'


class ContactMessageSerializer(serializers.ModelSerializer):
    message = serializers.CharField(min_length=10)
    class Meta:
        model = ContactMessage
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'is_read']
