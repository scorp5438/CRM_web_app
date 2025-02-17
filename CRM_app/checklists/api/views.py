from datetime import timedelta
from math import ceil

from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.response import Response

from profiles.models import Companies
from .serializers import MistakeSerializer, SubMistakeSerializer, CreateChListSerializer, ChListSerializer
from ..models import Mistake, SubMistake, CheckList
from utils.utils import replace_field_error_messages

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

        return queryset

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        result_list = [result.get('result') for result in response.data.get('results')]
        try:
            avg_result = sum(result_list) / len(result_list)
        except ZeroDivisionError:
            avg_result = 0
        response.data['avg_result'] = round(avg_result, 2)
        count = response.data.get('count')
        response.data['page'] = ceil(count / 10)
        return response

    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(controller=user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            replace_field_error_messages(serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



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


class MistakeApiView(viewsets.ModelViewSet):
    serializer_class = MistakeSerializer
    queryset = Mistake.objects.all()
    http_method_names = ['get']


class SubMistakeApiView(viewsets.ModelViewSet):
    serializer_class = SubMistakeSerializer
    queryset = SubMistake.objects.all()
    http_method_names = ['get']

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        count = response.data.get('count')
        response.data['page'] = ceil(count / 10)
        return response
