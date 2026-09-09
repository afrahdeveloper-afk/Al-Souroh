
import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='News',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('news_title', models.CharField(max_length=255)),
                ('news_title_ar', models.CharField(max_length=255)),
                ('news_description', models.TextField()),
                ('news_description_ar', models.TextField()),
                ('news_content', models.TextField()),
                ('news_content_ar', models.TextField()),
                ('news_img', models.ImageField(upload_to='news/', validators=[django.core.validators.FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'webp'])])),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'verbose_name': 'News',
                'verbose_name_plural': 'News',
                'ordering': ['-created_at'],
            },
        ),
    ]
