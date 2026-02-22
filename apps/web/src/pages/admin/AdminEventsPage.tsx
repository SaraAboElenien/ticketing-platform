/**
 * AdminEventsPage — admin event management: list, create, edit, delete.
 * Design: admin-tailwind (stat cards, filters bar, table with icon, ticket bar, status badges).
 */

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useEvents } from '@/hooks/useEvents';
import EventFilters from '@/components/events/EventFilters';
import Pagination from '@/components/ui/Pagination';
import Alert from '@/components/ui/Alert';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import StatCard from '@/components/admin/StatCard';
import { formatDate, formatPrice } from '@/utils/formatters';
import * as eventsApi from '@/api/events.api';
import { getErrorMessage } from '@/utils/apiError';

const EMOJI_OPTIONS = ['🎭', '🎷', '🎸', '🎤', '💻', '🎆', '🍷', '⛄', '🎬', '🖼'];
function getEventEmoji(name: string): string {
  const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return EMOJI_OPTIONS[hash % EMOJI_OPTIONS.length];
}
function getEventGradient(name: string): string {
  const gradients = [
    'linear-gradient(135deg,#1a0a2e,#2D1060)',
    'linear-gradient(135deg,#071626,#0C2545)',
    'linear-gradient(135deg,#050f1a,#071e38)',
    'linear-gradient(135deg,#1a0500,#2e0c00)',
    'linear-gradient(135deg,#0d0a1e,#1a0050)',
    'linear-gradient(135deg,#071a12,#0A2E1A)',
    'linear-gradient(135deg,#050d1a,#081830)',
    'linear-gradient(135deg,#0a0c10,#111827)',
    'linear-gradient(135deg,#0a0a0a,#1a1a2e)',
  ];
  const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return gradients[hash % gradients.length];
}
function ticketBarColor(pct: number): string {
  if (pct <= 0) return 'linear-gradient(90deg,#DC2626,#F87171)';
  if (pct < 30) return 'linear-gradient(90deg,#059669,#34D399)';
  if (pct < 80) return 'linear-gradient(90deg,#D97706,#FCD34D)';
  return 'linear-gradient(90deg,#DC2626,#F87171)';
}

