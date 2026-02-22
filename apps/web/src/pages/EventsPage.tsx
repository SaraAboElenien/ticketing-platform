/**
 * EventsPage — full event listing with filters, search, and pagination.
 * TicketHub dark theme: page hero, sticky filters, grid, empty state.
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
    <div className="bg-bg min-h-screen flex flex-col">
      {/* Page hero */}
      <div className="fade-up-0 relative overflow-hidden px-4 sm:px-8 lg:px-[52px] pt-14 pb-12 border-b border-[rgba(255,255,255,.07)]">
        <div className="page-hero-grid grid-drift absolute inset-0" />
        <div
          className="absolute w-[500px] h-[300px] rounded-full pointer-events-none glow-pulse hidden lg:block"
          style={{ background: 'radial-gradient(circle,rgba(124,58,237,.12) 0%,transparent 70%)', top: '50%', left: '20%', transform: 'translate(-50%,-50%)' }}
        />
        <div className="relative z-[2]">
          <div className="flex items-center gap-2 text-[0.75rem] font-medium tracking-[0.1em] uppercase text-purple-light mb-3">
            <span className="w-5 h-px bg-purple-light" />
            All Events
          </div>
          <h1 className="text-[2.4rem] font-bold tracking-[-0.03em] mb-1.5 text-[#F8F9FF]">Browse Events</h1>
          <p className="text-[0.9rem] text-[rgba(248,249,255,.45)]">Concerts, festivals, conferences and more — find your next experience.</p>
        </div>
      </div>

      <EventFilters query={query} onChange={setQuery} />

      <div className="fade-up-2 flex items-center justify-between px-4 sm:px-8 lg:px-[52px] pt-7 pb-5">
        <p className="text-[0.85rem] text-[rgba(248,249,255,.45)]">
          Showing <strong className="text-[#F8F9FF]">{loading ? '…' : events.length}</strong> events
        </p>
      </div>

      <main className="flex-1 px-4 sm:px-8 lg:px-[52px] pb-20">
        {loading ? (
          <Spinner className="py-16" size="lg" />
        ) : error ? (
          <div className="rounded-[10px] bg-[rgba(220,38,38,.1)] border border-[rgba(220,38,38,.2)] p-6 text-center text-sm text-[#F87171]">
            {error}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 px-6">
            <div className="text-5xl mb-4 opacity-30">🎟</div>
            <h3 className="text-[1.1rem] font-semibold mb-2 text-[#F8F9FF]">No events found</h3>
            <p className="text-[0.9rem] text-[rgba(248,249,255,.45)]">Try adjusting your filters or search term.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
      </main>
    </div>
  );
}
