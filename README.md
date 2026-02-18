# Ticketing Platform Backend

A production-grade, scalable ticketing platform backend built with Node.js, Express, TypeScript, and MongoDB. Designed for high concurrency, data integrity, and real-world production use.

## 🎯 Features

- **Concurrency-Safe Booking**: Atomic operations prevent overbooking under high load
- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **Idempotency**: All booking operations are idempotent to prevent duplicate charges
- **Calculated Availability**: Dynamic ticket availability calculation ensures data integrity
- **Redis Caching**: Performance optimization with smart cache invalidation
- **Soft Deletes**: Audit trail and data recovery capability
- **API Versioning**: Future-proof API design
- **Serverless Ready**: Compatible with Vercel and other serverless platforms

## 🏗️ Architecture

This is a **monorepo** structure using npm workspaces and Turborepo:

```
ticketing-platform/
├── apps/
│   └── api/              # Express backend application
├── packages/
│   └── shared/           # Shared types, schemas, utilities
└── package.json          # Root workspace configuration
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- MongoDB (self-hosted or Atlas free tier)
- Redis (self-hosted or cloud free tier)

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update .env with your configuration
```

### Development

```bash
# Start all services in development mode
npm run dev

# Start specific app
npm run dev --workspace=apps/api
```

### Building

```bash
# Build all packages
npm run build

# Build specific package
npm run build --workspace=apps/api
```

## 📦 100% Free Stack

All technologies used are **100% free and open source**:

- **Node.js** - MIT License
- **Express** - MIT License
- **TypeScript** - Apache 2.0
- **MongoDB** - Free Community Edition or Atlas Free Tier
- **Redis** - Open Source or Cloud Free Tier
- **All Libraries** - Open Source (MIT/Apache licenses)

### Self-Hosted Setup (100% Free)

1. **MongoDB**: Install MongoDB Community Edition locally or use Docker
2. **Redis**: Install Redis locally or use Docker
3. **Deployment**: Use free VPS (Oracle Cloud Free Tier, AWS Free Tier) or Vercel Free Tier

## 🔧 Configuration

See `.env.example` for all configuration options. Key settings:

- `MONGODB_URI`: MongoDB connection string
- `REDIS_HOST` / `REDIS_PORT`: Redis connection details
- `JWT_SECRET`: Secret key for JWT tokens (change in production!)
- `RATE_LIMIT_MAX_REQUESTS`: Rate limiting configuration

## 📚 API Documentation

API endpoints are versioned: `/api/v1/`

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - Logout

### Events
- `GET /api/v1/events` - List events (with filtering & pagination)
- `GET /api/v1/events/:id` - Get event details
- `POST /api/v1/events` - Create event (admin)
- `PUT /api/v1/events/:id` - Update event (admin)
- `DELETE /api/v1/events/:id` - Delete event (admin)

### Bookings
- `POST /api/v1/bookings` - Book ticket (requires idempotency key)
- `GET /api/v1/bookings` - Get user bookings
- `GET /api/v1/bookings/:id` - Get booking details
- `PATCH /api/v1/bookings/:id/cancel` - Cancel booking

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests for specific package
npm test --workspace=apps/api
```

## 📝 License

MIT License - 100% Free and Open Source

## 🤝 Contributing

Contributions welcome! Please read the contributing guidelines first.

