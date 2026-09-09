from django.db import models


class ContactUs(models.Model):
    """
    Singleton model for contact information.
    Only one record is allowed.
    """
    phone_number = models.CharField(max_length=50)
    whatsapp_number = models.CharField(max_length=50)
    google_map_link = models.CharField(max_length=500)
    email = models.CharField(max_length=255, null=True, blank=True)

    address = models.CharField(max_length=500)
    address_ar = models.CharField(max_length=500)

    work_days = models.CharField(max_length=255)
    work_days_ar = models.CharField(max_length=255, null=True, blank=True)

    work_hours = models.CharField(max_length=255)

    instagram_user = models.CharField(max_length=255)
    facebook_user = models.CharField(max_length=255)
    tiktok_user = models.CharField(max_length=255)

    class Meta:
        verbose_name = 'Contact Us'
        verbose_name_plural = 'Contact Us'

    def __str__(self):
        return 'Contact Us'

    def save(self, *args, **kwargs):
        existing = ContactUs.objects.first()
        if existing and existing.pk != self.pk:
            raise ValueError('Only one Contact Us record is allowed.')
        super().save(*args, **kwargs)
