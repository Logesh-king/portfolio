from django.contrib import admin
from .models import AboutInfo, Skill, Project, Education, ContactMessage

@admin.register(AboutInfo)
class AboutInfoAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'heading', 'projects_completed', 'years_experience')
    
    # Restrict creation to only one entry
    def has_add_permission(self, request):
        if AboutInfo.objects.exists():
            return False
        return True


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'level', 'icon_class', 'angle', 'radius')
    list_filter = ('category',)
    search_fields = ('name', 'category')


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'status', 'is_featured', 'order')
    list_filter = ('status', 'is_featured')
    search_fields = ('title', 'tags', 'techs_used')
    list_editable = ('order', 'is_featured', 'status')


@admin.register(Education)
class EducationAdmin(admin.ModelAdmin):
    list_display = ('title', 'institution', 'year_range', 'grade')
    search_fields = ('title', 'institution')


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'subject', 'created_at')
    readonly_fields = ('name', 'email', 'subject', 'message', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('name', 'email', 'subject', 'message')
    
    # Restrict changing of contact messages - they should only be read or deleted
    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
