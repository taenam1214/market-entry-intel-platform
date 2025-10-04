#!/bin/bash
# Build script for Railway deployment

echo "Setting Django settings to production..."
export DJANGO_SETTINGS_MODULE=kairosai.settings_production

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Build completed successfully!"
echo "Note: Migrations will be run after deployment to ensure proper database connection."
