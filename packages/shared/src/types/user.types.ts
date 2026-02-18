/**
 * User-related types and DTOs
 */

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export interface User {
  _id: string;
  email: string;
  name: string;
  role: UserRole;
  provider?: 'local' | 'google'; // Auth provider (defaults to 'local')
  isEmailVerified?: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

// NOTE: 'role' is excluded from public registration to prevent privilege escalation
export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

