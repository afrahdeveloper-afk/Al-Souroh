
import django.core.validators
import general_information.models
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='GeneralInformation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('main_title', models.CharField(max_length=255)),
                ('main_title_ar', models.CharField(max_length=255)),
                ('second_title', models.CharField(max_length=255)),
                ('second_title_ar', models.CharField(max_length=255)),
                ('description', models.TextField()),
                ('description_ar', models.TextField()),
                ('hero_img', models.ImageField(upload_to=general_information.models.general_info_image_path, validators=[django.core.validators.FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'webp'])])),
            ],
            options={
                'verbose_name': 'General Information',
                'verbose_name_plural': 'General Information',
            },
        ),
    ]
