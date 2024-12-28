from rest_framework import serializers
from django.contrib.auth.models import User
from django.utils import timezone

from profiles.models import Companies
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

    class Meta:
        model = User
        fields = 'username', 'count_exams'

    def get_count_exams(self, obj: User):
        today = timezone.now().date()
        count_exam = Exam.objects.filter(date_exam=today, result_exam='', name_examiner=obj).count()
        return count_exam

class AdminCcSerializer(serializers.ModelSerializer):

    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = 'username', 'full_name'

    def get_full_name(self, obj: User):
        full_name = User.objects.filter(username=obj.username).first().profile.full_name
        return full_name

