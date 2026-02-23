# Setup Guide — Ticketing Platform

Step-by-step setup for local development and deployment. Use environment variables for all secrets and URLs; never commit real credentials or explicit external links.

---

## Prerequisites

- **Node.js** >= 18.0.0  
- **npm** >= 9.0.0  
- **MongoDB** (self-hosted or managed free tier)  
- **Redis** (self-hosted or managed free tier).

---

## Architecture Overview

### Monorepo layout

- **apps/api** — Express backend. REST API under `/api/v1/`. Connects to MongoDB (events, users, bookings) and Redis (cache, idempotency, optional sessions). Protected routes use JWT; admin routes require `role: admin`.
- **apps/web** — React SPA (Vite). Consumes the API via `VITE_API_URL` in production or Vite proxy in development. Uses shared types from `packages/shared`.
- **packages/shared** — TypeScript types and utilities shared by API and web. Must be built before running or building either app (`npm run build --workspace=packages/shared`).

### Request flow

- Browser loads the web app; all API calls go to the same origin in dev (proxy) or to `VITE_API_URL` in production. API validates `CORS_ORIGIN` against the frontend origin.
- Auth: login/register return access + refresh tokens; web stores them and sends `Authorization: Bearer <accessToken>`; refresh is used when the access token expires.
- Bookings: create-booking requests require an `Idempotency-Key` header (UUID); the API uses it to deduplicate and cache responses in Redis.

### Security notes

- Registration does not accept `role` — users are created as `user`; admin is set only via database or trusted tooling.
- JWT secrets and Redis/MongoDB credentials must come from environment only; `.env` is git-ignored.
- CORS is configured with `CORS_ORIGIN`; in production set it to your frontend origin (no trailing slash). Do not use wildcards in production.

---

## 100% free setup options

### Option 1: Local development

**MongoDB**

- Docker: run a container on port 27017 (e.g. image `mongo:latest`).  
- Or install MongoDB Community Edition from the official MongoDB site (download/package manager for your OS).

**Redis**

- Docker: run a container on port 6379 (e.g. image `redis:latest`).  
- Or install Redis from the official Redis site or your OS package manager.

### Option 2: Managed free tiers

- **MongoDB**: Use a managed free tier (e.g. MongoDB Atlas). Create an M0 cluster and obtain a connection string. Store it in `MONGODB_URI`; do not commit it.
- **Redis**: Use a managed free tier (e.g. Redis Cloud or similar). Create a free instance and obtain connection URL/credentials. Store in `REDIS_URL` or `REDIS_HOST`/`REDIS_PORT`/`REDIS_PASSWORD`; do not commit.

---

## Installation steps

### 1. Install dependencies

```bash
# From repository root
npm install
```

This installs dependencies for all workspaces.

### 2. Environment configuration

**API** — create `apps/api/.env` from the example:

```bash
cp apps/api/.env.example apps/api/.env
```

Edit `apps/api/.env`. Important variables:

- **MONGODB_URI** — Local: `mongodb://localhost:27017/ticketing-platform`. Managed: use the connection string from your provider (never commit it).
- **Redis** — Local: leave `REDIS_URL` empty and set `REDIS_HOST=localhost`, `REDIS_PORT=6379`. Managed: set `REDIS_URL` to your provider’s URL (never commit it).
- **JWT_SECRET**, **JWT_REFRESH_SECRET** — Must be long, random strings in production (e.g. 32+ chars). Generate with a secure random source; never use defaults in production.
- **CORS_ORIGIN** — In development, your Vite origin (e.g. `http://localhost:5173`). In production, your frontend’s full origin with no trailing slash.
- **FRONTEND_URL** — Used for password reset and similar links; set to your frontend URL in production.
- **GOOGLE_CLIENT_ID**, **GOOGLE_CLIENT_SECRET**, **GOOGLE_REDIRECT_URI** — Only if you enable Google OAuth; obtain from your Google Cloud project and set redirect URI to match your frontend (e.g. `http://localhost:5173/auth/callback/google` in dev).

**Web** — create `apps/web/.env` from the example:

```bash
cp apps/web/.env.example apps/web/.env
```

Edit `apps/web/.env`:

- **VITE_API_URL** — Leave empty in development (Vite proxy forwards `/api` to the API). In production, set to your deployed API base URL (e.g. `https://api.yourdomain.com`). No trailing slash.
- **VITE_GOOGLE_CLIENT_ID** — Only if using Google OAuth; must match the client ID configured in the API.

Never commit `.env` files or paste real connection strings or secrets into docs or issues.

### 3. Build shared package

```bash
npm run build --workspace=packages/shared
```

Required before running or building the API or web app.

### 4. Start development servers

```bash
# Start both API and web (from root)
npm run dev
```

