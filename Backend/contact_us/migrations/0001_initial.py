
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='ContactUs',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('phone_number', models.CharField(max_length=50)),
                ('whatsapp_number', models.CharField(max_length=50)),
                ('google_map_link', models.CharField(max_length=500)),
                ('address', models.CharField(max_length=500)),
                ('address_ar', models.CharField(max_length=500)),
                ('work_days', models.CharField(max_length=255)),
                ('work_hours', models.CharField(max_length=255)),
                ('instagram_user', models.CharField(max_length=255)),
                ('facebook_user', models.CharField(max_length=255)),
                ('tiktok_user', models.CharField(max_length=255)),
            ],
            options={
                'verbose_name': 'Contact Us',
                'verbose_name_plural': 'Contact Us',
            },
        ),
    ]
