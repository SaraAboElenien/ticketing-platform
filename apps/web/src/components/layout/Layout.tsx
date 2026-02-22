/**
 * Layout — page wrapper that renders Header + content + Footer.
 * useReveal observes [data-reveal] elements and adds .visible on scroll.
 */

import { Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useReveal } from '@/hooks/useReveal';
import Header from './Header';
import Footer from './Footer';

export default function Layout() {
  const location = useLocation();
  useReveal([location.pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Toaster
        position="top-right"
        toastOptions={{
          className: '!bg-bg2 !text-[#F8F9FF] !border !border-[rgba(255,255,255,.1)]',
          success: { iconTheme: { primary: '#6EE7B7', secondary: '#0E1420' } },
          error: { iconTheme: { primary: '#F87171', secondary: '#0E1420' } },
        }}
      />
      <Header />
      {/* Main content area — flex-1 pushes footer to the bottom */}
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

