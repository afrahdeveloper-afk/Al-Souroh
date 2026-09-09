from rest_framework import status
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema

from .models import GeneralInformation
from .serializers import GeneralInformationSerializer


class GeneralInformationView(APIView):
    """
    Singleton endpoint for General Information.

    GET: Retrieve the single record (public).
    PUT/PATCH: Update the record (authenticated).
    POST: Create the record if it doesn't exist (authenticated).
    DELETE: Delete the record (authenticated).
    """
    permission_classes = [IsAuthenticatedOrReadOnly]

    @extend_schema(
        responses={200: GeneralInformationSerializer},
        description='Retrieve the General Information record.',
    )
    def get(self, request):
        instance = GeneralInformation.objects.first()
        if not instance:
            return Response({})
        serializer = GeneralInformationSerializer(instance, context={'request': request})
        return Response(serializer.data)

    @extend_schema(
        request={'multipart/form-data': GeneralInformationSerializer},
        responses={201: GeneralInformationSerializer},
        description='Create the General Information record. Only one record is allowed.',
    )
    def post(self, request):
        if GeneralInformation.objects.exists():
            return Response(
                {'detail': 'General Information already exists. Use PUT or PATCH to update.'},
                status=status.HTTP_409_CONFLICT,
            )
        serializer = GeneralInformationSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @extend_schema(
        request={'multipart/form-data': GeneralInformationSerializer},
        responses={200: GeneralInformationSerializer},
        description='Fully update the General Information record.',
    )
    def put(self, request):
        instance = GeneralInformation.objects.first()
        if not instance:
            return Response(
                {'detail': 'General Information has not been created yet. Use POST to create.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = GeneralInformationSerializer(
            instance, data=request.data, context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @extend_schema(
        request={'multipart/form-data': GeneralInformationSerializer},
        responses={200: GeneralInformationSerializer},
        description='Partially update the General Information record.',
    )
    def patch(self, request):
        instance = GeneralInformation.objects.first()
        if not instance:
            return Response(
                {'detail': 'General Information has not been created yet. Use POST to create.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = GeneralInformationSerializer(
            instance, data=request.data, partial=True, context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @extend_schema(
        responses={204: None},
        description='Delete the General Information record.',
    )
    def delete(self, request):
        instance = GeneralInformation.objects.first()
        if not instance:
            return Response(
                {'detail': 'General Information has not been created yet.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
