/**
 * Authentication controller
 * Handles HTTP requests for all authentication endpoints.
 * All business logic lives in AuthService — controllers only handle HTTP concerns.
 */

import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { ApiResponse } from '@ticketing-platform/shared';
import { cacheIdempotencyResponse } from '../../core/middleware/idempotency.middleware';
import { config } from '../../config';

// Cookie options for the httpOnly refresh token.
// Cross-origin (frontend on different domain than API) requires SameSite=None; Secure so the browser sends the cookie.
type RefreshCookieOptions = {
  httpOnly: true;
  secure: boolean;
  sameSite: 'strict' | 'none';
  path: string;
  maxAge: number;
};

function getRefreshCookieOptions(): RefreshCookieOptions {
  const isProduction = config.nodeEnv === 'production';
  const corsOrigin = config.corsOrigin;
  const isCrossOrigin = Array.isArray(corsOrigin)
    ? corsOrigin.some((o) => o && !o.includes('localhost'))
    : !!corsOrigin && !String(corsOrigin).includes('localhost');
  const useCrossSiteCookie = isProduction || isCrossOrigin;

  return {
    httpOnly: true,
    secure: useCrossSiteCookie || isProduction,
    sameSite: useCrossSiteCookie ? ('none' as const) : ('strict' as const),
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * POST /auth/register
   * Register a new user and trigger email verification
   */
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.register(req.body);

      const response: ApiResponse = {
        success: true,
        message: result.message,
        data: result,
      };

      // Cache for idempotency if client supplied a key
      if (req.idempotencyKey) {
        await cacheIdempotencyResponse(req.idempotencyKey, 201, response);
      }

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /auth/login
   * Authenticate with email and password, returns tokens
   */
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.login(req.body);

      // Set refresh token as httpOnly cookie (more secure than body-only delivery)
      res.cookie('refreshToken', result.refreshToken, getRefreshCookieOptions());

      const response: ApiResponse = {
        success: true,
        message: 'Login successful',
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /auth/refresh
   * Issue a new access token using a valid refresh token (body or cookie)
   */
  refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Accept refresh token from body (mobile clients) or httpOnly cookie (web clients)
      const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;

      if (!refreshToken) {
        const response: ApiResponse = {
          success: false,
          message: 'Refresh token is required',
          errors: [{ message: 'Refresh token is required', code: 'VALIDATION_ERROR' }],
        };
        res.status(400).json(response);
        return;
      }

      const result = await this.authService.refreshToken({ refreshToken });

      const response: ApiResponse = {
        success: true,
        message: 'Token refreshed successfully',
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /auth/logout
   * Invalidate refresh token in Redis and clear the cookie
   */
  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.user) {
        await this.authService.logout(req.user.id);
      }

      res.clearCookie('refreshToken', getRefreshCookieOptions());

      const response: ApiResponse = {
        success: true,
        message: 'Logout successful',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /auth/me
   * Return the authenticated user's profile
   */
  me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.authService.getProfile(req.user!.id);

      const response: ApiResponse = {
        success: true,
        data: user,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /auth/verify-email
   * Verify email with the 6-digit code; returns tokens for immediate login
   */
  verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.verifyEmail(req.body.code, req.body.email);

      res.cookie('refreshToken', result.refreshToken, getRefreshCookieOptions());

      const response: ApiResponse = {
        success: true,
        message: 'Email verified successfully',
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /auth/resend-verification
   * Resend the verification code to the given email
   */
  resendVerification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.resendVerificationEmail(req.body.email);

      const response: ApiResponse = {
        success: true,
        message: result.message,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /auth/forgot-password
   * Trigger a password reset email (safe response regardless of whether email exists)
   */
  forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.forgotPassword(req.body.email);

      const response: ApiResponse = {
        success: true,
        message: result.message,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /auth/reset-password
   * Reset the password using the token from the email link
   */
  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.resetPassword(req.body.token, req.body.password);

      const response: ApiResponse = {
        success: true,
        message: result.message,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /auth/google
   * Authenticate with a Google authorization code obtained by the frontend.
   * The frontend initiates the OAuth flow, captures the code, and posts it here.
   */
  googleAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // req.body.code is already validated as non-empty by the Zod middleware
      const result = await this.authService.authenticateWithGoogle(req.body.code);

      // Set the refresh token as an httpOnly cookie, consistent with other auth flows
      res.cookie('refreshToken', result.refreshToken, getRefreshCookieOptions());

      const response: ApiResponse = {
        success: true,
        message: 'Google authentication successful',
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
