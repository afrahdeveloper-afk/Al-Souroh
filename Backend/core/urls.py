"""
URL configuration for core project.
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
)

from .auth_views import LoginView, LogoutView, CurrentUserView, CSRFTokenView

urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/auth/login/', LoginView.as_view(), name='auth-login'),
    path('api/auth/logout/', LogoutView.as_view(), name='auth-logout'),
    path('api/auth/user/', CurrentUserView.as_view(), name='auth-user'),
    path('api/auth/csrf/', CSRFTokenView.as_view(), name='auth-csrf'),

    path('api/general-information/', include('general_information.urls')),
    path('api/services/', include('services.urls')),
    path('api/project-categories/', include('projects.urls_categories')),
    path('api/projects/', include('projects.urls_projects')),
    path('api/news/', include('news.urls')),
    path('api/contact-us/', include('contact_us.urls')),
    path('api/static-images/', include('static_images.urls')),

    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
