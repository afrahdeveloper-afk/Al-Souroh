from rest_framework import status
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema

from .models import (
    HomePageImages,
    AboutUsImages,
    ServicesPageImage,
    ProjectsPageImage,
    NewsPageImage,
    ContactUsPageImage,
)
from .serializers import (
    HomePageImagesSerializer,
    AboutUsImagesSerializer,
    ServicesPageImageSerializer,
    ProjectsPageImageSerializer,
    NewsPageImageSerializer,
    ContactUsPageImageSerializer,
)


class BaseSingletonImagesView(APIView):
    """
    Base singleton endpoint shared by every static-images group.

    GET: Retrieve the single record (public).
    PUT/PATCH: Update the record (authenticated).
    POST: Create the record if it doesn't exist (authenticated).
    DELETE: Delete the record (authenticated).
    """
    permission_classes = [IsAuthenticatedOrReadOnly]
    model = None
    serializer_class = None

    def get(self, request):
        instance = self.model.objects.first()
        if not instance:
            return Response({})
        serializer = self.serializer_class(instance, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        if self.model.objects.exists():
            return Response(
                {'detail': f'{self.model._meta.verbose_name} already exists. Use PUT or PATCH to update.'},
                status=status.HTTP_409_CONFLICT,
            )
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def put(self, request):
        instance = self.model.objects.first()
        if not instance:
            return Response(
                {'detail': f'{self.model._meta.verbose_name} has not been created yet. Use POST to create.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = self.serializer_class(instance, data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def patch(self, request):
        instance = self.model.objects.first()
        if not instance:
            return Response(
                {'detail': f'{self.model._meta.verbose_name} has not been created yet. Use POST to create.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = self.serializer_class(
            instance, data=request.data, partial=True, context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request):
        instance = self.model.objects.first()
        if not instance:
            return Response(
                {'detail': f'{self.model._meta.verbose_name} has not been created yet.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@extend_schema(tags=['Static Images'])
class HomePageImagesView(BaseSingletonImagesView):
    """Singleton endpoint for the home page's static images."""
    model = HomePageImages
    serializer_class = HomePageImagesSerializer


@extend_schema(tags=['Static Images'])
class AboutUsImagesView(BaseSingletonImagesView):
    """Singleton endpoint for the about-us page's static images."""
    model = AboutUsImages
    serializer_class = AboutUsImagesSerializer


@extend_schema(tags=['Static Images'])
class ServicesPageImageView(BaseSingletonImagesView):
    """Singleton endpoint for the services page's static image."""
    model = ServicesPageImage
    serializer_class = ServicesPageImageSerializer


@extend_schema(tags=['Static Images'])
class ProjectsPageImageView(BaseSingletonImagesView):
    """Singleton endpoint for the projects page's static image."""
    model = ProjectsPageImage
    serializer_class = ProjectsPageImageSerializer


@extend_schema(tags=['Static Images'])
class NewsPageImageView(BaseSingletonImagesView):
    """Singleton endpoint for the news page's static image."""
    model = NewsPageImage
    serializer_class = NewsPageImageSerializer


@extend_schema(tags=['Static Images'])
class ContactUsPageImageView(BaseSingletonImagesView):
    """Singleton endpoint for the contact-us page's static image."""
    model = ContactUsPageImage
    serializer_class = ContactUsPageImageSerializer
