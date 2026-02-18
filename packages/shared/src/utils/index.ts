/**
 * Shared utility functions
 */

/**
 * Generate a unique ticket number
 */
export function generateTicketNumber(eventId: string, sequence: number): string {
  const eventShortId = eventId.slice(-6).toUpperCase();
  const paddedSequence = sequence.toString().padStart(6, '0');
  return `TKT-${eventShortId}-${paddedSequence}`;
}

/**
 * Calculate pagination metadata
 */
export function calculatePaginationMeta(
  page: number,
  limit: number,
  total: number
): {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
} {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/**
 * Sanitize string input to prevent NoSQL injection
 */
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

