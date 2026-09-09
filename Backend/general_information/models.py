import os
import uuid
from django.db import models

from core.validators import image_with_gif_extension_validator


def general_info_image_path(instance, filename):
    """
    Upload path for general information hero image.
    A unique suffix per upload (not a fixed name) so the stored URL always
    changes on replacement — otherwise browsers/CDNs cache the old image at
    the same URL and never pick up the new one.
    """
    ext = filename.rsplit(".", 1)[-1].lower()
    return f"general_information/hero_img_{uuid.uuid4().hex[:10]}.{ext}"


class GeneralInformation(models.Model):
    """
    Singleton model for the site's general information.
    Only one record is allowed.
    """

    main_title = models.CharField(max_length=255)
    main_title_ar = models.CharField(max_length=255)

    second_title = models.CharField(max_length=255)
    second_title_ar = models.CharField(max_length=255)

    description = models.TextField()
    description_ar = models.TextField()

    hero_img = models.ImageField(
        upload_to=general_info_image_path,
        validators=[image_with_gif_extension_validator],
    )

    class Meta:
        verbose_name = "General Information"
        verbose_name_plural = "General Information"

    def __str__(self):
        return self.main_title

    def save(self, *args, **kwargs):
        existing = GeneralInformation.objects.first()
        if existing and existing.pk != self.pk:
            raise ValueError("Only one General Information record is allowed.")

        old_image_path = None
        if self.pk:
            try:
                old = GeneralInformation.objects.get(pk=self.pk)
                if old.hero_img and old.hero_img.name != self.hero_img.name:
                    old_image_path = old.hero_img.path
            except GeneralInformation.DoesNotExist:
                pass

        super().save(*args, **kwargs)

        if old_image_path and os.path.isfile(old_image_path):
            try:
                os.remove(old_image_path)
            except OSError:
                pass

    def delete(self, *args, **kwargs):
        image_path = self.hero_img.path if self.hero_img else None
        super().delete(*args, **kwargs)
        if image_path and os.path.isfile(image_path):
            try:
                os.remove(image_path)
            except OSError:
                pass
