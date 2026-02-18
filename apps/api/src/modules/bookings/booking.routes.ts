/**
 * Booking routes
 * All routes require authentication
 */

import { Router } from 'express';
import { BookingController } from './booking.controller';
import { validateBody, validateQuery } from '../../core/middleware/validation.middleware';
import { createBookingSchema, bookingQuerySchema, cancelBookingSchema } from '@ticketing-platform/shared';
import { authMiddleware } from '../../core/middleware/auth.middleware';
import { strictRateLimiter } from '../../core/middleware/rateLimit.middleware';
import { idempotencyMiddleware } from '../../core/middleware/idempotency.middleware';
import { validateObjectId } from '../../core/middleware/objectId.middleware';

const router = Router();
const bookingController = new BookingController();

// All booking routes require authentication
router.use(authMiddleware);

// Create booking (requires idempotency key, strict rate limiting)
router.post(
  '/',
  strictRateLimiter,
  idempotencyMiddleware,
  validateBody(createBookingSchema),
  bookingController.create
);

// List user bookings
router.get('/', validateQuery(bookingQuerySchema), bookingController.list);

// Get booking by ID
router.get('/:id', validateObjectId('id'), bookingController.getById);

// Cancel booking
router.patch(
  '/:id/cancel',
  validateObjectId('id'),
  validateBody(cancelBookingSchema),
  bookingController.cancel
);

export default router;
