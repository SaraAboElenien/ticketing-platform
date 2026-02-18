/**
 * useBookings — fetches the current user's bookings.
 */

import { useState, useEffect, useCallback } from 'react';
import * as bookingsApi from '@/api/bookings.api';
import type { BookingQuery, PaginationMeta } from '@/types';
import { getErrorMessage } from '@/utils/apiError';

export function useBookings(initialQuery?: Partial<BookingQuery>) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<Partial<BookingQuery>>(initialQuery ?? {});

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await bookingsApi.getBookings(query);
      if (res.success) {
        setBookings(res.data as any[] ?? []);
        setMeta(res.meta ?? null);
      } else {
        setError(res.message ?? 'Failed to load bookings');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return { bookings, meta, loading, error, query, setQuery, refetch: fetchBookings };
}

