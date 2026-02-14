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
from .report_views import DownloadReportView
from .sharing_views import ShareReportView, UnshareReportView, SharedReportView
from .benchmark_views import BenchmarkView
from .phase3_views import (
    MultiMarketAnalysisView,
    ScenarioModelView,
    DeepDiveView,
    FinancialModelView,
    MultiMarketReportListView,
    PlaybookView,
)

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

    # Report downloads
    path('reports/<int:report_id>/download/<str:report_type>/', DownloadReportView.as_view(), name='download-report'),

    # Phase 3: Advanced Analysis
    path('multi-market-analysis/', MultiMarketAnalysisView.as_view(), name='multi-market-analysis'),
    path('multi-market-reports/', MultiMarketReportListView.as_view(), name='multi-market-reports'),
    path('scenario-model/', ScenarioModelView.as_view(), name='scenario-model'),
    path('deep-dive/', DeepDiveView.as_view(), name='deep-dive'),
    path('reports/<int:report_id>/financial-model/', FinancialModelView.as_view(), name='financial-model'),

    # Phase 4: Playbook & Execution
    path('reports/<int:report_id>/playbook/', PlaybookView.as_view(), name='playbook'),

    # Phase 5: Sharing & Benchmarks
    path('reports/<int:report_id>/share/', ShareReportView.as_view(), name='share-report'),
    path('reports/<int:report_id>/unshare/', UnshareReportView.as_view(), name='unshare-report'),
    path('shared/<str:share_token>/', SharedReportView.as_view(), name='shared-report'),
    path('benchmarks/', BenchmarkView.as_view(), name='benchmarks'),
]