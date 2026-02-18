# Production-Ready Authentication System

## ✅ Implemented Features

### 1. **Email Verification** ✅
- Users receive a 6-digit verification code after registration
- Code expires in 24 hours
- Email must be verified before login
- Verification code is logged in development mode for testing

**Endpoints:**
- `POST /api/v1/auth/verify-email` - Verify email with code (requires auth)
- `POST /api/v1/auth/resend-verification` - Resend verification code

### 2. **Password Reset Flow** ✅
- Secure password reset with token-based system
- Reset tokens expire in 1 hour
- Email sent with reset link
- Password complexity enforced on reset

**Endpoints:**
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password with token

### 3. **Account Security** ✅
- Account lockout after 5 failed login attempts
- Lockout duration: 30 minutes
- Failed attempts counter resets on successful login
- Email verification required before login

### 4. **Email Service** ✅
- Uses Resend (free tier: 100 emails/day)
- HTML email templates for verification and password reset
- Falls back to logging in development mode
- Verification codes logged in development for easy testing

## 📧 Email Configuration

### Environment Variables Required:

```env
# Email Service (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxx  # Get from https://resend.com/api-keys
FROM_EMAIL=noreply@yourdomain.com  # Must be verified in Resend
APP_NAME=Ticketing Platform        # App name for emails
FRONTEND_URL=http://localhost:5173 # Frontend URL for password reset links
```

### Setting Up Resend (Free Tier):

1. Sign up at https://resend.com
2. Verify your domain (or use `onboarding@resend.dev` for testing)
3. Get your API key from the dashboard
4. Add to `.env` file

**Note:** In development without `RESEND_API_KEY`, emails are logged to console instead of being sent.

## 🔐 Authentication Flow

### Registration Flow:
1. User registers → Account created (unverified)
2. 6-digit verification code sent to email
3. User verifies email with code → Gets access token
4. User can now login

### Login Flow:
1. User attempts login
2. System checks:
   - Account not locked
   - Email verified
   - Password correct
3. On success: Returns tokens
4. On failure: Increments failed attempts (locks after 5)

### Password Reset Flow:
1. User requests password reset
2. Reset token generated and sent via email
3. User clicks link or uses token
4. User sets new password
5. Token invalidated

## 📝 API Endpoints

### Public Endpoints:

#### Register
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!",
  "name": "John Doe"
}

Response:
{
  "success": true,
  "message": "Registration successful! Please check your email for the verification code.",
  "data": {
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!"
}

Response:
{
  "success": true,
  "data": {
    "user": { ... },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

#### Verify Email (Protected)
```http
POST /api/v1/auth/verify-email
Authorization: Bearer <token>
Content-Type: application/json

{
  "code": "123456"
}

Response:
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "user": { ... },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

#### Resend Verification
```http
POST /api/v1/auth/resend-verification
Content-Type: application/json

{
  "email": "user@example.com"
}

Response:
{
  "success": true,
  "message": "Verification code has been sent to your email."
}
```

#### Forgot Password
```http
POST /api/v1/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}

Response:
{
  "success": true,
  "message": "If an account exists with this email, a password reset link has been sent."
}
```

#### Reset Password
```http
POST /api/v1/auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "password": "NewPassword123!"
}

Response:
{
  "success": true,
  "message": "Password has been reset successfully. You can now login with your new password."
}
```

## 🗄️ Database Schema Updates

### User Model New Fields:
- `isEmailVerified` (Boolean, default: false)
- `verificationCode` (String, 6 digits)
- `verificationCodeExpires` (Date, 24 hours)
- `passwordResetToken` (String, crypto random)
- `passwordResetExpires` (Date, 1 hour)
- `failedLoginAttempts` (Number, default: 0)
- `lockedUntil` (Date, optional)

## 🔒 Security Features

1. **Email Verification Required**: Users cannot login until email is verified
2. **Account Lockout**: 5 failed attempts = 30 minute lockout
3. **Secure Tokens**: Password reset tokens are cryptographically random
4. **Token Expiration**: 
   - Verification codes: 24 hours
   - Reset tokens: 1 hour
5. **Rate Limiting**: All auth endpoints are rate-limited
6. **Password Complexity**: Enforced on registration and reset

## 🧪 Testing in Development

### Without Resend API Key:
- Emails are logged to console
- Verification codes are logged with format: `🔐 Verification code for email@example.com: 123456`
- Check server logs to get verification codes

### With Resend API Key:
- Emails are sent via Resend
- Check your email inbox
- Use `onboarding@resend.dev` for testing (no domain verification needed)

## 📋 Testing Checklist

- [ ] Register new user → Check email/logs for verification code
- [ ] Verify email with code → Should get tokens
- [ ] Try login before verification → Should fail
- [ ] Login after verification → Should succeed
- [ ] Try wrong password 5 times → Account should lock
- [ ] Request password reset → Check email/logs for reset link
- [ ] Reset password → Should succeed
- [ ] Login with new password → Should succeed

## 🚀 Production Deployment

### Before deploying:
1. Set `RESEND_API_KEY` in production environment
2. Verify your domain in Resend
3. Update `FROM_EMAIL` to your verified domain
4. Update `FRONTEND_URL` to production URL
5. Set strong `JWT_SECRET` and `JWT_REFRESH_SECRET`

### Environment Variables Checklist:
```env
NODE_ENV=production
RESEND_API_KEY=re_xxxxxxxxxxxxx
FROM_EMAIL=noreply@yourdomain.com
APP_NAME=Your App Name
FRONTEND_URL=https://yourdomain.com
JWT_SECRET=<32+ character secret>
JWT_REFRESH_SECRET=<32+ character secret>
```

## 📚 Next Steps (Optional Enhancements)

- [ ] Two-factor authentication (2FA)
- [ ] Email change verification
- [ ] Session management (list active sessions)
- [ ] Password history (prevent reuse)
- [ ] Account deletion with confirmation
- [ ] Social login (OAuth)

---

**Status**: ✅ Production-Ready  
**Last Updated**: After implementing email verification and password reset

