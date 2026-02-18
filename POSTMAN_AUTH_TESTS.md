# Postman Authentication Tests - Complete Guide

## Base URL
```
http://localhost:3000/api/v1/auth
```

---

## 📝 Test Data

### User Credentials
```json
{
  "email": "testuser@example.com",
  "password": "TestPassword123!",
  "name": "Test User"
}
```

### Alternative Test Users
```json
// User 2
{
  "email": "john.doe@example.com",
  "password": "SecurePass456!",
  "name": "John Doe"
}

// User 3
{
  "email": "jane.smith@example.com",
  "password": "MyPassword789!",
  "name": "Jane Smith"
}
```

---

## 🧪 Test Flow

### **0. Google OAuth Authentication (Optional)**

**Prerequisites:**
- Google OAuth must be configured (see `GOOGLE_OAUTH_SETUP.md`)
- Get authorization code from Google OAuth flow

**Request:**
```http
POST http://localhost:3000/api/v1/auth/google
Content-Type: application/json
```

**Body:**
```json
{
  "code": "4/0AeanS..."
}
```
*Get code from Google OAuth redirect URL*

**Expected Response (200):**
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

**📌 Notes:**
- Creates new account if email doesn't exist
- Links to existing account if email exists with local auth
- Google users are automatically email verified
- Google users cannot login with password (must use Google OAuth)

---

### **1. Register New User**

**Request:**
```http
POST http://localhost:3000/api/v1/auth/register
Content-Type: application/json
```

**Body:**
```json
{
  "email": "testuser@example.com",
  "password": "TestPassword123!",
  "name": "Test User"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Registration successful. Please check your email for verification code.",
  "data": {
    "user": {
      "_id": "...",
      "email": "testuser@example.com",
      "name": "Test User",
      "role": "user",
      "isEmailVerified": false
    }
  }
}
```

**📌 Check Terminal:** Look for `🔐 VERIFICATION CODE for testuser@example.com: 123456`

---

### **2. Verify Email**

**Request:**
```http
POST http://localhost:3000/api/v1/auth/verify-email
Content-Type: application/json
```

**Body:**
```json
{
  "email": "testuser@example.com",
  "code": "123456"
}
```
*Use the 6-digit code from terminal*

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

---

### **3. Login**

**Request:**
```http
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json
```

**Body:**
```json
{
  "email": "testuser@example.com",
  "password": "TestPassword123!"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "...",
      "email": "testuser@example.com",
      "name": "Test User",
      "role": "user",
      "isEmailVerified": true
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**📌 Save:** Copy `accessToken` for protected routes

---

### **4. Get Current User Profile**

**Request:**
```http
GET http://localhost:3000/api/v1/auth/me
Authorization: Bearer <accessToken>
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "email": "testuser@example.com",
    "name": "Test User",
    "role": "user",
    "isEmailVerified": true,
    "createdAt": "2026-02-17T...",
    "updatedAt": "2026-02-17T..."
  }
}
```

---

### **5. Resend Verification Code**

**Request:**
```http
POST http://localhost:3000/api/v1/auth/resend-verification
Content-Type: application/json
```

**Body:**
```json
{
  "email": "testuser@example.com"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Verification code sent successfully"
}
```

**📌 Check Terminal:** New verification code will be logged

---

### **6. Forgot Password**

**Request:**
```http
POST http://localhost:3000/api/v1/auth/forgot-password
Content-Type: application/json
```

**Body:**
```json
{
  "email": "testuser@example.com"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Password reset email sent if account exists"
}
```

**📌 Check Terminal:** Look for `🔑 PASSWORD RESET TOKEN for testuser@example.com: abc123def456...`

---

### **7. Reset Password**

**Request:**
```http
POST http://localhost:3000/api/v1/auth/reset-password
Content-Type: application/json
```

**Body:**
```json
{
  "token": "abc123def456...",
  "password": "NewPassword123!"
}
```
*Use the token from terminal*

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

**📌 Test:** Try logging in with new password

---

### **8. Refresh Access Token**

**Request:**
```http
POST http://localhost:3000/api/v1/auth/refresh
Content-Type: application/json
```

**Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
*Use refreshToken from login response*

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### **9. Logout**

**Request:**
```http
POST http://localhost:3000/api/v1/auth/logout
Authorization: Bearer <accessToken>
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

**📌 Test:** Try using refresh token after logout (should fail)

---

## 🔒 Security Tests

### **Test 1: Account Lockout (5 Failed Attempts)**

**Request (Repeat 5 times with wrong password):**
```http
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json
```

**Body:**
```json
{
  "email": "testuser@example.com",
  "password": "WrongPassword123!"
}
```

**Expected Response (After 5 attempts - 429):**
```json
{
  "success": false,
  "message": "Account locked due to too many failed login attempts. Please try again in 15 minutes.",
  "errors": [
    {
      "message": "Account locked due to too many failed login attempts. Please try again in 15 minutes.",
      "code": "ACCOUNT_LOCKED"
    }
  ]
}
```

---

### **Test 2: Invalid Verification Code**

