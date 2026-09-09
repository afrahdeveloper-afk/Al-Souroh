from django.contrib import admin
from .models import GeneralInformation


@admin.register(GeneralInformation)
class GeneralInformationAdmin(admin.ModelAdmin):
    list_display = ('main_title', 'second_title')

    def has_add_permission(self, request):
        if GeneralInformation.objects.exists():
            return False
        return super().has_add_permission(request)
