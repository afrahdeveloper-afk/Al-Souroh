from django.contrib import admin
from .models import News


@admin.register(News)
class NewsAdmin(admin.ModelAdmin):
    list_display = ('news_title', 'is_featured', 'created_at')
    list_editable = ('is_featured',)
    search_fields = ('news_title', 'news_title_ar')
    ordering = ('-created_at',)
