from django.contrib import admin

from .models import (
    HomePageImages,
    AboutUsImages,
    ServicesPageImage,
    ProjectsPageImage,
    NewsPageImage,
    ContactUsPageImage,
)


class SingletonAdminMixin:
    def has_add_permission(self, request):
        if self.model.objects.exists():
            return False
        return super().has_add_permission(request)


@admin.register(HomePageImages)
class HomePageImagesAdmin(SingletonAdminMixin, admin.ModelAdmin):
    pass


@admin.register(AboutUsImages)
class AboutUsImagesAdmin(SingletonAdminMixin, admin.ModelAdmin):
    pass


@admin.register(ServicesPageImage)
class ServicesPageImageAdmin(SingletonAdminMixin, admin.ModelAdmin):
    pass


@admin.register(ProjectsPageImage)
class ProjectsPageImageAdmin(SingletonAdminMixin, admin.ModelAdmin):
    pass


@admin.register(NewsPageImage)
class NewsPageImageAdmin(SingletonAdminMixin, admin.ModelAdmin):
    pass


@admin.register(ContactUsPageImage)
class ContactUsPageImageAdmin(SingletonAdminMixin, admin.ModelAdmin):
    pass
