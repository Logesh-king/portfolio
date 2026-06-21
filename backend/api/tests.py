from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework.authtoken.models import Token
from .models import AboutInfo, Skill, Project, Education, ContactMessage

class PortfolioAPITests(APITestCase):

    def setUp(self):
        # Create user accounts
        self.admin_user = User.objects.create_superuser(
            username='testadmin',
            email='admin@test.com',
            password='adminpassword'
        )
        self.admin_token = Token.objects.create(user=self.admin_user)
        
        # Seed test data
        self.about = AboutInfo.objects.create(
            full_name="Logesh M",
            heading="I AM AVAILABLE FOR FULL STACK DEVELOPMENT",
            bio="Bio summary.",
            projects_completed=10,
            years_experience=2
        )
        
        self.skill = Skill.objects.create(
            name="React JS",
            category="Outer",
            level=90,
            icon_class="fab fa-react"
        )
        
        self.project = Project.objects.create(
            title="Smart Life Analyzer",
            description="Analyzer app",
            tags="React, Django",
            status="Completed"
        )
        
        self.education = Education.objects.create(
            year_range="2023 - 2025",
            title="M.Sc CS",
            institution="Periyar University",
            grade="6.5 CGPA"
        )

    def test_get_about_info(self):
        url = reverse('about-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['full_name'], "Logesh M")

    def test_get_skills_list(self):
        url = reverse('skills-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], "React JS")

    def test_get_projects_list(self):
        url = reverse('projects-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_get_education_list(self):
        url = reverse('education-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_submit_contact_message(self):
        url = reverse('contact-list')
        data = {
            "name": "Jane Doe",
            "email": "jane@example.com",
            "subject": "Inquiry",
            "message": "This is a message containing more than ten characters."
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ContactMessage.objects.count(), 1)

    def test_submit_contact_message_spam_honeypot(self):
        # Submitting honeypot website field should return success but not save to DB
        url = reverse('contact-list')
        data = {
            "name": "Spam Bot",
            "email": "bot@spammer.com",
            "subject": "Buy bitcoin!",
            "message": "This is a spam message that should be silently ignored.",
            "website": "http://spambot.com"
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ContactMessage.objects.count(), 0)

    def test_get_contacts_unauthorized(self):
        # Normal public user should not be able to list contact messages
        url = reverse('contact-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_contacts_authorized(self):
        # Authenticated admin user should be able to list contact messages
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.admin_token.key)
        url = reverse('contact-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.client.credentials() # Reset credentials

    def test_create_skill_unauthorized(self):
        # Normal public user should not be able to create skills
        url = reverse('skills-list')
        data = {
            "name": "Ruby",
            "category": "General",
            "level": 60,
            "icon_class": "fas fa-gem"
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_skill_authorized(self):
        # Authenticated admin user should be able to create skills
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.admin_token.key)
        url = reverse('skills-list')
        data = {
            "name": "Ruby",
            "category": "General",
            "level": 60,
            "icon_class": "fas fa-gem"
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Skill.objects.count(), 2)
        self.client.credentials() # Reset credentials
