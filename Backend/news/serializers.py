from rest_framework import serializers
from .models import News


class NewsSerializer(serializers.ModelSerializer):
    class Meta:
        model = News
        fields = [
            'id', 'news_title', 'news_title_ar',
            'news_description', 'news_description_ar',
            'news_content', 'news_content_ar',
            'news_img', 'is_featured',
        ]
