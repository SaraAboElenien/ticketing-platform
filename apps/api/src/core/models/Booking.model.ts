/**
 * Booking Mongoose model
 * Includes idempotency key, soft delete, and status tracking
 *
 * NOTE: Indexes are defined carefully to avoid redundancy.
 * Schema-level unique:true already creates an index, so we don't duplicate those.
 */

import mongoose, { Schema, Document } from 'mongoose';
import { BookingStatus } from '@ticketing-platform/shared';

export interface IBooking extends Document {
  userId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  ticketNumber: string;
  bookingDate: Date;
  status: BookingStatus;
  idempotencyKey: string;
  expiresAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      // No standalone index — covered by compound indexes below
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      // No standalone index — covered by compound indexes below
    },
    ticketNumber: {
      type: String,
      required: true,
      unique: true, // Creates index automatically — no separate index needed
    },
    bookingDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: Object.values(BookingStatus),
      default: BookingStatus.PENDING,
    },
    idempotencyKey: {
      type: String,
      required: true,
      unique: true, // Creates index automatically — no separate index needed
    },
    expiresAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
    cancellationReason: {
      type: String,
      maxlength: 500,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for common query patterns (no redundant single-field indexes)
bookingSchema.index({ userId: 1, bookingDate: -1 });           // User's bookings list sorted by date
bookingSchema.index({ eventId: 1, status: 1 });                // Event's bookings by status
bookingSchema.index({ userId: 1, eventId: 1, status: 1 });     // Prevent duplicate active bookings
bookingSchema.index({ deletedAt: 1 }, { sparse: true });       // Soft delete filter

// Exclude deleted documents by default
bookingSchema.pre(/^find/, function (next) {
  if (!(this as any).getOptions().includeDeleted) {
    (this as any).where({ deletedAt: null });
  }
  next();
});

export const Booking = mongoose.model<IBooking>('Booking', bookingSchema);
