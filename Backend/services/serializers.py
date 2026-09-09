from rest_framework import serializers
from .models import Service


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = '__all__'

    def validate_service_problems(self, value):
        """Ensure service_problems is a list of strings."""
        if not isinstance(value, list):
            raise serializers.ValidationError('This field must be a list.')
        for item in value:
            if not isinstance(item, str):
                raise serializers.ValidationError('All items in the list must be strings.')
        if len(value) == 0:
            raise serializers.ValidationError('This field must contain at least one item.')
        return value

    def validate_service_problems_ar(self, value):
        """Ensure service_problems_ar is a list of strings."""
        if not isinstance(value, list):
            raise serializers.ValidationError('This field must be a list.')
        for item in value:
            if not isinstance(item, str):
                raise serializers.ValidationError('All items in the list must be strings.')
        if len(value) == 0:
            raise serializers.ValidationError('This field must contain at least one item.')
        return value

    def validate_service_procedures(self, value):
        """Ensure service_procedures is a list of strings."""
        if not isinstance(value, list):
            raise serializers.ValidationError('This field must be a list.')
        for item in value:
            if not isinstance(item, str):
                raise serializers.ValidationError('All items in the list must be strings.')
        if len(value) == 0:
            raise serializers.ValidationError('This field must contain at least one item.')
        return value

    def validate_service_procedures_ar(self, value):
        """Ensure service_procedures_ar is a list of strings."""
        if not isinstance(value, list):
            raise serializers.ValidationError('This field must be a list.')
        for item in value:
            if not isinstance(item, str):
                raise serializers.ValidationError('All items in the list must be strings.')
        if len(value) == 0:
            raise serializers.ValidationError('This field must contain at least one item.')
        return value
