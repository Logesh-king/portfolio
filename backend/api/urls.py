from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AboutInfoViewSet, SkillViewSet, ProjectViewSet,
    EducationViewSet, ContactMessageViewSet
)

router = DefaultRouter()
# Registrations
router.register(r'about', AboutInfoViewSet, basename='about')
router.register(r'skills', SkillViewSet, basename='skills')
router.register(r'projects', ProjectViewSet, basename='projects')
router.register(r'education', EducationViewSet, basename='education')
router.register(r'contact', ContactMessageViewSet, basename='contact')

urlpatterns = [
    path('', include(router.urls)),
]
