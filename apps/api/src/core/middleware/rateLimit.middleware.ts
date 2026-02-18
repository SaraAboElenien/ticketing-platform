/**
 * Rate limiting middleware
 * Prevents abuse and ensures fair usage
 *
 * NOTE: Uses in-memory store by default. For multi-instance production deployments,
 * integrate a Redis-backed store (e.g., rate-limit-redis) for distributed rate limiting.
 */

import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { RateLimitError } from '../errors/app.error';
import { config } from '../../config';

/**
 * Create rate limiter with configurable options
 */
export function createRateLimiter(options?: {
  windowMs?: number;
  max?: number;
  keyGenerator?: (req: Request) => string;
}) {
  const windowMs = options?.windowMs || config.rateLimit.windowMs;
  const max = options?.max || config.rateLimit.maxRequests;

  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,  // Returns rate limit info in `RateLimit-*` headers
    legacyHeaders: false,   // Disable `X-RateLimit-*` headers
    keyGenerator: options?.keyGenerator || ((req: Request) => {
      // Rate limit by user ID if authenticated, otherwise by IP
      return (req as any).user?.id || req.ip || 'unknown';
    }),
    handler: (req: Request, res: Response) => {
      throw new RateLimitError('Too many requests, please try again later');
    },
  });
}

/**
 * Default rate limiter for all routes
 */
export const defaultRateLimiter = createRateLimiter();

/**
 * Strict rate limiter for sensitive operations (login, registration, booking)
 */
export const strictRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per 15 minutes
});
