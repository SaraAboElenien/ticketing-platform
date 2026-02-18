/**
 * NotFoundPage — 404 catch-all.
 */

import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-7xl font-bold text-primary-600">404</h1>
      <p className="mt-4 text-xl font-semibold text-neutral-900">Page not found</p>
      <p className="mt-2 text-sm text-neutral-500">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link to="/" className="mt-6">
        <Button>Go Home</Button>
      </Link>
    </div>
  );
}

