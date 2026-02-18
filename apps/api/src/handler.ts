/**
 * Serverless handler for Vercel/deployment platforms
 * Exports Express app as a serverless function
 */

import { createApp } from './app';
import { connectMongoDB } from './core/database/mongodb.connection';
import { getRedisClient } from './core/cache/redis.client';
import { logger } from './core/utils/logger';

// Initialize connections (cached for serverless)
let app: ReturnType<typeof createApp> | null = null;
let connectionsInitialized = false;

async function initializeConnections() {
  if (connectionsInitialized) {
    return;
  }

  try {
    // Connect to MongoDB (connection is cached)
    await connectMongoDB();
    logger.info('MongoDB connected (serverless)');

    // Connect to Redis (connection is cached, optional)
    const redisClient = await getRedisClient();
    if (redisClient) {
      logger.info('Redis connected (serverless)');
    } else {
      logger.warn('Redis unavailable (serverless) - continuing without caching');
    }

    connectionsInitialized = true;
  } catch (error) {
    // MongoDB connection failure is critical - throw
    // Redis failure is non-critical - log and continue
    if (error instanceof Error && error.message.includes('MongoDB')) {
      logger.error('Failed to initialize MongoDB connection:', error);
      throw error;
    }
    logger.warn('Non-critical connection issue (likely Redis):', error);
    // Continue even if Redis fails
  }
}

/**
 * Serverless handler function
 */
export default async function handler(req: any, res: any) {
  // Initialize connections on first request (cold start)
  if (!connectionsInitialized) {
    await initializeConnections();
  }

  // Create app on first request
  if (!app) {
    app = createApp();
  }

  // Handle request
  return app(req, res);
}

