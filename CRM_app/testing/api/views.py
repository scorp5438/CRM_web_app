from datetime import timedelta

from django.utils import timezone
from profiles.models import Companies
from rest_framework import viewsets, serializers, status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from .serializers import ExamSerializer, ResultSerializer
from ..models import Exam


class ExamApiView(viewsets.ModelViewSet):
    serializer_class = ExamSerializer
    http_method_names = ['get', 'post']

    def get_queryset(self):
        company_slug = self.request.GET.get('company', None)
        mode = self.request.GET.get('mode', None)
        now = timezone.now()
        # if not self.request.get('date'):
        first_day_of_month = now.replace(day=1)
        last_day_of_month = (first_day_of_month + timedelta(days=32)).replace(day=1) - timedelta(days=1)

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
        print(queryset[0].date_exam, type(queryset[0].date_exam))
        return queryset.order_by('date_exam')

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

    def perform_update(self, serializer):
        try:
            serializer.save()
            # instance = serializer.save() # Если сохраненные данные необходимо использовать дальше
        except ValidationError as e:
            raise serializers.ValidationError(e.detail)

    def perform_create(self, serializer):
        company = self.request.user.profile.company
        serializer.save(company=company)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            if serializer.errors.get('date_exam') and 'Date has wrong format' in serializer.errors.get('date_exam')[0]:
                serializer.errors.get('date_exam')[0] = 'Пожалуйста, укажите дату экзамена.'
            if serializer.errors.get('name_intern') and 'This field may not be blank.' in serializer.errors.get('name_intern')[0]:
                serializer.errors.get('name_intern')[0] = 'Пожалуйста, укажите ФИ стажера.'
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# class ExamCreateApiView(viewsets.ModelViewSet):
#     serializer_class = ExamSerializer
#     queryset = Exam.objects.all()
#     http_method_names = ['post']
#
#     def perform_create(self, serializer):
#         company = self.request.user.profile.company
#         serializer.save(company=company)
#
#     def create(self, request, *args, **kwargs):
#         response = super().create(request, *args, **kwargs)
#         return Response({'message': 'Экзамен успешно создан', 'data': response.data}, status=status.HTTP_201_CREATED)


class ExamUpdateApiView(viewsets.ModelViewSet):
    serializer_class = ExamSerializer
    queryset = Exam.objects.all()
    http_method_names = ['get', 'patch']

    def update(self, request, *args, **kwargs):

        exam = self.get_object()
        serializer = self.get_serializer(exam, data=request.data, partial=True)
        try:
            serializer.is_valid(raise_exception=True)
        except ValidationError as e:
            if e.detail.get(
                    'non_field_errors') and 'The fields date_exam, time_exam, name_examiner must make a unique set.' in \
                    e.detail.get('non_field_errors')[0]:
                e.detail.get('non_field_errors')[0] = 'Проверяющий уже занят в данную дату и время'
                return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)

        super().update(request, *args, **kwargs)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ResultApiView(viewsets.ViewSet):
    def list(self, request):
        serializer = ResultSerializer()
        results = [res[0] for res in Exam.result_list]
        return Response({"results": results})
