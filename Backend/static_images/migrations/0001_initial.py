
import django.core.validators
import static_images.models
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='AboutUsImages',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('main_image', models.ImageField(upload_to=static_images.models.about_main_image_path, validators=[django.core.validators.FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'webp', 'avif'])])),
                ('center_image_first', models.ImageField(upload_to=static_images.models.about_center_image_first_path, validators=[django.core.validators.FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'webp', 'avif'])])),
                ('center_image_second', models.ImageField(upload_to=static_images.models.about_center_image_second_path, validators=[django.core.validators.FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'webp', 'avif'])])),
                ('center_image_third', models.ImageField(upload_to=static_images.models.about_center_image_third_path, validators=[django.core.validators.FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'webp', 'avif'])])),
                ('center_image_fourth', models.ImageField(upload_to=static_images.models.about_center_image_fourth_path, validators=[django.core.validators.FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'webp', 'avif'])])),
            ],
            options={
                'verbose_name': 'About Us Images',
                'verbose_name_plural': 'About Us Images',
            },
        ),
        migrations.CreateModel(
            name='ContactUsPageImage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('main_image', models.ImageField(upload_to=static_images.models.contact_us_main_image_path, validators=[django.core.validators.FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'webp', 'avif'])])),
            ],
            options={
                'verbose_name': 'Contact Us Page Image',
                'verbose_name_plural': 'Contact Us Page Image',
            },
        ),
        migrations.CreateModel(
            name='HomePageImages',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('first_step_image', models.ImageField(upload_to=static_images.models.home_first_step_image_path, validators=[django.core.validators.FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'webp', 'avif'])])),
                ('second_step_image', models.ImageField(upload_to=static_images.models.home_second_step_image_path, validators=[django.core.validators.FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'webp', 'avif'])])),
                ('third_step_image', models.ImageField(upload_to=static_images.models.home_third_step_image_path, validators=[django.core.validators.FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'webp', 'avif'])])),
                ('fourth_step_image', models.ImageField(upload_to=static_images.models.home_fourth_step_image_path, validators=[django.core.validators.FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'webp', 'avif'])])),
                ('story_image', models.ImageField(upload_to=static_images.models.home_story_image_path, validators=[django.core.validators.FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'webp', 'avif'])])),
                ('case_study_before_image', models.ImageField(upload_to=static_images.models.home_case_study_before_image_path, validators=[django.core.validators.FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'webp', 'avif'])])),
                ('case_study_after_image', models.ImageField(upload_to=static_images.models.home_case_study_after_image_path, validators=[django.core.validators.FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'webp', 'avif'])])),
                ('process_image_first', models.ImageField(upload_to=static_images.models.home_process_image_first_path, validators=[django.core.validators.FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'webp', 'avif'])])),
                ('process_image_second', models.ImageField(upload_to=static_images.models.home_process_image_second_path, validators=[django.core.validators.FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'webp', 'avif'])])),
                ('process_image_third', models.ImageField(upload_to=static_images.models.home_process_image_third_path, validators=[django.core.validators.FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'webp', 'avif'])])),
                ('process_image_fourth', models.ImageField(upload_to=static_images.models.home_process_image_fourth_path, validators=[django.core.validators.FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'webp', 'avif'])])),
                ('process_image_fifth', models.ImageField(upload_to=static_images.models.home_process_image_fifth_path, validators=[django.core.validators.FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'webp', 'avif'])])),
                ('process_image_sixth', models.ImageField(upload_to=static_images.models.home_process_image_sixth_path, validators=[django.core.validators.FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'webp', 'avif'])])),
                ('end_image', models.ImageField(upload_to=static_images.models.home_end_image_path, validators=[django.core.validators.FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'webp', 'avif'])])),
            ],
            options={
                'verbose_name': 'Home Page Images',
                'verbose_name_plural': 'Home Page Images',
            },
        ),
        migrations.CreateModel(
            name='NewsPageImage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('main_image', models.ImageField(upload_to=static_images.models.news_main_image_path, validators=[django.core.validators.FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'webp', 'avif'])])),
            ],
            options={
                'verbose_name': 'News Page Image',
                'verbose_name_plural': 'News Page Image',
            },
        ),
        migrations.CreateModel(
            name='ProjectsPageImage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('main_image', models.ImageField(upload_to=static_images.models.projects_main_image_path, validators=[django.core.validators.FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'webp', 'avif'])])),
            ],
            options={
                'verbose_name': 'Projects Page Image',
                'verbose_name_plural': 'Projects Page Image',
            },
        ),
        migrations.CreateModel(
            name='ServicesPageImage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('main_image', models.ImageField(upload_to=static_images.models.services_main_image_path, validators=[django.core.validators.FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'webp', 'avif'])])),
            ],
            options={
                'verbose_name': 'Services Page Image',
                'verbose_name_plural': 'Services Page Image',
            },
        ),
    ]
