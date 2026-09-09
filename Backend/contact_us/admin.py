from django.contrib import admin
from .models import ContactUs


@admin.register(ContactUs)
class ContactUsAdmin(admin.ModelAdmin):
    list_display = ('phone_number', 'whatsapp_number', 'email', 'address', 'work_days', 'work_days_ar', 'work_hours', 'instagram_user', 'facebook_user', 'tiktok_user')

    def has_add_permission(self, request):
        if ContactUs.objects.exists():
            return False
        return super().has_add_permission(request)
