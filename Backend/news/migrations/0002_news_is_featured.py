
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('news', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='news',
            name='is_featured',
            field=models.BooleanField(blank=True, default=False, verbose_name='Featured Article/News'),
        ),
    ]
