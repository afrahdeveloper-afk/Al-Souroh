from django.contrib import admin
from .models import ProjectCategory, Project


@admin.register(ProjectCategory)
class ProjectCategoryAdmin(admin.ModelAdmin):
    list_display = ('category_name', 'category_name_ar')
    search_fields = ('category_name', 'category_name_ar')


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('project_name', 'category', 'car_model', 'date')
    list_filter = ('category', 'date')
    search_fields = ('project_name', 'project_name_ar', 'car_model')
