from django.contrib import admin

from .models import Profile, Lines, Companies

from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User


@admin.register(Companies)
class CompaniesAdmin(admin.ModelAdmin):
    list_display = 'pk', 'name', 'slug'
    list_display_links = 'pk', 'name'
    ordering = 'pk',
    search_fields = 'name',

    prepopulated_fields = {'slug': ('name',)}


@admin.register(Lines)
class LinesAdmin(admin.ModelAdmin):
    list_display = 'pk', 'name_line'
    list_display_links = 'pk', 'name_line'
    ordering = 'pk',
    search_fields = 'name_line',


class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False
    verbose_name_plural = 'Профиль'
    fk_name = 'user'


class CustomUserAdmin(UserAdmin):
    list_display = 'pk', 'username', 'get_full_name', 'get_post', 'get_status', 'get_company', 'is_staff', 'is_superuser'
    list_display_links = 'pk', 'username'
    inlines = (ProfileInline,)

    def get_full_name(self, obj: User):
        return obj.profiles.full_name

    get_full_name.short_description = 'Фамилия Имя'

    def get_post(self, obj: User):
        return obj.profiles.post

    get_post.short_description = 'Должность'

    def get_status(self, obj: User):
        return obj.profiles.status

    get_status.short_description = 'Статус'

    def get_company(self, obj: User):
        return obj.profiles.company

    get_company.short_description = 'Компания'


admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)
