/**
 * Express application setup
 * Configures all middleware and routes
 */

import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { config } from './config';
import { API_PREFIX } from '@ticketing-platform/shared';

// Middleware
import { requestLogger } from './core/middleware/logger.middleware';
import { errorHandler, notFoundHandler } from './core/middleware/error.middleware';
import { defaultRateLimiter } from './core/middleware/rateLimit.middleware';

// Infrastructure checks
import { isMongoDBConnected } from './core/database/mongodb.connection';
import { isRedisConnected } from './core/cache/redis.client';

// Routes
import authRoutes from './modules/auth/auth.routes';
import eventRoutes from './modules/events/event.routes';
import bookingRoutes from './modules/bookings/booking.routes';

/**
 * Create and configure Express app
 */
export function createApp(): Express {
  const app = express();

  // Security middleware — sets various HTTP headers to prevent common attacks
  app.use(helmet());

  // CORS configuration
  app.use(
    cors({
      origin: config.corsOrigin,
      credentials: true,
    })
  );

  // Body parsing middleware with size limits to prevent payload abuse
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser());

  // Compression middleware — gzip responses for performance
  app.use(compression());

  // Request logging — logs every incoming request and response
  app.use(requestLogger);

  // Rate limiting (applied to all routes)
  app.use(defaultRateLimiter);

  // Shallow health check — just confirms the server process is alive
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // Deep health check — verifies MongoDB and Redis connectivity
  app.get('/health/ready', (req, res) => {
    const mongoOk = isMongoDBConnected();
    const redisOk = isRedisConnected();
    const allHealthy = mongoOk && redisOk;

    res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      dependencies: {
        mongodb: mongoOk ? 'connected' : 'disconnected',
        redis: redisOk ? 'connected' : 'disconnected',
      },
      // Temporary debug — shows if env vars exist (not their values)
      envCheck: {
        MONGODB_URI: !!process.env.MONGODB_URI,
        REDIS_URL: !!process.env.REDIS_URL,
        NODE_ENV: process.env.NODE_ENV || 'not set',
      },
    });
  });

  // API routes
  app.use(`${API_PREFIX}/auth`, authRoutes);
  app.use(`${API_PREFIX}/events`, eventRoutes);
  app.use(`${API_PREFIX}/bookings`, bookingRoutes);

  // 404 handler — catches unmatched routes
  app.use(notFoundHandler);

  // Error handler (must be last middleware)
  app.use(errorHandler);

  return app;
}
