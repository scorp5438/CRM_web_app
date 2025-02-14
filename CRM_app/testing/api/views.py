from datetime import timedelta

from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from profiles.models import Companies
from .serializers import ExamSerializer, CreateExamSerializer, ResultSerializer
from ..models import Exam


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
        result = self.request.GET.get('result', None)
        data_from = self.request.GET.get('data_from', None)
        data_to = self.request.GET.get('data_to', None)
        now = timezone.now()

        if not self.request.GET.get('data_from'):
            first_day_of_month = now.replace(day=1)
        else:
            first_day_of_month = data_from

        if not self.request.GET.get('data_to'):
            last_day_of_month = (now.replace(day=1) + timedelta(days=32)).replace(day=1) - timedelta(days=1)
        else:
            last_day_of_month = data_to

        if self.request.user.is_staff:
            if mode == 'my-exam':
                queryset = Exam.objects.filter(name_examiner=self.request.user.id, result_exam='',
                                               date_exam=now).select_related('company', 'name_train',
                                                                             'internal_test_examiner')

            elif company_slug:
                company = Companies.objects.filter(slug=company_slug).first()

                # TODO Сделать и проверить фильтрацию екзаменов по КЦ для МэйнКомпании
                queryset = Exam.objects.filter(company=company.id, date_exam__gte=first_day_of_month,
                                               date_exam__lte=last_day_of_month).select_related('company', 'name_train',
                                                                                                'internal_test_examiner')

            else:
                queryset = Exam.objects.all()

        else:
            company = self.request.user.profile.company
            queryset = Exam.objects.filter(company=company.id, date_exam__gte=first_day_of_month,
                                           date_exam__lte=last_day_of_month).select_related('company', 'name_train',
                                                                                            'internal_test_examiner')
        if result:
            queryset.filter(result_exam=result)
        return queryset.order_by('date_exam', 'time_exam')

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

    def perform_create(self, serializer):
        company = self.request.user.profile.company
        serializer.save(company=company)

    def replace_field_error_messages(self, errors):
        replacements = {
            'date_exam': 'Пожалуйста, укажите дату экзамена.',
            'name_intern': 'Пожалуйста, укажите ФИ стажера.',
            'company': 'Пожалуйста, укажите компанию стажера.',
            'training_form': 'Пожалуйста, укажите форму обучения.',
            'try_count': 'Пожалуйста, укажите попытку.',
            'name_train': 'Пожалуйста, укажите фамилию обучающего.',
            'internal_test_examiner': 'Пожалуйста, укажите фамилию принимающего зачет.'
        }

        expected_messages = [
            'This field may not be null.',
            'This field may not be blank.',
            'Date has wrong format. Use one of these formats instead: YYYY-MM-DD.',
            '"" is not a valid choice.',
        ]

        for field, messages in errors.items():
            if field in replacements:
                for i in range(len(messages)):
                    if messages[i] in expected_messages:
                        messages[i] = replacements[field]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            self.replace_field_error_messages(serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            self.replace_field_error_messages(serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
            if 'time_exam' in e.detail:
                errors['time_exam'] = ['Пожалуйста, укажите время зачета']
            if 'date_exam' in e.detail:
                error_answer = [
                    'Date has wrong format. Use one of these formats instead: YYYY-MM-DD.',
                    'This field may not be null.'
                ]
                if e.detail['date_exam'][0] not in error_answer:
                    errors['date_exam'] = e.detail['date_exam']
                else:
                    errors['date_exam'] = 'Пожалуйста, укажите дату экзамена.'
            if e.detail.get(
                    'non_field_errors') and 'The fields date_exam, time_exam, name_examiner must make a unique set.' in \
                    e.detail.get('non_field_errors')[0]:
                e.detail.get('non_field_errors')[0] = 'Проверяющий уже занят в данную дату и время'
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
