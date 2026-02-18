/**
 * Bookings API service — wraps every booking endpoint.
 */

import client from './client';
import type { ApiResponse, BookingQuery } from '@/types';

/** POST /bookings — requires an Idempotency-Key header to prevent duplicates */
export async function createBooking(body: {
  eventId: string;
  quantity: number;
  idempotencyKey: string;
}): Promise<ApiResponse> {
  const { data } = await client.post<ApiResponse>('/bookings', body, {
    headers: { 'Idempotency-Key': body.idempotencyKey },
  });
  return data;
}

/** GET /bookings — returns the current user's bookings (paginated) */
export async function getBookings(
  query?: Partial<BookingQuery>
): Promise<ApiResponse> {
  const { data } = await client.get<ApiResponse>('/bookings', { params: query });
  return data;
}

/** GET /bookings/:id */
export async function getBooking(id: string): Promise<ApiResponse> {
  const { data } = await client.get<ApiResponse>(`/bookings/${id}`);
  return data;
}

/** PATCH /bookings/:id/cancel */
export async function cancelBooking(
  id: string,
  body?: { reason?: string }
): Promise<ApiResponse> {
  const { data } = await client.patch<ApiResponse>(`/bookings/${id}/cancel`, body ?? {});
  return data;
}

