/**
 * User Mongoose model
 * Includes soft delete and password hashing
 */

import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';
import { UserRole } from '@ticketing-platform/shared';
import { config } from '../../config';

export interface IUser extends Document {
  email: string;
  password?: string; // Optional for Google OAuth users
  name: string;
  role: UserRole;
  provider: 'local' | 'google'; // Auth provider
  googleId?: string; // Google user ID for OAuth users
  isEmailVerified: boolean;
  verificationCode?: string;
  verificationCodeExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  failedLoginAttempts: number;
  lockedUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  isAccountLocked(): boolean;
  incrementFailedLoginAttempts(): Promise<void>;
  resetFailedLoginAttempts(): Promise<void>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true, // Creates unique index automatically
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function(this: IUser) {
        // Password required only for local auth users
        return this.provider === 'local';
      },
      select: false, // Don't return password by default
    },
    provider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allow multiple null values
      select: false,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
      select: false, // Don't return by default
    },
    verificationCodeExpires: {
      type: Date,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockedUntil: {
      type: Date,
      default: null,
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

// Indexes
// email: unique index is created automatically by the schema field definition above
// googleId: unique sparse index is created automatically by the schema field definition above
userSchema.index({ deletedAt: 1 }, { sparse: true }); // Sparse index for soft deletes

// Hash password before saving (only for local auth users)
userSchema.pre('save', async function (next) {
  // Skip password hashing for Google OAuth users or if password not modified
  if (this.provider === 'google' || !this.isModified('password') || !this.password) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(config.bcryptRounds);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare password
// Guards against Google OAuth users who have no stored password
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to check if account is locked
userSchema.methods.isAccountLocked = function (): boolean {
  return this.lockedUntil && this.lockedUntil > new Date();
};

// Method to increment failed login attempts
userSchema.methods.incrementFailedLoginAttempts = async function (): Promise<void> {
  this.failedLoginAttempts += 1;
  
  // Lock account after 5 failed attempts for 30 minutes
  if (this.failedLoginAttempts >= 5) {
    this.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
  }
  
  await this.save();
};

// Method to reset failed login attempts
userSchema.methods.resetFailedLoginAttempts = async function (): Promise<void> {
  this.failedLoginAttempts = 0;
  this.lockedUntil = undefined;
  await this.save();
};

// Exclude deleted documents by default
userSchema.pre(/^find/, function (next) {
  if (!(this as any).getOptions().includeDeleted) {
    (this as any).where({ deletedAt: null });
  }
  next();
});

export const User = mongoose.model<IUser>('User', userSchema);

