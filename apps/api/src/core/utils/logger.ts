/**
 * Structured logging using Winston
 * Provides JSON logs for production observability
 *
 * NOTE: File transports are only used in development/local.
 * In production/serverless, logs go to console only (picked up by cloud logging).
 */

import winston from 'winston';
import { config } from '../../config';

// JSON format for structured logging (production and log aggregation)
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Human-readable format for local development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

// Build transports list based on environment
const transports: winston.transport[] = [
  // Console transport is always active — cloud platforms capture stdout
  new winston.transports.Console({
    format: config.nodeEnv === 'production' ? logFormat : consoleFormat,
  }),
];

// File transports only in development (serverless filesystems are ephemeral)
if (config.nodeEnv === 'development') {
  transports.push(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
    })
  );
}

export const logger = winston.createLogger({
  level: config.logLevel,
  format: logFormat,
  defaultMeta: { service: 'ticketing-platform-api' },
  transports,
});
