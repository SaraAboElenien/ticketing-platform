/**
 * Idempotency key generation for booking requests.
 * Uses crypto-grade UUID v4 to guarantee uniqueness.
 */

import { v4 as uuidv4 } from 'uuid';

export function generateIdempotencyKey(): string {
  return uuidv4();
}