- API: default port 3000 (override with `PORT` in `apps/api/.env`).  
- Web: default port 5173 (Vite). Open the web app in the browser; it will use the proxy to reach the API.

To run only one app:

```bash
npm run dev --workspace=apps/api
# or
npm run dev --workspace=apps/web
```

When running only the web app, ensure the API is reachable at the URL the web uses (proxy in dev or `VITE_API_URL` in prod).

---

## API endpoints (overview)

Base URL in dev: `http://localhost:3000` (or your `PORT`). All below are under `/api/v1/`.

### Health

- `GET /health` — Quick liveness.  
- `GET /health/ready` — Checks MongoDB and Redis connectivity.

### Auth

- `POST /auth/register` — Body: `email`, `password`, `name`. Role cannot be set (always `user`).  
- `POST /auth/login` — Body: `email`, `password`. Returns access and refresh tokens.  
- `GET /auth/me` — Current user (header: `Authorization: Bearer <token>`).  
- `POST /auth/refresh` — Body: `refreshToken`.  
- `POST /auth/logout` — Invalidates refresh token (send auth header if required).

### Events

- `GET /events` — List; query params for status, sort, pagination.  
- `GET /events/:id` — Single event (includes `availableTickets`).  
- `POST /events` — Create (admin).  
- `PUT /events/:id` — Update (admin).  
- `DELETE /events/:id` — Soft delete (admin); blocked if active bookings exist.

### Bookings

- `POST /bookings` — Create booking. Headers: `Authorization`, `Idempotency-Key` (UUID). Body: `eventId`, `quantity`.  
- `GET /bookings` — List current user’s bookings (paginated).  
- `GET /bookings/:id` — Detail (ownership enforced).  
- `PATCH /bookings/:id/cancel` — Cancel booking (optional body: `reason`).

Use a REST client or the web app to call these; replace `localhost:3000` with your API URL when not running locally.

---

## Testing the system

### Create an admin user

Register a user via the API or web app, then set `role` to `admin` in the database (e.g. MongoDB shell or Compass). The register endpoint does not accept `role` to prevent privilege escalation.

### Verify health

```bash
# Liveness
GET http://localhost:3000/health

# Readiness (MongoDB + Redis)
GET http://localhost:3000/health/ready
```

### Create an event and book

- Create an event via `POST /api/v1/events` with an admin token.  
- Book via `POST /api/v1/bookings` with a user token and an `Idempotency-Key` header (UUID).  
- `availableTickets` is updated atomically; no overbooking.

---

## Production deployment

- **API**: Set all environment variables in your host (Vercel, Docker, or VPS). Never rely on `.env` committed to the repo. Use strong JWT secrets and restrict `CORS_ORIGIN` to your frontend origin.  
- **Web**: Set `VITE_API_URL` to your production API URL. Build with `npm run build --workspace=apps/web` and serve the built output (e.g. static host or same server behind a path).  
- **Database**: Use managed MongoDB and Redis with TLS and credentials from env.  
- **OAuth**: Set Google OAuth redirect URI to your production frontend callback URL in Google Cloud Console and in `GOOGLE_REDIRECT_URI` / frontend config.

Deployment details (Docker, Vercel, PM2, etc.) depend on your host; keep secrets and URLs in the platform’s environment config, not in code or docs.

---

## Architecture notes (backend)

- **Availability**: `availableTickets` is stored on the Event document and updated atomically (e.g. `$inc`). Initialized to `totalTickets` on create; decremented on book, incremented on cancel.  
- **Idempotency**: Create-booking requires `Idempotency-Key` header. Responses are cached in Redis (e.g. 24h) so duplicate requests return the same result.  
- **Concurrency**: Booking uses a conditional update (e.g. `availableTickets >= quantity`) so decrements only succeed when stock allows.  
- **Caching**: Event/availability data can be cached in Redis with short TTL; invalidated on booking/cancel.  
- **Errors**: Async middleware forwards errors to Express error handler; no unhandled throws in route handlers.  
- **Shutdown**: Server drains connections and closes MongoDB/Redis on SIGTERM/SIGINT.

---

## Troubleshooting

- **MongoDB**: Ensure the process is running and the connection string in `MONGODB_URI` is correct and reachable (firewall, network).  
- **Redis**: Ensure Redis is running; check `REDIS_URL` or `REDIS_HOST`/`REDIS_PORT`/`REDIS_PASSWORD`.  
- **Port in use**: Change `PORT` in `apps/api/.env` or stop the process using the port.  
- **Module not found**: Run `npm install` at root and build shared: `npm run build --workspace=packages/shared`.  
- **CORS**: Ensure `CORS_ORIGIN` exactly matches the frontend origin (scheme, host, port; no trailing slash).

For more context, see the main README.md and the repository’s issue tracker.
