/**
 * Event Mongoose model
 * Includes soft delete, optimistic locking version, and availableTickets for atomic booking
 *
 * IMPORTANT: availableTickets is atomically decremented/incremented during booking operations
 * to prevent overbooking. It is the source-of-truth for ticket availability.
 */

import mongoose, { Schema, Document } from 'mongoose';
import { EventStatus } from '@ticketing-platform/shared';

export interface IEvent extends Document {
  name: string;
  date: Date;
  venue: string;
  totalTickets: number;
  availableTickets: number; // Atomically managed — prevents overbooking
  price: number;
  status: EventStatus;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    venue: {
      type: String,
      required: true,
      trim: true,
    },
    totalTickets: {
      type: Number,
      required: true,
      min: 1,
      max: 1000000,
    },
    // availableTickets is atomically managed via $inc during booking/cancellation
    availableTickets: {
      type: Number,
      required: true,
      min: 0,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(EventStatus),
      default: EventStatus.DRAFT,
      index: true,
    },
    version: {
      type: Number,
      default: 0,
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

// Indexes for performance
eventSchema.index({ date: 1, status: 1 });
eventSchema.index({ status: 1, date: 1 });
eventSchema.index({ createdAt: -1 });
eventSchema.index({ deletedAt: 1 }, { sparse: true });

// Text search index for name and venue
eventSchema.index({ name: 'text', venue: 'text' });

// Increment version on update (optimistic locking)
eventSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.version = (this.version || 0) + 1;
  }
  next();
});

// Exclude deleted documents by default
eventSchema.pre(/^find/, function (next) {
  if (!(this as any).getOptions().includeDeleted) {
    (this as any).where({ deletedAt: null });
  }
  next();
});

export const Event = mongoose.model<IEvent>('Event', eventSchema);
