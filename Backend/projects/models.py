import os
import uuid
from django.db import models

from core.validators import image_extension_validator


class ProjectCategory(models.Model):
    """Model representing a project category."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category_name = models.CharField(max_length=255)
    category_name_ar = models.CharField(max_length=255)

    class Meta:
        verbose_name = 'Project Category'
        verbose_name_plural = 'Project Categories'
        ordering = ['category_name']

    def __str__(self):
        return self.category_name


class Project(models.Model):
    """Model representing a project."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    category = models.ForeignKey(
        ProjectCategory,
        on_delete=models.PROTECT,
        related_name='projects',
    )

    project_name = models.CharField(max_length=255)
    project_name_ar = models.CharField(max_length=255)

    car_model = models.CharField(max_length=255)

    date = models.DateField()

    project_description = models.TextField()
    project_description_ar = models.TextField()

    cover_img = models.ImageField(
        upload_to='projects/covers/',
        blank=True,
        null=True,
        validators=[image_extension_validator],
    )
    before_img = models.ImageField(
        upload_to='projects/before/',
        blank=True,
        null=True,
        validators=[image_extension_validator],
    )
    after_img = models.ImageField(
        upload_to='projects/after/',
        blank=True,
        null=True,
        validators=[image_extension_validator],
    )

    class Meta:
        verbose_name = 'Project'
        verbose_name_plural = 'Projects'
        ordering = ['-date']

    def __str__(self):
        return self.project_name

    def save(self, *args, **kwargs):
        if self.pk:
            try:
                old = Project.objects.get(pk=self.pk)
                for field_name in ('cover_img', 'before_img', 'after_img'):
                    old_file = getattr(old, field_name)
                    new_file = getattr(self, field_name)
                    if old_file and old_file != new_file:
                        if os.path.isfile(old_file.path):
                            os.remove(old_file.path)
            except Project.DoesNotExist:
                pass
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        for field_name in ('cover_img', 'before_img', 'after_img'):
            img = getattr(self, field_name)
            if img:
                if os.path.isfile(img.path):
                    os.remove(img.path)
        super().delete(*args, **kwargs)
