/**
 * Centralized Axios instance.
 *
 * - baseURL comes from VITE_API_URL (env var) so nothing is hardcoded.
 * - withCredentials: true  sends the httpOnly refresh-token cookie automatically.
 * - Request interceptor: attaches the Bearer access token.
 * - Response interceptor: on 401 tries a single silent refresh then retries.
 */

import axios, { InternalAxiosRequestConfig, AxiosError } from 'axios';
import { API_PREFIX } from '@/types';

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, ''); // no trailing slash

if (!API_URL && import.meta.env.PROD) {
  console.error(
    '[TicketHub] VITE_API_URL is not set. Set it in your deployment (e.g. Vercel Environment Variables) to your API base URL (e.g. https://your-api.vercel.app).'
  );
}

const client = axios.create({
  baseURL: `${API_URL}${API_PREFIX}`,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach access token ────────────────────────────
client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('accessToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: silent refresh on 401 ─────────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
}

client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Only attempt refresh on 401 and if we haven't retried already
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Never try refresh when the failed request was an auth endpoint (login, register, etc.)
    // Otherwise a failed login (401) would trigger refresh → "Refresh token is required" instead of the real error
    const requestUrl = originalRequest.url ?? '';
    if (requestUrl.includes('/auth/')) {
      return Promise.reject(error);
    }

    // If a refresh is already in-flight, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(client(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Call refresh endpoint — the httpOnly cookie carries the refresh token
      const { data } = await axios.post(
        `${API_URL}${API_PREFIX}/auth/refresh`,
        {},
        { withCredentials: true }
      );

      const newToken: string = data?.data?.accessToken;
      if (!newToken) throw new Error('No access token in refresh response');

      localStorage.setItem('accessToken', newToken);
      processQueue(null, newToken);

      // Retry the original request with the new token
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return client(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      // Refresh failed — clear auth state and redirect to login
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default client;

