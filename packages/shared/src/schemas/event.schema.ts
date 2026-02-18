/**
 * Event validation schemas using Zod
 */

import { z } from 'zod';
import { EventStatus } from '../types/event.types';

export const createEventSchema = z.object({
  name: z.string().min(1).max(200),
  date: z.coerce.date().refine((date) => date > new Date(), {
    message: 'Event date must be in the future',
  }),
  venue: z.string().min(1).max(200),
  totalTickets: z.number().int().positive().min(1).max(1000000),
  price: z.number().nonnegative().min(0),
  status: z.nativeEnum(EventStatus).optional().default(EventStatus.DRAFT),
});

export const updateEventSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  date: z.coerce.date().optional(),
  venue: z.string().min(1).max(200).optional(),
  totalTickets: z.number().int().positive().min(1).max(1000000).optional(),
  price: z.number().nonnegative().min(0).optional(),
  status: z.nativeEnum(EventStatus).optional(),
});

export const eventQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  cursor: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  status: z.nativeEnum(EventStatus).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  venue: z.string().optional(),
  search: z.string().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
});

