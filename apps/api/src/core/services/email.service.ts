/**
 * Email service using Resend
 * Sends transactional emails (verification, password reset, etc.)
 *
 * Behaviour:
 *  - RESEND_API_KEY present  → sends real emails via Resend
 *  - RESEND_API_KEY absent   → logs the email content to the terminal (development fallback)
 */

import { Resend } from 'resend';
import { config } from '../../config';
import { logger } from '../utils/logger';

// Initialize client only when API key is present
const resend = config.email.apiKey ? new Resend(config.email.apiKey) : null;

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send an email via Resend.
 * Falls back to terminal logging when no API key is configured.
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  if (!resend) {
    // Development fallback: log email content so engineers can manually verify flows
    logger.info('[Email] Would send email (no RESEND_API_KEY set):', {
      to: options.to,
      subject: options.subject,
    });

    // Extract and log the 6-digit verification code if present
    const codeMatch = options.html.match(/\b(\d{6})\b/);
    if (codeMatch) {
      logger.info(`[Email] 🔐 VERIFICATION CODE for ${options.to}: ${codeMatch[1]}`);
    }

    // Extract and log a password reset token if present
    const tokenMatch = options.html.match(/reset-password\?token=([a-fA-F0-9]{64})/);
    if (tokenMatch) {
      logger.info(`[Email] 🔑 PASSWORD RESET TOKEN for ${options.to}: ${tokenMatch[1]}`);
    }

    return;
  }

  try {
    await resend.emails.send({
      from: config.email.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    logger.info('[Email] Sent successfully', { to: options.to, subject: options.subject });
  } catch (error) {
    // Log but do not throw — email failures must not break auth flows
    // Consider adding a retry queue (e.g. BullMQ) for production reliability
    logger.error('[Email] Failed to send email:', { to: options.to, error });
  }
}

/**
 * Generate the HTML body for the initial email verification email
 */
export function generateVerificationEmail(name: string, code: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f4f4f4; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
          <h1 style="color: #333; margin-top: 0;">Welcome to ${config.email.appName}!</h1>
        </div>

        <p>Hi ${name},</p>

        <p>Thank you for signing up! Please verify your email address by entering the code below:</p>

        <div style="background-color: #f9f9f9; border: 2px dashed #333; border-radius: 5px; padding: 20px; text-align: center; margin: 30px 0;">
          <h2 style="color: #333; margin: 0; font-size: 32px; letter-spacing: 5px;">${code}</h2>
        </div>

        <p>This code expires in <strong>24 hours</strong>.</p>

        <p>If you did not create an account, you can safely ignore this email.</p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

        <p style="color: #666; font-size: 12px;">This is an automated message — please do not reply.</p>
      </body>
    </html>
  `;
}

/**
 * Generate the HTML body for the password reset email
 * The reset link points to the frontend's reset-password page
 */
export function generatePasswordResetEmail(name: string, resetToken: string): string {
  const resetUrl = `${config.email.frontendUrl}/reset-password?token=${resetToken}`;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f4f4f4; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
          <h1 style="color: #333; margin-top: 0;">Password Reset Request</h1>
        </div>

        <p>Hi ${name},</p>

        <p>We received a request to reset the password for your account. Click the button below to proceed:</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        </div>

        <p>Or copy and paste this URL into your browser:</p>
        <p style="word-break: break-all; color: #007bff;">${resetUrl}</p>

        <p>This link expires in <strong>1 hour</strong>.</p>

        <p>If you did not request a password reset, please ignore this email. Your password will not change.</p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

        <p style="color: #666; font-size: 12px;">This is an automated message — please do not reply.</p>
      </body>
    </html>
  `;
}
