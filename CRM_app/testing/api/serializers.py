from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from testing.models import Exam


class ExamSerializer(serializers.ModelSerializer):
    """
    Сериализатор для модели Exam с подстановкой данных
    из связанных моделей User и Profile.
    """

    name_train_full_name = serializers.SerializerMethodField(
        help_text="Полное имя преподавателя (из профиля)"
    )
    internal_test_examiner_full_name = serializers.SerializerMethodField(
        help_text="Полное имя экзаменатора по внутреннему ТЗ (из профиля)"
    )
    name_examiner_full_name = serializers.SerializerMethodField(
        help_text="Полное имя принимающего экзамен (из профиля)"
    )

    class Meta:
        model = Exam
        fields = '__all__'  # Включаем все поля из модели Exam
        extra_kwargs = {
            'date_exam': {'help_text': 'Дата проведения экзамена (YYYY-MM-DD)'},
            'time_exam': {'help_text': 'Время проведения экзамена (HH:MM:SS)'},
            'result_exam': {'help_text': 'Результат экзамена'},
            'comment_exam': {'help_text': 'Комментарий к экзамену'},
        }

    @extend_schema_field(serializers.CharField(
        allow_null=True,
        help_text="Полное имя преподавателя или пустая строка, если не указано"
    ))
    def get_name_examiner_full_name(self, obj):
        """
        Получает полное имя преподавателя (name_train),
        используя профиль пользователя.
        """
        if obj.name_examiner and hasattr(obj.name_examiner, 'profile'):
            return obj.name_examiner.profile.full_name
        return ''  # Если профиль не существует или нет данных

    @extend_schema_field(serializers.CharField(
        allow_null=True,
        help_text="Полное имя преподавателя или пустая строка, если не указано"
    ))
    def get_name_train_full_name(self, obj):
        """
        Получает полное имя преподавателя (name_train),
        используя профиль пользователя.
        """
        if obj.name_train:
            return obj.name_train.profile.full_name
        return ''  # Если профиль не существует или нет данных

    @extend_schema_field(serializers.CharField(
        allow_null=True,
        help_text="Полное имя экзаменатора или пустая строка, если не указано"
    ))
    def get_internal_test_examiner_full_name(self, obj):
        if obj.internal_test_examiner:
            return obj.internal_test_examiner.profile.full_name
        return ''


class CreateExamSerializer(ExamSerializer):

    class Meta(ExamSerializer.Meta):
        fields = ['date_exam', 'name_intern', 'company', 'training_form', 'try_count', 'name_train',
                                   'internal_test_examiner', 'note']
        extra_kwargs = {
            'date_exam': {'required': True},
            'name_intern': {'required': True},
            'company': {'required': True},
            'training_form': {'required': True},
        }


class ResultSerializer(serializers.Serializer):
    """
    Сериализатор для отображения списка возможных результатов экзамена
    """
    results = serializers.ListField(
        child=serializers.ChoiceField(choices=Exam.result_list)
    )
