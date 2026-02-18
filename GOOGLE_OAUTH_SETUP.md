# Google OAuth Setup Guide

## Overview

The ticketing platform now supports Google OAuth authentication, allowing users to register and login using their Google accounts. This provides a seamless authentication experience without requiring users to create a new password.

## Features

✅ **Google OAuth Registration & Login** - Users can sign in with Google  
✅ **Account Linking** - Existing local accounts can be linked to Google  
✅ **Email Verification** - Google emails are automatically verified  
✅ **Seamless Integration** - Works alongside traditional email/password auth  

---

## Setup Instructions

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google+ API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/v1/auth/google/callback` (development)
     - `https://yourdomain.com/api/v1/auth/google/callback` (production)
   - Save and copy your **Client ID** and **Client Secret**

### Step 2: Configure Environment Variables

Add these variables to your `.env` file:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/v1/auth/google/callback
```

**For Production:**
```env
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/v1/auth/google/callback
```

### Step 3: Frontend Integration

#### Option A: Direct Backend Callback (Recommended)

1. **Redirect user to Google OAuth:**
```javascript
const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
  `client_id=${GOOGLE_CLIENT_ID}&` +
  `redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}&` +
  `response_type=code&` +
  `scope=openid%20email%20profile&` +
  `access_type=offline`;

window.location.href = googleAuthUrl;
```

2. **Handle callback and send code to backend:**
```javascript
// Extract code from URL query params
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');

if (code) {
  // Send code to backend
  const response = await fetch('/api/v1/auth/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  
  const data = await response.json();
  // Save tokens and redirect
  localStorage.setItem('accessToken', data.data.accessToken);
  localStorage.setItem('refreshToken', data.data.refreshToken);
}
```

#### Option B: Frontend OAuth Flow

If you prefer handling OAuth entirely on the frontend:

1. Use a library like `@react-oauth/google` or `google-auth-library` on the frontend
2. Get the authorization code from Google
3. Send the code to your backend endpoint: `POST /api/v1/auth/google`

---

## API Endpoint

### POST `/api/v1/auth/google`

Authenticate user with Google OAuth authorization code.

**Request:**
```json
{
  "code": "4/0AeanS..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Google authentication successful",
  "data": {
    "user": {
      "_id": "...",
      "email": "user@gmail.com",
      "name": "John Doe",
      "role": "user",
      "provider": "google",
      "isEmailVerified": true,
      "createdAt": "2026-02-17T...",
      "updatedAt": "2026-02-17T..."
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**

- **400** - Missing or invalid authorization code
- **401** - Google OAuth not configured or authentication failed
- **409** - Account conflict (email already exists with different provider)

---

## How It Works

### Registration Flow

1. User clicks "Sign in with Google" on frontend
2. Frontend redirects to Google OAuth consent screen
3. User grants permissions
4. Google redirects back with authorization code
5. Frontend sends code to backend: `POST /api/v1/auth/google`
6. Backend:
   - Exchanges code for Google ID token
   - Verifies token and extracts user info
   - Creates new user account (if doesn't exist)
   - Links Google account (if email exists with local auth)
   - Returns JWT tokens

### Login Flow

1. User clicks "Sign in with Google"
2. Same flow as registration
3. If user exists with Google ID → Login
4. If user exists with same email but local auth → Link accounts
5. Returns JWT tokens

### Account Linking

If a user has an existing account with email/password and then signs in with Google using the same email:

- The Google account is automatically linked
- The account switches to Google OAuth provider
- User can no longer login with password (must use Google)
- All existing data is preserved

---

## Database Schema Changes

The User model now includes:

```typescript
{
  provider: 'local' | 'google',  // Default: 'local'
  googleId?: string,              // Google user ID (for OAuth users)
  password?: string,              // Optional (not required for Google users)
}
```

**Indexes:**
- `googleId` - Sparse unique index for OAuth users

---

## Security Considerations

1. **Email Verification**: Google OAuth users are automatically verified (Google verifies emails)
2. **Password Not Required**: Google users don't need passwords
3. **Account Lockout**: Google OAuth logins reset failed login attempts
4. **Token Validation**: Google ID tokens are verified server-side
5. **HTTPS Required**: Use HTTPS in production for OAuth redirects

---

## Testing

### Test with Postman

1. **Get Authorization Code:**
   - Visit: `https://accounts.google.com/o/oauth2/v2/auth?client_id=YOUR_CLIENT_ID&redirect_uri=http://localhost:3000/api/v1/auth/google/callback&response_type=code&scope=openid%20email%20profile`
   - Sign in with Google
   - Copy the `code` from the redirect URL

2. **Send to Backend:**
```http
POST http://localhost:3000/api/v1/auth/google
Content-Type: application/json

{
  "code": "4/0AeanS..."
}
```

### Test Account Linking

1. Create account with email/password: `POST /api/v1/auth/register`
2. Sign in with Google using same email
3. Account should be linked automatically
4. Try logging in with password → Should fail (must use Google)

---

## Troubleshooting

### "Google OAuth is not configured"
- Check that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in `.env`

### "Failed to authenticate with Google"
- Verify redirect URI matches exactly (including protocol and port)
- Check that Google+ API is enabled
- Ensure authorization code hasn't expired (codes expire quickly)

### "An account with this email already exists"
- This happens if trying to create a Google account with an email that already has a Google account
- User should login with existing Google account instead

### "Please sign in with Google"
- User tried to login with password but account is linked to Google
- User must use Google OAuth to login

---

## Frontend Example (React)

```typescript
import { useState } from 'react';

function GoogleSignInButton() {
  const handleGoogleSignIn = () => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    const redirectUri = encodeURIComponent(
      `${window.location.origin}/auth/google/callback`
    );
    
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${redirectUri}&` +
      `response_type=code&` +
      `scope=openid%20email%20profile&` +
      `access_type=offline`;
    
    window.location.href = googleAuthUrl;
  };

  return (
    <button onClick={handleGoogleSignIn}>
      Sign in with Google
    </button>
  );
}

// Callback handler
function GoogleCallback() {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
      fetch('/api/v1/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
        .then(res => res.json())
        .then(data => {
          localStorage.setItem('accessToken', data.data.accessToken);
          localStorage.setItem('refreshToken', data.data.refreshToken);
          window.location.href = '/dashboard';
        })
        .catch(err => {
          console.error('Google auth failed:', err);
          setLoading(false);
        });
    }
  }, []);
  
  return loading ? <div>Authenticating...</div> : <div>Authentication failed</div>;
}
```

---

## Production Checklist

- [ ] Google OAuth credentials created
- [ ] Production redirect URI added to Google Console
- [ ] Environment variables set in production
- [ ] HTTPS enabled (required for OAuth)
- [ ] Frontend OAuth flow tested
- [ ] Account linking tested
- [ ] Error handling implemented

---

**Note**: Google OAuth is **100% free** and included in Google Cloud Platform's free tier. No additional costs for authentication.

