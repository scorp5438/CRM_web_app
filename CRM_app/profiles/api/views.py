from rest_framework import viewsets

from profiles.api.serializers import CompanySerializer
from profiles.models import Companies


class CompaniesApiView(viewsets.ModelViewSet):
    serializer_class = CompanySerializer
    queryset = Companies.objects.exclude(slug='krutaya-kompaniya')
    http_method_names = ['get']