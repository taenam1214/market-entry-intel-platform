#!/bin/bash
# Post-deployment script for Railway

echo "Setting Django settings to production..."
export DJANGO_SETTINGS_MODULE=kairosai.settings_production

echo "Running migrations with production settings..."
python manage.py migrate

echo "Creating superuser if it doesn't exist..."
echo "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.filter(email='admin@example.com').exists() or User.objects.create_superuser('admin@example.com', 'admin', 'password123')" | python manage.py shell

echo "Post-deployment completed successfully!"
