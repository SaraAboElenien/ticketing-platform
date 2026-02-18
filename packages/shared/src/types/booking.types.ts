/**
 * Booking-related types and DTOs
 */

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

export interface Booking {
  _id: string;
  userId: string;
  eventId: string;
  ticketNumber: string;
  bookingDate: Date;
  status: BookingStatus;
  idempotencyKey: string;
  expiresAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface CreateBookingDto {
  eventId: string;
  idempotencyKey: string; // Required for idempotency
  quantity?: number; // Default: 1
}

export interface BookingQuery extends PaginationQuery {
  userId?: string;
  eventId?: string;
  status?: BookingStatus;
  dateFrom?: string;
  dateTo?: string;
}

export interface CancelBookingDto {
  reason?: string;
}

// Re-export PaginationQuery from api.types
import { PaginationQuery } from './api.types';
export type { PaginationQuery };

