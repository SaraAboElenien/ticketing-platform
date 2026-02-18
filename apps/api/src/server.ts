/**
 * Development server entry point
 * Starts Express server on configured port with graceful shutdown
 */

import { createApp } from './app';
import { config } from './config';
import { connectMongoDB, disconnectMongoDB } from './core/database/mongodb.connection';
import { getRedisClient, closeRedisClient } from './core/cache/redis.client';
import { logger } from './core/utils/logger';

async function startServer() {
  try {
    // Connect to MongoDB
    logger.info('Connecting to MongoDB...');
    await connectMongoDB();
    logger.info('MongoDB connected');

    // Connect to Redis (optional - server continues if Redis unavailable)
    logger.info('Connecting to Redis...');
    const redisClient = await getRedisClient();
    if (redisClient) {
      logger.info('Redis connected');
    } else {
      logger.warn('Redis unavailable - server will continue without caching. Some features may be limited.');
    }

    // Create Express app
    const app = createApp();

    // Start server
    const server = app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`, {
        environment: config.nodeEnv,
        apiVersion: config.apiVersion,
      });
    });

    // Graceful shutdown handler — closes HTTP server, MongoDB, and Redis
    async function gracefulShutdown(signal: string) {
      logger.info(`${signal} received, shutting down gracefully...`);

      server.close(async () => {
        logger.info('HTTP server closed');

        try {
          // Close database connections
          await disconnectMongoDB();
          await closeRedisClient();
          logger.info('All connections closed');
        } catch (error) {
          logger.error('Error during shutdown:', error);
        }

        process.exit(0);
      });

      // Force shutdown after 10 seconds if graceful shutdown hangs
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    }

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start server
startServer();
