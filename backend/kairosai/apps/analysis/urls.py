from django.urls import path
from .views import (
    MarketAnalysisAPIView, 
    DeepMarketAnalysisAPIView,
    HealthCheckAPIView, 
    quick_market_analysis,
    KeyInsightsAPIView,
    CompetitorAnalysisAPIView,
)
from typing import Dict

app_name = 'analysis'

urlpatterns = [
    path('health/', HealthCheckAPIView.as_view(), name='health-check'),
    path('market-analysis/', MarketAnalysisAPIView.as_view(), name='market-analysis'),
    path('deep-analysis/', DeepMarketAnalysisAPIView.as_view(), name='deep-analysis'),
    path('quick-analysis/', quick_market_analysis, name='quick-analysis'),
    path('key-insights/', KeyInsightsAPIView.as_view(), name='key-insights'),
    path('competitor-analysis/', CompetitorAnalysisAPIView.as_view(), name='competitor-analysis'),
]