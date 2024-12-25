from rest_framework import viewsets
from django.contrib.auth.models import User
from rest_framework.permissions import IsAdminUser

# from profiles.api.serializers import CompanySerializer
from .serializers import UserExamSerializer, CompanySerializer
from profiles.models import Companies


class CompaniesApiView(viewsets.ModelViewSet):
    serializer_class = CompanySerializer
    http_method_names = ['get']
    queryset = Companies.objects.exclude(main_company=True)


class UserExamApiView(viewsets.ModelViewSet):
    serializer_class = UserExamSerializer
    http_method_names = ['get']
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        user = self.request.user
        queryset = User.objects.select_related('profile').filter(id=user.id)
        return queryset