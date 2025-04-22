from datetime import datetime, timedelta
from math import ceil

from django.utils import timezone
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample, OpenApiResponse
from rest_framework import viewsets, status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from profiles.models import Companies
from utils.utils import replace_field_error_messages
from .serializers import ExamSerializer, CreateExamSerializer, ResultSerializer
from ..models import Exam


@extend_schema(
    tags=['Зачеты'],
    summary="Создание, и обновление зачетов для админов КЦ и получение списка для админов КЦ и ДМ",
    description="""
    API для работы с зачетами.
    Позволяет создавать и обновлять зачеты админам КЦ, получать зачеты админам КЦ и ДМ.
    Доступные методы: GET (список), POST (создание), PATCH (частичное обновление).
    """
)
class ExamApiView(viewsets.ModelViewSet):

    http_method_names = ['get', 'post', 'patch']

    @extend_schema(
        exclude=True
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

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

        if not date_from:
            first_day_of_month = now.replace(day=1).date()  # Преобразуем в date
        else:
            first_day_of_month = datetime.strptime(date_from, "%Y-%m-%d").date()  # Преобразуем в date

        if not date_to:
            last_day_of_month = (now.replace(day=1) + timedelta(days=32)).replace(day=1) - timedelta(days=1)
            last_day_of_month = last_day_of_month.date()  # Преобразуем в date
        else:
            last_day_of_month = datetime.strptime(date_to, "%Y-%m-%d").date()

        queryset = Exam.objects.select_related('company', 'name_train', 'internal_test_examiner').all()

        if self.request.user.is_staff:
            if mode == 'my-exam':
                queryset = queryset.filter(name_examiner=self.request.user.id, date_exam=now)

                if result and '' not in result:
                    result_list = result[0].split(',')

                    queryset = queryset.filter(result_exam__in=result_list)

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

        if result and '' not in result:
            result_list = result[0].split(',')

            queryset = queryset.filter(result_exam__in=result_list)

        return queryset.order_by('date_exam', 'time_exam')

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

    def perform_create(self, serializer):
        company = self.request.user.profile.company
        serializer.save(company=company)

    @extend_schema(
        request=CreateExamSerializer,
        responses={
            200: ExamSerializer,
            400: OpenApiResponse(description="Неверные данные запроса"),
            403: OpenApiResponse(description="У данного пользователя нет прав на изменение зачета")
        },
        examples=[
            OpenApiExample(
                'Пример запроса на обновление зачета',
                value={
                    'company': 'Указывается id компании авторизованного пользователя type=int. Посмотреть можно тут: http://127.0.0.1:8000/api-root/companies/',
                    'date_exam': '2025-12-15',
                    'name_intern': 'Иван Иванов',
                    'training_form': 'ВО',
                    'try_count': 1,
                    'name_train': 'Указывается id обучающего. type=int. Посмотреть можно тут: http://127.0.0.1:8000/api-root/admin/',
                    'internal_test_examiner': 'Указывается id принимающего внутренний зачет. type=int. Посмотреть можно тут:  http://127.0.0.1:8000/api-root/admin/',
                    'note': 'Какое-то примечание (не обязательно)'
                },
                request_only=True
            )
        ]
    )

    def update(self, request, *args, **kwargs):
        if self.request.user.profile.post != 'Admin':
            return Response({'message': 'Создать зачет может только админ КЦ'}, status=status.HTTP_403_FORBIDDEN)

        instance = self.get_object()  # получаем существующий объект
        serializer = self.get_serializer(instance, data=request.data, partial=True)

        try:
            serializer.is_valid(raise_exception=True)
        except ValidationError as e:
            replace_field_error_messages(e.detail)
            return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        request=CreateExamSerializer,
        responses={
            201: ExamSerializer,
            400: OpenApiResponse(description="Неверные данные запроса"),
            403: OpenApiResponse(description="У данного пользователя нет прав на создание зачета")
        },
        examples=[
            OpenApiExample(
                'Пример запроса на создание зачета для админа КЦ',
                value={
                    'company': 'Указывается id компании авторизованного пользователя type=int. Посмотреть можно тут: http://127.0.0.1:8000/api-root/companies/',
                    'date_exam': '2025-12-15',
                    'name_intern': 'Иван Иванов',
                    'training_form': 'ВО',
                    'try_count': 1,
                    'name_train': 'Указывается id обучающего. type=int. Посмотреть можно тут: http://127.0.0.1:8000/api-root/admin/',
                    'internal_test_examiner': 'Указывается id принимающего внутренний зачет. type=int. Посмотреть можно тут:  http://127.0.0.1:8000/api-root/admin/',
                    'note': 'Какое-то примечание (не обязательно)'
                },
                request_only=True
            )
        ]
    )
    def create(self, request, *args, **kwargs):
        if self.request.user.profile.post != 'Admin':
            return Response({'message': 'Создать зачет может только админ КЦ'}, status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            replace_field_error_messages(serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name='company',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description='Слаг компании для фильтрации',
                required=True
            ),
            OpenApiParameter(
                name='mode',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description='Режим фильтрации (my-exam - зачеты, авторизованного пользователя',
                enum=['my-exam']
            ),
            OpenApiParameter(
                name='result',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description='Фильтрация по результату ',
                enum=[
                    'Не допущен',
                    'Допущен',
                    'Отмена',
                    'Неявка',
                    'Не состоялось'
                ]
            ),
            OpenApiParameter(
                name='date_from',
                type=OpenApiTypes.DATE,
                location=OpenApiParameter.QUERY,
                description='Дата начала периода (формат YYYY-MM-DD)'
            ),
            OpenApiParameter(
                name='date_to',
                type=OpenApiTypes.DATE,
                location=OpenApiParameter.QUERY,
                description='Дата окончания периода (формат YYYY-MM-DD)'
            ),
        ],
        responses={
            200: ExamSerializer(many=True),
            400: OpenApiResponse(description="Неверные параметры запроса")
        }
    )
    def list(self, request, *args, **kwargs):
        if self.request.user.profile.post == 'Operator':
            return Response({'message': 'Пользователь не может посмотреть список зачетов'},
                            status=status.HTTP_403_FORBIDDEN)
        response = super().list(request, *args, **kwargs)
        count = response.data.get('count')
        response.data['page'] = ceil(count / 10)
        return response


