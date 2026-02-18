/**
 * AdminEventsPage — admin event management: list, create, edit, delete.
 * Reuses the same EventCard + filters as the public listing.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useEvents } from '@/hooks/useEvents';
import EventFilters from '@/components/events/EventFilters';
import Pagination from '@/components/ui/Pagination';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import { formatDate, formatPrice, ticketLabel } from '@/utils/formatters';
import * as eventsApi from '@/api/events.api';
import { getErrorMessage } from '@/utils/apiError';

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

  const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
    published: 'success',
    draft: 'neutral',
    cancelled: 'danger',
    completed: 'info' as any,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-neutral-900">Manage Events</h1>
        <Link to="/admin/events/new">
          <Button>+ New Event</Button>
        </Link>
      </div>

      {/* Filters */}
      <EventFilters query={query} onChange={setQuery} />

      {/* Table-style list */}
      <div className="mt-6">
        {loading ? (
          <Spinner className="py-16" size="lg" />
        ) : error ? (
          <div className="rounded-lg bg-danger-50 p-6 text-center text-sm text-danger-700">{error}</div>
        ) : events.length === 0 ? (
          <p className="py-16 text-center text-neutral-500">No events found.</p>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
              <table className="min-w-full text-sm">
                <thead className="bg-neutral-50 text-left text-xs font-medium uppercase text-neutral-500">
                  <tr>
                    <th className="px-4 py-3">Event</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Tickets</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {events.map((ev: any) => (
                    <tr key={ev._id} className="hover:bg-neutral-50">
                      <td className="px-4 py-3 font-medium text-neutral-900">
                        {ev.name}
                        <p className="text-xs text-neutral-400">{ev.venue}</p>
                      </td>
                      <td className="px-4 py-3 text-neutral-600 whitespace-nowrap">
                        {formatDate(ev.date)}
                      </td>
                      <td className="px-4 py-3 text-neutral-600">{formatPrice(ev.price)}</td>
                      <td className="px-4 py-3 text-neutral-600">
                        {ticketLabel(ev.availableTickets)} / {ev.totalTickets}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={statusVariant[ev.status] ?? 'neutral'}>
                          {ev.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <Link
                          to={`/admin/events/${ev._id}/edit`}
                          className="text-sm text-primary-600 hover:underline"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => setDeleteTarget({ id: ev._id, name: ev.name })}
                          className="text-sm text-danger-600 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {meta && (
              <div className="mt-6">
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
            <div className="rounded-lg bg-danger-50 p-3 text-sm text-danger-700" role="alert">
              {deleteError}
            </div>
          )}
          <p className="text-sm text-neutral-700">
            Are you sure you want to delete{' '}
            <span className="font-semibold">{deleteTarget?.name}</span>? This is a soft-delete
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

