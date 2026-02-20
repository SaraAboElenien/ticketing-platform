/**
 * Environment configuration with validation
 * All configuration values are validated on startup
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface Config {
  // Server
  nodeEnv: string;
  port: number;
  apiVersion: string;

  // MongoDB
  mongodbUri: string;

  // Redis
  redis: {
    host: string;
    port: number;
    password?: string;
    url?: string;
  };

  // JWT
  jwt: {
    secret: string;
    expiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
  };

  // Bcrypt
  bcryptRounds: number;

  // Rate Limiting
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };

  // Booking
  booking: {
    reservationTtlMinutes: number;
    idempotencyKeyTtlHours: number;
  };

  // CORS
  corsOrigin: string | string[];

  // Logging
  logLevel: string;

  // Email (Nodemailer / Gmail SMTP)
  email: {
    smtpUser: string;   // Gmail address (empty string = dev fallback mode)
    smtpPass: string;   // Gmail App Password
    appName: string;
    frontendUrl: string;
  };

  // Google OAuth
  googleOAuth: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  };
}

function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (!value && !defaultValue) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || defaultValue!;
}

function getEnvNumber(key: string, defaultValue?: number): number {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value ? parseInt(value, 10) : defaultValue!;
}

function getEnvArray(key: string, defaultValue?: string[]): string | string[] {
  const value = process.env[key];
  if (!value && !defaultValue) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  const result = value || defaultValue!.join(',');
  return result.includes(',') ? result.split(',').map((s: string) => s.trim()) : result;
}

export const config: Config = {
  nodeEnv: getEnv('NODE_ENV', 'development'),
  port: getEnvNumber('PORT', 3000),
  apiVersion: getEnv('API_VERSION', 'v1'),

  // Single MongoDB URI — use MONGODB_URI for both local and Atlas (Atlas connection strings work the same way)
  mongodbUri: getEnv('MONGODB_URI', 'mongodb://localhost:27017/ticketing-platform'),

  redis: {
    host: getEnv('REDIS_HOST', 'localhost'),
    port: getEnvNumber('REDIS_PORT', 6379),
    password: process.env.REDIS_PASSWORD,
    url: process.env.REDIS_URL,
  },

  jwt: {
    secret: getEnv('JWT_SECRET', 'change-this-secret-in-production-min-32-chars'),
    expiresIn: getEnv('JWT_EXPIRES_IN', '15m'),
    refreshSecret: getEnv('JWT_REFRESH_SECRET', 'change-this-refresh-secret-in-production'),
    refreshExpiresIn: getEnv('JWT_REFRESH_EXPIRES_IN', '7d'),
  },

  bcryptRounds: getEnvNumber('BCRYPT_ROUNDS', 10),

  rateLimit: {
    windowMs: getEnvNumber('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000),
    maxRequests: getEnvNumber('RATE_LIMIT_MAX_REQUESTS', 100),
  },

  booking: {
    reservationTtlMinutes: getEnvNumber('BOOKING_RESERVATION_TTL_MINUTES', 15),
    idempotencyKeyTtlHours: getEnvNumber('IDEMPOTENCY_KEY_TTL_HOURS', 24),
  },

  // Default to the Vite dev server port — the frontend runs on :5173, not the API port :3000
  corsOrigin: getEnvArray('CORS_ORIGIN', ['http://localhost:5173']),

  logLevel: getEnv('LOG_LEVEL', 'info'),

  email: {
    // Empty string = no credentials; service will fall back to terminal logging
    smtpUser: process.env.SMTP_USER || '',
    smtpPass: process.env.SMTP_PASS || '',
    appName: getEnv('APP_NAME', 'Ticketing Platform'),
    frontendUrl: getEnv('FRONTEND_URL', 'http://localhost:5173'),
  },

  googleOAuth: {
    // Both fields are optional — Google OAuth is disabled when they are absent
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    // Must match the redirect URI configured in the Google Cloud Console
    // AND the redirect URI the frontend uses when initiating the OAuth flow
    redirectUri: getEnv('GOOGLE_REDIRECT_URI', 'http://localhost:5173/auth/callback/google'),
  },
};

// Validate critical configuration in production
if (config.nodeEnv === 'production') {
  if (config.jwt.secret === 'change-this-secret-in-production-min-32-chars') {
    throw new Error('JWT_SECRET must be changed in production!');
  }
  if (config.jwt.secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long!');
  }
}

