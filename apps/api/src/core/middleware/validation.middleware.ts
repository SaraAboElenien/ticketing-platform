/**
 * Request validation middleware using Zod schemas
 * Validates request body, query, and params
 */

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../errors/app.error';

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        throw new ValidationError('Validation failed', errors);
      }
      next(error);
    }
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        throw new ValidationError('Query validation failed', errors);
      }
      next(error);
    }
  };
}

export function validateParams(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        throw new ValidationError('Parameter validation failed', errors);
      }
      next(error);
    }
  };
}

