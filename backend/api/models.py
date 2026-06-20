from django.db import models

class AboutInfo(models.Model):
    full_name = models.CharField(max_length=100, default="Logesh M")
    heading = models.CharField(max_length=200, default="I AM AVAILABLE FOR FULL STACK DEVELOPMENT")
    bio = models.TextField(default="Hi, I'm Logesh M. A passionate Full Stack Developer dedicated to creating visually appealing, accessible, and high-performance web applications.")
    profile_image = models.ImageField(upload_to='profile/', blank=True, null=True)
    resume_file = models.FileField(upload_to='resume/', blank=True, null=True)
    projects_completed = models.IntegerField(default=20)
    years_experience = models.IntegerField(default=1)
    passion_percentage = models.IntegerField(default=100)

    class Meta:
        verbose_name = "About Information"
        verbose_name_plural = "About Information"

    def __str__(self):
        return self.full_name


class Skill(models.Model):
    CATEGORY_CHOICES = [
        ('Core', 'Core'),
        ('Outer', 'Outer Circle (Wheel)'),
        ('Inner', 'Inner Circle (Wheel)'),
        ('General', 'General'),
    ]
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='General')
    level = models.IntegerField(default=80, help_text="Skill level percentage (0-100)")
    icon_class = models.CharField(max_length=100, help_text="FontAwesome class, e.g., 'fab fa-react'")
    icon_color = models.CharField(max_length=50, blank=True, null=True, help_text="Hex color or styling, e.g. '#61dafb'")
    angle = models.FloatField(default=0.0, help_text="Angle in degrees for orbit wheel")
    radius = models.FloatField(default=155.0, help_text="Radius in pixels for orbit wheel")
    description = models.CharField(max_length=255, blank=True, null=True, help_text="Short description of skill usage")

    def __str__(self):
        return f"{self.name} ({self.category})"


class Project(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    image = models.ImageField(upload_to='projects/', blank=True, null=True)
    tags = models.CharField(max_length=500, help_text="Comma-separated tags, e.g. 'React, Django, PostgreSQL'")
    features = models.CharField(max_length=500, blank=True, null=True, help_text="Comma-separated feature summary")
    techs_used = models.CharField(max_length=500, blank=True, null=True, help_text="Comma-separated backend/frontend techs used")
    status = models.CharField(max_length=50, default="Completed", help_text="e.g. 'Completed' or 'In Progress'")
    live_url = models.URLField(blank=True, null=True)
    github_url = models.URLField(blank=True, null=True)
    is_featured = models.BooleanField(default=False)
    order = models.IntegerField(default=0)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['order', 'id']


class Education(models.Model):
    year_range = models.CharField(max_length=50, help_text="e.g., '2023 - 2025'")
    title = models.CharField(max_length=200, help_text="e.g., 'M.Sc Computer Science'")
    institution = models.CharField(max_length=200, help_text="e.g., 'Periyar University'")
    grade = models.CharField(max_length=50, help_text="e.g., '6.5 CGPA'")
    grade_label = models.CharField(max_length=100, default="Graduation Index")
    progress_offset = models.FloatField(default=35.19, help_text="Radial bar offset SVG dashoffset (e.g. 35.19 for 6.5 CGPA out of 10)")

    class Meta:
        verbose_name_plural = "Education Timeline"

    def __str__(self):
        return f"{self.title} - {self.institution}"


class ContactMessage(models.Model):
    name = models.CharField(max_length=150)
    email = models.EmailField()
    subject = models.CharField(max_length=250)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message from {self.name} - {self.subject}"
