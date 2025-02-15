from rest_framework import serializers
from checklists.models import Mistake, SubMistake, CheckList


class MistakeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mistake
        fields = '__all__'


class SubMistakeSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubMistake
        fields = '__all__'


class ChListSerializer(serializers.ModelSerializer):
    controller_full_name = serializers.SerializerMethodField()
    operator_name_full_name = serializers.SerializerMethodField()

    first_miss_name = serializers.SerializerMethodField()
    second_miss_name = serializers.SerializerMethodField()
    third_miss_name = serializers.SerializerMethodField()
    forty_miss_name = serializers.SerializerMethodField()
    fifty_miss_name = serializers.SerializerMethodField()
    sixty_miss_name = serializers.SerializerMethodField()

    line_name = serializers.SerializerMethodField()

    class Meta:
        model = CheckList
        fields = (
            'date', 'controller_full_name', 'operator_name_full_name', 'type_appeal','call_date', 'call_time', 'call_id', 'first_miss_name', 'second_miss_name',
            'third_miss_name', 'forty_miss_name', 'fifty_miss_name', 'sixty_miss_name', 'result', 'line_name', 'first_comm', 'second_comm',
            'third_comm', 'forty_comm', 'fifty_comm', 'sixty_comm',)

    def get_controller_full_name(self, obj):
        if obj.controller:
            return obj.controller.profile.full_name
        return ''

    def get_operator_name_full_name(self, obj):
        if obj.operator_name:
            return obj.operator_name.profile.full_name
        return ''

    def get_first_miss_name(self, obj):
        if obj.first_miss:
            return obj.first_miss.name
        return ''

    def get_second_miss_name(self, obj):
        if obj.second_miss:
            return obj.second_miss.name
        return ''

    def get_third_miss_name(self, obj):
        if obj.third_miss:
            return obj.third_miss.name
        return ''

    def get_forty_miss_name(self, obj):
        if obj.forty_miss:
            return obj.forty_miss.name
        return ''

    def get_fifty_miss_name(self, obj):
        if obj.fifty_miss:
            return obj.fifty_miss.name
        return ''

    def get_sixty_miss_name(self, obj):
        if obj.sixty_miss:
            return obj.sixty_miss.name
        return ''

    def get_line_name(self, obj):
        if obj.line:
            return obj.line.name_line
        return ''


class CreateChListSerializer(serializers.ModelSerializer):
    class Meta:
        model = CheckList
        fields = ['company', 'operator_name', 'type_appeal', 'line', 'call_date', 'call_time', 'call_id',
                  'first_miss', 'second_miss', 'third_miss', 'forty_miss', 'fifty_miss', 'sixty_miss', 'first_comm',
                  'second_comm', 'third_comm', 'forty_comm', 'fifty_comm', 'sixty_comm', 'claim', 'just',
                  'claim_number']
