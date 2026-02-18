/**
 * Booking controller
 * Handles HTTP requests for booking endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { BookingService } from './booking.service';
import { ApiResponse } from '@ticketing-platform/shared';
import { cacheIdempotencyResponse } from '../../core/middleware/idempotency.middleware';

export class BookingController {
  private bookingService: BookingService;

  constructor() {
    this.bookingService = new BookingService();
  }

  /**
   * Create booking
   */
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Check if idempotency cache exists (from middleware)
      if (req.idempotencyCache) {
        res.status(req.idempotencyCache.statusCode).json(req.idempotencyCache.body);
        return;
      }

      const result = await this.bookingService.createBooking(req.body, req.user!.id);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Ticket booked successfully',
      };

      // Cache response for idempotency
      if (req.idempotencyKey) {
        await cacheIdempotencyResponse(req.idempotencyKey, 201, response);
      }

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get booking by ID — enforces ownership (user can only see their own bookings)
   */
  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Pass userId to enforce ownership — users can only view their own bookings
      const result = await this.bookingService.getBookingById(req.params.id, req.user!.id);

      const response: ApiResponse = {
        success: true,
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * List bookings — scoped to authenticated user
   */
  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.bookingService.listBookings(req.query as any, req.user!.id);

      const response: ApiResponse = {
        success: true,
        data: result.bookings,
        meta: result.meta,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Cancel booking
   */
  cancel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.bookingService.cancelBooking(
        req.params.id,
        req.user!.id,
        req.body.reason
      );

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Booking cancelled successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
