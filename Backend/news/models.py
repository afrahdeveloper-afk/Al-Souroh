import os
from django.db import models

from core.validators import image_extension_validator


class News(models.Model):
    """Model representing a news article."""
    news_title = models.CharField(max_length=255)
    news_title_ar = models.CharField(max_length=255)

    news_description = models.TextField()
    news_description_ar = models.TextField()

    news_content = models.TextField()
    news_content_ar = models.TextField()

    news_img = models.ImageField(
        upload_to='news/',
        validators=[image_extension_validator],
    )

    is_featured = models.BooleanField(
        default=False,
        blank=True,
        verbose_name="Featured Article/News"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'News'
        verbose_name_plural = 'News'
        ordering = ['-created_at']

    def __str__(self):
        return self.news_title

    def save(self, *args, **kwargs):
        if self.is_featured:
            News.objects.filter(is_featured=True).exclude(pk=self.pk).update(is_featured=False)

        if self.pk:
            try:
                old = News.objects.get(pk=self.pk)
                if old.news_img and old.news_img != self.news_img:
                    if os.path.isfile(old.news_img.path):
                        os.remove(old.news_img.path)
            except News.DoesNotExist:
                pass
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        if self.news_img:
            if os.path.isfile(self.news_img.path):
                os.remove(self.news_img.path)
        super().delete(*args, **kwargs)
