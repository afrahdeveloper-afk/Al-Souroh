from rest_framework import status
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema

from .models import ContactUs
from .serializers import ContactUsSerializer


class ContactUsView(APIView):
    """
    Singleton endpoint for Contact Us information.

    GET: Retrieve the single record (public).
    PUT/PATCH: Update the record (authenticated).
    POST: Create the record if it doesn't exist (authenticated).
    DELETE: Delete the record (authenticated).
    """
    permission_classes = [IsAuthenticatedOrReadOnly]

    @extend_schema(
        responses={200: ContactUsSerializer},
        description='Retrieve the Contact Us record.',
    )
    def get(self, request):
        instance = ContactUs.objects.first()
        if not instance:
            return Response({})
        serializer = ContactUsSerializer(instance, context={'request': request})
        return Response(serializer.data)

    @extend_schema(
        request=ContactUsSerializer,
        responses={201: ContactUsSerializer},
        description='Create the Contact Us record. Only one record is allowed.',
    )
    def post(self, request):
        if ContactUs.objects.exists():
            return Response(
                {'detail': 'Contact Us already exists. Use PUT or PATCH to update.'},
                status=status.HTTP_409_CONFLICT,
            )
        serializer = ContactUsSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @extend_schema(
        request=ContactUsSerializer,
        responses={200: ContactUsSerializer},
        description='Fully update the Contact Us record.',
    )
    def put(self, request):
        instance = ContactUs.objects.first()
        if not instance:
            return Response(
                {'detail': 'Contact Us has not been created yet. Use POST to create.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = ContactUsSerializer(
            instance, data=request.data, context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @extend_schema(
        request=ContactUsSerializer,
        responses={200: ContactUsSerializer},
        description='Partially update the Contact Us record.',
    )
    def patch(self, request):
        instance = ContactUs.objects.first()
        if not instance:
            return Response(
                {'detail': 'Contact Us has not been created yet. Use POST to create.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = ContactUsSerializer(
            instance, data=request.data, partial=True, context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @extend_schema(
        responses={204: None},
        description='Delete the Contact Us record.',
    )
    def delete(self, request):
        instance = ContactUs.objects.first()
        if not instance:
            return Response(
                {'detail': 'Contact Us information has not been created yet.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
