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
import AuthPageLayout from '@/components/auth/AuthPageLayout';
import { getErrorMessage } from '@/utils/apiError';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
});
type ForgotForm = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [serverError, setServerError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotForm>({ resolver: zodResolver(schema) });

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
    <AuthPageLayout
      title="Reset password"
      subtitle="Enter your email and we'll send you a reset link."
      footerText="Back to"
      footerLinkTo="/login"
      footerLinkLabel="Log in"
    >
      {serverError && (
        <div className="rounded-[10px] bg-[rgba(220,38,38,.1)] border border-[rgba(220,38,38,.2)] p-3 text-sm text-[#F87171] mb-4" role="alert">
          {serverError}
        </div>
      )}
      {sent ? (
        <div className="space-y-4 text-center">
          <div className="rounded-[10px] bg-[rgba(5,150,105,.12)] border border-[rgba(5,150,105,.2)] p-4 text-sm text-[#6EE7B7]">
            If an account exists for that email, a reset link has been sent. Check your inbox.
          </div>
          <Link to="/login" className="text-sm text-purple-light hover:underline">
            Back to login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
          <Button type="submit" fullWidth loading={loading}>
            Send reset link
          </Button>
        </form>
      )}
    </AuthPageLayout>
  );
}
