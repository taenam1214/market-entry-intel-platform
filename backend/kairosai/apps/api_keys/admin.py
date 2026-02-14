from django.contrib import admin
from .models import APIKey


@admin.register(APIKey)
class APIKeyAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'is_active', 'usage_count', 'last_used', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('name', 'user__email')
    ordering = ('-created_at',)
    readonly_fields = ('key', 'usage_count', 'last_used', 'created_at')
