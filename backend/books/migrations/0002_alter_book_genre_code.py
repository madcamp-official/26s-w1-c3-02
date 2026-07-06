from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('books', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='book',
            name='genre_code',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
    ]
