import os
import uuid
from django.db import models

from core.validators import image_extension_validator


def _static_image_path(prefix, filename):
    """
    Shared upload-path builder. A unique suffix per upload (not a fixed
    name) so the stored URL always changes on replacement — otherwise
    browsers/CDNs cache the old image at the same URL and never pick up
    the new one.
    """
    ext = filename.rsplit('.', 1)[-1].lower()
    return f'static_images/{prefix}_{uuid.uuid4().hex[:10]}.{ext}'


def home_first_step_image_path(instance, filename):
    return _static_image_path('home_first_step', filename)


def home_second_step_image_path(instance, filename):
    return _static_image_path('home_second_step', filename)


def home_third_step_image_path(instance, filename):
    return _static_image_path('home_third_step', filename)


def home_fourth_step_image_path(instance, filename):
    return _static_image_path('home_fourth_step', filename)


def home_story_image_path(instance, filename):
    return _static_image_path('home_story', filename)


def home_case_study_before_image_path(instance, filename):
    return _static_image_path('home_case_study_before', filename)


def home_case_study_after_image_path(instance, filename):
    return _static_image_path('home_case_study_after', filename)


def home_process_image_first_path(instance, filename):
    return _static_image_path('home_process_first', filename)


def home_process_image_second_path(instance, filename):
    return _static_image_path('home_process_second', filename)


def home_process_image_third_path(instance, filename):
    return _static_image_path('home_process_third', filename)


def home_process_image_fourth_path(instance, filename):
    return _static_image_path('home_process_fourth', filename)


def home_process_image_fifth_path(instance, filename):
    return _static_image_path('home_process_fifth', filename)


def home_process_image_sixth_path(instance, filename):
    return _static_image_path('home_process_sixth', filename)


def home_end_image_path(instance, filename):
    return _static_image_path('home_end', filename)


def about_main_image_path(instance, filename):
    return _static_image_path('about_main', filename)


def about_center_image_first_path(instance, filename):
    return _static_image_path('about_center_first', filename)


def about_center_image_second_path(instance, filename):
    return _static_image_path('about_center_second', filename)


def about_center_image_third_path(instance, filename):
    return _static_image_path('about_center_third', filename)


def about_center_image_fourth_path(instance, filename):
    return _static_image_path('about_center_fourth', filename)


def services_main_image_path(instance, filename):
    return _static_image_path('services_main', filename)


def projects_main_image_path(instance, filename):
    return _static_image_path('projects_main', filename)


def news_main_image_path(instance, filename):
    return _static_image_path('news_main', filename)


def contact_us_main_image_path(instance, filename):
    return _static_image_path('contact_us_main', filename)


class SingletonImageModel(models.Model):
    """
    Base for singleton models that only hold ImageFields: only one record
    is allowed, and replacing/deleting an image cleans up the old file.
    """

    class Meta:
        abstract = True

    def _image_field_names(self):
        return [f.name for f in self._meta.get_fields() if isinstance(f, models.ImageField)]

    def save(self, *args, **kwargs):
        existing = self.__class__.objects.first()
        if existing and existing.pk != self.pk:
            raise ValueError(f'Only one {self.__class__.__name__} record is allowed.')

        old_paths = []
        if self.pk:
            try:
                old = self.__class__.objects.get(pk=self.pk)
                for name in self._image_field_names():
                    old_file = getattr(old, name)
                    new_file = getattr(self, name)
                    if old_file and old_file.name != (new_file.name if new_file else None):
                        old_paths.append(old_file.path)
            except self.__class__.DoesNotExist:
                pass

        super().save(*args, **kwargs)

        for path in old_paths:
            if os.path.isfile(path):
                try:
                    os.remove(path)
                except OSError:
                    pass

    def delete(self, *args, **kwargs):
        paths = []
        for name in self._image_field_names():
            f = getattr(self, name)
            if f:
                paths.append(f.path)
        super().delete(*args, **kwargs)
        for path in paths:
            if os.path.isfile(path):
                try:
                    os.remove(path)
                except OSError:
                    pass


