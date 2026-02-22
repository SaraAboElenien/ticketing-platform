/**
 * HomePage — landing page with hero section and featured events.
 * TicketHub dark theme: hero grid, purple glow, gradient text, stats.
 */

import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useEvents } from '@/hooks/useEvents';
import EventCard from '@/components/events/EventCard';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import FloatingTicketCards from '@/components/ui/FloatingTicketCards';

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const { events, loading } = useEvents({ limit: 6, status: 'published' as any, sortBy: 'date', sortOrder: 'asc' });

  return (
    <div className="bg-bg">
      {/* Hero */}
      <section className="min-h-screen grid grid-cols-1 lg:grid-cols-2 items-center px-4 sm:px-8 lg:px-[52px] pt-[100px] pb-20 relative overflow-hidden gap-10">
        <div className="hero-grid grid-drift absolute inset-0" />
        <div
          className="glow-pulse absolute w-[700px] h-[700px] rounded-full pointer-events-none hidden lg:block"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,.15) 0%, transparent 70%)', top: '50%', left: '30%', transform: 'translate(-50%,-55%)' }}
        />
        <div className="relative z-[2]">
          <div className="fade-up-1 inline-flex items-center gap-2 text-[0.78rem] font-medium tracking-[0.08em] uppercase text-purple-light mb-6">
            <span className="w-6 h-px bg-purple-light" />
            Event Discovery Platform
          </div>
          <h1 className="fade-up-2 hero-h1 font-bold leading-[1.1] tracking-[-0.03em] text-[#F8F9FF]">
            Discover &amp; Book
            <br />
            <em className="not-italic gradient-text">Amazing Events</em>
          </h1>
          <p className="fade-up-3 mt-5 text-[rgba(248,249,255,.45)] text-[1.05rem] leading-[1.7] max-w-[480px]">
            Browse upcoming concerts, conferences, and more. Secure your tickets instantly with our fast, reliable booking system.
          </p>
          <div className="fade-up-4 flex items-center gap-[14px] mt-9">
            <Link to="/events" className="no-underline">
              <Button size="lg">Browse Events</Button>
            </Link>
            {!isAuthenticated && (
              <Link to="/register" className="no-underline">
                <Button variant="secondary" size="lg">Sign Up Free</Button>
              </Link>
            )}
          </div>
          <div className="fade-up-5 flex gap-9 mt-14 pt-10 border-t border-[rgba(255,255,255,.07)]">
            <div>
              <div className="text-[1.6rem] font-bold tracking-[-0.02em] text-[#F8F9FF]">50K+</div>
              <div className="text-[0.8rem] text-[rgba(248,249,255,.45)] mt-0.5">Happy Attendees</div>
            </div>
            <div>
              <div className="text-[1.6rem] font-bold tracking-[-0.02em] text-[#F8F9FF]">500+</div>
              <div className="text-[0.8rem] text-[rgba(248,249,255,.45)] mt-0.5">Monthly Events</div>
            </div>
            <div>
              <div className="text-[1.6rem] font-bold tracking-[-0.02em] text-[#F8F9FF]">99%</div>
              <div className="text-[0.8rem] text-[rgba(248,249,255,.45)] mt-0.5">Satisfaction</div>
            </div>
          </div>
        </div>
        <div className="relative z-[2] hidden lg:flex items-center justify-center fade-up-4">
          <FloatingTicketCards variant="hero" />
        </div>
      </section>

      <div className="h-px bg-[rgba(255,255,255,.07)] mx-4 sm:mx-8 lg:mx-[52px]" />

      {/* Featured Events */}
      <section className="py-[88px] px-4 sm:px-8 lg:px-[52px]">
        <div className="flex items-end justify-between mb-11">
          <div>
            <div className="text-[0.75rem] font-medium tracking-[0.1em] uppercase text-purple-light mb-2.5">Don&apos;t miss out</div>
            <h2 className="text-[1.9rem] font-bold tracking-[-0.025em] text-[#F8F9FF]">Upcoming Events</h2>
          </div>
          <Link to="/events" className="text-[0.88rem] text-[rgba(248,249,255,.45)] no-underline flex items-center gap-1 hover:text-[#F8F9FF] transition-all group">
            View all <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        {loading ? (
          <Spinner className="py-12" size="lg" />
        ) : events.length === 0 ? (
          <p className="text-center text-[rgba(248,249,255,.45)] py-12">
            No upcoming events right now. Check back soon!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((event: any) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
