/**
 * Redis client singleton with CacheService
 * Critical for caching, idempotency, and distributed operations
 *
 * CacheService is now a singleton — initialized once and reused across the app.
 */

import { createClient, RedisClientType } from 'redis';
import { config } from '../../config';
import { logger } from '../utils/logger';

let redisClient: RedisClientType | null = null;
let isConnected = false;
let cacheServiceInstance: CacheService | null = null;

/**
 * Get or create Redis client singleton
 * Returns null if Redis is unavailable (server can continue without it)
 */
export async function getRedisClient(): Promise<RedisClientType | null> {
  if (redisClient && isConnected) {
    return redisClient;
  }

  // If we already tried and failed, return null
  if (redisClient && !isConnected) {
    return null;
  }

  try {
    // Use Redis URL if provided, otherwise use host/port
    const redisUrl = config.redis.url || `redis://${config.redis.host}:${config.redis.port}`;

    // Only pass password separately if not using REDIS_URL (URL already contains auth)
    const clientConfig: any = {
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries: number) => {
          if (retries > 10) {
            logger.warn('Redis reconnection failed after 10 retries. Continuing without Redis.');
            isConnected = false;
            return false; // Stop reconnecting
          }
          // Exponential backoff: 100ms, 200ms, 400ms... capped at 3s
          return Math.min(retries * 100, 3000);
        },
        // Enable TLS for Upstash and other cloud Redis providers that require SSL
        tls: redisUrl.startsWith('rediss://') || redisUrl.includes('upstash.io'),
      },
    };

    // Only add password if not using REDIS_URL (URL already contains password)
    if (!config.redis.url && config.redis.password) {
      clientConfig.password = config.redis.password;
    }

    redisClient = createClient(clientConfig);

    // Connection lifecycle events
    redisClient.on('error', (error) => {
      logger.error('Redis client error:', error);
      isConnected = false;
    });

    redisClient.on('connect', () => {
      logger.info('Redis client connecting...');
    });

    redisClient.on('ready', () => {
      logger.info('Redis client ready');
      isConnected = true;
    });

    redisClient.on('end', () => {
      logger.warn('Redis client connection ended');
      isConnected = false;
      cacheServiceInstance = null; // Clear cache service when connection ends
    });

    // Connect to Redis with timeout
    await Promise.race([
      redisClient.connect(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Redis connection timeout')), 5000)
      ),
    ]);

    return redisClient;
  } catch (error) {
    logger.warn('Redis unavailable. Server will continue without caching:', error);
    isConnected = false;
    redisClient = null;
    return null;
  }
}

/**
 * Get singleton CacheService instance
 * Avoids creating a new CacheService on every middleware/service call
 * Returns a no-op cache service if Redis is unavailable
 */
export async function getCacheService(): Promise<CacheService> {
  if (cacheServiceInstance) {
    return cacheServiceInstance;
  }

  const client = await getRedisClient();
  if (!client) {
    // Return a no-op cache service that does nothing
    cacheServiceInstance = new CacheService(null);
    return cacheServiceInstance;
  }

  cacheServiceInstance = new CacheService(client);
  return cacheServiceInstance;
}

/**
 * Close Redis connection gracefully
 */
export async function closeRedisClient(): Promise<void> {
  if (redisClient && isConnected) {
    await redisClient.quit();
    redisClient = null;
    isConnected = false;
    cacheServiceInstance = null;
    logger.info('Redis client closed');
  }
}

/**
 * Check if Redis is connected
 */
export function isRedisConnected(): boolean {
  return isConnected && redisClient !== null;
}

/**
 * Cache helper — wraps Redis get/set/del with JSON serialization and error handling
 * Works as a no-op if Redis client is null (graceful degradation)
 */
export class CacheService {
  private client: RedisClientType | null;

  constructor(client: RedisClientType | null) {
    this.client = client;
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.client) {
      return null; // No-op if Redis unavailable
    }
    try {
      const value = await this.client.get(key);
      return value ? (JSON.parse(value) as T) : null;
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    if (!this.client) {
      return; // No-op if Redis unavailable
    }
    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await this.client.setEx(key, ttlSeconds, serialized);
      } else {
        await this.client.set(key, serialized);
      }
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.client) {
      return; // No-op if Redis unavailable
    }
    try {
      await this.client.del(key);
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.client) {
      return false; // No-op if Redis unavailable
    }
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }
}
