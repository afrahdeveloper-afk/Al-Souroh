import os
from django.db import models
from django.core.exceptions import ValidationError

from core.validators import image_extension_validator


def service_image_path(instance, filename):
    """Upload path for service images."""
    ext = filename.rsplit('.', 1)[-1].lower()
    return f'services/{filename}'


def validate_list_of_strings(value):
    """Validate that the value is a list of strings."""
    if not isinstance(value, list):
        raise ValidationError('This field must be a list.')
    for item in value:
        if not isinstance(item, str):
            raise ValidationError('All items in the list must be strings.')
    if len(value) == 0:
        raise ValidationError('This field must contain at least one item.')


class Service(models.Model):
    """Model representing a service offered."""
    service_name = models.CharField(max_length=255)
    service_name_ar = models.CharField(max_length=255)

    service_description = models.TextField()
    service_description_ar = models.TextField()

    service_rank = models.CharField(max_length=255)
    service_rank_ar = models.CharField(max_length=255)

    service_priority = models.PositiveIntegerField(
        default=0,
        help_text='Controls the display order of this service in the frontend navbar list. Lower numbers appear first.',
    )

    service_problems = models.JSONField(validators=[validate_list_of_strings])
    service_problems_ar = models.JSONField(validators=[validate_list_of_strings])

    service_procedures = models.JSONField(validators=[validate_list_of_strings])
    service_procedures_ar = models.JSONField(validators=[validate_list_of_strings])

    img = models.ImageField(
        upload_to='services/',
        validators=[image_extension_validator],
    )

    class Meta:
        verbose_name = 'Service'
        verbose_name_plural = 'Services'
        ordering = ['service_priority', 'id']

    def __str__(self):
        return self.service_name

    def save(self, *args, **kwargs):
        if self.pk:
            try:
                old = Service.objects.get(pk=self.pk)
                if old.img and old.img != self.img:
                    if os.path.isfile(old.img.path):
                        os.remove(old.img.path)
            except Service.DoesNotExist:
                pass
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        if self.img:
            if os.path.isfile(self.img.path):
                os.remove(self.img.path)
        super().delete(*args, **kwargs)
