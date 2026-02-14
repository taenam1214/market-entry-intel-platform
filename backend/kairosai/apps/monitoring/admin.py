from django.contrib import admin
from .models import (
    MarketMonitor,
    MarketAlert,
    ExecutionPlan,
    Milestone,
    CompetitorTracker,
    CompetitorUpdate,
)


@admin.register(MarketMonitor)
class MarketMonitorAdmin(admin.ModelAdmin):
    list_display = ('user', 'report', 'is_active', 'frequency', 'last_checked', 'created_at')
    list_filter = ('is_active', 'frequency')
    search_fields = ('user__email', 'report__company_name', 'report__target_market')
    ordering = ('-created_at',)


@admin.register(MarketAlert)
class MarketAlertAdmin(admin.ModelAdmin):
    list_display = ('title', 'monitor', 'alert_type', 'severity', 'is_read', 'created_at')
    list_filter = ('alert_type', 'severity', 'is_read')
    search_fields = ('title', 'description', 'monitor__report__company_name')
    ordering = ('-created_at',)


@admin.register(ExecutionPlan)
class ExecutionPlanAdmin(admin.ModelAdmin):
    list_display = ('user', 'report', 'status', 'started_at', 'created_at', 'updated_at')
    list_filter = ('status',)
    search_fields = ('user__email', 'report__company_name', 'report__target_market')
    ordering = ('-created_at',)


@admin.register(Milestone)
class MilestoneAdmin(admin.ModelAdmin):
    list_display = ('title', 'plan', 'phase', 'is_completed', 'target_date', 'completed_date', 'estimated_cost')
    list_filter = ('is_completed', 'phase')
    search_fields = ('title', 'description', 'plan__report__company_name')
    ordering = ('phase', 'created_at')


@admin.register(CompetitorTracker)
class CompetitorTrackerAdmin(admin.ModelAdmin):
    list_display = ('competitor_name', 'user', 'report', 'is_active', 'last_checked', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('competitor_name', 'user__email', 'report__company_name')
    ordering = ('-created_at',)


@admin.register(CompetitorUpdate)
class CompetitorUpdateAdmin(admin.ModelAdmin):
    list_display = ('title', 'tracker', 'update_type', 'detected_at')
    list_filter = ('update_type',)
    search_fields = ('title', 'description', 'tracker__competitor_name')
    ordering = ('-detected_at',)
