from rest_framework import serializers

from .models import (
    HomePageImages,
    AboutUsImages,
    ServicesPageImage,
    ProjectsPageImage,
    NewsPageImage,
    ContactUsPageImage,
)


class HomePageImagesSerializer(serializers.ModelSerializer):
    class Meta:
        model = HomePageImages
        fields = '__all__'


class AboutUsImagesSerializer(serializers.ModelSerializer):
    class Meta:
        model = AboutUsImages
        fields = '__all__'


class ServicesPageImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServicesPageImage
        fields = '__all__'


class ProjectsPageImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectsPageImage
        fields = '__all__'


class NewsPageImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsPageImage
        fields = '__all__'


class ContactUsPageImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactUsPageImage
        fields = '__all__'
