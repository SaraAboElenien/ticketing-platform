/**
 * Auth API service — wraps every auth endpoint.
 * Returns the raw ApiResponse so callers can inspect success/errors.
 */

import client from './client';
import type { ApiResponse, AuthResponse } from '@/types';

/** POST /auth/register */
export async function register(body: {
  email: string;
  password: string;
  name: string;
}): Promise<ApiResponse> {
  const { data } = await client.post<ApiResponse>('/auth/register', body);
  return data;
}

/** POST /auth/login */
export async function login(body: {
  email: string;
  password: string;
}): Promise<ApiResponse<AuthResponse>> {
  const { data } = await client.post<ApiResponse<AuthResponse>>('/auth/login', body);
  return data;
}

/** POST /auth/refresh — access token comes back in body, refresh token in httpOnly cookie */
export async function refreshToken(): Promise<ApiResponse<{ accessToken: string }>> {
  const { data } = await client.post<ApiResponse<{ accessToken: string }>>('/auth/refresh', {});
  return data;
}

/** POST /auth/logout */
export async function logout(): Promise<ApiResponse> {
  const { data } = await client.post<ApiResponse>('/auth/logout');
  return data;
}

/** GET /auth/me — returns the current user's profile */
export async function getMe(): Promise<ApiResponse> {
  const { data } = await client.get<ApiResponse>('/auth/me');
  return data;
}

/** POST /auth/verify-email */
export async function verifyEmail(body: {
  email: string;
  code: string;
}): Promise<ApiResponse<AuthResponse>> {
  const { data } = await client.post<ApiResponse<AuthResponse>>('/auth/verify-email', body);
  return data;
}

/** POST /auth/resend-verification */
export async function resendVerification(body: {
  email: string;
}): Promise<ApiResponse> {
  const { data } = await client.post<ApiResponse>('/auth/resend-verification', body);
  return data;
}

/** POST /auth/forgot-password */
export async function forgotPassword(body: {
  email: string;
}): Promise<ApiResponse> {
  const { data } = await client.post<ApiResponse>('/auth/forgot-password', body);
  return data;
}

/** POST /auth/reset-password */
export async function resetPassword(body: {
  token: string;
  password: string;
}): Promise<ApiResponse> {
  const { data } = await client.post<ApiResponse>('/auth/reset-password', body);
  return data;
}

/** POST /auth/google — exchange Google authorization code for tokens */
export async function googleAuth(body: {
  code: string;
}): Promise<ApiResponse<AuthResponse>> {
  const { data } = await client.post<ApiResponse<AuthResponse>>('/auth/google', body);
  return data;
}

