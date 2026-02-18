/**
 * CancelModal — asks for an optional reason, then cancels a booking.
 */

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
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
          <div className="rounded-lg bg-danger-50 p-3 text-sm text-danger-700" role="alert">
            {error}
          </div>
        )}

        <p className="text-sm text-neutral-700">
          Are you sure you want to cancel your booking for{' '}
          <span className="font-semibold">{eventName}</span>? This action cannot be undone.
        </p>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Reason <span className="text-neutral-400">(optional)</span>
          </label>
          <textarea
            className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
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

