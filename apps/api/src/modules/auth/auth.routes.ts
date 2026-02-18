/**
 * Authentication routes
 * Public: register, login, refresh token
 * Protected: logout
 */

import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validateBody } from '../../core/middleware/validation.middleware';
import {
  createUserSchema,
  loginSchema,
  refreshTokenSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  googleAuthSchema,
} from '@ticketing-platform/shared';
import { strictRateLimiter } from '../../core/middleware/rateLimit.middleware';
import { authMiddleware } from '../../core/middleware/auth.middleware';

const router = Router();
const authController = new AuthController();

// Public routes
router.post(
  '/register',
  strictRateLimiter,
  validateBody(createUserSchema),
  authController.register
);

router.post('/login', strictRateLimiter, validateBody(loginSchema), authController.login);

router.post(
  '/refresh',
  validateBody(refreshTokenSchema),
  authController.refreshToken
);

// Email verification routes (no auth required - user can't login before verification)
router.post(
  '/verify-email',
  strictRateLimiter,
  validateBody(verifyEmailSchema),
  authController.verifyEmail
);

router.post(
  '/resend-verification',
  strictRateLimiter,
  validateBody(resendVerificationSchema),
  authController.resendVerification
);

// Password reset routes
router.post(
  '/forgot-password',
  strictRateLimiter,
  validateBody(forgotPasswordSchema),
  authController.forgotPassword
);

router.post(
  '/reset-password',
  strictRateLimiter,
  validateBody(resetPasswordSchema),
  authController.resetPassword
);

// Google OAuth route
router.post(
  '/google',
  strictRateLimiter,
  validateBody(googleAuthSchema),
  authController.googleAuth
);

// Protected routes
router.post('/logout', authMiddleware, authController.logout);

// GET /me — returns the currently authenticated user's profile
router.get('/me', authMiddleware, authController.me);

export default router;
