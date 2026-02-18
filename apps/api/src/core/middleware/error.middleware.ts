/**
 * Centralized error handling middleware
 * Formats all errors into consistent API responses
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app.error';
import { ApiResponse } from '@ticketing-platform/shared';
import { logger } from '../utils/logger';

export function errorHandler(
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log error
  logger.error('Error occurred:', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  // Handle known operational errors
  if (error instanceof AppError) {
    // Check if it's a ValidationError with detailed field errors
    if ('errors' in error && Array.isArray((error as any).errors) && (error as any).errors.length > 0) {
      const response: ApiResponse = {
        success: false,
        message: error.message,
        errors: (error as any).errors.map((err: { field?: string; message: string }) => ({
          field: err.field,
          message: err.message,
          code: error.code,
        })),
      };

      res.status(error.statusCode).json(response);
      return;
    }

    // Standard AppError without detailed errors
    const response: ApiResponse = {
      success: false,
      message: error.message,
      errors: [{ message: error.message, code: error.code }],
    };

    res.status(error.statusCode).json(response);
    return;
  }

  // Handle validation errors (from Zod or express-validator)
  if (error.name === 'ValidationError' || error.name === 'ZodError') {
    const response: ApiResponse = {
      success: false,
      message: 'Validation error',
      errors: [{ message: error.message }],
    };

    res.status(400).json(response);
    return;
  }

  // Handle MongoDB duplicate key error
  if (error.name === 'MongoServerError' && (error as any).code === 11000) {
    const response: ApiResponse = {
      success: false,
      message: 'Duplicate entry',
      errors: [{ message: 'A record with this value already exists' }],
    };

    res.status(409).json(response);
    return;
  }

  // Handle unknown errors (don't expose details in production)
  const response: ApiResponse = {
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    errors: [{ message: 'An unexpected error occurred' }],
  };

  res.status(500).json(response);
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(req: Request, res: Response): void {
  const response: ApiResponse = {
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
    errors: [{ message: 'Resource not found' }],
  };

  res.status(404).json(response);
}

