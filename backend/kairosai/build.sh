#!/bin/bash
# Build script for Railway deployment

echo "Setting Django settings to production..."
export DJANGO_SETTINGS_MODULE=kairosai.settings_production

echo "Running migrations with production settings..."
python manage.py migrate

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Build completed successfully!"
