# 🚀 Quick Start Guide - First Time Setup

## ✅ What's Already Done

1. ✅ Dependencies installed (`npm i`)
2. ✅ `.env` file created at `apps/api/.env`
3. ✅ Shared package built
4. ✅ MongoDB is running on port 27017

## 📋 Next Steps

### 1. Connect MongoDB Compass

1. Open **MongoDB Compass**
2. Connect to: `mongodb://localhost:27017`
3. You should see the `ticketing-platform` database appear once the server starts

### 2. Start Redis (Optional but Recommended)

**Option A: Install Redis for Windows**
- Download from: https://github.com/microsoftarchive/redis/releases
- Or use WSL: `wsl --install` then `sudo apt-get install redis-server`

**Option B: Use Redis Cloud (Free)**
- Sign up at: https://redis.com/try-free/
- Get your Redis URL
- Update `REDIS_URL` in `apps/api/.env`

**Note**: The server will start without Redis, but caching and idempotency features won't work.

### 3. Start the Development Server

Open a **new terminal** in the project root and run:

```bash
cd apps/api
npm run dev
```

Or from the root:

```bash
npm run dev --workspace=apps/api
```

You should see:
```
🚀 Server running on port 3000
✅ MongoDB connected
⚠️  Redis connection failed (if Redis isn't running - this is OK for basic testing)
```

### 4. Test in Postman

#### A. Health Check (No Auth Required)

**Request:**
```
GET http://localhost:3000/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Server is healthy",
  "data": {
    "status": "ok",
    "timestamp": "2026-02-16T..."
  }
}
```

#### B. User Registration (First Signup!)

**Request:**
```
POST http://localhost:3000/api/v1/auth/register
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "test@example.com",
  "password": "Password123",
  "name": "Test User"
}
```

**Important**: 
- Password must be at least 8 characters
- Must contain: uppercase letter, lowercase letter, and number
- The `role` field is NOT accepted (always defaults to "user")

**Expected Response (Success - 201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "...",
      "email": "test@example.com",
      "name": "Test User",
      "role": "user"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

**Save the `accessToken` and `refreshToken` for next requests!**

#### C. Get Current User Profile

**Request:**
```
GET http://localhost:3000/api/v1/auth/me
Authorization: Bearer <your-access-token>
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "id": "...",
    "email": "test@example.com",
    "name": "Test User",
    "role": "user"
  }
}
```

### 5. Verify in MongoDB Compass

1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. Navigate to `ticketing-platform` database
4. Open the `users` collection
5. You should see your newly registered user! 🎉

## 🔧 Troubleshooting

### Server Won't Start

**Check for errors:**
```bash
cd apps/api
npm run dev
```

**Common issues:**
- **Port 3000 already in use**: Change `PORT` in `.env` to another port (e.g., `3001`)
- **MongoDB connection failed**: Make sure MongoDB is running (`mongod` or via Compass)
- **TypeScript errors**: Run `npm run build --workspace=packages/shared` first

### MongoDB Compass Not Connecting

- Make sure MongoDB is running: Check Windows Services or run `mongod` manually
- Connection string: `mongodb://localhost:27017`
- If using MongoDB Atlas, use the connection string from Atlas dashboard

### Postman Request Fails

- **404 Not Found**: Make sure server is running on port 3000
- **500 Internal Server Error**: Check server terminal for error messages
- **Validation Error**: Check that your JSON body matches the schema exactly

## 📝 Next Steps After First Signup

1. ✅ Test login endpoint: `POST /api/v1/auth/login`
2. ✅ Create an event (as admin - you'll need to promote your user to admin in MongoDB)
3. ✅ Book tickets with idempotency key
4. ✅ View your bookings

## 🎯 Quick Reference

**Base URL**: `http://localhost:3000`

**Endpoints**:
- `GET /health` - Health check
- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/me` - Get current user (requires auth)
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - Logout

**MongoDB Connection**: `mongodb://localhost:27017/ticketing-platform`

**Environment File**: `apps/api/.env`

---

**Need help?** Check the main `SETUP.md` or `PROJECT_REFERENCE.md` files for detailed documentation.

