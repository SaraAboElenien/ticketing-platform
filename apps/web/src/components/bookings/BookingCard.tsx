/**
 * BookingCard — renders a single booking in the user's bookings list.
 * TicketHub dark theme: color strip, icon column with notches, meta grid, ticket # row, cancel button.
 */

import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import BarcodeBar from '@/components/ui/BarcodeBar';
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

/** Emoji from event name for icon column */
function getEventEmoji(name: string) {
  const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const emojis = ['🎸', '🎷', '🎭', '🎆', '🎤', '💻'];
  return emojis[hash % emojis.length];
}

export default function BookingCard({ booking, onCancel }: BookingCardProps) {
  const ev = booking.eventId;
  const qty = booking.quantity ?? 1;
  const total = ev ? ev.price * qty : 0;
  const emoji = ev ? getEventEmoji(ev.name) : '🎟';

  return (
    <div data-reveal className="bg-bg2 border border-[rgba(255,255,255,.07)] rounded-[18px] overflow-hidden hover:border-[rgba(124,58,237,.35)] hover:shadow-[0_16px_48px_rgba(0,0,0,.4)] transition-all">
      <div className="h-1" style={{ background: 'linear-gradient(90deg,#7C3AED 0%,#9B5CF6 100%)' }} />
      <div className="flex items-stretch">
        <div className="card-icon-col relative w-20 flex-shrink-0 flex items-center justify-center text-[2rem] border-r border-dashed border-[rgba(255,255,255,.07)] py-7">
          {emoji}
        </div>
        <div className="flex-1 px-7 py-6 flex flex-col gap-[14px]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[1.15rem] font-semibold tracking-[-0.015em] mb-1.5 text-[#F8F9FF]">
                {ev?.name ?? 'Unknown Event'}
              </div>
              <Badge variant={statusVariant[booking.status] ?? 'neutral'} icon={<span className="status-dot w-[5px] h-[5px] rounded-full bg-current inline-block" />}>
                {booking.status}
              </Badge>
            </div>
            <div className="text-[1.4rem] font-bold tracking-[-0.02em] whitespace-nowrap flex-shrink-0 text-[#F8F9FF]">
              {formatPrice(total)}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            {ev && (
              <>
                <div className="flex items-center gap-2 text-[0.82rem] text-[rgba(248,249,255,.45)]">
                  <span className="text-[0.85rem] opacity-70">📅</span>
                  <div>
                    <span className="block text-[0.7rem] text-[rgba(248,249,255,.2)] mb-px">Date &amp; Time</span>
                    <span>{formatDate(ev.date)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[0.82rem] text-[rgba(248,249,255,.45)]">
                  <span className="text-[0.85rem] opacity-70">📍</span>
                  <div>
                    <span className="block text-[0.7rem] text-[rgba(248,249,255,.2)] mb-px">Venue</span>
                    <span>{ev.venue}</span>
                  </div>
                </div>
              </>
            )}
            <div className="flex items-center gap-2 text-[0.82rem] text-[rgba(248,249,255,.45)]">
              <span className="text-[0.85rem] opacity-70">🎟</span>
              <div>
                <span className="block text-[0.7rem] text-[rgba(248,249,255,.2)] mb-px">Tickets</span>
                <span>{ticketLabel(qty)}</span>
              </div>
            </div>
            {ev && (
              <div className="flex items-center gap-2 text-[0.82rem] text-[rgba(248,249,255,.45)]">
                <span className="text-[0.85rem] opacity-70">💳</span>
                <div>
                  <span className="block text-[0.7rem] text-[rgba(248,249,255,.2)] mb-px">Price per ticket</span>
                  <span>{formatPrice(ev.price)}</span>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between gap-3 px-4 py-3 bg-[rgba(255,255,255,.03)] border border-[rgba(255,255,255,.07)] rounded-[10px]">
            <div>
              <div className="text-[0.7rem] text-[rgba(248,249,255,.2)] uppercase tracking-[0.07em]">Ticket #</div>
              <div className="text-[0.85rem] font-semibold text-purple-light font-mono tracking-[0.04em]">{booking.ticketNumber}</div>
            </div>
            <BarcodeBar className="h-[22px]" />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between px-7 py-4 border-t border-[rgba(255,255,255,.07)]">
        <span className="text-[0.78rem] text-[rgba(248,249,255,.2)]">Booked on {formatDate(booking.createdAt)}</span>
        {booking.status === 'confirmed' && (
          <Button variant="danger" size="sm" onClick={() => onCancel(booking._id, ev?.name ?? 'this event')}>
            Cancel Booking
          </Button>
        )}
      </div>
    </div>
  );
}
