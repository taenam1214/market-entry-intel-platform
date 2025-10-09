from django.db import models
from django.contrib.auth import get_user_model
import json

User = get_user_model()

class MarketReport(models.Model):
    """Model to store generated market analysis reports"""
    
    ANALYSIS_TYPES = [
        ('standard', 'Standard Analysis'),
        ('deep', 'Deep Analysis'),
        ('quick', 'Quick Analysis'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    # Basic information
    id = models.AutoField(primary_key=True)
    analysis_id = models.CharField(max_length=100, unique=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='market_reports')
    
    # Analysis details
    analysis_type = models.CharField(max_length=20, choices=ANALYSIS_TYPES, default='standard')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Company and market information
    company_name = models.CharField(max_length=200)
    industry = models.CharField(max_length=100)
    target_market = models.CharField(max_length=100)
    website = models.URLField(blank=True, null=True)
    current_positioning = models.TextField(blank=True)
    brand_description = models.TextField(blank=True)
    
    # Additional company details (optional fields from AnalysisForm)
    customer_segment = models.CharField(max_length=50, blank=True, null=True)
    expansion_direction = models.CharField(max_length=50, blank=True, null=True)
    company_size = models.CharField(max_length=50, blank=True, null=True)
    annual_revenue = models.CharField(max_length=50, blank=True, null=True)
    funding_stage = models.CharField(max_length=50, blank=True, null=True)
    current_markets = models.CharField(max_length=200, blank=True, null=True)
    key_products = models.TextField(blank=True, null=True)
    competitive_advantage = models.TextField(blank=True, null=True)
    expansion_timeline = models.CharField(max_length=50, blank=True, null=True)
    budget_range = models.CharField(max_length=50, blank=True, null=True)
    regulatory_requirements = models.TextField(blank=True, null=True)
    partnership_preferences = models.TextField(blank=True, null=True)
    
    # Report content (stored as JSON)
    dashboard_data = models.JSONField(default=dict, blank=True)
    detailed_scores = models.JSONField(default=dict, blank=True)
    research_report = models.JSONField(default=dict, blank=True)
    competitor_analysis = models.JSONField(default=list, blank=True)  # Competitor data
    segment_arbitrage = models.JSONField(default=list, blank=True)  # Arbitrage opportunities
    key_insights = models.JSONField(default=list, blank=True)
    revenue_projections = models.JSONField(default=dict, blank=True)
    recommended_actions = models.JSONField(default=dict, blank=True)
    
    # Executive summary and content for RAG
    executive_summary = models.TextField(blank=True)
    full_content = models.TextField(blank=True)  # Full text content for RAG
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Market Report'
        verbose_name_plural = 'Market Reports'
    
    def __str__(self):
        return f"{self.company_name} - {self.target_market} ({self.analysis_type})"
    
    def get_summary_for_rag(self):
        """Get a summary of the report for RAG context"""
        return {
            'title': f"Market Analysis: {self.company_name} expanding to {self.target_market}",
            'type': self.analysis_type,
            'industry': self.industry,
            'target_market': self.target_market,
            'summary': self.executive_summary,
            'key_insights': self.key_insights,
            'scores': self.detailed_scores,
            'created_at': self.created_at.isoformat(),
        }

class ChatConversation(models.Model):
    """Model to store chat conversations with the AI assistant"""
    
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_conversations')
    title = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at']
        verbose_name = 'Chat Conversation'
        verbose_name_plural = 'Chat Conversations'
    
    def __str__(self):
        return f"Chat {self.id} - {self.user.email}"

class ChatMessage(models.Model):
    """Model to store individual chat messages"""
    
    MESSAGE_TYPES = [
        ('user', 'User Message'),
        ('assistant', 'Assistant Message'),
    ]
    
    id = models.AutoField(primary_key=True)
    conversation = models.ForeignKey(ChatConversation, on_delete=models.CASCADE, related_name='messages')
    message_type = models.CharField(max_length=20, choices=MESSAGE_TYPES)
    content = models.TextField()
    sources = models.JSONField(default=list, blank=True)  # Report sources used for RAG
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
        verbose_name = 'Chat Message'
        verbose_name_plural = 'Chat Messages'
    
    def __str__(self):
        return f"{self.message_type}: {self.content[:50]}..."
