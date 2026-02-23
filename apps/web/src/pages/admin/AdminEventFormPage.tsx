/**
 * AdminEventFormPage — create or edit an event.
 * Design: two-column (form + live preview), emoji picker, status radio cards, danger zone (edit).
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as eventsApi from '@/api/events.api';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import { getErrorMessage } from '@/utils/apiError';
import { EventStatus } from '@/types';
import { formatDate, formatPrice } from '@/utils/formatters';

const eventSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  date: z.string().min(1, 'Date is required'),
  venue: z.string().min(1, 'Venue is required').max(200),
  totalTickets: z.coerce.number().int().min(1, 'Must be at least 1'),
  price: z.coerce.number().min(0, 'Price cannot be negative'),
  status: z.nativeEnum(EventStatus),
});
type EventForm = z.infer<typeof eventSchema>;

const EMOJI_LIST = ['🎭', '🎸', '🎷', '🎤', '🎆', '💻', '🍷', '⛄', '🎬', '🏆', '🎨', '🎪', '🏋️', '🎙️', '🌟', '🎺'];
const EMOJI_COLORS: Record<string, [string, string, string]> = {
  '🎭': ['#1a0a2e', '#2D1060', '#7C3AED'],
  '🎸': ['#071a12', '#0A2E1A', '#059669'],
  '🎷': ['#071626', '#0C2545', '#2563EB'],
  '🎤': ['#1a0500', '#2e0c00', '#DC2626'],
  '🎆': ['#0d0a1e', '#1a0050', '#7C3AED'],
  '💻': ['#050f1a', '#071e38', '#2563EB'],
  '🍷': ['#1a0a00', '#2e1800', '#D97706'],
  '⛄': ['#050d1a', '#081830', '#0891B2'],
  '🎬': ['#0a0a0a', '#1a1a2e', '#0891B2'],
  '🏆': ['#1a1200', '#2e2000', '#D97706'],
  '🎨': ['#0a0014', '#1a003a', '#7C3AED'],
  '🎪': ['#1a0005', '#2e000f', '#DC2626'],
  '🏋️': ['#050a14', '#0a162a', '#2563EB'],
  '🎙️': ['#100a00', '#201400', '#D97706'],
  '🌟': ['#0d0a00', '#1a1400', '#D97706'],
  '🎺': ['#0a0500', '#1e0e00', '#D97706'],
};
const DEFAULT_GRADIENT: [string, string, string] = ['#050f1a', '#071e38', '#2563EB'];

function getEmojiGradient(emoji: string): [string, string, string] {
  return EMOJI_COLORS[emoji] ?? DEFAULT_GRADIENT;
}

export default function AdminEventFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [loadingEvent, setLoadingEvent] = useState(isEditMode);
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState('🎭');
  const [eventForPreview, setEventForPreview] = useState<{ totalTickets: number; availableTickets?: number } | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
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

  const watched = watch();

  useEffect(() => {
    if (!isEditMode) return;
    (async () => {
      try {
        const res = await eventsApi.getEvent(id!);
        if (res.success && res.data) {
          const ev = res.data as any;
          reset({
            name: ev.name,
            date: new Date(ev.date).toISOString().slice(0, 16),
            venue: ev.venue,
            totalTickets: ev.totalTickets,
            price: ev.price,
            status: ev.status,
          });
          setEventForPreview({ totalTickets: ev.totalTickets, availableTickets: ev.availableTickets });
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

  const onSubmit = async (values: EventForm) => {
    setServerError('');
    setSubmitting(true);
    try {
      const payload = { ...values, date: new Date(values.date).toISOString() };
      const res = isEditMode
        ? await eventsApi.updateEvent(id!, payload)
        : await eventsApi.createEvent(payload as any);
      if (res.success) navigate('/admin/events');
      else setServerError(res.message || 'Operation failed');
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    setDeleteError('');
    try {
      const res = await eventsApi.deleteEvent(id);
      if (res.success) {
        setDeleteModalOpen(false);
        navigate('/admin/events');
      } else setDeleteError(res.message || 'Delete failed');
    } catch (err) {
      setDeleteError(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const previewName = watched.name?.trim() || 'Event Name';
  const previewDate = watched.date ? new Date(watched.date) : null;
  const previewVenue = watched.venue?.trim() || '';
  const previewPrice = Number(watched.price) || 0;
  const previewTotal = Number(watched.totalTickets) || 0;
  const previewStatus = watched.status || 'draft';
  const [g1, g2, glow] = getEmojiGradient(selectedEmoji);
  const sold = eventForPreview ? (eventForPreview.totalTickets ?? 0) - (eventForPreview.availableTickets ?? 0) : 0;
  const soldPct = previewTotal > 0 ? Math.round((sold / previewTotal) * 100) : 0;

  const statusOptions = isEditMode
    ? [
        { value: EventStatus.DRAFT, label: 'Draft', emoji: '📝' },
        { value: EventStatus.PUBLISHED, label: 'Published', emoji: '✅' },
        { value: EventStatus.CANCELLED, label: 'Cancelled', emoji: '🚫' },
        { value: EventStatus.COMPLETED, label: 'Completed', emoji: '🏁' },
      ]
    : [
        { value: EventStatus.DRAFT, label: 'Draft', emoji: '📝' },
        { value: EventStatus.PUBLISHED, label: 'Published', emoji: '✅' },
        { value: EventStatus.CANCELLED, label: 'Cancelled', emoji: '🚫' },
      ];

  if (loadingEvent) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-bg">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_420px] bg-bg" style={{ minHeight: 'calc(100vh - 64px)' }}>
      <div className="form-side relative overflow-hidden px-4 sm:px-10 lg:px-14 pt-12 pb-20 border-r border-[rgba(255,255,255,.07)]">
        <Link
          to="/admin/events"
          className="back-link inline-flex items-center gap-[7px] text-[rgba(248,249,255,.45)] text-[0.85rem] no-underline mb-8 hover:text-[#F8F9FF] transition-colors"
        >
          <span className="back-arrow">←</span> Back to events
        </Link>

        <div className="fade-up-1 mb-9">
          <div className="flex items-center gap-2 text-[0.72rem] font-medium tracking-[0.1em] uppercase text-purple-light mb-2.5">
            <span className="w-[18px] h-px bg-purple-light" />
            Admin Panel
          </div>
          <h1 className="text-[2rem] font-bold tracking-[-0.03em] text-[#F8F9FF]">
            {isEditMode ? 'Edit Event' : 'Create New Event'}
          </h1>
          <p className="text-[0.88rem] text-[rgba(248,249,255,.45)] mt-1.5">
            {isEditMode ? "Changes update the live preview instantly — save when you're ready." : 'Fill in the details — your ticket preview updates live on the right.'}
          </p>
          {isEditMode && id && (
            <div className="inline-flex items-center gap-[7px] bg-bg2 border border-[rgba(255,255,255,.07)] rounded-lg px-[14px] py-[6px] mt-3 text-[0.75rem] text-[rgba(248,249,255,.2)] font-mono">
              Event ID: <span className="text-purple-light">#{id.slice(-6).toUpperCase()}</span> · {watched.name || '—'}
            </div>
          )}
        </div>

        <div className="fade-up-2 relative z-[1]">
          {serverError && <Alert className="mb-4">{serverError}</Alert>}
          {isEditMode && isDirty && (
            <div className="change-indicator visible mb-4">
              <span className="change-dot" />
              Unsaved changes — don&apos;t forget to save!
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-0">
            <div className="mb-6">
              <label className="block text-[0.8rem] font-medium text-[rgba(248,249,255,.45)] mb-2 tracking-[0.01em]">
                Event Icon <span className="text-[0.72rem] text-[rgba(248,249,255,.2)] font-normal ml-1.5">— pick an emoji</span>
              </label>
              <div className="grid grid-cols-8 gap-2 bg-bg2 border border-[rgba(255,255,255,.07)] rounded-[10px] p-[14px]">
                {EMOJI_LIST.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className={`emoji-btn ${selectedEmoji === emoji ? 'selected' : ''}`}
                    data-emoji={emoji}
                    onClick={() => setSelectedEmoji(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <Input label="Event Name" placeholder="Summer Concert 2026"  error={errors.name?.message} {...register('name')} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <Input label="Date & Time" type="datetime-local" error={errors.date?.message} {...register('date')} />
              <Input label="Venue" placeholder="Central Park"  error={errors.venue?.message} {...register('venue')} />
            </div>

            <div className="h-px bg-[rgba(255,255,255,.07)] my-7" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <Input label="Total Tickets" type="number" error={errors.totalTickets?.message} {...register('totalTickets')} />
              <Input label="Price ($)" type="number" step="0.01"  error={errors.price?.message} {...register('price')} />
            </div>

            <div className="h-px bg-[rgba(255,255,255,.07)] my-7" />

            <div className="mb-6">
              <label className="block text-[0.8rem] font-medium text-[rgba(248,249,255,.45)] mb-2 tracking-[0.01em]">Status</label>
              <div className={`grid gap-[10px] mb-6 ${isEditMode ? 'grid-cols-4' : 'grid-cols-3'}`}>
                {statusOptions.map((opt) => (
                  <div key={opt.value} className="status-opt relative">
                    <input
                      type="radio"
                      id={`status-${opt.value}`}
                      value={opt.value}
                      className="absolute opacity-0 pointer-events-none"
                      {...register('status')}
                    />
                    <label htmlFor={`status-${opt.value}`}>
                      <span className="text-[1.1rem]">{opt.emoji}</span> {opt.label}
                    </label>
                  </div>
                ))}
              </div>
              {errors.status && <p className="mt-1 text-[0.8rem] text-[#F87171]">{errors.status.message}</p>}
            </div>

            <div className="grid mt-10 gap-3" style={{ gridTemplateColumns: '1fr 1.6fr' }}>
              <button
                type="button"
                onClick={() => navigate('/admin/events')}
                className="py-[14px] rounded-[10px] border border-[rgba(255,255,255,.07)] bg-transparent text-[rgba(248,249,255,.45)] font-outfit text-[0.92rem] font-medium cursor-pointer hover:text-[#F8F9FF] hover:border-[rgba(255,255,255,.2)] hover:bg-[rgba(255,255,255,.04)] transition-all"
              >
                Cancel
              </button>
              <Button type="submit" fullWidth loading={submitting} className="py-[14px] rounded-[10px] font-semibold flex items-center justify-center gap-2">
                {isEditMode ? '💾 Save Changes' : '🎟 Create Event'}
              </Button>
            </div>

            {isEditMode && id && (
              <div className="bg-[rgba(220,38,38,.05)] border border-[rgba(220,38,38,.15)] rounded-xl px-5 py-[18px] mt-7">
                <div className="flex items-center gap-[7px] text-[0.8rem] font-semibold text-[#F87171] mb-2.5">⚠️ Danger Zone</div>
                <p className="text-[0.78rem] text-[rgba(248,249,255,.45)] mb-[14px] leading-[1.6]">
                  Deleting this event is permanent and cannot be undone. All associated bookings will be cancelled and attendees notified.
                </p>
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(true)}
                  className="px-5 py-[9px] rounded-[9px] bg-[rgba(220,38,38,.1)] text-[#F87171] border border-[rgba(220,38,38,.25)] font-outfit text-[0.82rem] font-medium cursor-pointer hover:bg-[rgba(220,38,38,.2)] hover:border-[rgba(220,38,38,.4)] hover:-translate-y-px transition-all"
                >
                  🗑 Delete This Event
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      <div className="bg-bg px-4 sm:px-8 lg:px-8 pt-12 pb-10 flex flex-col sticky top-16 overflow-y-auto border-l border-[rgba(255,255,255,.07)]" style={{ height: 'calc(100vh - 64px)' }}>
        <div className="fade-up-3 mb-6">
          <div className="text-[0.7rem] font-medium tracking-[0.1em] uppercase text-[rgba(248,249,255,.2)] mb-1.5">Live Preview</div>
          <div className="text-[1rem] font-semibold text-[#F8F9FF]">
            {isEditMode ? 'How attendees will see this event' : 'Your ticket will look like this'}
          </div>
        </div>

        <div className="fade-up-4 w-full bg-bg2 border border-[rgba(255,255,255,.1)] rounded-[18px] overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,.5)] hover:shadow-[0_32px_80px_rgba(0,0,0,.6),0_0_0_1px_rgba(124,58,237,.15)] transition-shadow group">
          <div
            className="tkt-header relative h-40 flex items-center justify-center overflow-hidden"
            style={{ background: `linear-gradient(135deg,${g1},${g2})` }}
          >
            <div className="absolute w-40 h-40 rounded-full opacity-40" style={{ background: glow, filter: 'blur(40px)' }} />
            <div className="relative z-[1] text-[3.5rem] transition-transform duration-300 group-hover:scale-[1.08] group-hover:-translate-y-1">
              {selectedEmoji}
            </div>
          </div>
          <div className="tkt-tear-preview relative flex items-center px-5 py-3">
            <div className="w-[18px] h-[18px] rounded-full bg-bg border border-[rgba(255,255,255,.08)] flex-shrink-0 relative z-[1]" />
            <div className="w-[18px] h-[18px] rounded-full bg-bg border border-[rgba(255,255,255,.08)] flex-shrink-0 relative z-[1] ml-auto" />
          </div>
          <div className="px-[22px] py-[18px]">
            <span
              className="inline-flex items-center gap-[5px] px-[10px] py-[3px] rounded-[6px] mb-2.5 text-[0.7rem] font-semibold tracking-[0.05em]"
              style={
                previewStatus === 'published'
                  ? { background: 'rgba(5,150,105,.12)', color: '#6EE7B7', border: '1px solid rgba(5,150,105,.2)' }
                  : previewStatus === 'draft'
                    ? { background: 'rgba(100,116,139,.12)', color: '#94A3B8', border: '1px solid rgba(100,116,139,.2)' }
                    : previewStatus === 'cancelled'
                      ? { background: 'rgba(220,38,38,.12)', color: '#F87171', border: '1px solid rgba(220,38,38,.2)' }
                      : { background: 'rgba(124,58,237,.12)', color: '#C084FC', border: '1px solid rgba(124,58,237,.2)' }
              }
            >
              {previewStatus === 'published' && '✅ '}
              {previewStatus === 'draft' && '📝 '}
              {previewStatus === 'cancelled' && '🚫 '}
              {previewStatus === 'completed' && '🏁 '}
              {previewStatus.charAt(0).toUpperCase() + previewStatus.slice(1)}
            </span>
            <div className="text-[1.1rem] font-bold tracking-[-0.02em] mb-3 leading-[1.3] min-h-[1.4em] text-[#F8F9FF]">{previewName}</div>
            <div className="flex flex-col gap-[7px] mb-[14px]">
              <div className="flex items-center gap-[9px] text-[0.8rem] text-[rgba(248,249,255,.45)]">
                📅 {previewDate ? formatDate(previewDate.toISOString()) : <span className="text-[rgba(248,249,255,.2)]">Date not set</span>}
              </div>
              <div className="flex items-center gap-[9px] text-[0.8rem] text-[rgba(248,249,255,.45)]">
                📍 {previewVenue || <span className="text-[rgba(248,249,255,.2)]">Venue not set</span>}
              </div>
            </div>
            <div className="pt-3 pb-0.5 border-t border-[rgba(255,255,255,.06)] flex items-center justify-between">
              <div className="flex gap-0.5 items-end h-[24px]">
                {Array.from({ length: 26 }, (_, i) => (
                  <span
                    key={i}
                    className="block rounded-sm bg-[rgba(255,255,255,.2)]"
                    style={{
                      width: 1 + (i % 2),
                      height: 8 + ((i * 11) % 18),
                      opacity: 0.2 + ((i * 7) % 35) / 100,
                    }}
                  />
                ))}
              </div>
              <div className="text-[0.65rem] text-[rgba(248,249,255,.2)] font-mono tracking-[0.04em]">#TH-{id ? id.slice(-5) : '00000'}</div>
            </div>
          </div>
          <div className="flex items-center justify-between px-[22px] py-[14px] border-t border-[rgba(255,255,255,.07)]">
            <div className="text-[1.25rem] font-bold tracking-[-0.02em] text-[#F8F9FF]">
              {formatPrice(previewPrice)} <span className="text-[0.72rem] text-[rgba(248,249,255,.45)] font-normal">/ ticket</span>
            </div>
            <div className="text-[0.76rem] text-[rgba(248,249,255,.45)]">{previewTotal.toLocaleString()} tickets</div>
          </div>
          {isEditMode && eventForPreview && (
            <div className="px-[22px] pb-[18px]">
              <div className="flex justify-between text-[0.72rem] text-[rgba(248,249,255,.45)] mb-1.5">
                <span>Tickets sold</span>
                <span>{sold.toLocaleString()} / {previewTotal.toLocaleString()} ({soldPct}%)</span>
              </div>
              <div className="h-1 bg-[rgba(255,255,255,.07)] rounded-sm overflow-hidden">
                <div
                  className="tickets-sold-fill h-full rounded-sm"
                  style={{ width: `${soldPct}%`, background: 'linear-gradient(90deg,#7C3AED,#9B5CF6)' }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="fade-up-5 flex flex-col gap-2 mt-4">
          <div className="flex items-center gap-2.5 bg-bg2 border border-[rgba(255,255,255,.07)] rounded-[10px] px-[14px] py-2.5 text-[0.75rem] text-[rgba(248,249,255,.45)]">
            <span className="flex-shrink-0 text-[0.9rem]">💡</span>
            Published events appear immediately on the events page.
          </div>
          <div className="flex items-center gap-2.5 bg-bg2 border border-[rgba(255,255,255,.07)] rounded-[10px] px-[14px] py-2.5 text-[0.75rem] text-[rgba(248,249,255,.45)]">
            <span className="flex-shrink-0 text-[0.9rem]">🔒</span>
            Cancelled events are hidden from new bookings.
          </div>
        </div>
      </div>

      <Modal open={deleteModalOpen} onClose={() => { setDeleteModalOpen(false); setDeleteError(''); }} title="Delete Event">
        <div className="space-y-4">
          {deleteError && <Alert>{deleteError}</Alert>}
          <p className="text-sm text-[rgba(248,249,255,.45)]">
            Are you sure you want to delete <span className="font-semibold text-[#F8F9FF]">{watched.name || 'this event'}</span>? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => setDeleteModalOpen(false)}>Keep</Button>
            <Button variant="danger" fullWidth loading={deleting} onClick={handleDelete}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
