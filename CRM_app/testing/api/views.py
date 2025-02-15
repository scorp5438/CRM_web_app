from math import ceil
from datetime import timedelta

from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from profiles.models import Companies
from .serializers import ExamSerializer, CreateExamSerializer, ResultSerializer
from ..models import Exam


def replace_field_error_messages(errors):
    replacements = {
        'date_exam': 'Пожалуйста, укажите дату экзамена.',
        'name_intern': 'Пожалуйста, укажите ФИ стажера.',
        'company': 'Пожалуйста, укажите компанию стажера.',
        'training_form': 'Пожалуйста, укажите форму обучения.',
        'try_count': 'Пожалуйста, укажите попытку.',
        'name_train': 'Пожалуйста, укажите фамилию обучающего.',
        'internal_test_examiner': 'Пожалуйста, укажите фамилию принимающего зачет.',
        'time_exam': 'Пожалуйста, укажите время зачета',
        'non_field_errors':'Проверяющий уже занят в данную дату и время'
    }

    expected_messages = [
        'This field may not be null.',
        'This field may not be blank.',
        'Date has wrong format. Use one of these formats instead: YYYY-MM-DD.',
        'The fields date_exam, time_exam, name_examiner must make a unique set.',
        '"" is not a valid choice.',
        'Time has wrong format. Use one of these formats instead: hh:mm[:ss[.uuuuuu]].'
    ]

    for field, messages in errors.items():
        if field in replacements:
            for i in range(len(messages)):
                if messages[i] in expected_messages:
                    messages[i] = replacements[field]


class ExamApiView(viewsets.ModelViewSet):

    http_method_names = ['get', 'post', 'patch']

    @property
    def get_serializer(self, *args, **kwargs):
        if self.request.method == 'GET':
            return ExamSerializer
        elif self.request.method == 'PATCH' or self.request.method == 'POST':
            return CreateExamSerializer

    def get_queryset(self):
        company_slug = self.request.GET.get('company', None)
        mode = self.request.GET.get('mode', None)
        result = self.request.GET.getlist('result', None)
        date_from = self.request.GET.get('date_from', None)
        date_to = self.request.GET.get('date_to', None)
        now = timezone.now()

        if not self.request.GET.get('date_from'):
            first_day_of_month = now.replace(day=1)
        else:
            first_day_of_month = date_from

        if not self.request.GET.get('date_to'):
            last_day_of_month = (now.replace(day=1) + timedelta(days=32)).replace(day=1) - timedelta(days=1)
        else:
            last_day_of_month = date_to

        queryset = Exam.objects.select_related('company', 'name_train', 'internal_test_examiner')

        if self.request.user.is_staff:
            if mode == 'my-exam':
                queryset = queryset.filter(name_examiner=self.request.user.id, result_exam='', date_exam=now)
                return queryset.order_by('time_exam')
            else:
                company = Companies.objects.filter(slug=company_slug).first()
                if not company:
                    return Exam.objects.none()
        else:
            company = self.request.user.profile.company
        queryset = queryset.filter(
            company=company.id,
            date_exam__gte=first_day_of_month,
            date_exam__lte=last_day_of_month)

        if result:
            queryset = queryset.filter(result_exam__in=result)

        return queryset.order_by('date_exam', 'time_exam')

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

    def perform_create(self, serializer):
        company = self.request.user.profile.company
        serializer.save(company=company)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            replace_field_error_messages(serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            replace_field_error_messages(serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        count = response.data.get('count')
        response.data['page'] = ceil(count / 10)
        return response

class ExamUpdateApiView(viewsets.ModelViewSet):
    serializer_class = ExamSerializer
    queryset = Exam.objects.all()
    http_method_names = ['get', 'patch']

    def update(self, request, *args, **kwargs):

        exam = self.get_object()
        serializer = self.get_serializer(exam, data=request.data, partial=True)
        errors = {}

        try:

            serializer.is_valid(raise_exception=True)

        except ValidationError as e:
            replace_field_error_messages(e.detail)
            return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)

        time_exam = request.data.get('time_exam')
        name_examiner = request.data.get('name_examiner')

        if not time_exam or time_exam == "00:00:00":
            errors['time_exam'] = ['Пожалуйста, укажите время зачета']
        if not name_examiner:
            errors['name_examiner'] = ['Пожалуйста, укажите ФИ принимающего']

        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()

        return Response(serializer.data, status=status.HTTP_200_OK)


class ResultApiView(viewsets.ViewSet):
    def list(self, request):
        serializer = ResultSerializer()
        results = [res[0] for res in Exam.result_list]
        return Response({"results": results})
