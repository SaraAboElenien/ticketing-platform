/**
 * Extract a human-readable error message from an Axios error / ApiResponse.
 * Falls back to generic text so the UI always has something to show.
 */

import type { ApiResponse } from '@/types';

export function getErrorMessage(error: unknown): string {
  // Axios wraps the server response in error.response.data
  const axiosData = (error as any)?.response?.data as ApiResponse | undefined;

  if (axiosData?.errors?.length) {
    return axiosData.errors[0].message;
  }
  if (axiosData?.message) {
    return axiosData.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred. Please try again.';
}

