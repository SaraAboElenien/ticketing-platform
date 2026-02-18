/**
 * Booking service with truly atomic concurrency-safe operations
 *
 * CRITICAL: Prevents overbooking using MongoDB's atomic findOneAndUpdate with $inc.
 * The Event.availableTickets field is decremented atomically — if availableTickets < quantity,
 * the update fails and no booking is created. This is race-condition proof.
 */

import mongoose from 'mongoose';
import { Booking as BookingModel } from '../../core/models/Booking.model';
import { Event } from '../../core/models/Event.model';
import {
  CreateBookingDto,
  BookingStatus,
  BookingQuery,
  PaginationMeta,
} from '@ticketing-platform/shared';
import { NotFoundError, ConflictError } from '../../core/errors/app.error';
import { EventAvailabilityService } from '../events/event-availability.service';
import { generateTicketNumber, calculatePaginationMeta, DEFAULTS } from '@ticketing-platform/shared';
import { logger } from '../../core/utils/logger';

export class BookingService {
  private availabilityService: EventAvailabilityService;

  constructor() {
    this.availabilityService = new EventAvailabilityService();
  }

  /**
   * Book ticket(s) with atomic operation
   *
   * FLOW:
   * 1. Check idempotency (return existing booking if found)
   * 2. Atomically decrement Event.availableTickets using $inc with $gte guard
   * 3. If decrement fails → no tickets available (race-safe)
   * 4. Create booking document(s) within a transaction
   * 5. If booking insert fails → rollback the $inc (restore tickets)
   */
  async createBooking(data: CreateBookingDto, userId: string) {
    const quantity = data.quantity || 1;

    // Step 1: Idempotency check — return existing booking if same key was used
    const existingBooking = await BookingModel.findOne({
      idempotencyKey: data.idempotencyKey,
    });

    if (existingBooking) {
      return this.getBookingById(existingBooking._id.toString());
    }

    // Step 2: Verify event exists and is bookable
    const event = await Event.findById(data.eventId);
    if (!event) {
      throw new NotFoundError('Event');
    }

    // Fast pre-check before atomic operation (saves a write attempt)
    if (event.availableTickets < quantity) {
      throw new ConflictError(
        quantity === 1
          ? 'No tickets available'
          : `Only ${event.availableTickets} ticket(s) available`
      );
    }

    // Step 3: Atomic ticket reservation using findOneAndUpdate with $inc
    // This is the core overbooking prevention — atomically decrements availableTickets
    // only if availableTickets >= quantity. If two requests race, only one wins.
    const updatedEvent = await Event.findOneAndUpdate(
      {
        _id: data.eventId,
        availableTickets: { $gte: quantity }, // Guard: only if enough tickets
        deletedAt: null,
      },
      {
        $inc: {
          availableTickets: -quantity, // Atomic decrement
          version: 1,                 // Optimistic locking bump
        },
      },
      { new: true }
    );

    // If update returned null, another request took the last tickets
    if (!updatedEvent) {
      throw new ConflictError('No tickets available — sold out or concurrent booking took them');
    }

    // Step 4: Create booking document(s)
    // If this step fails, we must restore the tickets we just reserved
    try {
      if (quantity === 1) {
        return await this.createSingleBooking(data, userId, updatedEvent);
      } else {
        return await this.createMultipleBookings(data, userId, updatedEvent, quantity);
      }
    } catch (error) {
      // ROLLBACK: Restore the atomically decremented tickets
      logger.error('Booking creation failed, restoring reserved tickets', {
        eventId: data.eventId,
        quantity,
        error,
      });

      await Event.findByIdAndUpdate(data.eventId, {
        $inc: { availableTickets: quantity, version: 1 },
      });

      throw error;
    } finally {
      // Invalidate cache regardless of success/failure
      await this.availabilityService.invalidateCache(data.eventId);
    }
  }

