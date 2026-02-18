/**
 * HomePage — landing page with hero section and featured events.
 */

import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useEvents } from '@/hooks/useEvents';
import EventCard from '@/components/events/EventCard';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  // Fetch a small set of published events for the featured section
  const { events, loading } = useEvents({ limit: 6, status: 'published' as any, sortBy: 'date', sortOrder: 'asc' });

  return (
    <div>
      {/* ── Hero Section ──────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Discover &amp; Book Amazing Events
            </h1>
            <p className="mt-4 text-lg text-primary-100">
              Browse upcoming concerts, conferences, and more. Secure your tickets
              instantly with our fast, reliable booking system.
            </p>
            <div className="mt-8 flex gap-3">
              <Link to="/events">
                <Button size="lg" className="bg-white text-primary-700 hover:bg-primary-50">
                  Browse Events
                </Button>
              </Link>
              {!isAuthenticated && (
                <Link to="/register">
                  <Button size="lg" variant="ghost" className="text-white border border-white/30 hover:bg-white/10">
                    Sign Up Free
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Events ───────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-neutral-900">Upcoming Events</h2>
          <Link to="/events" className="text-sm font-medium text-primary-600 hover:underline">
            View all →
          </Link>
        </div>

        {loading ? (
          <Spinner className="py-12" size="lg" />
        ) : events.length === 0 ? (
          <p className="text-center text-neutral-500 py-12">
            No upcoming events right now. Check back soon!
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event: any) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

