/**
 * Footer — minimal site footer. TicketHub dark theme.
 */

import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-[rgba(255,255,255,.07)] px-4 py-7 sm:px-8 lg:px-[52px] flex items-center justify-between flex-wrap gap-4">
      <Link to="/" className="flex items-center gap-2 text-[0.95rem] font-semibold text-[rgba(248,249,255,.45)] no-underline hover:text-[#F8F9FF] transition-colors">
        <span className="w-[30px] h-[30px] bg-purple rounded-[7px] grid place-items-center text-[0.9rem]">🎟</span>
        TicketHub
      </Link>
      <span className="text-[0.8rem] text-[rgba(248,249,255,.2)]">
        © {new Date().getFullYear()} TicketHub. All rights reserved.
      </span>
    </footer>
  );
}
