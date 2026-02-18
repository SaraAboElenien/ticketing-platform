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

  // The email is passed via router state from the register page
  const emailFromState = (location.state as any)?.email ?? '';

  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<VerifyForm>({
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
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900">Verify your email</h1>
          <p className="mt-1 text-sm text-neutral-500">
            We sent a 6-digit code to your inbox.
          </p>
        </div>

        {serverError && (
          <div className="rounded-lg bg-danger-50 p-3 text-sm text-danger-700" role="alert">
            {serverError}
          </div>
        )}
        {successMsg && (
          <div className="rounded-lg bg-success-50 p-3 text-sm text-success-700" role="status">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Verification Code"
            placeholder="123456"
            maxLength={6}
            error={errors.code?.message}
            {...register('code')}
          />
          <Button type="submit" fullWidth loading={loading}>
            Verify
          </Button>
        </form>

        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="text-primary-600 hover:underline disabled:opacity-50"
          >
            {resending ? 'Sending...' : 'Resend code'}
          </button>
          <Link to="/login" className="text-neutral-500 hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}

