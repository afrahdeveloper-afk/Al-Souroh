from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers


class LoginView(APIView):
    """
    Login endpoint for session authentication.

    POST with username and password to obtain a session cookie.
    The response also includes a CSRF token that must be sent
    as the X-CSRFToken header on subsequent write requests.
    """
    permission_classes = [AllowAny]

    @extend_schema(
        request=inline_serializer(
            name='LoginRequest',
            fields={
                'username': serializers.CharField(),
                'password': serializers.CharField(),
            },
        ),
        responses={
            200: inline_serializer(
                name='LoginResponse',
                fields={
                    'detail': serializers.CharField(),
                    'user': inline_serializer(
                        name='UserInfo',
                        fields={
                            'id': serializers.IntegerField(),
                            'username': serializers.CharField(),
                        },
                    ),
                    'csrftoken': serializers.CharField(),
                },
            ),
            400: inline_serializer(
                name='LoginError',
                fields={'detail': serializers.CharField()},
            ),
        },
        description='Authenticate with username and password. Returns session cookie and CSRF token.',
    )
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response(
                {'detail': 'Username and password are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = authenticate(request, username=username, password=password)

        if user is None:
            return Response(
                {'detail': 'Invalid credentials.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        login(request, user)
        csrf_token = get_token(request)

        return Response({
            'detail': 'Login successful.',
            'user': {
                'id': user.id,
                'username': user.username,
            },
            'csrftoken': csrf_token,
        })


class LogoutView(APIView):
    """Logout endpoint. Clears the session."""
    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=None,
        responses={200: inline_serializer(
            name='LogoutResponse',
            fields={'detail': serializers.CharField()},
        )},
        description='Logout the current user and clear the session.',
    )
    def post(self, request):
        logout(request)
        return Response({'detail': 'Logout successful.'})


class CurrentUserView(APIView):
    """Returns the currently authenticated user's information."""
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={200: inline_serializer(
            name='CurrentUserResponse',
            fields={
                'id': serializers.IntegerField(),
                'username': serializers.CharField(),
            },
        )},
        description='Get the currently authenticated user.',
    )
    def get(self, request):
        return Response({
            'id': request.user.id,
            'username': request.user.username,
        })


class CSRFTokenView(APIView):
    """
    Endpoint to obtain a CSRF token.
    The frontend should call this before making any write requests.
    """
    permission_classes = [AllowAny]

    @extend_schema(
        responses={200: inline_serializer(
            name='CSRFTokenResponse',
            fields={'csrftoken': serializers.CharField()},
        )},
        description='Get a CSRF token for use in write requests.',
    )
    def get(self, request):
        csrf_token = get_token(request)
        return Response({'csrftoken': csrf_token})
