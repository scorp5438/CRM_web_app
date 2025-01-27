from pprint import pprint

from rest_framework import viewsets, serializers, status
from rest_framework.response import Response

from .serializers import MistakeSerializer, SubMistakeSerializer, CreateChListSerializer, ChListSerializer
from ..models import Mistake, SubMistake, CheckList


class MistakeApiView(viewsets.ModelViewSet):
    serializer_class = MistakeSerializer
    queryset = Mistake.objects.all()
    http_method_names = ['get']


class SubMistakeApiView(viewsets.ModelViewSet):
    serializer_class = SubMistakeSerializer
    queryset = SubMistake.objects.all()
    http_method_names = ['get']


class ChListApiView(viewsets.ModelViewSet):
    serializer_class = ChListSerializer
    queryset = CheckList.objects.select_related('operator_name', 'controller', 'line', 'first_miss', 'second_miss',
                                                'third_miss', 'forty_miss', 'fifty_miss', 'sixty_miss').all()
    http_method_names = ['get']

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        result_list = [result.get('result') for result in response.data.get('results')]
        try:
            avg_result = sum(result_list) / len(result_list)
        except ZeroDivisionError:
            avg_result = 0
        response.data['avg_result'] = round(avg_result, 2)
        return response


class ChListCreateApiView(viewsets.ModelViewSet):
    serializer_class = CreateChListSerializer
    queryset = CheckList.objects.all()
    http_method_names = ['get', 'post']

    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(controller=user)

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        return Response({'message': 'Проверка успешно добавлена'}, status=status.HTTP_201_CREATED)
