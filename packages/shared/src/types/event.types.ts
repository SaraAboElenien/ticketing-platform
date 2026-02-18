/**
 * Event-related types and DTOs
 */

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export interface Event {
  _id: string;
  name: string;
  date: Date;
  venue: string;
  totalTickets: number;
  price: number;
  status: EventStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  version?: number;
}

export interface CreateEventDto {
  name: string;
  date: string | Date;
  venue: string;
  totalTickets: number;
  price: number;
  status?: EventStatus;
}

export interface UpdateEventDto {
  name?: string;
  date?: string | Date;
  venue?: string;
  totalTickets?: number;
  price?: number;
  status?: EventStatus;
}

export interface EventQuery extends PaginationQuery {
  status?: EventStatus;
  dateFrom?: string;
  dateTo?: string;
  venue?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface EventAvailability {
  eventId: string;
  totalTickets: number;
  availableTickets: number;
  confirmedBookings: number;
  lastUpdated: Date;
}

// Re-export PaginationQuery from api.types
import { PaginationQuery } from './api.types';
export type { PaginationQuery };

