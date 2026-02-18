/**
 * Application-wide constants
 */

export const API_VERSION = 'v1';
export const API_PREFIX = `/api/${API_VERSION}`;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Cache Keys — each prefix is semantically distinct to prevent collisions
export const CACHE_KEYS = {
  EVENT_AVAILABILITY: (eventId: string) => `event:availability:${eventId}`,
  EVENT_DETAILS: (eventId: string) => `event:details:${eventId}`,
  USER_BOOKINGS: (userId: string, page: number) => `user:bookings:${userId}:${page}`,
  IDEMPOTENCY: (key: string) => `idempotency:${key}`,
  RATE_LIMIT: (identifier: string) => `ratelimit:${identifier}`,
  REFRESH_TOKEN: (userId: string) => `auth:refresh:${userId}`,
} as const;

// Cache TTLs (in seconds)
export const CACHE_TTL = {
  EVENT_AVAILABILITY: 5,
  EVENT_DETAILS: 60,
  USER_BOOKINGS: 30,
  IDEMPOTENCY: 24 * 60 * 60, // 24 hours
} as const;

// Default Values
export const DEFAULTS = {
  PAGINATION_LIMIT: 20,
  PAGINATION_MAX_LIMIT: 100,
  BOOKING_RESERVATION_TTL_MINUTES: 15,
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,
} as const;

// Error Codes
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const;

