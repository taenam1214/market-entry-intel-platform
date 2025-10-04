# Railway Deployment Setup

## Environment Variables to Set in Railway Dashboard

Go to your Railway project dashboard and set these environment variables:

### Required Environment Variables:
```
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=market-entry-intel-platform-production.up.railway.app
CORS_ALLOWED_ORIGINS=https://market-entry-intel-platform-production.up.railway.app

# Database (Railway will provide these automatically)
DB_NAME=railway
DB_USER=postgres
DB_PASSWORD=your-railway-db-password
DB_HOST=your-railway-db-host
DB_PORT=5432

# AI Services
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
SERPER_API_KEY=your_serper_api_key

# Google OAuth
GOOGLE_OAUTH2_CLIENT_ID=your_google_client_id
GOOGLE_OAUTH2_CLIENT_SECRET=your_google_client_secret
```

## Quick Fix Commands

If you're still getting the ALLOWED_HOSTS error, try these commands in Railway:

1. **Set the environment variable directly:**
   ```bash
   railway variables set ALLOWED_HOSTS=market-entry-intel-platform-production.up.railway.app
   ```

2. **Or add it to your Railway dashboard:**
   - Go to your project
   - Click on "Variables" tab
   - Add: `ALLOWED_HOSTS` = `market-entry-intel-platform-production.up.railway.app`

3. **Redeploy:**
   ```bash
   railway up
   ```

## Alternative: Update settings.py directly

If the environment variable approach doesn't work, you can also update the default in settings.py:

```python
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1,market-entry-intel-platform-production.up.railway.app').split(',')
```

This should fix the "Invalid HTTP_HOST header" error.
