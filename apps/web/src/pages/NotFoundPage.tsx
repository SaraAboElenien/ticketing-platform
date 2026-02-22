/**
 * NotFoundPage — 404 catch-all. TicketHub dark theme.
 */

import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center bg-bg">
      <h1 className="text-7xl font-bold gradient-text">404</h1>
      <p className="mt-4 text-xl font-semibold text-[#F8F9FF]">Page not found</p>
      <p className="mt-2 text-sm text-[rgba(248,249,255,.45)]">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link to="/" className="mt-6">
        <Button size="lg">Go Home</Button>
      </Link>
    </div>
  );
}
