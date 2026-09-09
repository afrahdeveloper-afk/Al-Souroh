
import django.core.validators
import services.models
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Service',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('service_name', models.CharField(max_length=255)),
                ('service_name_ar', models.CharField(max_length=255)),
                ('service_description', models.TextField()),
                ('service_description_ar', models.TextField()),
                ('service_rank', models.CharField(max_length=255)),
                ('service_rank_ar', models.CharField(max_length=255)),
                ('service_problems', models.JSONField(validators=[services.models.validate_list_of_strings])),
                ('service_problems_ar', models.JSONField(validators=[services.models.validate_list_of_strings])),
                ('service_procedures', models.JSONField(validators=[services.models.validate_list_of_strings])),
                ('service_procedures_ar', models.JSONField(validators=[services.models.validate_list_of_strings])),
                ('img', models.ImageField(upload_to='services/', validators=[django.core.validators.FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'webp'])])),
            ],
            options={
                'verbose_name': 'Service',
                'verbose_name_plural': 'Services',
            },
        ),
    ]
