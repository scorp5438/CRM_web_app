from django.contrib import admin

from .models import Exam


@admin.register(Exam)
class ExamAdmin(admin.ModelAdmin):
    list_display = 'pk', 'name_intern', 'date_exam', 'time_exam', 'name_examiner', 'result_exam'
    list_display_links = 'pk', 'name_intern',
    ordering = 'pk',
    search_fields = 'name_intern', 'name_examiner',
