
import django.core.validators
import django.db.models.deletion
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='ProjectCategory',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('category_name', models.CharField(max_length=255)),
                ('category_name_ar', models.CharField(max_length=255)),
            ],
            options={
                'verbose_name': 'Project Category',
                'verbose_name_plural': 'Project Categories',
            },
        ),
        migrations.CreateModel(
            name='Project',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('project_name', models.CharField(max_length=255)),
                ('project_name_ar', models.CharField(max_length=255)),
                ('car_model', models.CharField(max_length=255)),
                ('date', models.DateField()),
                ('project_description', models.TextField()),
                ('project_description_ar', models.TextField()),
                ('cover_img', models.ImageField(blank=True, null=True, upload_to='projects/covers/', validators=[django.core.validators.FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'webp'])])),
                ('before_img', models.ImageField(blank=True, null=True, upload_to='projects/before/', validators=[django.core.validators.FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'webp'])])),
                ('after_img', models.ImageField(blank=True, null=True, upload_to='projects/after/', validators=[django.core.validators.FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'webp'])])),
                ('category', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='projects', to='projects.projectcategory')),
            ],
            options={
                'verbose_name': 'Project',
                'verbose_name_plural': 'Projects',
            },
        ),
    ]
