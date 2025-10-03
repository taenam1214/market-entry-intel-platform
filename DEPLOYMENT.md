# Deployment Guide

## Quick Fix for Gunicorn Error

The "gunicorn: command not found" error occurs because Gunicorn is not installed. I've added it to your requirements.txt file.

## Installation Steps

1. **Install Gunicorn and WhiteNoise:**
   ```bash
   pip install gunicorn==21.2.0 whitenoise==6.6.0
   ```

2. **Or reinstall all requirements:**
   ```bash
   pip install -r backend/kairosai/requirements.txt
   ```

## Deployment Options

### Option 1: Heroku (Recommended)

1. **Install Heroku CLI** and login
2. **Create a new Heroku app:**
   ```bash
   heroku create your-app-name
   ```

3. **Set environment variables:**
   ```bash
   heroku config:set SECRET_KEY=your-secret-key
   heroku config:set DEBUG=False
   heroku config:set ALLOWED_HOSTS=your-app-name.herokuapp.com
   heroku config:set DB_NAME=your_db_name
   heroku config:set DB_USER=your_db_user
   heroku config:set DB_PASSWORD=your_db_password
   heroku config:set DB_HOST=your_db_host
   heroku config:set OPENAI_API_KEY=your_openai_key
   # ... add other environment variables
   ```

4. **Add PostgreSQL addon:**
   ```bash
   heroku addons:create heroku-postgresql:hobby-dev
   ```

5. **Deploy:**
   ```bash
   git add .
   git commit -m "Add production configuration"
   git push heroku main
   ```

6. **Run migrations:**
   ```bash
   heroku run python manage.py migrate
   ```

### Option 2: Railway

1. **Connect your GitHub repository to Railway**
2. **Set environment variables in Railway dashboard**
3. **Railway will automatically detect the Procfile and deploy**

### Option 3: DigitalOcean App Platform

1. **Create a new app in DigitalOcean**
2. **Connect your GitHub repository**
3. **Set environment variables**
4. **Deploy**

## Environment Variables Required

```bash
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=your-domain.com,www.your-domain.com
CORS_ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com

# Database (PostgreSQL for production)
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_HOST=your_database_host
DB_PORT=5432

# Redis
REDIS_URL=redis://localhost:6379/0

# AI Services
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
SERPER_API_KEY=your_serper_api_key

# Google OAuth
GOOGLE_OAUTH2_CLIENT_ID=your_google_client_id
GOOGLE_OAUTH2_CLIENT_SECRET=your_google_client_secret
```

## Local Testing

To test the production setup locally:

```bash
cd backend/kairosai
export DJANGO_SETTINGS_MODULE=kairosai.settings_production
python manage.py collectstatic --noinput
gunicorn kairosai.wsgi:application --bind 0.0.0.0:8000
```

## Frontend Deployment

For the frontend, you can deploy to:

1. **Vercel** (recommended for React apps)
2. **Netlify**
3. **GitHub Pages**

Make sure to update the API URLs in your frontend to point to your production backend URL.

## Troubleshooting

1. **Gunicorn not found:** Make sure it's installed: `pip install gunicorn`
2. **Static files not loading:** Run `python manage.py collectstatic`
3. **Database errors:** Check your database configuration and run migrations
4. **CORS errors:** Update CORS_ALLOWED_ORIGINS with your frontend URL
