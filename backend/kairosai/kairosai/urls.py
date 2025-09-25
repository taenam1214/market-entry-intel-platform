from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include('apps.analysis.urls')),
    path('api/v1/companies/', include('apps.companies.urls')),
    path('api/v1/auth/', include('apps.accounts.urls')),
]
