from rest_framework import serializers
from .models import MarketReport, ChatConversation, ChatMessage

class MarketReportSerializer(serializers.ModelSerializer):
    """Serializer for MarketReport model"""
    
    class Meta:
        model = MarketReport
        fields = [
            'id', 'analysis_id', 'user', 'analysis_type', 'status',
            'company_name', 'industry', 'target_market', 'website',
            'current_positioning', 'brand_description',
            'dashboard_data', 'detailed_scores', 'research_report',
            'key_insights', 'revenue_projections', 'recommended_actions',
            'executive_summary', 'full_content',
            'created_at', 'updated_at', 'completed_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'completed_at']

class MarketReportListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing market reports"""
    
    class Meta:
        model = MarketReport
        fields = [
            'id', 'analysis_id', 'analysis_type', 'status',
            'company_name', 'industry', 'target_market',
            'executive_summary', 'created_at', 'completed_at'
        ]

class ChatMessageSerializer(serializers.ModelSerializer):
    """Serializer for ChatMessage model"""
    
    class Meta:
        model = ChatMessage
        fields = ['id', 'message_type', 'content', 'sources', 'created_at']
        read_only_fields = ['id', 'created_at']

class ChatConversationSerializer(serializers.ModelSerializer):
    """Serializer for ChatConversation model"""
    messages = ChatMessageSerializer(many=True, read_only=True)
    
    class Meta:
        model = ChatConversation
        fields = ['id', 'title', 'messages', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class ChatMessageCreateSerializer(serializers.Serializer):
    """Serializer for creating new chat messages"""
    content = serializers.CharField(max_length=5000)
    conversation_id = serializers.IntegerField(required=False, allow_null=True)
