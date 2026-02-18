/**
 * Event service
 * Handles event CRUD operations with availability from the Event model's availableTickets field
 */

import { Event } from '../../core/models/Event.model';
import { Booking as BookingModel } from '../../core/models/Booking.model';
import {
  CreateEventDto,
  UpdateEventDto,
  EventQuery,
  EventStatus,
  BookingStatus,
  PaginationMeta,
} from '@ticketing-platform/shared';
import { NotFoundError, ConflictError } from '../../core/errors/app.error';
import { EventAvailabilityService } from './event-availability.service';
import { calculatePaginationMeta, DEFAULTS } from '@ticketing-platform/shared';

// Allowed fields for sorting — prevents users from sorting by internal fields
const ALLOWED_SORT_FIELDS = ['name', 'date', 'price', 'createdAt', 'availableTickets'];

export class EventService {
  private availabilityService: EventAvailabilityService;

  constructor() {
    this.availabilityService = new EventAvailabilityService();
  }

  /**
   * Create new event
   * Sets availableTickets = totalTickets on creation
   */
  async createEvent(data: CreateEventDto, userId: string) {
    const event = new Event({
      ...data,
      date: new Date(data.date),
      availableTickets: data.totalTickets, // Initially all tickets are available
      status: data.status || EventStatus.DRAFT,
    });

    await event.save();
    return this.getEventById(event._id.toString());
  }

  /**
   * Get event by ID with availability data
   */
  async getEventById(eventId: string) {
    const event = await Event.findById(eventId);
    if (!event) {
      throw new NotFoundError('Event');
    }

    // Availability comes directly from the model — no N+1 queries needed
    return {
      ...event.toObject(),
      availability: {
        totalTickets: event.totalTickets,
        availableTickets: event.availableTickets,
      },
    };
  }

  /**
   * List events with filtering, sorting, and pagination
   * Availability is read from the Event document directly (no N+1 problem)
   */
  async listEvents(query: EventQuery) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || DEFAULTS.PAGINATION_LIMIT, DEFAULTS.PAGINATION_MAX_LIMIT);
    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = {};

    if (query.status) {
      filter.status = query.status;
    }

    if (query.dateFrom || query.dateTo) {
      filter.date = {};
      if (query.dateFrom) {
        filter.date.$gte = new Date(query.dateFrom);
      }
      if (query.dateTo) {
        filter.date.$lte = new Date(query.dateTo);
      }
    }

    // Use text search index instead of raw $regex to prevent ReDoS attacks
    if (query.venue) {
      // Escape special regex characters to prevent ReDoS
      const escapedVenue = query.venue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.venue = { $regex: escapedVenue, $options: 'i' };
    }

    if (query.search) {
      filter.$text = { $search: query.search };
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      filter.price = {};
      if (query.minPrice !== undefined) {
        filter.price.$gte = query.minPrice;
      }
      if (query.maxPrice !== undefined) {
        filter.price.$lte = query.maxPrice;
      }
    }

    // Build sort — only allow whitelisted fields to prevent internal field exposure
    const sort: any = {};
    if (query.sortBy && ALLOWED_SORT_FIELDS.includes(query.sortBy)) {
      sort[query.sortBy] = query.sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.date = 1; // Default sort by upcoming date
    }

    // Execute query and count in parallel for performance
    const [events, total] = await Promise.all([
      Event.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Event.countDocuments(filter),
    ]);

    // Availability is already on the Event document — no extra queries needed
    const eventsWithAvailability = events.map((event) => ({
      ...event,
      availability: {
        totalTickets: event.totalTickets,
        availableTickets: event.availableTickets,
      },
    }));

    const meta: PaginationMeta = calculatePaginationMeta(page, limit, total);

    return {
      events: eventsWithAvailability,
      meta,
    };
  }

  /**
   * Update event
   * If totalTickets changes, recalculate availableTickets proportionally
   */
  async updateEvent(eventId: string, data: UpdateEventDto) {
    const event = await Event.findById(eventId);
    if (!event) {
      throw new NotFoundError('Event');
    }

    // If totalTickets is being changed, adjust availableTickets accordingly
    if (data.totalTickets !== undefined && data.totalTickets !== event.totalTickets) {
      const ticketDifference = data.totalTickets - event.totalTickets;
      const newAvailable = event.availableTickets + ticketDifference;

      // Can't reduce below already-booked tickets
      if (newAvailable < 0) {
        const bookedCount = event.totalTickets - event.availableTickets;
        throw new ConflictError(
          `Cannot reduce totalTickets to ${data.totalTickets}. ${bookedCount} tickets already booked.`
        );
      }

      event.availableTickets = newAvailable;
    }

    // Update other fields
    if (data.name !== undefined) event.name = data.name;
    if (data.venue !== undefined) event.venue = data.venue;
    if (data.price !== undefined) event.price = data.price;
    if (data.status !== undefined) event.status = data.status;
    if (data.totalTickets !== undefined) event.totalTickets = data.totalTickets;
    if (data.date) {
      event.date = new Date(data.date);
    }

    await event.save();

    // Invalidate availability cache
    await this.availabilityService.invalidateCache(eventId);

    return this.getEventById(eventId);
  }

  /**
   * Delete event (soft delete)
   * Prevents deletion if there are active (confirmed) bookings
   */
  async deleteEvent(eventId: string) {
    const event = await Event.findById(eventId);
    if (!event) {
      throw new NotFoundError('Event');
    }

    // Check for active bookings before allowing deletion
    const activeBookingsCount = await BookingModel.countDocuments({
      eventId: event._id,
      status: BookingStatus.CONFIRMED,
      deletedAt: null,
    });

    if (activeBookingsCount > 0) {
      throw new ConflictError(
        `Cannot delete event with ${activeBookingsCount} active booking(s). Cancel bookings first.`
      );
    }

    event.deletedAt = new Date();
    await event.save();

    // Invalidate cache
    await this.availabilityService.invalidateCache(eventId);

    return { message: 'Event deleted successfully' };
  }
}
