from django.contrib import admin
from .models import MarketReport, ChatConversation, ChatMessage


@admin.register(MarketReport)
class MarketReportAdmin(admin.ModelAdmin):
    list_display = ('user', 'company_name', 'target_market', 'industry', 'status', 'analysis_type', 'created_at')
    list_filter = ('status', 'analysis_type', 'industry')
    search_fields = ('company_name', 'target_market', 'user__email')
    ordering = ('-created_at',)


@admin.register(ChatConversation)
class ChatConversationAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'created_at', 'updated_at')
    search_fields = ('user__email', 'title')
    ordering = ('-updated_at',)


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('conversation', 'message_type', 'created_at')
    list_filter = ('message_type',)
    ordering = ('-created_at',)
