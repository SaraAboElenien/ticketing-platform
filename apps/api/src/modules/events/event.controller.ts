/**
 * Event controller
 * Handles HTTP requests for event endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { EventService } from './event.service';
import { ApiResponse } from '@ticketing-platform/shared';

export class EventController {
  private eventService: EventService;

  constructor() {
    this.eventService = new EventService();
  }

  /**
   * Create event
   */
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.eventService.createEvent(req.body, req.user!.id);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Event created successfully',
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get event by ID
   */
  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.eventService.getEventById(req.params.id);

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
   * List events
   */
  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.eventService.listEvents(req.query as any);

      const response: ApiResponse = {
        success: true,
        data: result.events,
        meta: result.meta,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update event
   */
  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.eventService.updateEvent(req.params.id, req.body);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Event updated successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete event (soft delete)
   */
  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.eventService.deleteEvent(req.params.id);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Event deleted successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
