/**
 * EventCard — grid card for the events listing page.
 * TicketHub dark theme: card-visual, ticket tear separator, status badge, price footer.
 */

import { Link } from 'react-router-dom';
import AvailabilityBadge from './AvailabilityBadge';
import { formatDate, formatPrice } from '@/utils/formatters';

interface EventCardProps {
  event: {
    _id: string;
    name: string;
    date: string;
    venue: string;
    price: number;
    totalTickets: number;
    availableTickets: number;
    status: string;
  };
}

/** Default gradient and emoji; can derive from event name/type if needed */
function getCardVisual(eventName: string) {
  const hash = eventName.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const options = [
    { gradient: 'linear-gradient(135deg,#1a0a2e,#2D1060)', emoji: '🎭' },
    { gradient: 'linear-gradient(135deg,#071626,#0C2545)', emoji: '🎷' },
    { gradient: 'linear-gradient(135deg,#071a12,#0A2E1A)', emoji: '🎸' },
    { gradient: 'linear-gradient(135deg,#0d0a1e,#1a0050)', emoji: '🎆' },
  ];
  return options[hash % options.length];
}

export default function EventCard({ event }: EventCardProps) {
  const visual = getCardVisual(event.name);
  const canBook = event.availableTickets > 0 && event.status === 'published';

  return (
    <Link
      to={`/events/${event._id}`}
      className="block group"
      data-reveal
    >
      <div className="bg-bg2 border border-[rgba(255,255,255,.07)] rounded-2xl overflow-hidden hover:border-[rgba(124,58,237,.4)] hover:shadow-[0_20px_48px_rgba(0,0,0,.4),0_0_0_1px_rgba(124,58,237,.1)] transition-all h-full flex flex-col">
        <div
          className="card-visual relative h-40 flex items-center justify-center overflow-hidden"
          style={{ background: visual.gradient }}
        >
          <div className="absolute w-[180px] h-[180px] rounded-full opacity-35 group-hover:opacity-60 transition-opacity bg-purple blur-[40px]" />
          <span className="text-5xl relative z-[1] group-hover:scale-110 group-hover:-translate-y-[3px] transition-transform duration-[350ms]">{visual.emoji}</span>
        </div>
        <div className="card-sep relative h-px mx-5 border-t border-dashed border-[rgba(255,255,255,.08)]" />
        <div className="px-[22px] py-5 flex-1 flex flex-col">
          <AvailabilityBadge availableTickets={event.availableTickets} totalTickets={event.totalTickets} />
          <h3 className="text-[1.1rem] font-semibold tracking-[-0.015em] mb-3.5 text-[#F8F9FF] line-clamp-2 mt-2">
            {event.name}
          </h3>
          <div className="flex flex-col gap-[7px]">
            <div className="flex items-center gap-[9px] text-[0.83rem] text-[rgba(248,249,255,.45)]">📅 {formatDate(event.date)}</div>
            <div className="flex items-center gap-[9px] text-[0.83rem] text-[rgba(248,249,255,.45)]">📍 {event.venue}</div>
          </div>
        </div>
        <div className="flex items-center justify-between px-[22px] py-4 border-t border-[rgba(255,255,255,.07)]">
          <div className="text-[1.2rem] font-bold tracking-[-0.02em] text-[#F8F9FF]">
            {formatPrice(event.price)} <span className="text-[0.75rem] text-[rgba(248,249,255,.45)] font-normal">/ ticket</span>
          </div>
          {canBook ? (
            <span className="px-[18px] py-[9px] rounded-lg text-[0.83rem] font-medium border-0 bg-purple text-[#F8F9FF] cursor-pointer group-hover:bg-purple-light group-hover:-translate-y-px group-hover:shadow-[0_6px_18px_rgba(124,58,237,.3)] transition-all">
              Get Tickets
            </span>
          ) : (
            <span className="px-[18px] py-[9px] rounded-lg text-[0.83rem] font-medium border-0 bg-[rgba(255,255,255,.05)] text-[rgba(248,249,255,.45)] cursor-not-allowed">
              Sold Out
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
