# Environment Variables Audit & Production Hardening

## Overview

Full audit of all environment variables across `apps/api` (backend) and `apps/web` (frontend). Identifies hardcoded values, production risks, and missing configuration files, with a step-by-step checklist to go live safely.

---

## 1. Backend — All Environment Variables

All backend env vars flow through `apps/api/src/config/index.ts` as a single `config` object. The raw `process.env` is never accessed outside of that one file, except for two cases:

| Direct `process.env` access outside `config/` | File | Risk |
|---|---|---|
| `process.env.NODE_ENV === 'production'` | `auth.controller.ts:15` | Cookie `secure` flag. Must be `'production'` in prod. |
| `process.env.NODE_ENV === 'production'` | `error.middleware.ts:82` | Hides raw error messages in prod. |

### Complete Backend Variable Table

| Variable | Default (dev fallback) | Required in Prod? | Used In |
|---|---|---|---|
| `NODE_ENV` | `'development'` | **Yes — must be `'production'`** | `config`, `auth.controller.ts`, `error.middleware.ts` |
| `PORT` | `3000` | Depends on host | `config` |
| `API_VERSION` | `'v1'` | No | `config` |
| `MONGODB_URI` | `mongodb://localhost:27017/ticketing-platform` | **Yes** | `config/index.ts` |
| `REDIS_URL` | *(none — falls back to host+port)* | **Yes** (Upstash) | `config`, `redis.client.ts` |
| `REDIS_HOST` | `'localhost'` | No (ignored when `REDIS_URL` set) | `config` |
| `REDIS_PORT` | `6379` | No | `config` |
| `REDIS_PASSWORD` | *(none)* | No (ignored when `REDIS_URL` set) | `config` |
| `JWT_SECRET` | `'change-this-secret…'` | **YES — CRITICAL** | `config` → auth service / middleware |
| `JWT_EXPIRES_IN` | `'15m'` | No | `config` |
| `JWT_REFRESH_SECRET` | `'change-this-refresh-secret…'` | **YES — CRITICAL** | `config` → auth service |
| `JWT_REFRESH_EXPIRES_IN` | `'7d'` | No | `config` |
| `BCRYPT_ROUNDS` | `10` | No | `config` |
| `RATE_LIMIT_WINDOW_MS` | `900000` (15 min) | No | `config` |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | No | `config` |
| `BOOKING_RESERVATION_TTL_MINUTES` | `15` | No | `config` |
| `IDEMPOTENCY_KEY_TTL_HOURS` | `24` | No | `config` |
| `CORS_ORIGIN` | `'http://localhost:5173'` | **Yes — set to prod frontend URL** | `config` → CORS middleware |
| `LOG_LEVEL` | `'info'` | No | `config` |
| `RESEND_API_KEY` | *(none — falls back to terminal log)* | **Yes — for real email delivery** | `config` → `email.service.ts` |
| `FROM_EMAIL` | `'onboarding@resend.dev'` | **Yes — must be verified domain** | `config` → `email.service.ts` |
| `APP_NAME` | `'Ticketing Platform'` | No | `config` → `email.service.ts` |
| `FRONTEND_URL` | `'http://localhost:5173'` | **Yes — password reset links** | `config` → `email.service.ts` |
| `GOOGLE_CLIENT_ID` | `''` (OAuth disabled) | If Google login enabled | `config` → `auth.service.ts` |
| `GOOGLE_CLIENT_SECRET` | `''` | **CRITICAL if Google enabled** | `config` → `auth.service.ts` |
| `GOOGLE_REDIRECT_URI` | `'http://localhost:5173/auth/callback/google'` | **Yes — must match Google Console** | `config` → `auth.service.ts` |

---

## 2. Frontend — All Environment Variables

All frontend env vars are accessed via `import.meta.env.VITE_*`. They are declared in `apps/web/src/vite-env.d.ts`.

