/**
 * BookingsPage — protected page showing the current user's bookings.
 * TicketHub dark theme: page header with eyebrow, title, active count card.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBookings } from '@/hooks/useBookings';
import BookingCard from '@/components/bookings/BookingCard';
import CancelModal from '@/components/bookings/CancelModal';
import Pagination from '@/components/ui/Pagination';
import Spinner from '@/components/ui/Spinner';

export default function BookingsPage() {
  const { bookings, meta, loading, error, query, setQuery, refetch } = useBookings({ page: 1, limit: 10 });
  const [cancelTarget, setCancelTarget] = useState<{ bookingId: string; eventName: string } | null>(null);

  const handleCancelClick = (bookingId: string, eventName: string) => {
    setCancelTarget({ bookingId, eventName });
  };

  const confirmedCount = bookings.filter((b: { status: string }) => b.status === 'confirmed').length;

  return (
    <main className="flex-1 max-w-[860px] w-full mx-auto px-4 sm:px-6 pt-[60px] pb-20 bg-bg">
      <div className="fade-up-0 flex items-end justify-between mb-10">
        <div>
          <div className="flex items-center gap-2 text-[0.75rem] font-medium tracking-[0.1em] uppercase text-purple-light mb-2">
            <span className="w-5 h-px bg-purple-light" />
            Account
          </div>
          <h1 className="text-[2rem] font-bold tracking-[-0.025em] text-[#F8F9FF]">My Bookings</h1>
        </div>
        {!loading && bookings.length > 0 && (
          <div className="bg-bg2 border border-[rgba(255,255,255,.07)] rounded-[10px] px-5 py-3 text-right">
            <div className="text-[1.5rem] font-bold text-[#F8F9FF]">{confirmedCount}</div>
            <div className="text-[0.75rem] text-[rgba(248,249,255,.45)]">Active Bookings</div>
          </div>
        )}
      </div>

      {loading ? (
        <Spinner className="py-16" size="lg" />
      ) : error ? (
        <div className="rounded-[10px] bg-[rgba(220,38,38,.1)] border border-[rgba(220,38,38,.2)] p-6 text-center text-sm text-[#F87171]">
          {error}
        </div>
      ) : bookings.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-[rgba(248,249,255,.45)]">You don&apos;t have any bookings yet.</p>
          <Link to="/events" className="mt-2 inline-block text-sm text-purple-light hover:underline">
            Browse events →
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-4">
            {bookings.map((b: any) => (
              <BookingCard key={b._id} booking={b} onCancel={handleCancelClick} />
            ))}
          </div>
          {meta && (
            <div className="mt-8">
              <Pagination meta={meta} onPageChange={(page) => setQuery((q: any) => ({ ...q, page }))} />
            </div>
          )}
        </>
      )}

      {cancelTarget && (
        <CancelModal
          open
          bookingId={cancelTarget.bookingId}
          eventName={cancelTarget.eventName}
          onClose={() => setCancelTarget(null)}
          onSuccess={refetch}
        />
      )}
    </main>
  );
}
