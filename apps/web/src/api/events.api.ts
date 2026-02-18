/**
 * Events API service — wraps every event endpoint.
 */

import client from './client';
import type { ApiResponse, CreateEventDto, UpdateEventDto, EventQuery } from '@/types';

/** GET /events — public, supports filtering and pagination */
export async function getEvents(
  query?: Partial<EventQuery>
): Promise<ApiResponse> {
  const { data } = await client.get<ApiResponse>('/events', { params: query });
  return data;
}

/** GET /events/:id — public, returns event + availability */
export async function getEvent(id: string): Promise<ApiResponse> {
  const { data } = await client.get<ApiResponse>(`/events/${id}`);
  return data;
}

/** POST /events — admin only */
export async function createEvent(body: CreateEventDto): Promise<ApiResponse> {
  const { data } = await client.post<ApiResponse>('/events', body);
  return data;
}

/** PUT /events/:id — admin only */
export async function updateEvent(
  id: string,
  body: Partial<UpdateEventDto>
): Promise<ApiResponse> {
  const { data } = await client.put<ApiResponse>(`/events/${id}`, body);
  return data;
}

/** DELETE /events/:id — admin only, soft delete */
export async function deleteEvent(id: string): Promise<ApiResponse> {
  const { data } = await client.delete<ApiResponse>(`/events/${id}`);
  return data;
}

