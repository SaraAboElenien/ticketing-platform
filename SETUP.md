# Setup Guide - Ticketing Platform Backend

## Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **MongoDB** (self-hosted or Atlas free tier)
- **Redis** (self-hosted or cloud free tier)

## 100% Free Setup Options

### Option 1: Local Development (100% Free)

#### MongoDB
```bash
# Using Docker (recommended)
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or install MongoDB Community Edition
# Windows: Download from https://www.mongodb.com/try/download/community
# macOS: brew install mongodb-community
# Linux: sudo apt-get install mongodb
```

#### Redis
```bash
# Using Docker (recommended)
docker run -d -p 6379:6379 --name redis redis:latest

# Or install Redis
# Windows: Download from https://github.com/microsoftarchive/redis/releases
# macOS: brew install redis
# Linux: sudo apt-get install redis-server
```

### Option 2: Cloud Free Tiers

#### MongoDB Atlas (Free Tier)
1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create a free M0 cluster (512MB storage)
3. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/dbname`

#### Redis Cloud (Free Tier)
1. Sign up at https://redis.com/try-free/
2. Create free database (30MB, 30 connections)
3. Get connection URL: `redis://default:password@redis-xxxxx.upstash.io:6379`

## Installation Steps

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# This will install dependencies for all workspaces
```

### 2. Environment Configuration

Create `.env` file in the `apps/api/` directory:

```bash
# Copy example file (the .env.example is inside apps/api/)
cp apps/api/.env.example apps/api/.env
```

Update `apps/api/.env` with your configuration:

```env
# Server
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug

# MongoDB
MONGODB_URI=mongodb://localhost:27017/ticketing-platform
# Or for Atlas: mongodb+srv://user:pass@cluster.mongodb.net/ticketing-platform

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
# Or for Redis Cloud: REDIS_URL=redis://default:pass@redis-xxxxx.upstash.io:6379

# JWT Secrets (CHANGE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173
```

### 3. Build Shared Package

```bash
# Build shared package first (required by API)
npm run build --workspace=packages/shared
```

### 4. Start Development Server

```bash
# Start API server in development mode
npm run dev --workspace=apps/api

# Or start all services
npm run dev
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Health Check
```bash
# Basic health check (always responds quickly)
GET http://localhost:3000/health

# Deep health check (verifies MongoDB + Redis connectivity)
GET http://localhost:3000/health/ready
```

### Authentication
```bash
# Register (role cannot be specified — always defaults to "user")
# Password requires: min 8 chars, 1 uppercase, 1 lowercase, 1 number
POST http://localhost:3000/api/v1/auth/register
Body: { "email": "user@example.com", "password": "Password1", "name": "John Doe" }

# Login
POST http://localhost:3000/api/v1/auth/login
Body: { "email": "user@example.com", "password": "Password1" }

# Get Current User Profile (requires auth)
GET http://localhost:3000/api/v1/auth/me
Headers: Authorization: Bearer <token>

# Refresh Token
POST http://localhost:3000/api/v1/auth/refresh
Body: { "refreshToken": "..." }

# Logout (invalidates refresh token)
POST http://localhost:3000/api/v1/auth/logout
Headers: Authorization: Bearer <token>
```

### Events
```bash
# List Events (with filtering, pagination, sorting)
GET http://localhost:3000/api/v1/events
GET http://localhost:3000/api/v1/events?status=published&sortBy=date&sortOrder=asc&page=1&limit=10

# Get Event Details (includes availableTickets)
GET http://localhost:3000/api/v1/events/:id

# Create Event (Admin only)
POST http://localhost:3000/api/v1/events
Headers: Authorization: Bearer <token>
Body: { "name": "Concert", "date": "2024-12-31", "venue": "Stadium", "totalTickets": 1000, "price": 50 }

# Update Event (Admin only)
PUT http://localhost:3000/api/v1/events/:id
Headers: Authorization: Bearer <token>
Body: { "name": "Updated Concert Name" }

# Delete Event (Admin only, soft delete — blocked if active bookings exist)
DELETE http://localhost:3000/api/v1/events/:id
Headers: Authorization: Bearer <token>
```

