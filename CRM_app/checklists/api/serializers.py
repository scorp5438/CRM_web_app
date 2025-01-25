from rest_framework import serializers
from checklists.models import Mistake, CheckList


class MistakeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mistake
        fields = '__all__'


class CreteChListSerializer(serializers.ModelSerializer):
    class Meta:
        model = CheckList
        fields = ['company', 'operator_name', 'type_appeal', 'line', 'call_date', 'call_time', 'call_id',
                  'first_miss', 'second_miss', 'third_miss', 'forty_miss', 'fifty_miss', 'sixty_miss', 'first_comm',
                  'second_comm', 'third_comm', 'forty_comm', 'fifty_comm', 'sixty_comm', 'claim', 'just',
                  'claim_number']
