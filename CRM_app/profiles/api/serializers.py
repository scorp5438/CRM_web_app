from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework import serializers
from django.db.models import Count

from checklists.models import CheckList
from profiles.models import Companies, Lines
from testing.models import Exam


class CompanySerializer(serializers.ModelSerializer):
    """
    Сериализатор для модели Companies
    """

    count_exams = serializers.SerializerMethodField()

    class Meta:
        model = Companies
        fields = '__all__'

    def get_count_exams(self, obj: Companies):
        count_exam = Exam.objects.filter(company=obj, time_exam='00:00:00', name_examiner=None).count()
        return count_exam


class UserExamSerializer(serializers.ModelSerializer):
    count_exams = serializers.SerializerMethodField()
    count_exam_conducted = serializers.SerializerMethodField()
    count_of_checks = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = 'username', 'count_exams', 'count_exam_conducted', 'count_of_checks'

    def get_count_exams(self, obj: User):
        today = timezone.now().date()
        count_exam = Exam.objects.filter(
            date_exam=today,
            result_exam='',
            name_examiner=obj
        ).count()
        return count_exam

    def get_count_exam_conducted(self, obj: User):
        today = timezone.now().date()
        results = ['Допущен', 'Не допущен', 'Не состоялось']
        count_exam_conducted = Exam.objects.filter(
            date_exam=today,
            result_exam__in=results,
            name_examiner=obj
        ).count()
        return count_exam_conducted

    def get_count_of_checks(self, obj: User):
        today = timezone.now().date()
        count_of_checks_dict = CheckList.objects.filter(
            date=today,
            controller=obj
        ).aggregate(Count('pk'))
        count_of_checks = count_of_checks_dict.get('pk__count')
        return count_of_checks

class AdminCcSerializer(serializers.ModelSerializer):

    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = 'id', 'username', 'full_name'

    def get_full_name(self, obj: User):
        full_name = User.objects.filter(username=obj.username).first().profile.full_name
        return full_name

class AdminMainSerializer(serializers.ModelSerializer):

    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = 'id', 'username', 'full_name'

    def get_full_name(self, obj: User):
        full_name = User.objects.filter(username=obj.username).first().profile.full_name
        return full_name


class OperatorSerializer(serializers.ModelSerializer):

    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = 'id', 'username', 'full_name'

    def get_full_name(self, obj: User):
        full_name = User.objects.filter(username=obj.username).first().profile.full_name
        return full_name


class LinesSerializer(serializers.ModelSerializer):

    class Meta:
        model = Lines
        fields = '__all__'
