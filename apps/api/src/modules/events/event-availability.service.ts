/**
 * Event availability service
 * Reads availability from Event.availableTickets (atomically managed) and caches in Redis.
 *
 * IMPORTANT: availableTickets is the source of truth, atomically updated via $inc
 * during booking and cancellation. This service only reads and caches the value.
 */

import { Event } from '../../core/models/Event.model';
import { getCacheService } from '../../core/cache/redis.client';
import { CACHE_KEYS, CACHE_TTL } from '@ticketing-platform/shared';
import { logger } from '../../core/utils/logger';

export interface EventAvailability {
  eventId: string;
  totalTickets: number;
  availableTickets: number;
  confirmedBookings: number;
  lastUpdated: Date;
}

export class EventAvailabilityService {
  /**
   * Get event availability (with optional Redis caching)
   */
  async getAvailability(eventId: string, useCache: boolean = true): Promise<EventAvailability> {
    // Try cache first for read-heavy paths (event listing, details page)
    if (useCache) {
      try {
        const cache = await getCacheService();
        const cached = await cache.get<EventAvailability>(
          CACHE_KEYS.EVENT_AVAILABILITY(eventId)
        );

        if (cached) {
          return cached;
        }
      } catch (error) {
        logger.warn('Cache read failed, reading from database:', error);
      }
    }

    // Read directly from Event document — no expensive aggregation needed
    const event = await Event.findById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    const confirmedBookings = event.totalTickets - event.availableTickets;

    const availability: EventAvailability = {
      eventId: event._id.toString(),
      totalTickets: event.totalTickets,
      availableTickets: event.availableTickets,
      confirmedBookings,
      lastUpdated: new Date(),
    };

    // Cache the result for subsequent reads
    try {
      const cache = await getCacheService();
      await cache.set(
        CACHE_KEYS.EVENT_AVAILABILITY(eventId),
        availability,
        CACHE_TTL.EVENT_AVAILABILITY
      );
    } catch (error) {
      logger.warn('Cache write failed:', error);
    }

    return availability;
  }

  /**
   * Invalidate availability cache
   * Called after bookings are created or cancelled
   */
  async invalidateCache(eventId: string): Promise<void> {
    try {
      const cache = await getCacheService();
      await cache.del(CACHE_KEYS.EVENT_AVAILABILITY(eventId));
    } catch (error) {
      logger.warn('Cache invalidation failed:', error);
    }
  }

  /**
   * Check if event has available tickets
   * Reads directly from database (bypasses cache for booking accuracy)
   */
  async hasAvailability(eventId: string, quantity: number = 1): Promise<boolean> {
    const event = await Event.findById(eventId).select('availableTickets').lean();
    if (!event) return false;
    return event.availableTickets >= quantity;
  }
}
