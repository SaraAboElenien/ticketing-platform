/**
 * Idempotency middleware
 * Ensures duplicate requests with same idempotency key return same response
 * CRITICAL for preventing duplicate bookings and charges
 *
 * NOTE: All errors use next(error) instead of throw because this is async middleware.
 * Express 4 does NOT catch thrown errors from async functions automatically.
 */

import { Request, Response, NextFunction } from 'express';
import { getCacheService } from '../cache/redis.client';
import { CACHE_KEYS, CACHE_TTL } from '@ticketing-platform/shared';
import { ValidationError } from '../errors/app.error';
import { ApiResponse } from '@ticketing-platform/shared';
import { logger } from '../utils/logger';

// Extend Request to include idempotency key and cached response
declare global {
  namespace Express {
    interface Request {
      idempotencyKey?: string;
      idempotencyCache?: {
        statusCode: number;
        body: ApiResponse;
      };
    }
  }
}

/**
 * Idempotency middleware
 * Checks for idempotency key in header and returns cached response if exists
 */
export async function idempotencyMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Only apply to POST, PUT, PATCH requests
    if (!['POST', 'PUT', 'PATCH'].includes(req.method)) {
      return next();
    }

    // Get idempotency key from header
    const idempotencyKey = req.headers['idempotency-key'] as string;

    if (!idempotencyKey) {
      // Idempotency key is required for booking operations
      if (req.path.includes('/bookings')) {
        return next(new ValidationError('Idempotency-Key header is required for booking operations'));
      }
      // Optional for other operations
      return next();
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(idempotencyKey)) {
      return next(new ValidationError('Idempotency-Key must be a valid UUID'));
    }

    const cache = await getCacheService();
    const cacheKey = CACHE_KEYS.IDEMPOTENCY(idempotencyKey);

    // Check if we have a cached response
    const cachedResponse = await cache.get<{ statusCode: number; body: ApiResponse }>(cacheKey);

    if (cachedResponse) {
      logger.info('Idempotency key found, returning cached response', {
        idempotencyKey,
        path: req.path,
      });

      // Return cached response directly
      req.idempotencyKey = idempotencyKey;
      req.idempotencyCache = cachedResponse;
      res.status(cachedResponse.statusCode).json(cachedResponse.body);
      return;
    }

    // Store idempotency key in request for later caching
    req.idempotencyKey = idempotencyKey;
    next();
  } catch (error) {
    // Continue without idempotency check if Redis fails — don't break the request
    logger.error('Idempotency middleware error:', error);
    next();
  }
}

/**
 * Helper to cache response for idempotency
 */
export async function cacheIdempotencyResponse(
  idempotencyKey: string,
  statusCode: number,
  body: ApiResponse
): Promise<void> {
  try {
    const cache = await getCacheService();
    const cacheKey = CACHE_KEYS.IDEMPOTENCY(idempotencyKey);

    await cache.set(cacheKey, { statusCode, body }, CACHE_TTL.IDEMPOTENCY);
  } catch (error) {
    logger.error('Failed to cache idempotency response:', error);
    // Don't throw — idempotency caching failure shouldn't break the request
  }
}
