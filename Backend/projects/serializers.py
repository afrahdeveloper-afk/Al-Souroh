from rest_framework import serializers
from .models import ProjectCategory, Project


class ProjectCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectCategory
        fields = '__all__'


class ProjectSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.category_name', read_only=True)
    category_name_ar = serializers.CharField(source='category.category_name_ar', read_only=True)

    class Meta:
        model = Project
        fields = '__all__'
