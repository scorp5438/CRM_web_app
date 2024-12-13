from rest_framework import serializers
from django.core.exceptions import ValidationError
from rest_framework.exceptions import ValidationError as RestFrameworkValidationError
from django.contrib.auth.models import User

from .models import Exam


class ExamSerializer(serializers.ModelSerializer):
    """
    Сериализатор для модели Exam с подстановкой данных в поле name_examiner
    по фильтру company=1 (ДМ), post='OKK'.
    """
    class Meta:
        model = Exam
        fields = '__all__'

    def validate(self, data):
        try:
            return super().validate(data)
        except ValidationError as e:
            raise RestFrameworkValidationError(e.detail)


