from rest_framework import viewsets, filters, status
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from django.db.models import ProtectedError

from .models import ProjectCategory, Project
from .serializers import ProjectCategorySerializer, ProjectSerializer


class ProjectCategoryViewSet(viewsets.ModelViewSet):
    """
    CRUD endpoint for Project Categories.

    GET list/detail: Public.
    POST/PUT/PATCH/DELETE: Authenticated.

    Search by category_name or category_name_ar using ?search=...

    A category cannot be deleted if it has associated projects (PROTECT).
    """
    queryset = ProjectCategory.objects.all()
    serializer_class = ProjectCategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['category_name', 'category_name_ar']

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            instance.delete()
        except ProtectedError:
            return Response(
                {
                    'detail': (
                        f'Cannot delete category "{instance.category_name}" because '
                        f'it still has associated projects. Remove or reassign all '
                        f'projects in this category first.'
                    )
                },
                status=status.HTTP_409_CONFLICT,
            )
        return Response(status=status.HTTP_204_NO_CONTENT)


class ProjectViewSet(viewsets.ModelViewSet):
    """
    CRUD endpoint for Projects.

    GET list/detail: Public.
    POST/PUT/PATCH/DELETE: Authenticated.

    Search by project_name or project_name_ar using ?search=...
    """
    queryset = Project.objects.select_related('category').all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['project_name', 'project_name_ar']
