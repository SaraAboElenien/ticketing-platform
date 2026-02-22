/**
 * Header — top navigation bar with logo, nav links, and auth state.
 * TicketHub dark theme: sticky nav, backdrop blur, purple accent.
 * Mobile: burger menu with slide-out drawer (Events, My Bookings, Admin, auth).
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';

export default function Header() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [menuOpen]);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate('/login');
  };

  const linkClass = (path: string) =>
    `text-[0.9rem] px-4 py-[7px] rounded-lg no-underline transition-all block ${
      location.pathname === path
        ? 'text-[#F8F9FF] bg-[rgba(255,255,255,.06)]'
        : 'text-[rgba(248,249,255,.45)] hover:text-[#F8F9FF] hover:bg-[rgba(255,255,255,.05)]'
    }`;

  const mobileLinkClass = (path: string) =>
    `text-[1rem] py-3 px-4 rounded-lg no-underline transition-all block w-full text-left border-b border-[rgba(255,255,255,.07)] last:border-0 ${
      location.pathname === path
        ? 'text-[#F8F9FF] bg-[rgba(255,255,255,.06)]'
        : 'text-[rgba(248,249,255,.45)] hover:text-[#F8F9FF] hover:bg-[rgba(255,255,255,.05)]'
    }`;

  return (
    <header className="nav-animate sticky top-0 z-[100] flex h-16 items-center justify-between px-4 sm:px-8 lg:px-[52px] bg-[rgba(8,12,20,.88)] backdrop-blur-[20px] border-b border-[rgba(255,255,255,.07)]">
      <Link to="/" className="flex items-center gap-[9px] text-[1.15rem] font-semibold text-[#F8F9FF] no-underline tracking-[-0.01em]">
        <span className="w-[30px] h-[30px] bg-purple rounded-[7px] grid place-items-center text-[0.9rem]">🎟</span>
        TicketHub
      </Link>

      <nav className="hidden items-center gap-1 md:flex">
        <Link to="/events" className={linkClass('/events')}>
          Events
        </Link>
        {isAuthenticated && (
          <Link to="/bookings" className={linkClass('/bookings')}>
            My Bookings
          </Link>
        )}
        {isAdmin && (
          <Link to="/admin/events" className={linkClass('/admin/events')}>
            Admin
          </Link>
        )}
      </nav>

      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <div className="hidden sm:flex items-center gap-2 text-[rgba(248,249,255,.45)] text-[0.9rem] px-[14px] py-[7px]">
                <div className="w-7 h-7 rounded-full bg-purple grid place-items-center text-[0.75rem] font-semibold text-white">
                  {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
                </div>
                {user?.name}
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-[rgba(248,249,255,.45)] no-underline text-[0.9rem] px-[18px] py-[7px] rounded-lg hover:text-[#F8F9FF] hover:bg-[rgba(255,255,255,.05)] transition-all">
                Log in
              </Link>
              <Link to="/register">
                <Button size="sm">Sign up</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile burger + slide-out menu */}
        <button
          type="button"
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-[#F8F9FF] hover:bg-[rgba(255,255,255,.08)] transition-colors"
          aria-label="Open menu"
          onClick={() => setMenuOpen(true)}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Overlay */}
      {menuOpen && (
        <div
          className="md:hidden fixed inset-0 z-[101] bg-black/50 backdrop-blur-sm"
          aria-hidden
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Slide-out drawer */}
      <div
        className={`md:hidden fixed top-0 right-0 z-[102] h-full w-[280px] max-w-[85vw] bg-bg2 border-l border-[rgba(255,255,255,.1)] shadow-xl transition-transform duration-200 ease-out ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-label="Navigation menu"
      >
        <div className="flex flex-col h-full pt-16">
          <div className="flex-1 overflow-auto py-2">
            <p className="px-4 py-2 text-[0.7rem] font-semibold tracking-wider text-[rgba(248,249,255,.35)] uppercase">
              Navigation
            </p>
            <Link to="/events" className={mobileLinkClass('/events')} onClick={() => setMenuOpen(false)}>
              Events
            </Link>
            {isAuthenticated && (
              <Link to="/bookings" className={mobileLinkClass('/bookings')} onClick={() => setMenuOpen(false)}>
                My Bookings
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin/events" className={mobileLinkClass('/admin/events')} onClick={() => setMenuOpen(false)}>
                Admin
              </Link>
            )}
          </div>
          <div className="p-4 border-t border-[rgba(255,255,255,.07)] space-y-2">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2 px-4 py-2 text-[rgba(248,249,255,.45)] text-[0.9rem]">
                  <div className="w-8 h-8 rounded-full bg-purple grid place-items-center text-[0.8rem] font-semibold text-white">
                    {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
                  </div>
                  {user?.name}
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full justify-center">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block py-3 px-4 rounded-lg text-center text-[0.9rem] text-[rgba(248,249,255,.45)] hover:text-[#F8F9FF] hover:bg-[rgba(255,255,255,.05)] transition-all"
                  onClick={() => setMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link to="/register" onClick={() => setMenuOpen(false)}>
                  <Button size="sm" className="w-full">Sign up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
        <button
          type="button"
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-lg text-[rgba(248,249,255,.45)] hover:bg-[rgba(255,255,255,.08)] hover:text-[#F8F9FF] transition-colors"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </header>
  );
}
