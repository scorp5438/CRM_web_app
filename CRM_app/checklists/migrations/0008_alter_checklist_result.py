# Generated by Django 4.2.16 on 2025-01-23 13:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('checklists', '0007_alter_checklist_result'),
    ]

    operations = [
        migrations.AlterField(
            model_name='checklist',
            name='result',
            field=models.CharField(blank=True, default=100, max_length=10),
        ),
    ]