### Bookings
```bash
# Book Ticket (REQUIRES Idempotency-Key header)
POST http://localhost:3000/api/v1/bookings
Headers: 
  Authorization: Bearer <token>
  Idempotency-Key: <uuid>
Body: { "eventId": "...", "quantity": 1 }

# Get User Bookings (paginated, only shows your own bookings)
GET http://localhost:3000/api/v1/bookings
Headers: Authorization: Bearer <token>

# Get Booking Details (ownership enforced — users can only view their own)
GET http://localhost:3000/api/v1/bookings/:id
Headers: Authorization: Bearer <token>

# Cancel Booking (restores availableTickets atomically)
PATCH http://localhost:3000/api/v1/bookings/:id/cancel
Headers: Authorization: Bearer <token>
Body: { "reason": "Changed plans" }
```

## Testing the System

### 1. Create Admin User

Register a user via the API, then manually promote to admin in MongoDB.
**Note**: The `role` field is NOT accepted in the register endpoint — this is intentional to prevent privilege escalation.

```javascript
// In MongoDB shell or Compass
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

### 2. Verify Health

```bash
# Quick health check
GET http://localhost:3000/health

# Deep health check (verifies MongoDB + Redis are connected)
GET http://localhost:3000/health/ready
```

### 3. Create an Event

```bash
POST http://localhost:3000/api/v1/events
Headers: Authorization: Bearer <admin-token>
Body: {
  "name": "Summer Concert 2026",
  "date": "2026-07-15T19:00:00Z",
  "venue": "Central Park",
  "totalTickets": 100,
  "price": 75.00,
  "status": "published"
}
# Note: availableTickets is automatically set to totalTickets on creation
```

### 4. Book Tickets

```bash
# Generate a UUID for idempotency key
# Windows PowerShell: [guid]::NewGuid()
# Linux/Mac: uuidgen

POST http://localhost:3000/api/v1/bookings
Headers: 
  Authorization: Bearer <user-token>
  Idempotency-Key: <generated-uuid>
Body: {
  "eventId": "<event-id>",
  "quantity": 1
}
# availableTickets is atomically decremented — no overbooking possible
```

## Production Deployment

### Vercel (Serverless)

1. Install Vercel CLI: `npm i -g vercel`
2. Deploy: `vercel`
3. Set environment variables in Vercel dashboard
4. Update `vercel.json` if needed:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "apps/api/src/handler.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "apps/api/src/handler.ts"
    }
  ]
}
```

### Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/shared/package*.json ./packages/shared/
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "apps/api/dist/server.js"]
```

### Self-Hosted VPS

1. Set up MongoDB and Redis on VPS
2. Clone repository
3. Install dependencies and build
4. Use PM2 for process management:

```bash
npm install -g pm2
pm2 start apps/api/dist/server.js --name ticketing-api
pm2 save
pm2 startup
```

## Troubleshooting

### MongoDB Connection Issues
- Check MongoDB is running: `docker ps` or `mongod --version`
- Verify connection string format
- Check firewall/network settings

### Redis Connection Issues
- Check Redis is running: `docker ps` or `redis-cli ping`
- Verify Redis URL/host/port
- Check Redis password if using cloud

### Port Already in Use
- Change `PORT` in `.env` file
- Or kill process using port: `lsof -ti:3000 | xargs kill`

### Module Not Found Errors
- Run `npm install` in root directory
- Build shared package: `npm run build --workspace=packages/shared`
- Check TypeScript compilation: `npm run build`

## Architecture Notes

- **Availability Management**: `availableTickets` is a **stored field** on the Event document, atomically managed via MongoDB `$inc` operator. It is initialized to `totalTickets` on creation and decremented/incremented on booking/cancellation. This is both fast to read and race-condition proof.

- **Idempotency**: All booking operations require an `Idempotency-Key` header (UUID) to prevent duplicate bookings on retries. Responses are cached in Redis for 24 hours.

- **Concurrency Safety**: Uses `findOneAndUpdate` with an `{ availableTickets: { $gte: quantity } }` guard — the decrement only succeeds if enough tickets remain. Combined with MongoDB sessions for multi-document consistency.

- **Caching**: Redis caches event availability (5-10s TTL) for fast reads, invalidated on booking/cancellation.

- **Security**: Registration does not accept `role` — all users default to `user`. Password requires complexity (uppercase + lowercase + number + min 8 chars). All `:id` routes validate ObjectId format.

- **Error Handling**: All async middleware uses `next(error)` instead of throwing — safe with Express 4's error handling model.

- **Graceful Shutdown**: The dev server handles `SIGTERM`/`SIGINT` by draining HTTP connections, then closing MongoDB and Redis.

## Support

For issues or questions, check the main README.md or open an issue in the repository.

