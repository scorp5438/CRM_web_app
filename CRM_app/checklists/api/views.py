from datetime import datetime, timedelta
from math import ceil

from django.db.models import Avg
from django.http import QueryDict
from django.utils import timezone
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiExample, OpenApiResponse, OpenApiParameter
from rest_framework import viewsets, status
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from profiles.models import Companies
from utils.utils import replace_field_error_messages
from .serializers import MistakeSerializer, SubMistakeSerializer, CreateChListSerializer, ChListSerializer, \
    ComplaintsSerializer, CheckDouble
from ..models import Mistake, SubMistake, CheckList


def check_double_ch_list(data: QueryDict):
    now = timezone.now()
    first_day_of_month = now.replace(day=1)
    last_day_of_month = (now.replace(day=1) + timedelta(days=32)).replace(day=1) - timedelta(days=1)
    call_id = data.get('call_id')
    operator_id = data.get('operator_name')

    queryset = CheckList.objects.filter(
        call_id=call_id,
        operator_name=operator_id,
        date__gte=first_day_of_month,
        date__lte=last_day_of_month
    )

    if queryset:
        raise ValidationError({'error': 'Данное обращение уже проверено ранее'})


@extend_schema_view(
    list=extend_schema(
        tags=['Чек листы'],
        summary="Получить список чек-листов",
        description="""
        API для работы с чек-листами. Позволяет:
        - Получить список чек-листов с фильтрацией
        - Просмотреть средний результат

        Фильтрация:
        - По компании (обязательно для staff пользователей)
        - По типу проверки (call/write)
        - По дате (период)
        - Для операторов - только свои чек-листы

        Возвращает:
        - Список чек-листов
        - Средний результат (avg_result)
        - Пагинацию (page)
        """,
        parameters=[
            OpenApiParameter(
                name='company',
                type=str,
                location=OpenApiParameter.QUERY,
                description='Слаг компании (обязателен для staff пользователей)'
            ),
            OpenApiParameter(
                name='check_type',
                type=str,
                location=OpenApiParameter.QUERY,
                description='Тип проверки',
                enum=['call', 'write'],
                required=True
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
            200: ChListSerializer(many=True),
            400: OpenApiResponse(description="Неверные параметры запроса"),
            403: OpenApiResponse(description="Доступ запрещен")
        }
    ),
    create=extend_schema(
        tags=['Чек листы'],
        summary="Создать новый чек-лист",
        description="""
        Создание нового чек-листа.

        Особенности:
        - Для звонков обязательно указание линии и вреся звонка
        - Проверка на дубликаты по call_id и operator_name
        - Автоматическое сохранение контроллера (текущий пользователь)
        """,
        request=CreateChListSerializer,
        responses={
            201: ChListSerializer,
            400: OpenApiResponse(description="Неверные данные запроса"),
            403: OpenApiResponse(description="Доступ запрещен")
        },
        examples=[
            OpenApiExample(
                'Пример запроса для звонка',
                value={
                    "type_appeal": "звонок",
                    "operator_name": 1,
                    "company": 1,
                    "line": "Основная линия",
                    "call_id": "12345",
                    "call_time": "Время звонка HH:MM:SS",
                    "first_miss": "По умолчанию 1, значит ошибки нет. указывается id ошибки type=int. Берем тут: http://127.0.0.1:8000/api-root/sub-mistakes/",
                    "second_miss": "По умолчанию 1, значит ошибки нет. указывается id ошибки type=int. Берем тут: http://127.0.0.1:8000/api-root/sub-mistakes/",
                    "third_miss": "По умолчанию 1, значит ошибки нет. указывается id ошибки type=int. Берем тут: http://127.0.0.1:8000/api-root/sub-mistakes/",
                    "forty_miss": "По умолчанию 1, значит ошибки нет. указывается id ошибки type=int. Берем тут: http://127.0.0.1:8000/api-root/sub-mistakes/",
                    "fifty_miss": "По умолчанию 1, значит ошибки нет. указывается id ошибки type=int. Берем тут: http://127.0.0.1:8000/api-root/sub-mistakes/",
                    "sixty_miss": "По умолчанию 1, значит ошибки нет. указывается id ошибки type=int. Берем тут: http://127.0.0.1:8000/api-root/sub-mistakes/",
                    "first_comm": "По умолчанию 1, значит ошибки нет",
                    "second_comm": "Не обязательное поле",
                    "third_comm": "Не обязательное поле",
                    "forty_comm": "Не обязательное поле",
                    "fifty_comm": "Не обязательное поле",
                    "sixty_comm": "Не обязательное поле",
                    "claim": "Жалоба",
                    "just": "Обоснованность жалобы, если проверка является жалобой",
                    "claim_number": "Номер жалобы, если проверка является жалобой"

                },
                request_only=True
            ),
            OpenApiExample(
                'Пример запроса для письма',
                value={
                    "type_appeal": "звонок",
                    "operator_name": 1,
                    "company": 1,
                    "call_id": "12345",
                    "first_miss": "Указывается id подпункта, соответствующий данному пункту type=int. Берем тут: http://127.0.0.1:8000/api-root/sub-mistakes/",
                    "second_miss": "Указывается id подпункта, соответствующий данному пункту type=int. Берем тут: http://127.0.0.1:8000/api-root/sub-mistakes/",
                    "third_miss": "Указывается id подпункта, соответствующий данному пункту type=int. Берем тут: http://127.0.0.1:8000/api-root/sub-mistakes/",
                    "forty_miss": "Указывается id подпункта, соответствующий данному пункту type=int. Берем тут: http://127.0.0.1:8000/api-root/sub-mistakes/",
                    "fifty_miss": "Указывается id подпункта, соответствующий данному пункту type=int. Берем тут: http://127.0.0.1:8000/api-root/sub-mistakes/",
                    "sixty_miss": "Указывается id подпункта, соответствующий данному пункту type=int. Берем тут: http://127.0.0.1:8000/api-root/sub-mistakes/",
                    "first_comm": "Не обязательное поле",
                    "second_comm": "Не обязательное поле",
                    "third_comm": "Не обязательное поле",
                    "forty_comm": "Не обязательное поле",
                    "fifty_comm": "Не обязательное поле",
                    "sixty_comm": "Не обязательное поле",
                    "claim": "Жалоба",
                    "just": "Обоснованность жалобы, если проверка является жалобой",
                    "claim_number": "Номер жалобы, если проверка является жалобой"

                },
                request_only=True
            )
        ]
    )
)
class ChListApiView(viewsets.ModelViewSet):
    """
    API для работы с чек-листами.
    Позволяет просматривать и создавать чек-листы с различными типами проверок.
    """
    http_method_names = ['get', 'post']
    permission_classes = [IsAuthenticated]

    @extend_schema(exclude=True)
    def retrieve(self, request, *args, **kwargs):
        return Response({"detail": "Метод не разрешен"}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    @property
    def get_serializer(self, *args, **kwargs):
        if self.request.method == 'GET':
            return ChListSerializer
        elif self.request.method == 'PATCH' or self.request.method == 'POST':
            return CreateChListSerializer

    def get_queryset(self):
        """
        Возвращает queryset с чек-листами, отфильтрованными по:
        - Компании (для staff - по параметру, для остальных - по компании пользователя)
        - Типу проверки (call/write)
        - Дате (период)
        - Для операторов - только свои чек-листы
        """
        check_type_dict = {
            'call': 'звонок',
            'write': 'письма',
        }
        company_slug = self.request.GET.get('company', None)
        check_type = self.request.GET.get('check_type', None)
        date_from = self.request.GET.get('date_from', None)
        date_to = self.request.GET.get('date_to', None)

        now = timezone.now()

        if not date_from or date_from == 'undefined':
            first_day_of_month = now.replace(day=1).date()  # Преобразуем в date
        else:
            first_day_of_month = datetime.strptime(date_from, "%Y-%m-%d").date()  # Преобразуем в date

        if not date_to or date_to == 'undefined':
            last_day_of_month = (now.replace(day=1) + timedelta(days=32)).replace(day=1) - timedelta(days=1)
            last_day_of_month = last_day_of_month.date()  # Преобразуем в date
        else:
            last_day_of_month = datetime.strptime(date_to, "%Y-%m-%d").date()

        queryset = CheckList.objects.select_related(
            'operator_name',
            'company',
            'controller',
            'line',
            'first_miss',
            'second_miss',
            'third_miss',
            'forty_miss',
            'fifty_miss',
            'sixty_miss'
        ).filter(
            date__gte=first_day_of_month,
            date__lte=last_day_of_month
        )

        if self.request.user.is_staff:
            company = Companies.objects.filter(slug=company_slug).first()
        else:
            company = self.request.user.profile.company

        if not company:
            return CheckList.objects.none()

        queryset = queryset.filter(company=company.pk, type_appeal=check_type_dict.get(check_type)).order_by('date')
        if self.request.user.profile.post == 'Operator':
            queryset = queryset.filter(operator_name=self.request.user)

        return queryset

    def list(self, request, *args, **kwargs):
        """
        Переопределенный метод list для добавления:
        - Среднего результата (avg_result)
        - Пагинации (page)
        """
        response = super().list(request, *args, **kwargs)
        queryset = self.get_queryset()
        avg = queryset.aggregate(Avg('result'))


        if queryset:
            response.data['avg_result'] = round(avg.get('result__avg'), 2)
        else:
            response.data['avg_result'] = 0
        count = response.data.get('count')
        response.data['page'] = ceil(count / 10)
        return response

    def perform_create(self, serializer):
        """Автоматическое сохранение контроллера (текущий пользователь)"""
        user = self.request.user
        serializer.save(controller=user)

    def create(self, request, *args, **kwargs):
        """
        Создание чек-листа с валидацией:
        - Проверка дубликатов для call_id и operator_name
        - Обязательность линии для звонков
        """
        if self.request.data.get('call_id') and self.request.data.get('operator_name'):
            check_double_ch_list(self.request.data)
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            type_appeal = serializer.validated_data.get('type_appeal')
            line = serializer.validated_data.get('line')
            if type_appeal == 'звонок' and line in ['', None]:
                return Response({'line': ['Пожалуйста, укажите линию.']}, status.HTTP_400_BAD_REQUEST)
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            replace_field_error_messages(serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema_view(
    create=extend_schema(
        tags=["Технические данные"],
        summary="Проверка дублирования чек-листа",
        description="""
        API для проверки возможного дублирования чек-листа.

        Проверяет существование чек-листа с такими же:
        - call_id (ID звонка)
        - operator_name (ID оператора)

        Требования:
        - Пользователь должен быть авторизован

        Возвращает:
        - message: True (если проверка выполнена успешно)
        """,
        request=CheckDouble,
        responses={
            200: OpenApiResponse(
                description="Проверка выполнена успешно",
                response={
                    "message": True
                }
            ),
            400: OpenApiResponse(description="Данное обращение уже проверено ранее"),
            403: OpenApiResponse(description="Доступ запрещен")
        },
        examples=[
            OpenApiExample(
                'Пример запроса',
                value={
                    "call_id": "12345",
                    "operator_name": 1
                },
                request_only=True
            ),
            OpenApiExample(
                'Пример ответа',
                value={
                    "message": True
                },
                response_only=True
            )
        ]
    )
)
class CheckDoubleChListApiView(viewsets.ModelViewSet):
    """
    API для проверки дублирования чек-листов.
    Позволяет проверить существование чек-листа с одинаковым call_id и operator_name.
    """
    http_method_names = ['post']
    serializer_class = CheckDouble
    queryset = CheckList.objects.all()
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        """
        Проверяет существование дубликата чек-листа.
        Вызывает функцию check_double_ch_list с данными запроса.
        """
        check_double_ch_list(self.request.data)
        return Response({'message':True}, status.HTTP_200_OK)


@extend_schema_view(
    list=extend_schema(
        tags=['Чек листы'],
        summary="Получить список жалоб",
        description="""
        API для получения списка жалоб с возможностью фильтрации.

        Фильтрация:
        - По компании (обязательно для staff пользователей)
        - По дате (период)
        - Для операторов - только свои жалобы

        Параметры по умолчанию:
        - Если date_from не указан - первый день текущего месяца
        - Если date_to не указан - последний день текущего месяца

        Возвращает:
        - Список жалоб с деталями
        - Пагинацию (поле page)
        """,
        parameters=[
            OpenApiParameter(
                name='company',
                type=str,
                location=OpenApiParameter.QUERY,
                description='Слаг компании (обязателен для is_staff пользователей)'
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
            200: ComplaintsSerializer(many=True),
            400: OpenApiResponse(description="Неверные параметры запроса"),
            403: OpenApiResponse(description="Доступ запрещен"),
            404: OpenApiResponse(description="Компания не найдена")
        },
        examples=[
            OpenApiExample(
                'Пример запроса для staff',
                value={
                    "company": "company-slug",
                    "date_from": "2023-01-01",
                    "date_to": "2023-01-31"
                },
                request_only=True
            ),
            OpenApiExample(
                'Пример ответа',
                value={
                    "count": 15,
                    "page": 2,
                    "results": [
                        {
                            "id": 1,
                            "date": "2023-01-15",
                            "operator_name": "Иванов Иван",
                            "company": "Компания 1",
                            "just": True,
                        },
                    ]
                },
                response_only=True
            )
        ]
    )
)
class ComplaintsApiView(viewsets.ModelViewSet):
    """
    API для работы с жалобами.
    Предоставляет доступ к списку жалоб с возможностью фильтрации.
    """
    http_method_names = ['get']
    serializer_class = ComplaintsSerializer
    permission_classes = [IsAuthenticated]

    @extend_schema(exclude=True)
    def retrieve(self, request, *args, **kwargs):
        return Response({"detail": "Метод не разрешен"}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def get_queryset(self):
        now = timezone.now()

        company_slug = self.request.GET.get('company', None)
        date_from = self.request.GET.get('date_from', None)
        date_to = self.request.GET.get('date_to', None)

        if not self.request.GET.get('date_from'):
            first_day_of_month = now.replace(day=1)
        else:
            first_day_of_month = date_from
        if not self.request.GET.get('date_to'):
            last_day_of_month = (now.replace(day=1) + timedelta(days=32)).replace(day=1) - timedelta(days=1)
        else:
            last_day_of_month = date_to

        queryset = CheckList.objects.select_related(
            'operator_name',
            'company',
        ).filter(
            just=True,
            date__gte=first_day_of_month,
            date__lte=last_day_of_month
        )
        user = self.request.user
        if user.is_staff:
            company = Companies.objects.filter(slug=company_slug).first()
        else:
            company = self.request.user.profile.company

        if not company:
            return CheckList.objects.none()

        queryset = queryset.filter(company=company.pk).order_by('date')
        if self.request.user.profile.post == 'Operator':
            queryset = queryset.filter(operator_name=self.request.user)

        return queryset

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        count = response.data.get('count')
        response.data['page'] = ceil(count / 10)
        return response


@extend_schema_view(
    list=extend_schema(
        tags=['Технические данные'],
        summary="Получить список всех основных ошибок",
        description="""
        API для получения списка всех основных ошибок, отсортированных по ID.

        Возвращает:
        - ID ошибки
        - Название ошибки
        - Дополнительные параметры ошибки
        """,
        responses={
            200: MistakeSerializer(many=True),
            403: "Доступ запрещен"
        },
        examples=[
            OpenApiExample(
                'Пример успешного ответа',
                value=[
                    {
                        "id": 1,
                        "name": "Не представление",
                        "description": "Оператор не представился",
                        "score": 5
                    },
                    {
                        "id": 2,
                        "name": "Неверная информация",
                        "description": "Предоставление неверных данных",
                        "score": 10
                    }
                ],
                response_only=True
            )
        ]
    ),
    retrieve=extend_schema(
        tags=['Технические данные'],
        summary="Получить детали конкретной ошибки",
        description="Получение детальной информации по конкретной основной ошибке",
        responses={
            200: MistakeSerializer,
            404: "Ошибка не найдена"
        }
    )
)
class MistakeApiView(viewsets.ModelViewSet):
    """
    API для работы с основными ошибками.
    Предоставляет доступ только для чтения к списку основных ошибок.
    """
    serializer_class = MistakeSerializer
    queryset = Mistake.objects.all().order_by('pk')
    http_method_names = ['get']
    permission_classes = [IsAuthenticated]

    @extend_schema(exclude=True)
    def retrieve(self, request, *args, **kwargs):
        return Response({"detail": "Метод не разрешен"}, status=status.HTTP_405_METHOD_NOT_ALLOWED)


@extend_schema_view(
    list=extend_schema(
        tags=['Технические данные'],
        summary="Получить список всех подошибок",
        description="""
        API для получения списка всех подошибок, отсортированных по названию.

        Возвращает:
        - ID подошибки
        - Название подошибки
        - Связанную основную ошибку
        - Дополнительные параметры
        - Пагинацию (page в ответе)
        """,
        responses={
            200: SubMistakeSerializer(many=True),
            403: "Доступ запрещен"
        },
        examples=[
            OpenApiExample(
                'Пример успешного ответа',
                value={
                    "count": 15,
                    "page": 2,
                    "results": [
                        {
                            "id": 1,
                            "name": "Не назвал компанию",
                            "mistake": 1,
                            "description": "Не назвал название компании"
                        },
                        {
                            "id": 2,
                            "name": "Не назвал имя",
                            "mistake": 1,
                            "description": "Не представился по имени"
                        }
                    ]
                },
                response_only=True
            )
        ]
    ),
    retrieve=extend_schema(
        tags=['Технические данные'],
        summary="Получить детали конкретной подошибки",
        description="Получение детальной информации по конкретной подошибке",
        responses={
            200: SubMistakeSerializer,
            404: "Подошибка не найдена"
        }
    )
)
class SubMistakeApiView(viewsets.ModelViewSet):
    """
    API для работы с подошибками.
    Предоставляет доступ только для чтения к списку подошибок с пагинацией.
    """
    serializer_class = SubMistakeSerializer
    queryset = SubMistake.objects.all().order_by('name')
    http_method_names = ['get']
    permission_classes = [IsAuthenticated]

    @extend_schema(exclude=True)
    def retrieve(self, request, *args, **kwargs):
        return Response({"detail": "Метод не разрешен"}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def list(self, request, *args, **kwargs):
        """
        Переопределенный метод list для добавления пагинации.
        Добавляет в ответ поле 'page' с текущей страницей.
        """

        if self.request.user.profile.post == 'Operator':
            return Response({'message': 'Пользователь не может посмотреть список зачетов'},
                            status=status.HTTP_403_FORBIDDEN)

        response = super().list(request, *args, **kwargs)
        count = response.data.get('count')
        response.data['page'] = ceil(count / 10)
        return response
