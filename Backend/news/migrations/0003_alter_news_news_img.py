
import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('news', '0002_news_is_featured'),
    ]

    operations = [
        migrations.AlterField(
            model_name='news',
            name='news_img',
            field=models.ImageField(upload_to='news/', validators=[django.core.validators.FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'webp', 'avif'])]),
        ),
    ]
