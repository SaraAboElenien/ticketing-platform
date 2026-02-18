/**
 * Booking validation schemas using Zod
 */

import { z } from 'zod';

export const createBookingSchema = z.object({
  eventId: z.string().min(1),
  idempotencyKey: z.string().uuid('Idempotency key must be a valid UUID'),
  quantity: z.number().int().positive().min(1).max(10).optional().default(1),
});

export const cancelBookingSchema = z.object({
  reason: z.string().max(500).optional(),
});

export const bookingQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  cursor: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  userId: z.string().optional(),
  eventId: z.string().optional(),
  status: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

