
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0001_initial'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='project',
            options={'ordering': ['-date'], 'verbose_name': 'Project', 'verbose_name_plural': 'Projects'},
        ),
        migrations.AlterModelOptions(
            name='projectcategory',
            options={'ordering': ['category_name'], 'verbose_name': 'Project Category', 'verbose_name_plural': 'Project Categories'},
        ),
    ]