| Variable | Default | Required in Prod? | Used In |
|---|---|---|---|
| `VITE_API_URL` | `''` (empty — uses Vite proxy in dev) | **Yes — must be full API URL** | `apps/web/src/api/client.ts:13` |
| `VITE_GOOGLE_CLIENT_ID` | *(none)* | If Google login enabled | `LoginPage.tsx:61`, `RegisterPage.tsx:60` |

**How `VITE_API_URL` works:**
- **Dev**: Empty `''` → Vite's proxy in `vite.config.ts` forwards `/api` to `http://localhost:3000`
- **Prod**: Must be set to `https://your-api-domain.vercel.app` — the proxy does not run in production builds

---

## 3. Identified Issues & Fixes Applied

### Issue 1 — `CORS_ORIGIN` wrong default ✅ Fixed
`localhost:3000` was the backend port. Changed default to `http://localhost:5173` (the Vite frontend port).

### Issue 2 — Dual MongoDB variable pattern ✅ Fixed
Removed `MONGODB_URI_LIVE`. Now uses a single `MONGODB_URI` for both local and Atlas.

### Issue 3 — No `apps/web/.env.example` ✅ Fixed
Created `apps/web/.env.example` documenting `VITE_API_URL` and `VITE_GOOGLE_CLIENT_ID`.

### Issue 4 — `.gitignore` gap ✅ Fixed
Added `.env.development`, `.env.production`, `.env.staging` to `.gitignore`.

### Issue 5 — `vite.config.ts` hardcoded proxy target
`target: 'http://localhost:3000'` — dev-only config, never ships to production. No action needed.

### Issue 6 — Cookie `maxAge` hardcoded (low priority)
`maxAge: 7 * 24 * 60 * 60 * 1000` in `auth.controller.ts` does not read from `JWT_REFRESH_EXPIRES_IN`. Not a security risk but the two can drift if refresh expiry is changed.

---

## 4. Sensitive Secrets — Never Commit Checklist

| Secret | Status |
|---|---|
| `.env` files | Covered by `.gitignore` ✓ |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | In `.env` — never committed ✓ |
| `GOOGLE_CLIENT_SECRET` | In `.env` — never committed ✓ |
| `RESEND_API_KEY` | In `.env` — never committed ✓ |
| `.env.production` / `.env.development` | Now covered by `.gitignore` ✓ |
| `.env.example` files | Committed intentionally — contain no real secrets ✓ |

---

## 5. Dev vs. Production `.env` Reference

### `apps/api/.env` — Development (local machine)
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ticketing-platform
REDIS_URL=rediss://default:pass@your-upstash-url.upstash.io:6379
JWT_SECRET=any-local-secret-32-chars-minimum
JWT_REFRESH_SECRET=any-local-refresh-secret-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/callback/google
# RESEND_API_KEY not set → emails log to terminal
```

### `apps/api/.env` — Production (set in Vercel dashboard, NOT in a file)
```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ticketing-platform
REDIS_URL=rediss://default:pass@your-upstash-url.upstash.io:6379
JWT_SECRET=<64-char-cryptographically-random-string>
JWT_REFRESH_SECRET=<64-char-cryptographically-random-string>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=https://your-frontend-domain.vercel.app
FRONTEND_URL=https://your-frontend-domain.vercel.app
RESEND_API_KEY=re_xxxxxxxxxxxx
FROM_EMAIL=noreply@yourdomain.com
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://your-frontend-domain.vercel.app/auth/callback/google
```

### `apps/web/.env` — Development (local machine)
```env
VITE_API_URL=
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

### `apps/web/.env` — Production (set in Vercel dashboard, NOT in a file)
```env
VITE_API_URL=https://your-api-domain.vercel.app
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

---

## 6. Vercel Deployment Order

1. Deploy **backend** (`apps/api`) → get its Vercel URL
2. Set backend production env vars in Vercel dashboard (see section 5 above)
3. Deploy **frontend** (`apps/web`) → set `VITE_API_URL=<backend-vercel-url>` before deploying
4. Copy frontend Vercel URL → update `CORS_ORIGIN` in backend Vercel env vars → redeploy backend

> Generate secure JWT secrets with:
> `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