@extend_schema(
    tags=['Зачеты'],
    summary="Обновление зачета админом ДМ",
    description="""
    API для работы с зачетами.
    Позволяет обновлять зачеты админу ДМ.
    Доступные методы: PATCH (частичное обновление).
    """
)
class ExamUpdateApiView(viewsets.ModelViewSet):
    serializer_class = ExamSerializer
    queryset = Exam.objects.all()
    http_method_names = ['patch']

    @extend_schema(
        request=CreateExamSerializer,
        responses={
            200: ExamSerializer,
            400: OpenApiResponse(description="Неверные данные запроса"),
            403: OpenApiResponse(description="У данного пользователя нет прав на изменение зачета")
        },
        examples=[
            OpenApiExample(
                'Пример запроса на обновление зачета для админа ДМ',
                value={
                    'company': 'Указывается id компании авторизованного пользователя type=int. Посмотреть можно тут: http://127.0.0.1:8000/api-root/companies/',
                    'date_exam': '2025-12-15',
                    'try_count': 1,
                    'time_exam': '13:00:00',
                    'name_examiner': 'Указывается id админа ДМ. type=int. Посмотреть можно тут: http://127.0.0.1:8000/api-root/admin/',
                    'result_exam': 'Допущен !доступный список можно посмотреть тут: http://127.0.0.1:8000/api-root/results/',
                    'comment_exam': 'Какое-то примечание (не обязательно)'
                },
                request_only=True
            )
        ]
    )
    def update(self, request, *args, **kwargs):
        if self.request.user.profile.post != 'OKK':
            return Response({'message': 'Создать зачет может только админ КЦ'}, status=status.HTTP_403_FORBIDDEN)
        exam = self.get_object()
        serializer = self.get_serializer(exam, data=request.data, partial=True)
        errors = {}

        try:

            serializer.is_valid(raise_exception=True)

        except ValidationError as e:
            replace_field_error_messages(e.detail)
            errors.update(e.detail)

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


@extend_schema(
    tags=['Технические данные'],
    summary="Получение списка результатов",
    description="""
    API для получения технических данных, используемых для фильтрации, выпадающих списков и пр.
    results: Список доступных результатов. Используется при редактировании зачета админом ДМ, после его проведения.
    """
)
class ResultApiView(viewsets.ViewSet):
    @extend_schema(
        responses={
            200: {
                'type': 'object',
                'properties': {
                    'results': {
                        'type': 'array',
                        'items': {
                            'type': 'string',
                            'enum': [res[0] for res in Exam.result_list]
                        }
                    }
                },
                'example': {
                    'results': ['Отмена', 'Неявка', 'Допущен', 'Не допущен', 'Не состоялось']
                }
            }
        }
    )
    def list(self, request):
        serializer = ResultSerializer()
        results = [res[0] for res in Exam.result_list]
        return Response({"results": results})