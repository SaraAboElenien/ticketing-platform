/**
 * VerifyEmailPage — accepts the 6-digit verification code sent after signup.
 * On success, logs the user in and redirects home.
 */

import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import * as authApi from '@/api/auth.api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import AuthPageLayout from '@/components/auth/AuthPageLayout';
import { getErrorMessage } from '@/utils/apiError';

const verifySchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, 'Code must be 6 digits'),
});
type VerifyForm = z.infer<typeof verifySchema>;

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const emailFromState = (location.state as { email?: string })?.email ?? '';

  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<VerifyForm>({
    resolver: zodResolver(verifySchema),
    defaultValues: { email: emailFromState, code: '' },
  });

  const onSubmit = async (values: VerifyForm) => {
    setServerError('');
    setLoading(true);
    try {
      const res = await authApi.verifyEmail(values);
      if (res.success && res.data) {
        login(res.data.user as any, res.data.accessToken);
        navigate('/', { replace: true });
      } else {
        setServerError(res.message || 'Verification failed');
      }
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setServerError('');
    setSuccessMsg('');
    setResending(true);
    try {
      const email = getValues('email');
      if (!email) {
        setServerError('Enter your email first');
        return;
      }
      const res = await authApi.resendVerification({ email });
      if (res.success) {
        setSuccessMsg('A new code has been sent to your email.');
      } else {
        setServerError(res.message || 'Could not resend code');
      }
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthPageLayout
      title="Verify your email"
      subtitle="We sent a 6-digit code to your inbox."
      footerText="Back to"
      footerLinkTo="/login"
      footerLinkLabel="Log in"
    >
      {serverError && (
        <div className="rounded-[10px] bg-[rgba(220,38,38,.1)] border border-[rgba(220,38,38,.2)] p-3 text-sm text-[#F87171] mb-4" role="alert">
          {serverError}
        </div>
      )}
      {successMsg && (
        <div className="rounded-[10px] bg-[rgba(5,150,105,.12)] border border-[rgba(5,150,105,.2)] p-3 text-sm text-[#6EE7B7] mb-4" role="status">
          {successMsg}
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
        <Input label="Verification Code" placeholder="123456" maxLength={6} error={errors.code?.message} {...register('code')} />
        <Button type="submit" fullWidth loading={loading}>
          Verify
        </Button>
      </form>
      <div className="flex items-center justify-between text-sm mt-4">
        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="text-purple-light hover:underline disabled:opacity-50"
        >
          {resending ? 'Sending...' : 'Resend code'}
        </button>
        <Link to="/login" className="text-[rgba(248,249,255,.45)] hover:underline">
          Back to login
        </Link>
      </div>
    </AuthPageLayout>
  );
}
