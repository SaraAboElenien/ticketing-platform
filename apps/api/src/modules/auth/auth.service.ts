/**
 * Authentication service
 * Handles user registration, login, JWT token generation, refresh tokens,
 * email verification, password reset, and Google OAuth
 */

import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../../core/models/User.model';
import { config } from '../../config';
import { AuthenticationError, ConflictError, NotFoundError } from '../../core/errors/app.error';
import { CreateUserDto, LoginDto, AuthResponse, RefreshTokenDto } from '@ticketing-platform/shared';
import { getCacheService } from '../../core/cache/redis.client';
import { CACHE_KEYS } from '@ticketing-platform/shared';
import {
  sendEmail,
  generateVerificationEmail,
  generatePasswordResetEmail,
} from '../../core/services/email.service';

// Reuse a single OAuth2Client instance across requests (avoid re-instantiation per call)
const googleOAuthClient = config.googleOAuth.clientId
  ? new OAuth2Client(
      config.googleOAuth.clientId,
      config.googleOAuth.clientSecret,
      config.googleOAuth.redirectUri
    )
  : null;

export class AuthService {
  /**
   * Register a new user and send a verification email
   */
  async register(data: CreateUserDto): Promise<{ message: string; user: { email: string; name: string } }> {
    // Check if user already exists
    const existingUser = await User.findOne({ email: data.email.toLowerCase() });
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Generate cryptographically secure 6-digit verification code
    const verificationCode = this.generateVerificationCode();

    // Create new user — role is always 'user' for public registration
    // Admin roles must be assigned directly in the database
    const user = new User({
      email: data.email.toLowerCase(),
      password: data.password,
      name: data.name,
      role: 'user',
      isEmailVerified: false,
      verificationCode,
      verificationCodeExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    await user.save();

    // Send verification email (non-blocking: failure doesn't break registration)
    await sendEmail({
      to: user.email,
      subject: 'Verify Your Email Address',
      html: generateVerificationEmail(user.name, verificationCode),
    });

    return {
      message: 'Registration successful! Please check your email for the verification code.',
      user: {
        email: user.email,
        name: user.name,
      },
    };
  }

  /**
   * Login user with account lockout and email verification enforcement
   */
  async login(data: LoginDto): Promise<AuthResponse> {
    // Fetch user with password field (excluded by default)
    const user = await User.findOne({ email: data.email.toLowerCase() }).select('+password');
    if (!user) {
      // Do not reveal whether the account exists
      throw new AuthenticationError('Invalid email or password');
    }

    // Block password login for Google OAuth accounts
    if (user.provider === 'google') {
      throw new AuthenticationError(
        'This account uses Google Sign-In. Please sign in with Google.'
      );
    }

    // Check if account is temporarily locked due to failed attempts
    if (user.isAccountLocked()) {
      const minutesRemaining = Math.ceil((user.lockedUntil!.getTime() - Date.now()) / (60 * 1000));
      throw new AuthenticationError(
        `Account is temporarily locked. Please try again in ${minutesRemaining} minute(s).`
      );
    }

    // Validate password
    const isPasswordValid = await user.comparePassword(data.password);
    if (!isPasswordValid) {
      await user.incrementFailedLoginAttempts();
      throw new AuthenticationError('Invalid email or password');
    }

    // Require email verification before allowing login
    if (!user.isEmailVerified) {
      throw new AuthenticationError(
        'Please verify your email address before logging in. Check your inbox for the verification code.'
      );
    }

    // Successful login: clear any lockout state
    await user.resetFailedLoginAttempts();

    const tokens = this.generateTokens({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    await this.storeRefreshToken(user._id.toString(), tokens.refreshToken);

    return {
      user: {
        _id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  /**
   * Refresh access token using a valid refresh token
   */
  async refreshToken(data: RefreshTokenDto): Promise<{ accessToken: string }> {
    try {
      // Verify the refresh token signature and expiry
      const decoded = jwt.verify(data.refreshToken, config.jwt.refreshSecret) as {
        id: string;
        email: string;
        role: string;
      };

      // Validate against Redis — guards against token reuse after logout
      const cache = await getCacheService();
      const storedToken = await cache.get<string>(CACHE_KEYS.REFRESH_TOKEN(decoded.id));

      if (!storedToken || storedToken !== data.refreshToken) {
        throw new AuthenticationError('Invalid or revoked refresh token');
      }

      // Issue a new access token
      const accessToken = jwt.sign(
        { id: decoded.id, email: decoded.email, role: decoded.role },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn } as SignOptions
      );

      return { accessToken };
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthenticationError('Invalid refresh token');
      }
      throw error;
    }
  }

  /**
   * Get user profile by ID — used by GET /auth/me
   */
  async getProfile(userId: string) {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    return {
      _id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      provider: user.provider,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Logout: invalidate the refresh token in Redis and clear the cookie
   */
  async logout(userId: string): Promise<void> {
    const cache = await getCacheService();
    await cache.del(CACHE_KEYS.REFRESH_TOKEN(userId));
  }

  /**
   * Verify email address using the 6-digit code
   * Does not require prior authentication — user cannot login before verification
   */
  async verifyEmail(code: string, email: string): Promise<AuthResponse> {
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+verificationCode +verificationCodeExpires'
    );
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.isEmailVerified) {
      throw new ConflictError('Email is already verified');
    }

    if (!user.verificationCode || user.verificationCode !== code) {
      throw new AuthenticationError('Invalid verification code');
    }

    if (!user.verificationCodeExpires || user.verificationCodeExpires < new Date()) {
      throw new AuthenticationError('Verification code has expired. Please request a new one.');
    }

    // Mark email as verified and clear the code
    user.isEmailVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    // Auto-login: issue tokens immediately after verification
    const tokens = this.generateTokens({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    await this.storeRefreshToken(user._id.toString(), tokens.refreshToken);

    return {
      user: {
        _id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  /**
   * Resend email verification code
   */
  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+verificationCode +verificationCodeExpires'
    );

    if (!user) {
      // Do not reveal whether the account exists
      return { message: 'If an account exists with this email, a verification code has been sent.' };
    }

    if (user.isEmailVerified) {
      throw new ConflictError('Email is already verified');
    }

    // Generate and store a new code
    const verificationCode = this.generateVerificationCode();
    user.verificationCode = verificationCode;
    user.verificationCodeExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await user.save();

    await sendEmail({
      to: user.email,
      subject: 'Verify Your Email Address',
      html: generateVerificationEmail(user.name, verificationCode),
    });

    return { message: 'If an account exists with this email, a verification code has been sent.' };
  }

  /**
   * Initiate password reset: generates a hashed token and sends reset email
   * The raw token (sent via email) is never stored — only the hash is persisted
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    // Constant response to avoid user enumeration
    const SAFE_RESPONSE = {
      message: 'If an account exists with this email, a password reset link has been sent.',
    };

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return SAFE_RESPONSE;
    }

    // Block password reset for Google OAuth accounts
    if (user.provider === 'google') {
      return SAFE_RESPONSE;
    }

    // Generate raw token to send in email; store only the SHA-256 hash
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    await sendEmail({
      to: user.email,
      subject: 'Reset Your Password',
      html: generatePasswordResetEmail(user.name, rawToken),
    });

    return SAFE_RESPONSE;
  }

  /**
   * Reset password using the raw token from the email
   * Invalidates all existing sessions after a successful reset
   */
  async resetPassword(rawToken: string, newPassword: string): Promise<{ message: string }> {
    // Hash the incoming token to compare against the stored hash
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      throw new AuthenticationError('Invalid or expired password reset token');
    }

    // Update the password and clear the reset token
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Invalidate all active sessions — forces re-login after a password reset
    const cache = await getCacheService();
    await cache.del(CACHE_KEYS.REFRESH_TOKEN(user._id.toString()));

    return { message: 'Password has been reset successfully. Please log in with your new password.' };
  }

  /**
   * Authenticate with Google OAuth
   * Handles both new user registration and existing user login
   * Does NOT silently link Google accounts to existing local accounts —
   * users with a local account must log in with email/password
   */
  async authenticateWithGoogle(code: string): Promise<AuthResponse> {
    if (!googleOAuthClient) {
      throw new AuthenticationError('Google OAuth is not configured on this server');
    }

    try {
      // Exchange the authorization code for Google tokens
      const { tokens } = await googleOAuthClient.getToken(code);
      googleOAuthClient.setCredentials(tokens);

      if (!tokens.id_token) {
        throw new AuthenticationError('Failed to retrieve ID token from Google');
      }

      // Verify the ID token — this validates audience, signature, and expiry
      const ticket = await googleOAuthClient.verifyIdToken({
        idToken: tokens.id_token,
        audience: config.googleOAuth.clientId,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new AuthenticationError('Failed to retrieve user information from Google');
      }

      const { sub: googleId, email, name, email_verified } = payload;

      if (!googleId || !email || !name) {
        throw new AuthenticationError('Incomplete profile returned by Google. Ensure email and profile scopes are granted.');
      }

      // Look up the user by their Google ID first (existing Google users)
      let user = await User.findOne({ googleId });

      if (!user) {
        // Check if an account already exists with this email using local auth
        const existingLocalUser = await User.findOne({ email: email.toLowerCase() });

        if (existingLocalUser) {
          // Do not auto-link accounts — require explicit action to prevent account takeover
          throw new ConflictError(
            'An account with this email already exists. Please log in with your email and password.'
          );
        }

        // Create a new account for this Google user
        user = new User({
          email: email.toLowerCase(),
          name,
          provider: 'google',
          googleId,
          role: 'user',
          // Google-verified emails are considered verified; unverified ones must still pass
          isEmailVerified: email_verified === true,
        });

        await user.save();
      }

      // Reset any lingering lockout state on successful OAuth login
      await user.resetFailedLoginAttempts();

      const { accessToken, refreshToken } = this.generateTokens({
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      await this.storeRefreshToken(user._id.toString(), refreshToken);

      return {
        user: {
          _id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          provider: user.provider,
          isEmailVerified: user.isEmailVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      // Re-throw known application errors unchanged
      if (error instanceof AuthenticationError || error instanceof ConflictError) {
        throw error;
      }
      // Wrap unexpected Google API errors
      throw new AuthenticationError('Google authentication failed. Please try again.');
    }
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  /**
   * Generate a cryptographically secure 6-digit verification code
   */
  private generateVerificationCode(): string {
    // crypto.randomInt is cryptographically secure, unlike Math.random()
    return crypto.randomInt(100000, 1000000).toString();
  }

  /**
   * Generate signed JWT access and refresh token pair
   */
  private generateTokens(payload: { id: string; email: string; role: string }): {
    accessToken: string;
    refreshToken: string;
  } {
    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    } as SignOptions);

    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
    } as SignOptions);

    return { accessToken, refreshToken };
  }

  /**
   * Persist refresh token in Redis with a 7-day TTL
   * Note: If Redis is unavailable, the token will not be stored.
   * The next refresh attempt will fail, requiring re-login — this is acceptable
   * as a security-forward trade-off over silently skipping validation.
   */
  private async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const cache = await getCacheService();
    const ttl = 7 * 24 * 60 * 60; // 7 days in seconds
    await cache.set(CACHE_KEYS.REFRESH_TOKEN(userId), refreshToken, ttl);
  }
}
