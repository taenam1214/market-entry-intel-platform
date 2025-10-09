"""
WSGI config for kairosai project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

# Use production settings if in production environment (Railway sets RAILWAY_ENVIRONMENT)
if os.getenv('RAILWAY_ENVIRONMENT') == 'production' or os.getenv('RAILWAY_PROJECT_ID'):
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'kairosai.settings_production')
else:
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'kairosai.settings')

application = get_wsgi_application()
