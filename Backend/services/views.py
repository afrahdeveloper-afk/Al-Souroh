from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticatedOrReadOnly

from .models import Service
from .serializers import ServiceSerializer


class ServiceViewSet(viewsets.ModelViewSet):
    """
    CRUD endpoint for Services.

    GET list/detail: Public.
    POST/PUT/PATCH/DELETE: Authenticated.

    Search by service_name or service_name_ar using ?search=...
    """
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['service_name', 'service_name_ar']
