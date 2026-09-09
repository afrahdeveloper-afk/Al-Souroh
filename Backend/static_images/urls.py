from django.urls import path

from .views import (
    HomePageImagesView,
    AboutUsImagesView,
    ServicesPageImageView,
    ProjectsPageImageView,
    NewsPageImageView,
    ContactUsPageImageView,
)

urlpatterns = [
    path('home-page/', HomePageImagesView.as_view(), name='static-images-home-page'),
    path('about-us/', AboutUsImagesView.as_view(), name='static-images-about-us'),
    path('services/', ServicesPageImageView.as_view(), name='static-images-services'),
    path('projects/', ProjectsPageImageView.as_view(), name='static-images-projects'),
    path('news/', NewsPageImageView.as_view(), name='static-images-news'),
    path('contact-us/', ContactUsPageImageView.as_view(), name='static-images-contact-us'),
]
