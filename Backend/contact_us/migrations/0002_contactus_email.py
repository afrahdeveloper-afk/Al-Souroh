
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('contact_us', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='contactus',
            name='email',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
