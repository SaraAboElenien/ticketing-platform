/**
 * CancelModal — asks for an optional reason, then cancels a booking.
 */

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import * as bookingsApi from '@/api/bookings.api';
import { getErrorMessage } from '@/utils/apiError';

interface CancelModalProps {
  open: boolean;
  onClose: () => void;
  bookingId: string;
  eventName: string;
  /** Called after a successful cancellation so the parent can refetch */
  onSuccess?: () => void;
}

export default function CancelModal({
  open,
  onClose,
  bookingId,
  eventName,
  onSuccess,
}: CancelModalProps) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCancel = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await bookingsApi.cancelBooking(bookingId, { reason: reason || undefined });
      if (res.success) {
        toast.success('Booking cancelled');
        onSuccess?.();
        onClose();
      } else {
        setError(res.message || 'Cancellation failed');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Cancel Booking">
      <div className="space-y-4">
        {error && (
          <div className="rounded-[10px] bg-[rgba(220,38,38,.1)] border border-[rgba(220,38,38,.2)] p-3 text-sm text-[#F87171]" role="alert">
            {error}
          </div>
        )}

        <p className="text-sm text-[rgba(248,249,255,.45)]">
          Are you sure you want to cancel your booking for{' '}
          <span className="font-semibold text-[#F8F9FF]">{eventName}</span>? This action cannot be undone.
        </p>

        <div>
          <label className="block text-sm font-medium text-[rgba(248,249,255,.45)] mb-1">
            Reason <span className="text-[rgba(248,249,255,.2)]">(optional)</span>
          </label>
          <textarea
            className="block w-full rounded-[10px] border border-[rgba(255,255,255,.07)] bg-bg2 px-3 py-2 text-sm text-[#F8F9FF] placeholder-[rgba(248,249,255,.2)] focus:border-[rgba(124,58,237,.5)] focus:outline-none focus:shadow-[0_0_0_3px_rgba(124,58,237,.12)]"
            rows={3}
            placeholder="Why are you cancelling?"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={onClose}>
            Keep Booking
          </Button>
          <Button variant="danger" fullWidth loading={loading} onClick={handleCancel}>
            Cancel Booking
          </Button>
        </div>
      </div>
    </Modal>
  );
}

