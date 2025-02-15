from django.db import models
from django.contrib.auth.models import User

from profiles.models import Lines, Companies


class Mistake(models.Model):
    worth_list = [
        (5, '5'),
        (15, '15'),
        (25, '25'),
        (50, '50'),
        (100, '100'),
    ]
    name = models.CharField(max_length=128, blank=False, verbose_name="Категория ошибки")
    worth = models.PositiveSmallIntegerField(blank=False, choices=worth_list, verbose_name="Вес ошибки")

    class Meta:
        verbose_name = 'Пункт'
        verbose_name_plural = 'Пункт'

    def __str__(self):
        return self.name


class SubMistake(models.Model):
    name = models.CharField(max_length=150, verbose_name="Наименование пункта ошибки")
    attachment = models.ForeignKey(to=Mistake, on_delete=models.CASCADE, verbose_name="Пункт",
                                   related_name="suberrors")
    class Meta:
        verbose_name = 'Подпункт'
        verbose_name_plural = 'Подпункт'

    def __str__(self):
        return self.name


class CheckList(models.Model):
    type_list = [
        ('звонок', 'звонок'),
        ('письма', 'письма'),
    ]
    decision_list = [
        ('Удоветворено', 'Удоветворено'),
        ('Отказано', 'Отказано'),
        (None, None),
    ]
    date = models.DateField(auto_now_add=True, verbose_name="Дата проверки")
    type_appeal = models.CharField(max_length=12, choices=type_list, blank=False, verbose_name="Тип обращения")
    controller = models.ForeignKey(to=User, on_delete=models.PROTECT, verbose_name="Контролер",
                                   related_name='controller')
    count = models.IntegerField(default=0, verbose_name="Количество прослушано")
    operator_name = models.ForeignKey(to=User, on_delete=models.PROTECT, limit_choices_to={'profile__post': 'Operator'},
                                      verbose_name="ФИ оператора",
                                      related_name='operator_name')
    company = models.ForeignKey(to=Companies, on_delete=models.PROTECT, verbose_name="Компания")
    call_date = models.DateField(default=None, verbose_name="Дата обращения")
    call_time = models.TimeField(default=None, blank=True, null=True, verbose_name="Время обращения")
    call_id = models.TextField(max_length=500, blank=False, verbose_name="id звонка")
    first_miss = models.ForeignKey(to=SubMistake, default='1', on_delete=models.PROTECT, verbose_name="Категория 1",
                                   related_name="firsterror", limit_choices_to={'attachment': 1})
    second_miss = models.ForeignKey(to=SubMistake, default='1', on_delete=models.PROTECT, verbose_name="Категория 2",
                                    related_name="seconderror", limit_choices_to={'attachment': 2})
    third_miss = models.ForeignKey(to=SubMistake, default='1', on_delete=models.PROTECT, verbose_name="Категория 3",
                                   related_name="thirderror", limit_choices_to={'attachment': 3})
    forty_miss = models.ForeignKey(to=SubMistake, default='1', on_delete=models.PROTECT, verbose_name="Категория 4",
                                   related_name="fortyerror", limit_choices_to={'attachment': 4})
    fifty_miss = models.ForeignKey(to=SubMistake, default='1', on_delete=models.PROTECT, verbose_name="Категория 5",
                                   related_name="fiftyerror", limit_choices_to={'attachment': 5})
    sixty_miss = models.ForeignKey(to=SubMistake, default='1', on_delete=models.PROTECT, verbose_name="Категория 6",
                                   related_name="sixtyerror", limit_choices_to={'attachment': 6})
    first_comm = models.TextField(max_length=1500, blank=True, verbose_name="Комментарий 1")
    second_comm = models.TextField(max_length=1500, blank=True, verbose_name="Комментарий 2")
    third_comm = models.TextField(max_length=1500, blank=True, verbose_name="Комментарий 3")
    forty_comm = models.TextField(max_length=1500, blank=True, verbose_name="Комментарий 4")
    fifty_comm = models.TextField(max_length=1500, blank=True, verbose_name="Комментарий 5")
    sixty_comm = models.TextField(max_length=1500, blank=True, verbose_name="Комментарий 6")
    result = models.PositiveSmallIntegerField(blank=True, default=100, verbose_name="Оценка")
    line = models.ForeignKey(to=Lines, on_delete=models.PROTECT, default=0, verbose_name="Линия")
    comment = models.TextField(max_length=1500, blank=True, null=True, default=None,
                               verbose_name="Комментарий компании")
    decision = models.CharField(max_length=1500, blank=True, null=True, choices=decision_list, default=None,
                                verbose_name="Решение ДМ")
    comment_court = models.TextField(max_length=1500, blank=True, null=True, default=None,
                                     verbose_name="Комментарий к решению")
    claim = models.BooleanField(default=False, verbose_name="Жалоба")
    just = models.BooleanField(default=False, verbose_name="Обоснованность жалобы")
    claim_number = models.CharField(max_length=20, blank=True, null=True, default=None, verbose_name="Номер жалобы")

    class Meta:
        verbose_name = 'Проверку'
        verbose_name_plural = 'Чек лист'

    def __str__(self):
        return f"CheckList {self.date} - {self.operator_name}"

    def save(self, *args, **kwargs):
        full_result = 100
        print(f"{self.sixty_miss.name = }")
        if self.sixty_miss.name != '1':
            self.result = 0
        else:
             for miss in [self.first_miss, self.second_miss, self.third_miss, self.forty_miss, self.fifty_miss]:
                 print(f'{miss.name = }')
                 if miss.name != '1':  # Проверяем, что ошибка выбрана
                    full_result -= miss.attachment.worth  # Получаем значение worth из связанной модели Mistake
                    print(f'{miss.attachment.worth = }')
             print(full_result)
             self.result = full_result
        super().save(*args, **kwargs)
        count = CheckList.objects.filter(operator_name=self.operator_name, type_appeal=self.type_appeal,
                                         date__year=self.date.year,
                                         date__month=self.date.month).count()
        CheckList.objects.filter(operator_name=self.operator_name, type_appeal=self.type_appeal,
                                 date__year=self.date.year,
                                 date__month=self.date.month).update(count=count)
