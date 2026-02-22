/**
 * LoginPage — email/password login + "Continue with Google" button.
 * On success, stores tokens and redirects to the previously intended page (or home).
 */

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import * as authApi from '@/api/auth.api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import AuthPageLayout, { AuthOrDivider, AuthGoogleButton } from '@/components/auth/AuthPageLayout';
import { getErrorMessage } from '@/utils/apiError';
import FloatingTicketCards from '@/components/ui/FloatingTicketCards';

function LoginDecorativeSide() {
  return (
    <div className="absolute inset-0 flex flex-col">
      <div className="ticket-side-grid grid-drift absolute inset-0" aria-hidden />
      <div
        className="glow-pulse absolute w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle,rgba(124,58,237,.16) 0%,transparent 70%)' }}
        aria-hidden
      />
      <div className="relative z-[2] flex-1 flex items-center justify-center min-h-0">
        <FloatingTicketCards variant="signup" />
      </div>
      <p className="relative z-10 text-[0.82rem] text-[rgba(248,249,255,.2)] tracking-[0.04em] text-center px-4 shrink-0 pb-12">
        Welcome back — your next event is a click away.
      </p>
    </div>
  );
}

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginForm) => {
    setServerError('');
    setLoading(true);
    try {
      const res = await authApi.login(values);
      if (res.success && res.data) {
        login(res.data.user as any, res.data.accessToken);
        navigate(from, { replace: true });
      } else {
        setServerError(res.message || 'Login failed');
      }
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setServerError('Google login is not configured.');
      return;
    }
    const redirectUri = `${window.location.origin}/auth/callback/google`;
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
    });
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  };

  return (
    <AuthPageLayout
      eyebrow="Welcome back"
      title="Log in to your account"
      subtitle="Enter your credentials to continue."
      footerText="Don't have an account?"
      footerLinkTo="/register"
      footerLinkLabel="Sign up"
      leftColumn={<LoginDecorativeSide />}
      afterForm={
        <>
          <AuthOrDivider />
          <AuthGoogleButton onClick={handleGoogleLogin} />
        </>
      }
    >
      {serverError && (
        <div className="rounded-[10px] bg-[rgba(220,38,38,.1)] border border-[rgba(220,38,38,.2)] p-3 text-sm text-[#F87171] mb-4" role="alert">
          {serverError}
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
        <Input label="Password" type="password" placeholder="••••••••" error={errors.password?.message} {...register('password')} />
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-[0.85rem] text-purple-light no-underline hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" fullWidth loading={loading} size="lg">
          Log in
        </Button>
      </form>
    </AuthPageLayout>
  );
}
