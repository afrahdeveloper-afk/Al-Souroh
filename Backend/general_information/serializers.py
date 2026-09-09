from rest_framework import serializers
from .models import GeneralInformation


class GeneralInformationSerializer(serializers.ModelSerializer):
    class Meta:
        model = GeneralInformation
        fields = '__all__'
