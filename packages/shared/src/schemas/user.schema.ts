/**
 * User and authentication validation schemas using Zod
 */

import { z } from 'zod';

// NOTE: 'role' is intentionally excluded from registration to prevent privilege escalation.
// Only admins should be able to assign roles (via a separate admin endpoint).
export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  name: z.string().min(1).max(100),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// refreshToken is optional in the body because web clients may send it as an httpOnly cookie.
// The controller reads from body first, then falls back to the cookie.
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token must be a non-empty string').optional(),
});

export const verifyEmailSchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string().length(6, 'Verification code must be 6 digits').regex(/^\d{6}$/, 'Verification code must contain only digits'),
});

export const resendVerificationSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

export const googleAuthSchema = z.object({
  code: z.string().min(1, 'Authorization code is required'),
});

