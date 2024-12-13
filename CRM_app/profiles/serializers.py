from rest_framework import serializers

from .models import Companies


class CompanySerializer(serializers.ModelSerializer):
    """
    Сериализатор для модели Companies
    """
    class Meta:
        model = Companies
        fields = '__all__'