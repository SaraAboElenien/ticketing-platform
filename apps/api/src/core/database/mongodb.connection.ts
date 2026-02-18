/**
 * MongoDB connection manager with connection pooling
 * Singleton pattern for serverless compatibility
 */

import mongoose from 'mongoose';
import { config } from '../../config';
import { logger } from '../utils/logger';

let isConnected = false;
let connectionPromise: Promise<typeof mongoose> | null = null;

/**
 * Connect to MongoDB with connection pooling
 * Uses singleton pattern to cache connection in serverless environments
 */
export async function connectMongoDB(): Promise<typeof mongoose> {
  // Return existing connection if already connected
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose;
  }

  // Return existing promise if connection is in progress
  if (connectionPromise) {
    return connectionPromise;
  }

  // Create new connection promise
  connectionPromise = mongoose
    .connect(config.mongodbUri, {
      maxPoolSize: 10, // Maximum number of connections in the pool
      minPoolSize: 2, // Minimum number of connections in the pool
      serverSelectionTimeoutMS: 5000, // Timeout for server selection
      socketTimeoutMS: 45000, // Socket timeout
    })
    .then((mongooseInstance) => {
      isConnected = true;
      logger.info('MongoDB connected successfully', {
        uri: config.mongodbUri.replace(/\/\/.*@/, '//***@'), // Hide credentials in logs
      });

      // Handle connection events
      mongooseInstance.connection.on('error', (error) => {
        logger.error('MongoDB connection error:', error);
        isConnected = false;
      });

      mongooseInstance.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
        isConnected = false;
      });

      mongooseInstance.connection.on('reconnected', () => {
        logger.info('MongoDB reconnected');
        isConnected = true;
      });

      return mongooseInstance;
    })
    .catch((error) => {
      connectionPromise = null;
      isConnected = false;
      logger.error('MongoDB connection failed:', error);
      throw error;
    });

  return connectionPromise;
}

/**
 * Disconnect from MongoDB
 */
export async function disconnectMongoDB(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
    connectionPromise = null;
    logger.info('MongoDB disconnected');
  }
}

/**
 * Check if MongoDB is connected
 */
export function isMongoDBConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

