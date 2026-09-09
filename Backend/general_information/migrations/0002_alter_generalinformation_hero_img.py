
import django.core.validators
import general_information.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('general_information', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='generalinformation',
            name='hero_img',
            field=models.ImageField(upload_to=general_information.models.general_info_image_path, validators=[django.core.validators.FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif'])]),
        ),
    ]
