/**
 * RegisterPage — user registration form.
 * After a successful sign-up the user is redirected to /verify-email.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as authApi from '@/api/auth.api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import AuthPageLayout, { AuthOrDivider, AuthGoogleButton } from '@/components/auth/AuthPageLayout';
import { getErrorMessage } from '@/utils/apiError';
import FloatingTicketCards from '@/components/ui/FloatingTicketCards';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[a-z]/, 'Must contain a lowercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
});
type RegisterForm = z.infer<typeof registerSchema>;

function RegisterDecorativeSide() {
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
        Join <strong className="text-purple-light font-medium">50,000+</strong> attendees already booking with TicketHub
      </p>
    </div>
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values: RegisterForm) => {
    setServerError('');
    setLoading(true);
    try {
      const res = await authApi.register(values);
      if (res.success) {
        navigate('/verify-email', { state: { email: values.email } });
      } else {
        setServerError(res.message || 'Registration failed');
      }
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setServerError('Google sign-up is not configured.');
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
      eyebrow="Get started free"
      title="Create an account"
      subtitle="Start booking events in minutes."
      footerText="Already have an account?"
      footerLinkTo="/login"
      footerLinkLabel="Log in"
      rightColumn={<RegisterDecorativeSide />}
      afterForm={
        <>
          <AuthOrDivider />
          <AuthGoogleButton onClick={handleGoogleRegister} />
        </>
      }
    >
      {serverError && (
        <div className="rounded-[10px] bg-[rgba(220,38,38,.1)] border border-[rgba(220,38,38,.2)] p-3 text-sm text-[#F87171] mb-4" role="alert">
          {serverError}
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Full Name" placeholder="Jane Doe" error={errors.name?.message} {...register('name')} />
        <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
        <Input label="Password" type="password" placeholder="Min. 8 characters" error={errors.password?.message} {...register('password')} />
        <p className="text-[0.75rem] text-[rgba(248,249,255,.2)] mt-1.5">
          Min 8 characters, 1 uppercase, 1 lowercase, 1 number.
        </p>
        <Button type="submit" fullWidth loading={loading} size="lg" className="mt-1.5">
          Sign up
        </Button>
      </form>
    </AuthPageLayout>
  );
}