  /**
   * Create a single booking (fast path — no transaction needed)
   */
  private async createSingleBooking(
    data: CreateBookingDto,
    userId: string,
    event: any
  ): Promise<any> {
    // Generate ticket number using a counter based on current booking count
    const bookingCount = await BookingModel.countDocuments({ eventId: event._id });
    const ticketNumber = generateTicketNumber(event._id.toString(), bookingCount + 1);

    const booking = new BookingModel({
      userId,
      eventId: event._id,
      ticketNumber,
      status: BookingStatus.CONFIRMED,
      idempotencyKey: data.idempotencyKey,
      bookingDate: new Date(),
    });

    await booking.save();
    return this.getBookingById(booking._id.toString());
  }

  /**
   * Create multiple bookings in a transaction (multi-ticket path)
   */
  private async createMultipleBookings(
    data: CreateBookingDto,
    userId: string,
    event: any,
    quantity: number
  ): Promise<any> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const bookingCount = await BookingModel.countDocuments({ eventId: event._id }).session(session);

      const bookings = [];
      for (let i = 0; i < quantity; i++) {
        const ticketNumber = generateTicketNumber(event._id.toString(), bookingCount + i + 1);
        const booking = new BookingModel({
          userId,
          eventId: event._id,
          ticketNumber,
          status: BookingStatus.CONFIRMED,
          idempotencyKey: `${data.idempotencyKey}-${i}`, // Unique key per ticket
          bookingDate: new Date(),
        });
        bookings.push(booking);
      }

      await BookingModel.insertMany(bookings, { session });
      await session.commitTransaction();

      // Return all created bookings
      return this.getBookingById(bookings[0]._id.toString());
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Get booking by ID with populated event and user details
   */
  async getBookingById(bookingId: string, userId?: string) {
    const filter: any = { _id: bookingId };

    // If userId is provided, enforce ownership check
    if (userId) {
      filter.userId = userId;
    }

    const booking = await BookingModel.findOne(filter)
      .populate('eventId', 'name date venue price')
      .populate('userId', 'email name')
      .lean();

    if (!booking) {
      throw new NotFoundError('Booking');
    }

    return booking;
  }

  /**
   * List user bookings with filtering and pagination
   */
  async listBookings(query: BookingQuery, userId?: string) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || DEFAULTS.PAGINATION_LIMIT, DEFAULTS.PAGINATION_MAX_LIMIT);
    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = {};

    // Always scope to the authenticated user (users can only see their own bookings)
    if (userId) {
      filter.userId = userId;
    }

    if (query.eventId) {
      filter.eventId = query.eventId;
    }

    if (query.status) {
      filter.status = query.status;
    }

    if (query.dateFrom || query.dateTo) {
      filter.bookingDate = {};
      if (query.dateFrom) {
        filter.bookingDate.$gte = new Date(query.dateFrom);
      }
      if (query.dateTo) {
        filter.bookingDate.$lte = new Date(query.dateTo);
      }
    }

    // Execute query and count in parallel
    const [bookings, total] = await Promise.all([
      BookingModel.find(filter)
        .populate('eventId', 'name date venue price')
        .sort({ bookingDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      BookingModel.countDocuments(filter),
    ]);

    const meta: PaginationMeta = calculatePaginationMeta(page, limit, total);

    return {
      bookings,
      meta,
    };
  }

  /**
   * Cancel booking and atomically restore available tickets
   */
  async cancelBooking(bookingId: string, userId: string, reason?: string) {
    const booking = await BookingModel.findById(bookingId);
    if (!booking) {
      throw new NotFoundError('Booking');
    }

    // Verify ownership — users can only cancel their own bookings
    if (booking.userId.toString() !== userId) {
      throw new NotFoundError('Booking');
    }

    // Check if already cancelled
    if (booking.status === BookingStatus.CANCELLED) {
      throw new ConflictError('Booking already cancelled');
    }

    // Update booking status
    booking.status = BookingStatus.CANCELLED;
    booking.cancelledAt = new Date();
    if (reason) {
      booking.cancellationReason = reason;
    }

    await booking.save();

    // Atomically restore the ticket to Event.availableTickets
    await Event.findByIdAndUpdate(booking.eventId, {
      $inc: { availableTickets: 1, version: 1 },
    });

    // Invalidate availability cache
    await this.availabilityService.invalidateCache(booking.eventId.toString());

    return this.getBookingById(bookingId);
  }
}
