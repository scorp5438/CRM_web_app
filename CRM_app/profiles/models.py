from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class Profile(models.Model):
    types_operators = [
        ("ВО", "ВО"),
        ("ГЛ", "ГЛ"),
        ("Ночной ВО", "Ночной ВО"),
        ("Стажер", "Стажер"),
    ]

    status_list = [
        ("Работает", "Работает"),
        ("Уволен", "Уволен"),
        ("В декрете", "В декрете"),
        ("На больничном", "На больничном"),
        ("б/с", "б/с"),
    ]

    posts = [
        ("OKK", "OKK"),
        ("GPH", "GPH"),
        ("Admin", "Admin"),
        ("Operator", "Operator"),
    ]

    user = models.OneToOneField(to=User, on_delete=models.CASCADE, related_name='profiles')
    full_name = models.CharField(max_length=60, blank=True, null=True, verbose_name="ФИ сотрудника")
    company = models.ForeignKey('Companies', on_delete=models.PROTECT, verbose_name='Компания', null=True,
                                related_name='profiles')
    post = models.CharField(max_length=20, verbose_name='Должность', choices=posts, null=True, blank=True)
    work_start_date = models.DateField(auto_now_add=True, editable=False, verbose_name="Дата выхода в линию")
    operator_type = models.CharField(max_length=36, blank=True, null=True, choices=types_operators,
                                     verbose_name="Тип оператора")
    status = models.CharField(max_length=16, blank=False, choices=status_list, verbose_name="Статус сотрудника",
                              default="Работает")
    lines = models.ManyToManyField("Lines", blank=True, related_name='profiles')
    update_date = models.DateField(auto_now=True, editable=False, verbose_name="Дата изменения")

    class Meta:
        verbose_name = 'Профиль'

    def __str__(self):
        return self.full_name


class Lines(models.Model):
    name_line = models.CharField(max_length=24, blank=False, verbose_name="Линия")

    class Meta:
        verbose_name = 'Линию'
        verbose_name_plural = 'Линии'

    def __str__(self):
        return self.name_line


class Companies(models.Model):
    name = models.CharField(max_length=20, verbose_name='Компания')
    slug = models.SlugField(db_index=True, unique=True, verbose_name='url')

    class Meta:
        verbose_name = 'Компанию'
        verbose_name_plural = 'Компании'

    def __str__(self):
        return self.name
