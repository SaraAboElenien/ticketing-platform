# Ticketing Platform

A production-grade, full-stack ticketing platform: Node.js/Express API with a React (Vite) web app. Supports high-concurrency bookings, JWT auth, idempotent operations, and a modern dark-theme UI.

## Features

- **Concurrency-Safe Booking**: Atomic operations prevent overbooking under load
- **JWT Authentication**: Token-based auth with refresh tokens; optional Google OAuth
- **Idempotency**: Booking operations are idempotent to prevent duplicate charges
- **Calculated Availability**: Dynamic ticket availability with atomic decrements
- **Redis Caching**: Performance with smart cache invalidation
- **Soft Deletes**: Audit trail and recovery for events
- **API Versioning**: Versioned API design
- **Web App**: React + Vite frontend with events, bookings, and admin flows
- **Serverless Ready**: API compatible with Vercel and similar platforms

## Architecture

Monorepo using npm workspaces and Turborepo:

```
ticketing-platform/
├── apps/
│   ├── api/          # Express backend (REST API)
│   └── web/          # React frontend (Vite)
├── packages/
│   └── shared/       # Shared types, schemas, utilities
└── package.json      # Root workspace configuration
```

- **API**: Serves `/api/v1/*` (auth, events, bookings). Uses MongoDB and Redis. CORS is configured via environment; never hardcode frontend URLs in code.
- **Web**: Single-page app that talks to the API. In development, Vite proxies `/api` to the API server; in production, set the API base URL via environment variables.
- **Shared**: Types and utilities used by both API and web; built before running or building either app.

## Quick Start

### Prerequisites

- Node.js >= 18
- npm >= 9
- MongoDB (local or managed free tier)
- Redis (local or managed free tier)

### Installation

```bash
# Install all dependencies (root and workspaces)
npm install

# Copy environment files (no secrets committed)
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# Edit apps/api/.env and apps/web/.env with your values (see SETUP.md)
```

### Development

```bash
# Build shared package first (required by API and web)
npm run build --workspace=packages/shared

# Run API and web in development mode
npm run dev
```

- API: typically at `http://localhost:3000` (see `PORT` in `apps/api/.env`)
- Web: typically at `http://localhost:5173` (Vite default); proxy forwards `/api` to the API

### Build

```bash
# Build all packages
npm run build

# Or build individually
npm run build --workspace=packages/shared
npm run build --workspace=apps/api
npm run build --workspace=apps/web
```

## Configuration

- **API**: `apps/api/.env` — see `apps/api/.env.example`. Key settings: `MONGODB_URI`, Redis (`REDIS_URL` or `REDIS_HOST`/`REDIS_PORT`), `JWT_SECRET` and `JWT_REFRESH_SECRET` (must be changed in production), `CORS_ORIGIN` (your frontend origin; no trailing slash).
- **Web**: `apps/web/.env` — see `apps/web/.env.example`. `VITE_API_URL` is empty in dev (proxy used); in production set it to your deployed API URL.

Never commit `.env` or expose secrets; use your deployment platform’s environment configuration for production.

## API Overview

Base path: `/api/v1/`

- **Auth**: register, login, refresh, logout, optional Google OAuth
- **Events**: list (filter/pagination), get by id, create/update/delete (admin)
- **Bookings**: create (requires `Idempotency-Key` header), list, get by id, cancel

See **SETUP.md** for detailed endpoint descriptions and architecture notes.

## Testing

```bash
# Run all tests
npm test

# Run tests for a specific workspace
npm test --workspace=apps/api
```

## License

MIT. All dependencies used are open source (MIT/Apache etc.).

## Contributing

Contributions are welcome. Follow the repository’s contributing guidelines and keep secrets and explicit external URLs out of committed files.
