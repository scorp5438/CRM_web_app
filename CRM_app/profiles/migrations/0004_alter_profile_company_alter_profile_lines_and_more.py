# Generated by Django 4.2.16 on 2024-12-17 18:16

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('profiles', '0003_alter_profile_options_alter_profile_full_name'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='company',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, related_name='profile', to='profiles.companies', verbose_name='Компания'),
        ),
        migrations.AlterField(
            model_name='profile',
            name='lines',
            field=models.ManyToManyField(blank=True, related_name='profile', to='profiles.lines'),
        ),
        migrations.AlterField(
            model_name='profile',
            name='user',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='profile', to=settings.AUTH_USER_MODEL),
        ),
    ]