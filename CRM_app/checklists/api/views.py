from datetime import timedelta

from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.response import Response

from .serializers import MistakeSerializer, SubMistakeSerializer, CreateChListSerializer, ChListSerializer
from ..models import Mistake, SubMistake, CheckList
from profiles.models import Companies

class ChListApiView(viewsets.ModelViewSet):
    http_method_names = ['get', 'post', 'patch']

    def get_serializer(self, *args, **kwargs):
        if self.request.method == 'GET':
            return ChListSerializer
        elif self.request.method == 'PATCH' or self.request.method == 'POST':
            return CreateChListSerializer

    def get_queryset(self):
        company_slug = self.request.GET.get('company', None)
        mode = self.request.GET.get('mode', None)
        check_type = self.request.GET.get('check_type', None)
        data_from = self.request.GET.get('data_from', None)
        data_to = self.request.GET.get('data_to', None)

        now = timezone.now()
        company_id = Companies.objects.filter(slug=company_slug).first().id
        if not self.request.GET.get('data_from'):
            first_day_of_month = now.replace(day=1)
        else:
            first_day_of_month = data_from

        if not self.request.GET.get('data_to'):
            last_day_of_month = (now.replace(day=1) + timedelta(days=32)).replace(day=1) - timedelta(days=1)
        else:
            last_day_of_month = data_to

        if self.request.user.is_staff:
            queryset = CheckList.objects.select_related('operator_name', 'controller', 'line', 'first_miss',
                                                        'second_miss',
                                                        'third_miss', 'forty_miss', 'fifty_miss', 'sixty_miss').filter(company=company_id, type_appeal=check_type)




        queryset = CheckList.objects.select_related('operator_name', 'controller', 'line', 'first_miss',
                                                        'second_miss',
                                                        'third_miss', 'forty_miss', 'fifty_miss', 'sixty_miss').all()

        return queryset.order_by('date')

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        result_list = [result.get('result') for result in response.data.get('results')]
        try:
            avg_result = sum(result_list) / len(result_list)
        except ZeroDivisionError:
            avg_result = 0
        response.data['avg_result'] = round(avg_result, 2)
        return response

    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(controller=user)

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        return Response({'message': 'Проверка успешно добавлена'}, status=status.HTTP_201_CREATED)


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
