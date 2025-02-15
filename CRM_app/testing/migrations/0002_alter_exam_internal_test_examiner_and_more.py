# Generated by Django 4.2.16 on 2024-12-13 09:23

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('testing', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='exam',
            name='internal_test_examiner',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, related_name='internal_test_examiner', to=settings.AUTH_USER_MODEL, verbose_name='ФИ принимающего внутреннее ТЗ'),
        ),
        migrations.AlterField(
            model_name='exam',
            name='name_examiner',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='name_examiner', to=settings.AUTH_USER_MODEL, verbose_name='ФИ сотрудника'),
        ),
        migrations.AlterField(
            model_name='exam',
            name='name_train',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, related_name='name_train', to=settings.AUTH_USER_MODEL, verbose_name='ФИ обучающего/обучающих'),
        ),
    ]
