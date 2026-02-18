/**
 * MongoDB ObjectId validation middleware
 * Validates that route parameters containing IDs are valid MongoDB ObjectIds.
 * Returns a 400 Bad Request instead of letting Mongoose throw a CastError (500).
 */

import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { ValidationError } from '../errors/app.error';

/**
 * Validates that the specified route param(s) are valid MongoDB ObjectIds.
 * Usage: router.get('/:id', validateObjectId('id'), controller.getById)
 */
export function validateObjectId(...paramNames: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    for (const paramName of paramNames) {
      const value = req.params[paramName];
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        return next(new ValidationError(`Invalid ${paramName}: '${value}' is not a valid ID`));
      }
    }
    next();
  };
}

