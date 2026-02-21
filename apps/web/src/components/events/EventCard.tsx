/**
 * EventCard — grid card for the events listing page.
 * Displays name, date, venue, price, and availability badge.
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

export default function EventCard({ event }: EventCardProps) {
  return (
    <Link
      to={`/events/${event._id}`}
      className="group flex flex-col rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 overflow-hidden"
    >
      {/* Card body */}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors duration-200 line-clamp-2">
            {event.name}
          </h3>
          <AvailabilityBadge
            availableTickets={event.availableTickets}
            totalTickets={event.totalTickets}
          />
        </div>

        {/* Meta info */}
        <div className="mt-auto space-y-1.5 text-sm text-neutral-500">
          <p className="flex items-center gap-1.5">
            {/* Calendar icon */}
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            {formatDate(event.date)}
          </p>
          <p className="flex items-center gap-1.5">
            {/* Location icon */}
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            {event.venue}
          </p>
        </div>
      </div>

      {/* Footer with price */}
      <div className="border-t border-neutral-100 bg-gradient-to-r from-primary-50 to-transparent px-5 py-3">
        <span className="text-lg font-bold text-primary-600">{formatPrice(event.price)}</span>
        <span className="ml-1 text-xs text-neutral-400">/ ticket</span>
      </div>
    </Link>
  );
}

