/**
 * ForgotPasswordPage — sends a password-reset email.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as authApi from '@/api/auth.api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { getErrorMessage } from '@/utils/apiError';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
});
type ForgotForm = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [serverError, setServerError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotForm>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: ForgotForm) => {
    setServerError('');
    setLoading(true);
    try {
      const res = await authApi.forgotPassword(values);
      if (res.success) {
        setSent(true);
      } else {
        setServerError(res.message || 'Could not send reset email');
      }
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900">Reset password</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        {serverError && (
          <div className="rounded-lg bg-danger-50 p-3 text-sm text-danger-700" role="alert">
            {serverError}
          </div>
        )}

        {sent ? (
          <div className="space-y-4 text-center">
            <div className="rounded-lg bg-success-50 p-4 text-sm text-success-700">
              If an account exists for that email, a reset link has been sent. Check your inbox.
            </div>
            <Link to="/login" className="text-sm text-primary-600 hover:underline">
              Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <Button type="submit" fullWidth loading={loading}>
              Send reset link
            </Button>
            <p className="text-center text-sm text-neutral-500">
              <Link to="/login" className="text-primary-600 hover:underline">
                Back to login
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

