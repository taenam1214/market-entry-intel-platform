from django.db import models
from django.contrib.auth import get_user_model
from apps.analysis.models import MarketReport

User = get_user_model()


class MarketMonitor(models.Model):
    FREQUENCY_CHOICES = [
        ('weekly', 'Weekly'),
        ('biweekly', 'Bi-weekly'),
        ('monthly', 'Monthly'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='market_monitors')
    report = models.ForeignKey(MarketReport, on_delete=models.CASCADE, related_name='monitors')
    is_active = models.BooleanField(default=True)
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES, default='weekly')
    last_checked = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ['user', 'report']

    def __str__(self):
        return f"Monitor: {self.report.company_name} - {self.report.target_market}"


class MarketAlert(models.Model):
    ALERT_TYPES = [
        ('regulatory', 'Regulatory Change'),
        ('competitor', 'Competitor Activity'),
        ('economic', 'Economic Indicator'),
        ('opportunity', 'New Opportunity'),
    ]
    SEVERITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    monitor = models.ForeignKey(MarketMonitor, on_delete=models.CASCADE, related_name='alerts')
    alert_type = models.CharField(max_length=20, choices=ALERT_TYPES)
    title = models.CharField(max_length=200)
    description = models.TextField()
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='medium')
    source_url = models.URLField(null=True, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.severity}] {self.title}"


class ExecutionPlan(models.Model):
    STATUS_CHOICES = [
        ('not_started', 'Not Started'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('paused', 'Paused'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='execution_plans')
    report = models.OneToOneField(MarketReport, on_delete=models.CASCADE, related_name='execution_plan')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='not_started')
    started_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Plan: {self.report.company_name} ({self.status})"


class Milestone(models.Model):
    plan = models.ForeignKey(ExecutionPlan, on_delete=models.CASCADE, related_name='milestones')
    title = models.CharField(max_length=200)
    description = models.TextField()
    phase = models.IntegerField()
    target_date = models.DateField(null=True, blank=True)
    completed_date = models.DateField(null=True, blank=True)
    is_completed = models.BooleanField(default=False)
    estimated_cost = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    actual_cost = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['phase', 'created_at']

    def __str__(self):
        return f"[Phase {self.phase}] {self.title}"


class CompetitorTracker(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='competitor_trackers')
    report = models.ForeignKey(MarketReport, on_delete=models.CASCADE, related_name='competitor_trackers')
    competitor_name = models.CharField(max_length=200)
    is_active = models.BooleanField(default=True)
    last_checked = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ['user', 'report', 'competitor_name']

    def __str__(self):
        return f"Tracking: {self.competitor_name}"


class CompetitorUpdate(models.Model):
    UPDATE_TYPES = [
        ('product_launch', 'Product Launch'),
        ('funding', 'Funding'),
        ('expansion', 'Expansion'),
        ('hiring', 'Hiring'),
        ('press', 'Press Coverage'),
    ]
    tracker = models.ForeignKey(CompetitorTracker, on_delete=models.CASCADE, related_name='updates')
    update_type = models.CharField(max_length=20, choices=UPDATE_TYPES)
    title = models.CharField(max_length=200)
    description = models.TextField()
    source_url = models.URLField(null=True, blank=True)
    detected_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-detected_at']

    def __str__(self):
        return f"[{self.update_type}] {self.title}"
