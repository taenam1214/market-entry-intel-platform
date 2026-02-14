from django.urls import path
from .views import APIKeyListCreateView, APIKeyDetailView, APIKeyUsageView

app_name = 'api_keys'

urlpatterns = [
    path('', APIKeyListCreateView.as_view(), name='apikey-list-create'),
    path('<int:pk>/', APIKeyDetailView.as_view(), name='apikey-detail'),
    path('<int:pk>/usage/', APIKeyUsageView.as_view(), name='apikey-usage'),
]
