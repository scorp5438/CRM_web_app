from datetime import timedelta
from django.utils import timezone

from rest_framework import viewsets, serializers, status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from .serializers import ExamSerializer
from ..models import Exam
from profiles.models import Companies


class ExamApiView(viewsets.ModelViewSet):
    serializer_class = ExamSerializer

    def get_queryset(self):
        company_slug = self.request.session.get('company')
        mode = self.request.session.get('mode')
        now = timezone.now()
        # if not self.request.get('date'):
        first_day_of_month = now.replace(day=1)
        last_day_of_month = (first_day_of_month + timedelta(days=32)).replace(day=1) - timedelta(days=1)

        if self.request.user.is_staff:
            if mode:
                queryset = Exam.objects.filter(name_examiner=self.request.user.id, result_exam='',
                                               date_exam=now).select_related('company', 'name_train',
                                                                             'internal_test_examiner')
            else:
                company = Companies.objects.filter(slug=company_slug).first()

                # TODO Сделать и проверить фильтрацию екзаменов по КЦ для МэйнКомпании
                queryset = Exam.objects.filter(company=company.id, date_exam__gte=first_day_of_month,
                                               date_exam__lte=last_day_of_month).select_related('company', 'name_train',
                                                                                                'internal_test_examiner')

        else:
            company = self.request.user.profile.company
            queryset = Exam.objects.filter(company=company.id, date_exam__gte=first_day_of_month,
                                           date_exam__lte=last_day_of_month).select_related('company', 'name_train',
                                                                                            'internal_test_examiner')
        print(queryset)
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


class ExamCreateApiView(viewsets.ModelViewSet):
    serializer_class = ExamSerializer
    http_method_names = ['post']

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.profile.company, **serializer.validated_data)


class ExamUpdateApiView(viewsets.ModelViewSet):
    serializer_class = ExamSerializer
    http_method_names = ['patch']

    def patch(self, request, *args, **kwargs):
        exam = self.get_object()
        serializer = self.get_serializer(exam, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        return Response(serializer.data, status=status.HTTP_200_OK)
