/**
 * BookingsPage — protected page showing the current user's bookings.
 * Includes pagination and a cancel flow.
 */

import { useState } from 'react';
import { useBookings } from '@/hooks/useBookings';
import BookingCard from '@/components/bookings/BookingCard';
import CancelModal from '@/components/bookings/CancelModal';
import Pagination from '@/components/ui/Pagination';
import Spinner from '@/components/ui/Spinner';

export default function BookingsPage() {
  const { bookings, meta, loading, error, query, setQuery, refetch } = useBookings({
    page: 1,
    limit: 10,
  });

  // Cancel modal state
  const [cancelTarget, setCancelTarget] = useState<{
    bookingId: string;
    eventName: string;
  } | null>(null);

  const handleCancelClick = (bookingId: string, eventName: string) => {
    setCancelTarget({ bookingId, eventName });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-neutral-900 mb-6">My Bookings</h1>

      {loading ? (
        <Spinner className="py-16" size="lg" />
      ) : error ? (
        <div className="rounded-lg bg-danger-50 p-6 text-center text-sm text-danger-700">
          {error}
        </div>
      ) : bookings.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-neutral-500">You don&apos;t have any bookings yet.</p>
          <a href="/events" className="mt-2 inline-block text-sm text-primary-600 hover:underline">
            Browse events →
          </a>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {bookings.map((b: any) => (
              <BookingCard key={b._id} booking={b} onCancel={handleCancelClick} />
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

      {/* Cancel confirmation modal */}
      {cancelTarget && (
        <CancelModal
          open
          bookingId={cancelTarget.bookingId}
          eventName={cancelTarget.eventName}
          onClose={() => setCancelTarget(null)}
          onSuccess={refetch}
        />
      )}
    </div>
  );
}

