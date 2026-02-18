/**
 * JWT Authentication middleware
 * Validates JWT tokens and attaches user to request
 *
 * NOTE: All error paths use next(error) for consistent Express error handling.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../config';
import { AuthenticationError, AuthorizationError } from '../errors/app.error';

// Extend Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

/**
 * JWT Authentication middleware
 * Validates JWT token from Authorization header or cookie
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    // Get token from Authorization header or cookie
    let token: string | undefined;

    // Check Authorization header: Bearer <token>
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // Check cookie if header not found
    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return next(new AuthenticationError('No token provided'));
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret) as {
      id: string;
      email: string;
      role: string;
      iat?: number;
      exp?: number;
    };

    // Attach user to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    // All JWT errors are mapped to AuthenticationError and passed to next()
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AuthenticationError('Invalid token'));
    }
    if (error instanceof jwt.TokenExpiredError) {
      return next(new AuthenticationError('Token expired'));
    }
    next(error);
  }
}

/**
 * Optional authentication middleware
 * Attaches user if token is present, but doesn't require it
 */
export function optionalAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    // If no token found, continue without auth — this is optional
    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, config.jwt.secret) as {
      id: string;
      email: string;
      role: string;
    };

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch {
    // Token is invalid/expired, continue without authentication
    next();
  }
}

/**
 * Role-based authorization middleware
 * Must be used AFTER authMiddleware
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AuthenticationError('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AuthorizationError('Insufficient permissions'));
    }

    next();
  };
}
