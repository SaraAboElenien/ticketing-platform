/**
 * AdminEventFormPage — create or edit an event.
 *
 * When :id is present in the URL → edit mode (fetches existing event).
 * Otherwise → create mode.
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as eventsApi from '@/api/events.api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';
import { getErrorMessage } from '@/utils/apiError';
import { EventStatus } from '@/types';

// ── Validation schema ───────────────────────────────────────────────────
const eventSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  date: z.string().min(1, 'Date is required'), // ISO date string
  venue: z.string().min(1, 'Venue is required').max(200),
  totalTickets: z.coerce.number().int().min(1, 'Must be at least 1'),
  price: z.coerce.number().min(0, 'Price cannot be negative'),
  status: z.nativeEnum(EventStatus),
});
type EventForm = z.infer<typeof eventSchema>;

export default function AdminEventFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [loadingEvent, setLoadingEvent] = useState(isEditMode);
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EventForm>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: '',
      date: '',
      venue: '',
      totalTickets: 100,
      price: 0,
      status: EventStatus.DRAFT,
    },
  });

  // Fetch existing event data in edit mode
  useEffect(() => {
    if (!isEditMode) return;
    (async () => {
      try {
        const res = await eventsApi.getEvent(id!);
        if (res.success && res.data) {
          const ev = res.data as any;
          reset({
            name: ev.name,
            // Format date to datetime-local input value
            date: new Date(ev.date).toISOString().slice(0, 16),
            venue: ev.venue,
            totalTickets: ev.totalTickets,
            price: ev.price,
            status: ev.status,
          });
        } else {
          setServerError('Event not found');
        }
      } catch (err) {
        setServerError(getErrorMessage(err));
      } finally {
        setLoadingEvent(false);
      }
    })();
  }, [id, isEditMode, reset]);

  const onSubmit = async (values: Record<string, any>) => {
    setServerError('');
    setSubmitting(true);
    try {
      const payload = {
        ...values,
        date: new Date(values.date).toISOString(),
      };

      const res = isEditMode
        ? await eventsApi.updateEvent(id!, payload)
        : await eventsApi.createEvent(payload as any);

      if (res.success) {
        navigate('/admin/events');
      } else {
        setServerError(res.message || 'Operation failed');
      }
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingEvent) {
    return <div className="min-h-[60vh] flex items-center justify-center bg-bg"><Spinner size="lg" /></div>;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8 bg-bg">
      <Link
        to="/admin/events"
        className="mb-6 inline-flex items-center gap-1 text-sm text-[rgba(248,249,255,.45)] hover:text-purple-light"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to events
      </Link>

      <h1 className="text-2xl font-bold text-[#F8F9FF] mb-6">
        {isEditMode ? 'Edit Event' : 'Create New Event'}
      </h1>

      {serverError && (
        <div className="mb-4 rounded-[10px] bg-[rgba(220,38,38,.1)] border border-[rgba(220,38,38,.2)] p-3 text-sm text-[#F87171]" role="alert">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Event Name"
          placeholder="Summer Concert 2026"
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Date & Time"
          type="datetime-local"
          error={errors.date?.message}
          {...register('date')}
        />

        <Input
          label="Venue"
          placeholder="Central Park"
          error={errors.venue?.message}
          {...register('venue')}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Total Tickets"
            type="number"
            error={errors.totalTickets?.message}
            {...register('totalTickets')}
          />
          <Input
            label="Price ($)"
            type="number"
            step="0.01"
            error={errors.price?.message}
            {...register('price')}
          />
        </div>

        <div>
          <label className="block text-[0.82rem] font-medium text-[rgba(248,249,255,.45)] mb-[7px]">Status</label>
          <select
            className="block w-full rounded-[10px] border border-[rgba(255,255,255,.07)] bg-bg2 px-4 py-[13px] text-[#F8F9FF] text-[0.92rem] outline-none focus:border-[rgba(124,58,237,.5)] focus:shadow-[0_0_0_3px_rgba(124,58,237,.12)]"
            {...register('status')}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
          {errors.status && (
            <p className="mt-1 text-sm text-[#F87171]">{errors.status.message}</p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            variant="secondary"
            fullWidth
            type="button"
            onClick={() => navigate('/admin/events')}
          >
            Cancel
          </Button>
          <Button type="submit" fullWidth loading={submitting}>
            {isEditMode ? 'Save Changes' : 'Create Event'}
          </Button>
        </div>
      </form>
    </div>
  );
}

