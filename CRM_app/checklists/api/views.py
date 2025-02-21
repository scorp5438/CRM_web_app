from datetime import timedelta
from math import ceil

from django.db.models import Avg
from django.http import QueryDict
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.exceptions import ValidationError
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


class ChListApiView(viewsets.ModelViewSet):
    http_method_names = ['get', 'post', 'patch']

    @property
    def get_serializer(self, *args, **kwargs):
        if self.request.method == 'GET':
            return ChListSerializer
        elif self.request.method == 'PATCH' or self.request.method == 'POST':
            return CreateChListSerializer

    def get_queryset(self):
        check_type_dict = {
            'call': 'звонок',
            'write': 'письма',
        }
        company_slug = self.request.GET.get('company', None)
        # mode = self.request.GET.get('mode', None)
        check_type = self.request.GET.get('check_type', None)
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
        response = super().list(request, *args, **kwargs)
        queryset = self.get_queryset()
        avg = queryset.aggregate(Avg('result'))

        if response.get('avg_result'):
            response.data['avg_result'] = round(avg.get('result__avg'), 2)
        else:
            response.data['avg_result'] = 0
        count = response.data.get('count')
        response.data['page'] = ceil(count / 10)
        return response

    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(controller=user)

    def create(self, request, *args, **kwargs):
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


class CheckDoubleChListApiView(viewsets.ModelViewSet):
    http_method_names = ['post']
    serializer_class = CheckDouble
    queryset = CheckList.objects.all()

    def create(self, request, *args, **kwargs):
        check_double_ch_list(self.request.data)
        return Response({'message':True}, status.HTTP_200_OK)


# class ChListCreateApiView(viewsets.ModelViewSet):
#     serializer_class = CreateChListSerializer
#     queryset = CheckList.objects.all()
#     http_method_names = ['get', 'post']
#
#     def perform_create(self, serializer):
#         user = self.request.user
#         serializer.save(controller=user)
#
#     def create(self, request, *args, **kwargs):
#         response = super().create(request, *args, **kwargs)
#         return Response({'message': 'Проверка успешно добавлена'}, status=status.HTTP_201_CREATED)

class ComplaintsApiView(viewsets.ModelViewSet):
    http_method_names = ['get']
    serializer_class = ComplaintsSerializer

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


class MistakeApiView(viewsets.ModelViewSet):
    serializer_class = MistakeSerializer
    queryset = Mistake.objects.all().order_by('pk')
    http_method_names = ['get']


class SubMistakeApiView(viewsets.ModelViewSet):
    serializer_class = SubMistakeSerializer
    queryset = SubMistake.objects.all().order_by('pk')
    http_method_names = ['get']

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        count = response.data.get('count')
        response.data['page'] = ceil(count / 10)
        return response
