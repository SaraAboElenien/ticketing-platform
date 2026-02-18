/**
 * BookingModal — quantity selector + confirmation for booking tickets.
 *
 * Generates an idempotency key once when the modal opens.
 * If the user closes and re-opens, a new key is generated.
 */

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { generateIdempotencyKey } from '@/utils/idempotency';
import { formatPrice } from '@/utils/formatters';
import * as bookingsApi from '@/api/bookings.api';
import { getErrorMessage } from '@/utils/apiError';

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  event: {
    _id: string;
    name: string;
    price: number;
    availableTickets: number;
  };
  /** Called after a successful booking so the parent can refetch data */
  onSuccess?: () => void;
}

export default function BookingModal({ open, onClose, event, onSuccess }: BookingModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [idempotencyKey, setIdempotencyKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [bookingResult, setBookingResult] = useState<any>(null);

  // Generate a fresh idempotency key every time the modal opens
  useEffect(() => {
    if (open) {
      setIdempotencyKey(generateIdempotencyKey());
      setQuantity(1);
      setError('');
      setSuccess(false);
      setBookingResult(null);
    }
  }, [open]);

  const maxQty = Math.min(event.availableTickets, 10); // cap at 10 per booking

  const handleBook = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await bookingsApi.createBooking({
        eventId: event._id,
        quantity,
        idempotencyKey,
      });
      if (res.success) {
        setSuccess(true);
        setBookingResult(res.data);
        onSuccess?.();
      } else {
        setError(res.message || 'Booking failed');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={success ? 'Booking Confirmed!' : 'Book Tickets'}>
      {success ? (
        <div className="space-y-4 text-center">
          {/* Success state */}
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-100">
            <svg className="h-7 w-7 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-neutral-700">
            You&apos;ve booked <span className="font-semibold">{quantity}</span> ticket
            {quantity > 1 ? 's' : ''} for <span className="font-semibold">{event.name}</span>.
          </p>
          {bookingResult?.ticketNumber && (
            <p className="text-sm text-neutral-500">
              Ticket #: <span className="font-mono font-medium">{bookingResult.ticketNumber}</span>
            </p>
          )}
          <Button onClick={onClose} fullWidth>
            Done
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          {error && (
            <div className="rounded-lg bg-danger-50 p-3 text-sm text-danger-700" role="alert">
              {error}
            </div>
          )}

          <div>
            <p className="text-sm text-neutral-500 mb-1">Event</p>
            <p className="font-medium text-neutral-900">{event.name}</p>
          </div>

          {/* Quantity selector */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Quantity</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-300 text-neutral-600 hover:bg-neutral-50 disabled:opacity-40"
                disabled={quantity <= 1}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                −
              </button>
              <span className="w-8 text-center font-semibold text-neutral-900">{quantity}</span>
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-300 text-neutral-600 hover:bg-neutral-50 disabled:opacity-40"
                disabled={quantity >= maxQty}
                onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
              >
                +
              </button>
              <span className="text-sm text-neutral-400">
                ({event.availableTickets} available)
              </span>
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between rounded-lg bg-neutral-50 px-4 py-3">
            <span className="text-sm text-neutral-600">Total</span>
            <span className="text-lg font-bold text-primary-600">
              {formatPrice(event.price * quantity)}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={onClose}>
              Cancel
            </Button>
            <Button fullWidth loading={loading} onClick={handleBook}>
              Confirm Booking
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

