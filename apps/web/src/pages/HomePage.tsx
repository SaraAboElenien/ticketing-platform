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
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white overflow-hidden">
        {/* Decorative accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Discover &amp; Book Amazing Events
            </h1>
            <p className="mt-6 text-lg text-primary-100 leading-relaxed">
              Browse upcoming concerts, conferences, and more. Secure your tickets
              instantly with our fast, reliable booking system.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/events">
                <Button size="lg" className="bg-white text-primary-700 hover:bg-primary-50 shadow-lg hover:shadow-xl transition-all">
                  Browse Events
                </Button>
              </Link>
              {!isAuthenticated && (
                <Link to="/register">
                  <Button size="lg" variant="ghost" className="text-white border-2 border-white/40 hover:bg-white/10 hover:border-white/60 backdrop-blur-sm transition-all">
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

