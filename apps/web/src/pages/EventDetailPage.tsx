/**
 * EventDetailPage — shows full event details with availability and booking CTA.
 */

import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useEvent } from '@/hooks/useEvent';
import { useAuth } from '@/hooks/useAuth';
import AvailabilityBadge from '@/components/events/AvailabilityBadge';
import BookingModal from '@/components/bookings/BookingModal';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';
import { formatDate, formatPrice, ticketLabel } from '@/utils/formatters';

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { event, loading, error, refetch } = useEvent(id);
  const { isAuthenticated } = useAuth();
  const [bookingOpen, setBookingOpen] = useState(false);

  if (loading) {
    return <Spinner className="min-h-[60vh]" size="lg" />;
  }

  if (error || !event) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center space-y-3">
          <h1 className="text-xl font-bold text-danger-700">{error ?? 'Event not found'}</h1>
          <Link to="/events" className="text-sm text-primary-600 hover:underline">
            ← Back to events
          </Link>
        </div>
      </div>
    );
  }

  const canBook =
    event.status === 'published' &&
    event.availableTickets > 0 &&
    isAuthenticated;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link to="/events" className="mb-6 inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-primary-600">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to events
      </Link>

      {/* Event Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-neutral-900">{event.name}</h1>
            <Badge variant={event.status === 'published' ? 'success' : 'neutral'}>
              {event.status}
            </Badge>
          </div>
          <p className="text-neutral-500">{event.description}</p>
        </div>
        <div className="text-right">
          <span className="text-3xl font-bold text-primary-600">
            {formatPrice(event.price)}
          </span>
          <p className="text-xs text-neutral-400">per ticket</p>
        </div>
      </div>

      {/* Details grid */}
      <div className="grid gap-6 sm:grid-cols-2 mb-8">
        <InfoItem
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          }
          label="Date & Time"
          value={formatDate(event.date)}
        />
        <InfoItem
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
          }
          label="Venue"
          value={event.venue}
        />
        <InfoItem
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
            </svg>
          }
          label="Tickets"
          value={`${ticketLabel(event.availableTickets)} left of ${event.totalTickets}`}
        />
        <div className="flex items-center gap-3 rounded-lg border border-neutral-200 p-4">
          <div className="text-neutral-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-neutral-400">Availability</p>
            <AvailabilityBadge
              availableTickets={event.availableTickets}
              totalTickets={event.totalTickets}
            />
          </div>
        </div>
      </div>

      {/* CTA */}
      {isAuthenticated ? (
        <Button
          size="lg"
          fullWidth
          disabled={!canBook}
          onClick={() => setBookingOpen(true)}
        >
          {event.availableTickets === 0
            ? 'Sold Out'
            : event.status !== 'published'
              ? 'Not Available'
              : 'Book Now'}
        </Button>
      ) : (
        <div className="text-center space-y-2">
          <Link to="/login">
            <Button size="lg" fullWidth>
              Log in to Book
            </Button>
          </Link>
          <p className="text-sm text-neutral-400">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-primary-600 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      )}

      {/* Booking Modal */}
      <BookingModal
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        event={event}
        onSuccess={refetch}
      />
    </div>
  );
}

/** Small helper component for the detail grid items */
function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-neutral-200 p-4">
      <div className="text-neutral-400">{icon}</div>
      <div>
        <p className="text-xs text-neutral-400">{label}</p>
        <p className="font-medium text-neutral-900">{value}</p>
      </div>
    </div>
  );
}