export default function AdminEventsPage() {
  const { events, meta, loading, error, query, setQuery, refetch } = useEvents({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError('');
    try {
      const res = await eventsApi.deleteEvent(deleteTarget.id);
      if (res.success) {
        setDeleteTarget(null);
        refetch();
      } else {
        setDeleteError(res.message || 'Delete failed');
      }
    } catch (err) {
      setDeleteError(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'neutral' | 'completed'> = {
    published: 'success',
    draft: 'neutral',
    cancelled: 'danger',
    completed: 'completed',
  };

  const stats = useMemo(() => {
    const total = events.length;
    const published = events.filter((e: { status: string }) => e.status === 'published').length;
    const ticketsSold = events.reduce(
      (sum: number, e: { totalTickets: number; availableTickets: number }) => sum + (e.totalTickets - (e.availableTickets ?? 0)),
      0
    );
    const revenue = events.reduce(
      (sum: number, e: { totalTickets: number; availableTickets: number; price: number }) =>
        sum + (e.totalTickets - (e.availableTickets ?? 0)) * (e.price ?? 0),
      0
    );
    return { total, published, ticketsSold, revenue };
  }, [events]);

  return (
    <div className="flex-1 px-4 sm:px-8 lg:px-10 pt-11 pb-20 bg-bg">
      <div className="fade-up-0 flex items-end justify-between mb-9">
        <div>
          <div className="flex items-center gap-2 text-[0.72rem] font-medium tracking-[0.1em] uppercase text-purple-light mb-2">
            <span className="w-[18px] h-px bg-purple-light" />
            Admin Panel
          </div>
          <h1 className="text-[2rem] font-bold tracking-[-0.03em] text-[#F8F9FF]">Manage Events</h1>
        </div>
        <Link
          to="/admin/events/new"
          className="flex items-center gap-2 bg-purple text-[#F8F9FF] px-[22px] py-[11px] rounded-[10px] text-[0.88rem] font-semibold no-underline hover:bg-purple-light hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(124,58,237,.35)] transition-all"
        >
          <span className="text-[1rem]">＋</span> New Event
        </Link>
      </div>

      {!loading && !error && (
        <div className="fade-up-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[14px] mb-8">
          <StatCard variant="purple" icon="🎟" value={stats.total} label="Total Events" />
          <StatCard variant="green" icon="✅" value={stats.published} label="Published" />
          <StatCard variant="blue" icon="🎫" value={stats.ticketsSold.toLocaleString()} label="Tickets Sold" />
          <StatCard variant="amber" icon="💰" value={`$${Math.round(stats.revenue / 1000)}K`} label="Total Revenue" />
        </div>
      )}

      <div className="fade-up-2 bg-bg2 border border-[rgba(255,255,255,.07)] rounded-[14px] px-4 sm:px-6 lg:px-[22px] py-[18px] mb-5">
        <EventFilters query={query} onChange={setQuery} variant="admin" />
      </div>

      <div className="fade-up-3">
        {loading ? (
          <Spinner className="py-16" size="lg" />
        ) : error ? (
          <Alert className="text-center">{error}</Alert>
        ) : events.length === 0 ? (
          <p className="py-16 text-center text-[rgba(248,249,255,.45)]">No events found.</p>
        ) : (
          <>
            <div className="bg-bg2 border border-[rgba(255,255,255,.07)] rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-[18px] border-b border-[rgba(255,255,255,.07)]">
                <span className="text-[0.95rem] font-semibold text-[#F8F9FF]">All Events</span>
                <span className="text-[0.78rem] text-[rgba(248,249,255,.45)] bg-bg3 px-[10px] py-[3px] rounded-[6px] border border-[rgba(255,255,255,.07)]">
                  {events.length} event{events.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-[rgba(255,255,255,.07)]">
                      <th className="px-5 py-3 text-left text-[0.68rem] font-semibold tracking-[0.09em] uppercase text-[rgba(248,249,255,.2)]">Event</th>
                      <th className="px-5 py-3 text-left text-[0.68rem] font-semibold tracking-[0.09em] uppercase text-[rgba(248,249,255,.2)]">Date</th>
                      <th className="px-5 py-3 text-left text-[0.68rem] font-semibold tracking-[0.09em] uppercase text-[rgba(248,249,255,.2)]">Price</th>
                      <th className="px-5 py-3 text-left text-[0.68rem] font-semibold tracking-[0.09em] uppercase text-[rgba(248,249,255,.2)]">Tickets</th>
                      <th className="px-5 py-3 text-left text-[0.68rem] font-semibold tracking-[0.09em] uppercase text-[rgba(248,249,255,.2)]">Status</th>
                      <th className="px-5 py-3 text-right text-[0.68rem] font-semibold tracking-[0.09em] uppercase text-[rgba(248,249,255,.2)]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((ev: any) => {
                      const availablePct = ev.totalTickets > 0 ? Math.round((ev.availableTickets / ev.totalTickets) * 100) : 0;
                      return (
                        <tr key={ev._id} className="border-b border-[rgba(255,255,255,.07)]">
                          <td className="px-5 py-4 align-middle">
                            <div className="flex items-center gap-[14px]">
                              <div
                                className="w-[38px] h-[38px] rounded-[10px] grid place-items-center text-[1.2rem] flex-shrink-0"
                                style={{ background: getEventGradient(ev.name) }}
                              >
                                {getEventEmoji(ev.name)}
                              </div>
                              <div>
                                <div className="text-[0.9rem] font-semibold mb-[3px] text-[#F8F9FF]">{ev.name}</div>
                                <div className="text-[0.75rem] text-[rgba(248,249,255,.45)]">{ev.venue}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 align-middle text-[0.83rem] text-[rgba(248,249,255,.45)] whitespace-nowrap">
                            {formatDate(ev.date)}
                          </td>
                          <td className="px-5 py-4 align-middle text-[0.9rem] font-semibold text-[#F8F9FF]">
                            {formatPrice(ev.price)}
                          </td>
                          <td className="px-5 py-4 align-middle">
                            <div className="text-[0.82rem] text-[rgba(248,249,255,.45)] mb-[5px]">
                              {ev.availableTickets} / {ev.totalTickets}
                            </div>
                            <div className="h-[3px] w-20 bg-[rgba(255,255,255,.07)] rounded-sm overflow-hidden">
                              <div
                                className="tickets-bar h-full rounded-sm"
                                style={{
                                  width: `${availablePct}%`,
                                  background: ticketBarColor(availablePct),
                                }}
                              />
                            </div>
                          </td>
                          <td className="px-5 py-4 align-middle">
                            <Badge variant={statusVariant[ev.status] ?? 'neutral'} icon={ev.status === 'published' ? <span className="s-pub-dot w-[5px] h-[5px] rounded-full bg-current inline-block" /> : undefined}>
                              {ev.status}
                            </Badge>
                          </td>
                          <td className="px-5 py-4 align-middle text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link
                                to={`/admin/events/${ev._id}/edit`}
                                className="px-[14px] py-1.5 rounded-[7px] text-[0.78rem] font-medium bg-[rgba(124,58,237,.12)] text-purple-light border border-[rgba(124,58,237,.2)] no-underline cursor-pointer hover:bg-[rgba(124,58,237,.22)] hover:border-[rgba(124,58,237,.4)] transition-all"
                              >
                                Edit
                              </Link>
                              <button
                                type="button"
                                onClick={() => setDeleteTarget({ id: ev._id, name: ev.name })}
                                className="px-[14px] py-1.5 rounded-[7px] text-[0.78rem] font-medium bg-[rgba(220,38,38,.08)] text-[#F87171] border border-[rgba(220,38,38,.18)] cursor-pointer hover:bg-[rgba(220,38,38,.16)] hover:border-[rgba(220,38,38,.35)] transition-all"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {meta && (
              <div className="mt-8">
                <Pagination meta={meta} onPageChange={(page) => setQuery((q) => ({ ...q, page }))} />
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete confirmation modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => { setDeleteTarget(null); setDeleteError(''); }}
        title="Delete Event"
      >
        <div className="space-y-4">
          {deleteError && (
            <Alert>{deleteError}</Alert>
          )}
          <p className="text-sm text-[rgba(248,249,255,.45)]">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-[#F8F9FF]">{deleteTarget?.name}</span>? This is a soft-delete
            and will fail if there are active bookings.
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => setDeleteTarget(null)}>
              Keep
            </Button>
            <Button variant="danger" fullWidth loading={deleting} onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

