/**
 * ResetPasswordPage — reads the ?token= query param and lets the user
 * set a new password.
 */

import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as authApi from '@/api/auth.api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { getErrorMessage } from '@/utils/apiError';

const schema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/[a-z]/, 'Must contain a lowercase letter')
      .regex(/[0-9]/, 'Must contain a number'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
type ResetForm = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetForm>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: ResetForm) => {
    setServerError('');
    setLoading(true);
    try {
      const res = await authApi.resetPassword({ token, password: values.password });
      if (res.success) {
        navigate('/login', { state: { passwordReset: true } });
      } else {
        setServerError(res.message || 'Could not reset password');
      }
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // If there's no token in the URL, show an error
  if (!token) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <div className="text-center space-y-4">
          <h1 className="text-xl font-bold text-danger-700">Invalid Reset Link</h1>
          <p className="text-sm text-neutral-500">
            This link is missing a reset token. Please request a new one.
          </p>
          <Link to="/forgot-password" className="text-primary-600 hover:underline text-sm">
            Request new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900">Set new password</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Choose a strong password for your account.
          </p>
        </div>

        {serverError && (
          <div className="rounded-lg bg-danger-50 p-3 text-sm text-danger-700" role="alert">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <Button type="submit" fullWidth loading={loading}>
            Reset password
          </Button>
        </form>
      </div>
    </div>
  );
}

