
import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('services', '0002_alter_service_options'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='service',
            options={'ordering': ['service_priority', 'id'], 'verbose_name': 'Service', 'verbose_name_plural': 'Services'},
        ),
        migrations.AddField(
            model_name='service',
            name='service_priority',
            field=models.PositiveIntegerField(default=0, help_text='Controls the display order of this service in the frontend navbar list. Lower numbers appear first.'),
        ),
        migrations.AlterField(
            model_name='service',
            name='img',
            field=models.ImageField(upload_to='services/', validators=[django.core.validators.FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'webp', 'avif'])]),
        ),
    ]
