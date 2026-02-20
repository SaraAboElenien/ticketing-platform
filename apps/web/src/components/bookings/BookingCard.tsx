/**
 * BookingCard — renders a single booking in the user's bookings list.
 */

import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { formatDate, formatPrice, ticketLabel } from '@/utils/formatters';

interface PopulatedEvent {
  _id: string;
  name: string;
  date: string;
  venue: string;
  price: number;
}

interface BookingCardProps {
  booking: {
    _id: string;
    ticketNumber: string;
    status: string;
    quantity?: number;
    createdAt: string;
    /** Populated by Mongoose — the field is called eventId but contains the full event object */
    eventId?: PopulatedEvent;
  };
  onCancel: (bookingId: string, eventName: string) => void;
}

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
  confirmed: 'success',
  pending: 'warning',
  cancelled: 'danger',
  expired: 'neutral',
};

export default function BookingCard({ booking, onCancel }: BookingCardProps) {
  const ev = booking.eventId;
  const qty = booking.quantity ?? 1;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
      {/* Left: event info */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-neutral-900">{ev?.name ?? 'Unknown Event'}</h3>
          <Badge variant={statusVariant[booking.status] ?? 'neutral'}>
            {booking.status}
          </Badge>
        </div>
        {ev && (
          <p className="text-sm text-neutral-500">
            {formatDate(ev.date)} &middot; {ev.venue}
          </p>
        )}
        <p className="text-xs text-neutral-400">
          Ticket #: <span className="font-mono">{booking.ticketNumber}</span>
          {' · '}
          {ticketLabel(qty)}
          {ev && <> · {formatPrice(ev.price * qty)}</>}
        </p>
        <p className="text-xs text-neutral-400">
          Booked on {formatDate(booking.createdAt)}
        </p>
      </div>

      {/* Right: actions */}
      {booking.status === 'confirmed' && (
        <Button
          variant="danger"
          size="sm"
          onClick={() => onCancel(booking._id, ev?.name ?? 'this event')}
        >
          Cancel
        </Button>
      )}
    </div>
  );
}

