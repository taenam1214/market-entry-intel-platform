from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def health_check(request):
    """Health check endpoint for Railway"""
    return JsonResponse({'status': 'healthy', 'message': 'Application is running'})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('health/', health_check, name='health_check'),
    path('api/v1/', include('apps.analysis.urls')),
    path('api/v1/companies/', include('apps.companies.urls')),
    path('api/v1/auth/', include('apps.accounts.urls')),
    path('api/v1/payments/', include('apps.payments.urls')),
    path('api/v1/', include('apps.monitoring.urls')),
    path('api/v1/teams/', include('apps.teams.urls')),
    path('api/v1/api-keys/', include('apps.api_keys.urls')),
    path('accounts/', include('allauth.urls')),
]
