/**
 * EventsPage — full event listing with filters, search, and pagination.
 */

import { useEvents } from '@/hooks/useEvents';
import EventCard from '@/components/events/EventCard';
import EventFilters from '@/components/events/EventFilters';
import Pagination from '@/components/ui/Pagination';
import Spinner from '@/components/ui/Spinner';

export default function EventsPage() {
  const { events, meta, loading, error, query, setQuery } = useEvents({
    page: 1,
    limit: 12,
    sortBy: 'date',
    sortOrder: 'asc',
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page heading */}
      <h1 className="text-3xl font-bold text-neutral-900 mb-6">Events</h1>

      {/* Filters */}
      <EventFilters query={query} onChange={setQuery} />

      {/* Results */}
      <div className="mt-6">
        {loading ? (
          <Spinner className="py-16" size="lg" />
        ) : error ? (
          <div className="rounded-lg bg-danger-50 p-6 text-center text-sm text-danger-700">
            {error}
          </div>
        ) : events.length === 0 ? (
          <p className="py-16 text-center text-neutral-500">
            No events match your filters.
          </p>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event: any) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>

            {meta && (
              <div className="mt-8">
                <Pagination
                  meta={meta}
                  onPageChange={(page) => setQuery((q) => ({ ...q, page }))}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

