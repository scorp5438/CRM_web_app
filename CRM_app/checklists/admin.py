from django.contrib import admin

from .models import SubMistake, Mistake, CheckList

@admin.register(SubMistake)
class SubMistakeAdmin(admin.ModelAdmin):
    list_display = 'name', 'attachment'
    list_display_links = 'name',
    ordering = 'name', 'attachment'
    search_fields = 'name', 'attachment'

@admin.register(Mistake)
class MistakeAdmin(admin.ModelAdmin):
    list_display = 'name', 'worth',
    list_display_links = 'name',
    ordering = 'name',
    search_fields = 'name',


@admin.register(CheckList)
class CheckListAdmin(admin.ModelAdmin):
    list_display = 'date', 'type_appeal', 'controller', 'count', 'operator_name', 'company'
    list_display_links = 'date', 'controller', 'operator_name',
    ordering = 'date', 'type_appeal', 'controller',
    search_fields = 'date', 'type_appeal', 'controller', 'operator_name',