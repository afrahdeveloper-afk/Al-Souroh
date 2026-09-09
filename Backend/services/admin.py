from django.contrib import admin
from .models import Service


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('service_name', 'service_rank', 'service_priority')
    list_display_links = ('service_name',)
    list_editable = ('service_priority',)
    search_fields = ('service_name', 'service_name_ar')
