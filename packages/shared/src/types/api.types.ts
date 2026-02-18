/**
 * Standard API Response Types
 * Used across frontend and backend for type safety
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ApiError[];
  meta?: PaginationMeta;
}

export interface ApiError {
  field?: string;
  message: string;
  code?: string;
}

export interface PaginationMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
  cursor?: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  cursor?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

