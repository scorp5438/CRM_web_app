from datetime import datetime, timedelta
from django.utils import timezone

from rest_framework import viewsets, serializers
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError

from .serializers import ExamSerializer
from .models import Exam


class ExamView(viewsets.ModelViewSet):
    serializer_class = ExamSerializer

    def get_queryset(self):
        company = self.request.user.company
        now = timezone.now()
        # if not self.request.get('date'):
        first_day_of_month = now.replace(day=1)
        last_day_of_month = (first_day_of_month + timedelta(days=32)).replace(day=1) - timedelta(days=1)

        if self.request.user.is_staff:
            queryset = Exam.objects.filter(date_exam__gte=first_day_of_month,
                                           date_exam__lte=last_day_of_month).prefetch_related('companies', 'profiles')
        else:
            queryset = Exam.objects.filter(company=company.id, date_exam__gte=first_day_of_month,
                                           date_exam__lte=last_day_of_month).prefetch_related('companies', 'profiles')
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
