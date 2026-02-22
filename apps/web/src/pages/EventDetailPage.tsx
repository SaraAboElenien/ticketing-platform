/**
 * EventDetailPage — shows full event details with availability and booking CTA.
 * TicketHub dark theme: card-like info blocks, purple accents.
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
    return <div className="min-h-[60vh] flex items-center justify-center bg-bg"><Spinner size="lg" /></div>;
  }

  if (error || !event) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 bg-bg">
        <div className="text-center space-y-3">
          <h1 className="text-xl font-bold text-[#F87171]">{error ?? 'Event not found'}</h1>
          <Link to="/events" className="text-sm text-purple-light hover:underline">
            ← Back to events
          </Link>
        </div>
      </div>
    );
  }

  const canBook = event.status === 'published' && event.availableTickets > 0 && isAuthenticated;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 bg-bg">
      <Link to="/events" className="mb-6 inline-flex items-center gap-1 text-sm text-[rgba(248,249,255,.45)] hover:text-purple-light transition-colors">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to events
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-[#F8F9FF]">{event.name}</h1>
            <Badge variant={event.status === 'published' ? 'success' : 'neutral'}>{event.status}</Badge>
          </div>
          {event.description && <p className="text-[rgba(248,249,255,.45)]">{event.description}</p>}
        </div>
        <div className="text-right">
          <span className="text-3xl font-bold text-purple-light">{formatPrice(event.price)}</span>
          <p className="text-xs text-[rgba(248,249,255,.45)]">per ticket</p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 mb-8">
        <InfoItem
          icon="📅"
          label="Date & Time"
          value={formatDate(event.date)}
        />
        <InfoItem
          icon="📍"
          label="Venue"
          value={event.venue}
        />
        <InfoItem
          icon="🎟"
          label="Tickets"
          value={`${ticketLabel(event.availableTickets)} left of ${event.totalTickets}`}
        />
        <div className="flex items-center gap-3 rounded-xl border border-[rgba(255,255,255,.07)] bg-bg2 p-4">
          <span className="text-2xl">✓</span>
          <div>
            <p className="text-[0.7rem] text-[rgba(248,249,255,.2)] uppercase tracking-wide">Availability</p>
            <AvailabilityBadge availableTickets={event.availableTickets} totalTickets={event.totalTickets} />
          </div>
        </div>
      </div>

      {isAuthenticated ? (
        <Button size="lg" fullWidth disabled={!canBook} onClick={() => setBookingOpen(true)}>
          {event.availableTickets === 0 ? 'Sold Out' : event.status !== 'published' ? 'Not Available' : 'Book Now'}
        </Button>
      ) : (
        <div className="text-center space-y-2">
          <Link to="/login">
            <Button size="lg" fullWidth>Log in to Book</Button>
          </Link>
          <p className="text-sm text-[rgba(248,249,255,.45)]">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-purple-light hover:underline">Sign up</Link>
          </p>
        </div>
      )}

      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} event={event} onSuccess={refetch} />
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[rgba(255,255,255,.07)] bg-bg2 p-4 hover:shadow-[0_4px_24px_rgba(0,0,0,.2)] transition-shadow">
      <span className="text-[0.85rem] opacity-70">{icon}</span>
      <div>
        <p className="text-[0.7rem] text-[rgba(248,249,255,.2)] mb-px">{label}</p>
        <p className="font-medium text-[#F8F9FF]">{value}</p>
      </div>
    </div>
  );
}
