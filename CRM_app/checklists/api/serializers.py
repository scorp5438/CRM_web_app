from rest_framework import serializers
from checklists.models import Mistake

class MistakeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mistake
        fields = '__all__'