class HomePageImages(SingletonImageModel):
    """Singleton holding every static image used on the home page."""

    first_step_image = models.ImageField(
        upload_to=home_first_step_image_path,
        validators=[image_extension_validator],
    )
    second_step_image = models.ImageField(
        upload_to=home_second_step_image_path,
        validators=[image_extension_validator],
    )
    third_step_image = models.ImageField(
        upload_to=home_third_step_image_path,
        validators=[image_extension_validator],
    )
    fourth_step_image = models.ImageField(
        upload_to=home_fourth_step_image_path,
        validators=[image_extension_validator],
    )

    story_image = models.ImageField(
        upload_to=home_story_image_path,
        validators=[image_extension_validator],
    )

    case_study_before_image = models.ImageField(
        upload_to=home_case_study_before_image_path,
        validators=[image_extension_validator],
    )
    case_study_after_image = models.ImageField(
        upload_to=home_case_study_after_image_path,
        validators=[image_extension_validator],
    )

    process_image_first = models.ImageField(
        upload_to=home_process_image_first_path,
        validators=[image_extension_validator],
    )
    process_image_second = models.ImageField(
        upload_to=home_process_image_second_path,
        validators=[image_extension_validator],
    )
    process_image_third = models.ImageField(
        upload_to=home_process_image_third_path,
        validators=[image_extension_validator],
    )
    process_image_fourth = models.ImageField(
        upload_to=home_process_image_fourth_path,
        validators=[image_extension_validator],
    )
    process_image_fifth = models.ImageField(
        upload_to=home_process_image_fifth_path,
        validators=[image_extension_validator],
    )
    process_image_sixth = models.ImageField(
        upload_to=home_process_image_sixth_path,
        validators=[image_extension_validator],
    )

    end_image = models.ImageField(
        upload_to=home_end_image_path,
        validators=[image_extension_validator],
    )

    class Meta:
        verbose_name = 'Home Page Images'
        verbose_name_plural = 'Home Page Images'

    def __str__(self):
        return 'Home Page Images'


class AboutUsImages(SingletonImageModel):
    """Singleton holding every static image used on the about-us page."""

    main_image = models.ImageField(
        upload_to=about_main_image_path,
        validators=[image_extension_validator],
    )

    center_image_first = models.ImageField(
        upload_to=about_center_image_first_path,
        validators=[image_extension_validator],
    )
    center_image_second = models.ImageField(
        upload_to=about_center_image_second_path,
        validators=[image_extension_validator],
    )
    center_image_third = models.ImageField(
        upload_to=about_center_image_third_path,
        validators=[image_extension_validator],
    )
    center_image_fourth = models.ImageField(
        upload_to=about_center_image_fourth_path,
        validators=[image_extension_validator],
    )

    class Meta:
        verbose_name = 'About Us Images'
        verbose_name_plural = 'About Us Images'

    def __str__(self):
        return 'About Us Images'


class ServicesPageImage(SingletonImageModel):
    """Singleton holding the static image used on the services page."""

    main_image = models.ImageField(
        upload_to=services_main_image_path,
        validators=[image_extension_validator],
    )

    class Meta:
        verbose_name = 'Services Page Image'
        verbose_name_plural = 'Services Page Image'

    def __str__(self):
        return 'Services Page Image'


class ProjectsPageImage(SingletonImageModel):
    """Singleton holding the static image used on the projects page."""

    main_image = models.ImageField(
        upload_to=projects_main_image_path,
        validators=[image_extension_validator],
    )

    class Meta:
        verbose_name = 'Projects Page Image'
        verbose_name_plural = 'Projects Page Image'

    def __str__(self):
        return 'Projects Page Image'


class NewsPageImage(SingletonImageModel):
    """Singleton holding the static image used on the news page."""

    main_image = models.ImageField(
        upload_to=news_main_image_path,
        validators=[image_extension_validator],
    )

    class Meta:
        verbose_name = 'News Page Image'
        verbose_name_plural = 'News Page Image'

    def __str__(self):
        return 'News Page Image'


class ContactUsPageImage(SingletonImageModel):
    """Singleton holding the static image used on the contact-us page."""

    main_image = models.ImageField(
        upload_to=contact_us_main_image_path,
        validators=[image_extension_validator],
    )

    class Meta:
        verbose_name = 'Contact Us Page Image'
        verbose_name_plural = 'Contact Us Page Image'

    def __str__(self):
        return 'Contact Us Page Image'
