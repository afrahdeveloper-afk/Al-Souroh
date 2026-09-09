
import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0002_alter_project_options_alter_projectcategory_options'),
    ]

    operations = [
        migrations.AlterField(
            model_name='project',
            name='after_img',
            field=models.ImageField(blank=True, null=True, upload_to='projects/after/', validators=[django.core.validators.FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'webp', 'avif'])]),
        ),
        migrations.AlterField(
            model_name='project',
            name='before_img',
            field=models.ImageField(blank=True, null=True, upload_to='projects/before/', validators=[django.core.validators.FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'webp', 'avif'])]),
        ),
        migrations.AlterField(
            model_name='project',
            name='cover_img',
            field=models.ImageField(blank=True, null=True, upload_to='projects/covers/', validators=[django.core.validators.FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'webp', 'avif'])]),
        ),
    ]
