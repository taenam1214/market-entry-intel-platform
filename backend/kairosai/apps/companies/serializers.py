from rest_framework import serializers
from .models import Company

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ['id', 'name', 'industry', 'website', 'description', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at'] 