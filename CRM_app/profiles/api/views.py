from django.contrib.auth.models import User
from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser

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


class UserExamApiView(viewsets.ModelViewSet):
    serializer_class = UserExamSerializer
    http_method_names = ['get']
    permission_classes = [IsAdminUser]

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

class AdminApiView(viewsets.ModelViewSet):
    serializer_class = AdminCcSerializer
    http_method_names = ['get']

    def get_queryset(self):
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


class LinesApiView(viewsets.ModelViewSet):
    serializer_class = LinesSerializer
    queryset = Lines.objects.all().order_by('pk')
    http_method_names = ['get']
