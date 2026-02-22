/**
 * AuthPageLayout — shared layout for login, register, verify-email, forgot-password, reset-password.
 * TicketHub dark theme: eyebrow, title, subtitle, form container, optional "or" divider + Google slot, footer link.
 */

import { Link } from 'react-router-dom';

interface AuthPageLayoutProps {
  /** Small caps label above title (e.g. "Get started free", "All Events") */
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  /** Slot for "or" divider + Google button (e.g. LoginPage, RegisterPage) */
  afterForm?: React.ReactNode;
  /** Footer text + link (e.g. "Already have an account? Log in") */
  footerText?: string;
  footerLinkTo?: string;
  footerLinkLabel?: string;
  /** Optional right column (e.g. decorative tickets for register) */
  rightColumn?: React.ReactNode;
  /** Optional left column (e.g. decorative tickets for login) */
  leftColumn?: React.ReactNode;
}

export default function AuthPageLayout({
  eyebrow,
  title,
  subtitle,
  children,
  afterForm,
  footerText,
  footerLinkTo,
  footerLinkLabel,
  rightColumn,
  leftColumn,
}: AuthPageLayoutProps) {
  const formContent = (
    <div className="fade-up-1 w-full max-w-[400px] relative z-[2]">
      {eyebrow && (
        <div className="flex items-center gap-2 text-[0.75rem] font-medium tracking-[0.1em] uppercase text-purple-light mb-5">
          <span className="w-5 h-px bg-purple-light" />
          {eyebrow}
        </div>
      )}
      <h1 className="text-[2rem] font-bold tracking-[-0.03em] mb-1.5 text-[#F8F9FF]">{title}</h1>
      {subtitle && (
        <p className="text-[0.9rem] text-[rgba(248,249,255,.45)] mb-9">{subtitle}</p>
      )}
      {children}
      {afterForm && <div className="mt-4">{afterForm}</div>}
      {footerText && footerLinkTo && footerLinkLabel && (
        <p className="text-center mt-6 text-[0.85rem] text-[rgba(248,249,255,.45)]">
          {footerText}{' '}
          <Link to={footerLinkTo} className="text-purple-light no-underline font-medium hover:underline">
            {footerLinkLabel}
          </Link>
        </p>
      )}
    </div>
  );

  if (leftColumn) {
    return (
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2" style={{ minHeight: 'calc(100vh - 64px)' }}>
        <div className="relative overflow-hidden hidden lg:flex items-center justify-center bg-bg min-h-[40vh] lg:min-h-0 order-2 lg:order-1">
          {leftColumn}
        </div>
        <div className="relative flex items-center justify-center px-6 py-12 lg:px-16 lg:py-[60px] border-l border-[rgba(255,255,255,.07)] form-side order-1 lg:order-2">
          {formContent}
        </div>
      </div>
    );
  }

  if (rightColumn) {
    return (
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2" style={{ minHeight: 'calc(100vh - 64px)' }}>
        <div className="relative flex items-center justify-center px-6 py-12 lg:px-16 lg:py-[60px] border-r border-[rgba(255,255,255,.07)] form-side">
          {formContent}
        </div>
        <div className="relative overflow-hidden flex items-center justify-center bg-bg min-h-[40vh] lg:min-h-0">
          {rightColumn}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      {formContent}
    </div>
  );
}

/** "Or" divider for use above Google button */
export function AuthOrDivider() {
  return (
    <div className="flex items-center gap-[14px] my-[22px] text-[rgba(248,249,255,.2)] text-[0.8rem]">
      <span className="flex-1 h-px bg-[rgba(255,255,255,.07)]" />
      or
      <span className="flex-1 h-px bg-[rgba(255,255,255,.07)]" />
    </div>
  );
}

/** Google button (shared markup, caller wires onClick) */
export function AuthGoogleButton({ onClick, children = 'Continue with Google' }: { onClick: () => void; children?: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full py-[13px] bg-bg2 border border-[rgba(255,255,255,.07)] rounded-[10px] text-[#F8F9FF] font-outfit text-[0.9rem] font-medium cursor-pointer flex items-center justify-center gap-2.5 hover:border-[rgba(255,255,255,.15)] hover:bg-bg3 hover:-translate-y-px transition-all"
    >
      <svg className="w-[18px] h-[18px]" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
        <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
        <path d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
      </svg>
      {children}
    </button>
  );
}
