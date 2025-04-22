from django.contrib.auth.models import User
from drf_spectacular.utils import extend_schema, OpenApiExample, extend_schema_view, OpenApiResponse
from rest_framework import viewsets, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response

from profiles.models import Companies, Lines
# from profiles.api.serializers import CompanySerializer
from .serializers import (UserExamSerializer,
                          CompanySerializer,
                          AdminCcSerializer,
                          AdminMainSerializer,
                          LinesSerializer,
                          TableDataSerializer)


class CompaniesApiView(viewsets.ModelViewSet):
    serializer_class = CompanySerializer
    http_method_names = ['get']
    queryset = Companies.objects.exclude(main_company=True).order_by('pk')

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        count_all = sum([count.get('count_exams') for count in response.data.get('results')])
        response.data['is_count'] = bool(count_all)
        return response


@extend_schema_view(
    list=extend_schema(
        tags=['Технические данные'],
        summary="Получение данных о назначенных экзаменов на авторизованного админа ДМ",
        description="""
        API для получения данных о текущем аутентифицированном пользователе и связанных с ним экзаменах.
        Доступно только для администраторов.

        Возвращает:
        - Username
        - Количество назначенных зачетов
        """,
        responses={
            200: UserExamSerializer,
            403: "Доступ запрещен (требуются права администратора)"
        },
        examples=[
            OpenApiExample(
                'Пример успешного ответа',
                value={
                    "username": "admin",
                    "count_exams": 5,

                },
                response_only=True
            )
        ]
    )
)
class UserExamApiView(viewsets.ModelViewSet):
    """
    API для работы с данными авторизированного пользователя и назначенных экзаменов.
    Позволяет аутентифицированному администратору получать информацию
    о своем профиле и статистику по экзаменам.
    """
    serializer_class = UserExamSerializer
    http_method_names = ['get']
    permission_classes = [IsAdminUser]

    @extend_schema(exclude=True)
    def retrieve(self, request, *args, **kwargs):
        """Отключаем endpoint для получения по id"""
        return Response({"detail": "Метод не разрешен"}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def get_queryset(self):
        user = self.request.user
        queryset = User.objects.select_related('profile').filter(id=user.id, profile__status='Работает').order_by('pk')
        return queryset


class TableUserData(viewsets.ModelViewSet):
    serializer_class = TableDataSerializer
    http_method_names = ['get']
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        queryset = User.objects.select_related('profile').filter(is_staff=True, profile__status='Работает').order_by(
            'pk')
        return queryset


@extend_schema_view(
    list=extend_schema(
        tags=['Технические данные'],
        summary="Получить список администраторов компании",
        description="""
        API для получения списка администраторов текущей компании пользователя.

        Требования:
        - Пользователь должен быть авторизован

        Фильтрация:
        - Исключаются операторы (profile__post='Operator')
        - Только пользователи той же компании

        Возвращает:
        - ID пользователя
        - Username
        - Имя пользователя

        """,
        responses={
            200: AdminCcSerializer(many=True),
            403: OpenApiResponse(description="Доступ запрещен (требуется авторизация и права staff)")
        },
        examples=[
            OpenApiExample(
                'Пример успешного ответа',
                value=[
                    {
                        "id": 1,
                        "username": "admin1",
                        "full_name": "Иванов Иван Иванович",
                    },
                    {
                        "id": 2,
                        "username": "admin2",
                        "full_name": "Петров Петр Петрович",
                    }
                ],
                response_only=True
            )
        ]
    ),
    retrieve=extend_schema(
        tags=['Технические данные'],
        summary="Получить данные конкретного администратора",
        description="""
        Получение данных конкретного администратора компании.

        Требования:
        - Пользователь должен быть авторизован
        - Администратор должен принадлежать той же компании
        """,
        responses={
            200: AdminCcSerializer,
            403: OpenApiResponse(description="Доступ запрещен"),
            404: OpenApiResponse(description="Администратор не найден")
        }
    )
)
class AdminApiView(viewsets.ModelViewSet):
    """
    API для работы с администраторами компании.
    Обеспечивает доступ к данным администраторов текущей компании пользователя.
    """
    serializer_class = AdminCcSerializer
    http_method_names = ['get']
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Возвращает queryset с администраторами компании текущего пользователя,
        исключая операторов.
        """
        company = self.request.user.profile.company
        queryset = User.objects.exclude(profile__post='Operator').filter(profile__company=company).select_related('profile').order_by('pk')
        return queryset


class OperatorApiView(viewsets.ModelViewSet):
    serializer_class = AdminMainSerializer
    http_method_names = ['get']

    def get_queryset(self):
        company_slug = self.request.GET.get('company', None)
        company = Companies.objects.filter(slug=company_slug).first()
        queryset = User.objects.filter(profile__company=company, profile__post='Operator').select_related('profile').order_by('pk')
        return queryset


@extend_schema_view(
    list=extend_schema(
        tags=["Технические данные"],
        summary="Получить список всех линий",
        description="""
        API для получения списка всех доступных линий, отсортированных по ID.

        Используется при:
        - Создании проверки в чек-листе администратором ДМ
        - Заполнении выпадающих списков

        Возвращает:
        - Название линии
        """,
        responses={
            200: LinesSerializer(many=True),
            403: OpenApiResponse(description="Доступ запрещен")
        },
        examples=[
            OpenApiExample(
                'Пример успешного ответа',
                value=[
                    {
                        "id": 1,
                        "name_line": "1 линия",
                    },
                    {
                        "id": 2,
                        "name_line": "Очередь",
                    },
                    {
                        "id": 3,
                        "name_line": "Курьер",
                    }
                ],
                response_only=True
            )
        ]
    ),
    retrieve=extend_schema(
        tags=["Технические данные"],
        summary="Получить детали конкретной линии",
        description="""
        Получение детальной информации по конкретной линии.

        Параметры:
        - id: идентификатор линии (обязательный)
        """,
        responses={
            200: LinesSerializer,
            404: OpenApiResponse(description="Линия не найдена"),
            403: OpenApiResponse(description="Доступ запрещен")
        },
        examples=[
            OpenApiExample(
                'Пример успешного ответа',
                value={
                    "id": 1,
                    "name": "1 линия",
                },
                response_only=True
            )
        ]
    )
)
class LinesApiView(viewsets.ModelViewSet):
    """
    API для работы с техническими данными линий.
    Предоставляет доступ только для чтения к списку линий и деталям конкретной линии.
    """
    serializer_class = LinesSerializer
    queryset = Lines.objects.all().order_by('pk')
    http_method_names = ['get']
