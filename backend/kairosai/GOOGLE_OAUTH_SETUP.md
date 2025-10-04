# Google OAuth Setup Instructions

## Backend Setup

### 1. Environment Variables
Create a `.env` file in the `backend/kairosai/` directory with the following variables:

```env
# Google OAuth Settings
GOOGLE_OAUTH2_CLIENT_ID=your-google-client-id-here
GOOGLE_OAUTH2_CLIENT_SECRET=your-google-client-secret-here
```

### 2. Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set the application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:8000/accounts/google/login/callback/`
   - `http://localhost:3000/` (for frontend)
7. Copy the Client ID and Client Secret to your `.env` file

### 3. Django Admin Setup
1. Run the Django server: `python manage.py runserver`
2. Go to `http://localhost:8000/admin/`
3. Navigate to "Social Applications" under "Social Accounts"
4. Add a new social application:
   - Provider: Google
   - Name: Google
   - Client id: Your Google Client ID
   - Secret key: Your Google Client Secret
   - Sites: Select your site

## Frontend Setup

### 1. Environment Variables
Create a `.env` file in the `frontend/` directory with:

```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
```

### 2. Google Identity Services
The frontend uses Google Identity Services library which is loaded dynamically. No additional setup is required.

## Testing the Integration

1. Start the Django backend: `python manage.py runserver`
2. Start the React frontend: `npm run dev`
3. Navigate to the login/register page
4. Click the "Sign in with Google" button
5. Complete the Google OAuth flow

## Features Implemented

- ✅ Google OAuth backend integration with django-allauth
- ✅ Custom User model with Google OAuth fields
- ✅ Google OAuth API endpoint (`/api/v1/auth/google-auth/`)
- ✅ Frontend Google OAuth button component
- ✅ Integration with existing login/register pages
- ✅ Automatic user creation/update on Google login
- ✅ Profile picture support from Google

## Database Changes

The User model now includes:
- `google_id`: Google user ID
- `provider`: Authentication provider ('google', 'email', etc.)
- `profile_picture`: URL to user's profile picture

## API Endpoints

- `POST /api/v1/auth/google-auth/` - Google OAuth authentication
- `POST /api/v1/auth/login/` - Traditional email/password login
- `POST /api/v1/auth/signup/` - Traditional email/password registration
