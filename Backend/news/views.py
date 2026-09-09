from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticatedOrReadOnly

from .models import News
from .serializers import NewsSerializer


class NewsViewSet(viewsets.ModelViewSet):
    """
    CRUD endpoint for News.

    GET list/detail: Public.
    POST/PUT/PATCH/DELETE: Authenticated.

    Search by news_title or news_title_ar using ?search=...

    Results are ordered newest first.
    """
    queryset = News.objects.all()
    serializer_class = NewsSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['news_title', 'news_title_ar']
