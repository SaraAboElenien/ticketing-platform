/**
 * App — root router configuration.
 *
 * Every page is lazy-loaded so only the visited route's bundle is fetched.
 * <Suspense> wraps the <Routes> block with a shared loading spinner.
 */

import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Spinner from '@/components/ui/Spinner';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AdminRoute from '@/components/auth/AdminRoute';

// ── Lazy-loaded pages ───────────────────────────────────────────────────
const HomePage = React.lazy(() => import('@/pages/HomePage'));
const EventsPage = React.lazy(() => import('@/pages/EventsPage'));
const EventDetailPage = React.lazy(() => import('@/pages/EventDetailPage'));
const BookingsPage = React.lazy(() => import('@/pages/BookingsPage'));
const NotFoundPage = React.lazy(() => import('@/pages/NotFoundPage'));

// Auth pages
const LoginPage = React.lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = React.lazy(() => import('@/pages/auth/RegisterPage'));
const VerifyEmailPage = React.lazy(() => import('@/pages/auth/VerifyEmailPage'));
const ForgotPasswordPage = React.lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = React.lazy(() => import('@/pages/auth/ResetPasswordPage'));
const GoogleCallbackPage = React.lazy(() => import('@/pages/auth/GoogleCallbackPage'));

// Admin pages
const AdminEventsPage = React.lazy(() => import('@/pages/admin/AdminEventsPage'));
const AdminEventFormPage = React.lazy(() => import('@/pages/admin/AdminEventFormPage'));

// ── Suspense fallback ───────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* All routes wrapped in the shared Layout (Header + Footer) */}
        <Route element={<Layout />}>
          {/* ── Public routes ──────────────────────────────────── */}
          <Route path="/" element={<HomePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />

          {/* ── Auth routes (unauthenticated) ─────────────────── */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/auth/callback/google" element={<GoogleCallbackPage />} />

          {/* ── Protected routes (requires login) ─────────────── */}
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <BookingsPage />
              </ProtectedRoute>
            }
          />

          {/* ── Admin routes (requires login + admin role) ────── */}
          <Route
            path="/admin/events"
            element={
              <AdminRoute>
                <AdminEventsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/events/new"
            element={
              <AdminRoute>
                <AdminEventFormPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/events/:id/edit"
            element={
              <AdminRoute>
                <AdminEventFormPage />
              </AdminRoute>
            }
          />

          {/* ── 404 catch-all ─────────────────────────────────── */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

