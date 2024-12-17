from rest_framework import serializers
from django.core.exceptions import ValidationError
from rest_framework.exceptions import ValidationError as RestFrameworkValidationError

from testing.models import Exam
from profiles.models import Profile  # Подключаем модель Profile
from django.contrib.auth.models import User


class ExamSerializer(serializers.ModelSerializer):
    """
    Сериализатор для модели Exam с подстановкой данных
    из связанных моделей User и Profile.
    """

    # Поле для полного имени преподавателя
    name_train_full_name = serializers.SerializerMethodField()

    # Поле для экзаменатора по внутреннему ТЗ
    internal_test_examiner_full_name = serializers.SerializerMethodField()

    name_examiner_full_name = serializers.SerializerMethodField()

    class Meta:
        model = Exam
        fields = '__all__'  # Включаем все поля из модели Exam

    def get_name_examiner_full_name(self, obj):
        """
        Получает полное имя преподавателя (name_train),
        используя профиль пользователя.
        """
        if obj.name_examiner:
            return obj.name_examiner.profile.full_name
        return None  # Если профиль не существует или нет данных

    def get_name_train_full_name(self, obj):
        """
        Получает полное имя преподавателя (name_train),
        используя профиль пользователя.
        """
        if obj.name_train:
            return obj.name_train.profile.full_name
        return None  # Если профиль не существует или нет данных

    def get_internal_test_examiner_full_name(self, obj):
        if obj.internal_test_examiner:
            return obj.internal_test_examiner.profile.full_name
        # if obj.internal_test_examiner and hasattr(obj.internal_test_examiner, 'profile'):
        #     return obj.internal_test_examiner.profile.full_name
        return None

    def validate(self, data):
        """
        Валидация данных модели Exam.
        """
        try:
            return super().validate(data)
        except ValidationError as e:
            raise RestFrameworkValidationError(e.detail)