
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('contact_us', '0002_contactus_email'),
    ]

    operations = [
        migrations.AddField(
            model_name='contactus',
            name='work_days_ar',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
