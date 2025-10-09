from django.urls import path
from .views import (
    ComprehensiveAnalysisAPIView,
    MarketAnalysisAPIView, 
    DeepMarketAnalysisAPIView,
    HealthCheckAPIView, 
    quick_market_analysis,
    KeyInsightsAPIView,
    CompetitorAnalysisAPIView,
    SegmentArbitrageAPIView,
)
from .chatbot_views import (
    MarketReportsAPIView,
    LatestDashboardDataAPIView,
    ChatConversationsAPIView,
    ChatMessageAPIView,
    ChatHistoryAPIView,
)
from typing import Dict

app_name = 'analysis'

urlpatterns = [
    path('health/', HealthCheckAPIView.as_view(), name='health-check'),
    path('comprehensive-analysis/', ComprehensiveAnalysisAPIView.as_view(), name='comprehensive-analysis'),
    path('market-analysis/', MarketAnalysisAPIView.as_view(), name='market-analysis'),
    path('deep-analysis/', DeepMarketAnalysisAPIView.as_view(), name='deep-analysis'),
    path('quick-analysis/', quick_market_analysis, name='quick-analysis'),
    path('key-insights/', KeyInsightsAPIView.as_view(), name='key-insights'),
    path('competitor-analysis/', CompetitorAnalysisAPIView.as_view(), name='competitor-analysis'),
    path('segment-arbitrage/', SegmentArbitrageAPIView.as_view(), name='segment-arbitrage'),
    
    # Chatbot API endpoints
    path('reports/', MarketReportsAPIView.as_view(), name='market-reports'),
    path('reports/<int:report_id>/', MarketReportsAPIView.as_view(), name='market-report-detail'),
    path('latest-dashboard/', LatestDashboardDataAPIView.as_view(), name='latest-dashboard'),
    path('chat/conversations/', ChatConversationsAPIView.as_view(), name='chat-conversations'),
    path('chat/messages/', ChatMessageAPIView.as_view(), name='chat-messages'),
    path('chat/conversations/<int:conversation_id>/', ChatHistoryAPIView.as_view(), name='chat-history'),
]