**Request:**
```http
POST http://localhost:3000/api/v1/auth/verify-email
Content-Type: application/json
```

**Body:**
```json
{
  "email": "testuser@example.com",
  "code": "999999"
}
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Invalid or expired verification code",
  "errors": [
    {
      "message": "Invalid or expired verification code",
      "code": "INVALID_VERIFICATION_CODE"
    }
  ]
}
```

---

### **Test 3: Expired Reset Token**

**Request:**
```http
POST http://localhost:3000/api/v1/auth/reset-password
Content-Type: application/json
```

**Body:**
```json
{
  "token": "expired_token_here",
  "password": "NewPassword123!"
}
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Invalid or expired reset token",
  "errors": [
    {
      "message": "Invalid or expired reset token",
      "code": "INVALID_RESET_TOKEN"
    }
  ]
}
```

---

### **Test 4: Password Complexity Validation**

**Request:**
```http
POST http://localhost:3000/api/v1/auth/register
Content-Type: application/json
```

**Body (Weak Password):**
```json
{
  "email": "weak@example.com",
  "password": "weak",
  "name": "Weak User"
}
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "message": "Password must be at least 8 characters long",
      "code": "VALIDATION_ERROR"
    },
    {
      "message": "Password must contain at least one uppercase letter",
      "code": "VALIDATION_ERROR"
    },
    {
      "message": "Password must contain at least one number",
      "code": "VALIDATION_ERROR"
    }
  ]
}
```

---

### **Test 5: Unauthorized Access (No Token)**

**Request:**
```http
GET http://localhost:3000/api/v1/auth/me
```

**Expected Response (401):**
```json
{
  "success": false,
  "message": "No token provided",
  "errors": [
    {
      "message": "No token provided",
      "code": "UNAUTHORIZED"
    }
  ]
}
```

---

### **Test 6: Invalid Token**

**Request:**
```http
GET http://localhost:3000/api/v1/auth/me
Authorization: Bearer invalid_token_here
```

**Expected Response (401):**
```json
{
  "success": false,
  "message": "Invalid token",
  "errors": [
    {
      "message": "Invalid token",
      "code": "UNAUTHORIZED"
    }
  ]
}
```

---

### **Test 7: Google User Trying Password Login**

**Prerequisites:** User must be created via Google OAuth first

**Request:**
```http
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json
```

**Body:**
```json
{
  "email": "user@gmail.com",
  "password": "SomePassword123!"
}
```

**Expected Response (401):**
```json
{
  "success": false,
  "message": "Please sign in with Google. This account was created using Google authentication.",
  "errors": [
    {
      "message": "Please sign in with Google. This account was created using Google authentication.",
      "code": "AUTHENTICATION_ERROR"
    }
  ]
}
```

---

## 📋 Postman Collection Variables

Set these variables in Postman:

```
base_url: http://localhost:3000/api/v1/auth
access_token: (set after login)
refresh_token: (set after login)
verification_code: (set from terminal)
reset_token: (set from terminal)
test_email: testuser@example.com
test_password: TestPassword123!
```

---

## 🎯 Complete Test Sequence

1. ✅ **Register** → Get verification code from terminal
2. ✅ **Verify Email** → Use code from terminal
3. ✅ **Login** → Save accessToken and refreshToken
4. ✅ **Get Profile** → Use accessToken
5. ✅ **Resend Verification** → Get new code from terminal
6. ✅ **Forgot Password** → Get reset token from terminal
7. ✅ **Reset Password** → Use token from terminal
8. ✅ **Login with New Password** → Verify password changed
9. ✅ **Refresh Token** → Get new accessToken
10. ✅ **Logout** → Invalidate session
11. ✅ **Test Account Lockout** → 5 wrong passwords
12. ✅ **Test Invalid Codes/Tokens** → Verify error handling

---

## 📌 Important Notes

1. **Verification Codes**: Check terminal for `🔐 VERIFICATION CODE for email@example.com: 123456`
2. **Reset Tokens**: Check terminal for `🔑 PASSWORD RESET TOKEN for email@example.com: abc123...`
3. **Password Requirements**: Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character
4. **Token Expiry**: Access tokens expire in 15 minutes, refresh tokens in 7 days
5. **Account Lockout**: 5 failed attempts = 15 minute lockout
6. **Rate Limiting**: Strict rate limiting on auth endpoints (prevents brute force)

---

## 🚨 Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Validation failed` | Invalid input format | Check request body matches schema |
| `Email already exists` | Duplicate registration | Use different email or login |
| `Invalid credentials` | Wrong password | Check password or reset it |
| `Account locked` | Too many failed attempts | Wait 15 minutes or reset password |
| `Invalid or expired code` | Wrong/old verification code | Request new code |
| `No token provided` | Missing Authorization header | Add `Authorization: Bearer <token>` |
| `Invalid token` | Expired or malformed token | Login again to get new token |
| `Please sign in with Google` | Tried password login on Google account | Use Google OAuth instead |
| `Google OAuth is not configured` | Missing Google OAuth credentials | Configure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` |

---

**Happy Testing! 🎉**

