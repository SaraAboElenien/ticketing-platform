/**
 * useEvents — fetches paginated events from the API.
 */

import { useState, useEffect, useCallback } from 'react';
import * as eventsApi from '@/api/events.api';
import type { EventQuery, PaginationMeta } from '@/types';
import { getErrorMessage } from '@/utils/apiError';

export function useEvents(initialQuery?: Partial<EventQuery>) {
  const [events, setEvents] = useState<any[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<Partial<EventQuery>>(initialQuery ?? {});

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await eventsApi.getEvents(query);
      if (res.success) {
        setEvents(res.data as any[] ?? []);
        setMeta(res.meta ?? null);
      } else {
        setError(res.message ?? 'Failed to load events');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { events, meta, loading, error, query, setQuery, refetch: fetchEvents };
}

