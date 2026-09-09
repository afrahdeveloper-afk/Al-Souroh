
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('services', '0001_initial'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='service',
            options={'ordering': ['id'], 'verbose_name': 'Service', 'verbose_name_plural': 'Services'},
        ),
    ]
