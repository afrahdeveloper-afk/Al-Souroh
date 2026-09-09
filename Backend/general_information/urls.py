from django.urls import path
from .views import GeneralInformationView

urlpatterns = [
    path('', GeneralInformationView.as_view(), name='general-information'),
]
