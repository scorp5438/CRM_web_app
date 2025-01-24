from rest_framework import viewsets

from .serializers import MistakeSerializer
from ..models import Mistake
class MistakeApiView(viewsets.ModelViewSet):
    serializer_class = MistakeSerializer
    queryset = Mistake.objects.all()
    http_method_names = ['get']