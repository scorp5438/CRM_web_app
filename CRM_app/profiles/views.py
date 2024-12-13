from django.contrib.auth.views import LogoutView
from django.urls import reverse_lazy

from rest_framework import viewsets
from rest_framework.response import Response

from .models import Companies
from .serializers import CompanySerializer


# Create your views here.

class MyLogoutView(LogoutView):
    next_page = reverse_lazy('profiles:login')


class CompaniesView(viewsets.ModelViewSet):
    serializer_class = CompanySerializer
    queryset = Companies.objects.exclude(slug='krutaya-kompaniya')
    http_method_names = ['get']