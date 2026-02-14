from django.urls import path
from .views import (
    MonitorListCreateView,
    MonitorDetailView,
    AlertListView,
    AlertMarkReadView,
    ExecutionPlanView,
    ExecutionPlanDetailView,
    MilestoneUpdateView,
    CompetitorTrackerListView,
    CompetitorTrackerDetailView,
    CompetitorUpdateListView,
    NewsFeedView,
)

app_name = 'monitoring'

urlpatterns = [
    path('monitors/', MonitorListCreateView.as_view(), name='monitor-list-create'),
    path('monitors/<int:pk>/', MonitorDetailView.as_view(), name='monitor-detail'),
    path('alerts/', AlertListView.as_view(), name='alert-list'),
    path('alerts/<int:pk>/read/', AlertMarkReadView.as_view(), name='alert-mark-read'),
    path('execution-plans/', ExecutionPlanView.as_view(), name='execution-plan-list'),
    path('execution-plans/<int:pk>/', ExecutionPlanDetailView.as_view(), name='execution-plan-detail'),
    path('milestones/<int:pk>/', MilestoneUpdateView.as_view(), name='milestone-update'),
    path('competitor-trackers/', CompetitorTrackerListView.as_view(), name='competitor-tracker-list'),
    path('competitor-trackers/<int:pk>/', CompetitorTrackerDetailView.as_view(), name='competitor-tracker-detail'),
    path('competitor-updates/', CompetitorUpdateListView.as_view(), name='competitor-update-list'),
    path('news-feed/', NewsFeedView.as_view(), name='news-feed'),
]
