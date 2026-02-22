/**
 * GoogleCallbackPage — handles the redirect from Google OAuth consent.
 * Flow: Google redirects with ?code=... → POST to /auth/google → store tokens + redirect home.
 */

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import * as authApi from '@/api/auth.api';
import Spinner from '@/components/ui/Spinner';
import { getErrorMessage } from '@/utils/apiError';

export default function GoogleCallbackPage() {
  const [params] = useSearchParams();
  const code = params.get('code');
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const exchanged = useRef(false);

  useEffect(() => {
    if (!code || exchanged.current) return;
    exchanged.current = true;

    (async () => {
      try {
        const res = await authApi.googleAuth({ code });
        if (res.success && res.data) {
          login(res.data.user as any, res.data.accessToken);
          navigate('/', { replace: true });
        } else {
          setError(res.message || 'Google authentication failed');
        }
      } catch (err) {
        setError(getErrorMessage(err));
      }
    })();
  }, [code, login, navigate]);

  if (error) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4 bg-bg">
        <div className="text-center space-y-4">
          <h1 className="text-xl font-bold text-[#F87171]">Authentication Failed</h1>
          <p className="text-sm text-[rgba(248,249,255,.45)]">{error}</p>
          <Link to="/login" className="text-purple-light hover:underline text-sm">
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-bg">
      <div className="text-center space-y-3">
        <Spinner size="lg" />
        <p className="text-sm text-[rgba(248,249,255,.45)]">Completing sign-in with Google...</p>
      </div>
    </div>
  );
}
