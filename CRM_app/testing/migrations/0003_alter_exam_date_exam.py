# Generated by Django 4.2.16 on 2025-02-07 12:18

from django.db import migrations, models
import testing.models


class Migration(migrations.Migration):

    dependencies = [
        ('testing', '0002_alter_exam_internal_test_examiner_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='exam',
            name='date_exam',
            field=models.DateField(null=True, validators=[testing.models.validate_date_exam], verbose_name='Дата зачета'),
        ),
    ]
