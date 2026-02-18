/**
 * useEvent — fetches a single event by ID.
 */

import { useState, useEffect, useCallback } from 'react';
import * as eventsApi from '@/api/events.api';
import { getErrorMessage } from '@/utils/apiError';

export function useEvent(id: string | undefined) {
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvent = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await eventsApi.getEvent(id);
      if (res.success) {
        setEvent(res.data);
      } else {
        setError(res.message ?? 'Event not found');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  return { event, loading, error, refetch: fetchEvent };
}

