/**
 * Button — primary UI action element.
 * TicketHub dark theme: purple primary, muted secondary/ghost, danger for cancel.
 *
 * Variants:
 *  - primary   (filled purple)
 *  - secondary (outlined, muted border)
 *  - danger    (filled red / cancel)
 *  - ghost     (text-only, muted)
 */

import React from 'react';
import Spinner from './Spinner';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-purple text-[#F8F9FF] hover:bg-purple-light hover:-translate-y-px hover:shadow-[0_6px_18px_rgba(124,58,237,.3)] focus-visible:ring-purple/50 border-0 transition-all',
  secondary:
    'border border-[rgba(255,255,255,.07)] bg-transparent text-[rgba(248,249,255,.45)] hover:text-[#F8F9FF] hover:border-[rgba(255,255,255,.15)] hover:bg-[rgba(255,255,255,.04)] focus-visible:ring-[rgba(255,255,255,.2)] transition-all',
  danger:
    'border border-[rgba(220,38,38,.25)] bg-[rgba(220,38,38,.08)] text-[#F87171] hover:bg-[rgba(220,38,38,.16)] hover:border-[rgba(220,38,38,.45)] hover:-translate-y-px focus-visible:ring-danger-500/50 transition-all',
  ghost:
    'text-[rgba(248,249,255,.45)] hover:text-[#F8F9FF] hover:bg-[rgba(255,255,255,.05)] border border-[rgba(255,255,255,.07)] hover:border-[rgba(255,255,255,.15)] focus-visible:ring-[rgba(255,255,255,.2)] transition-all',
};

const sizeStyles: Record<Size, string> = {
  sm: 'px-4 py-2 text-[0.88rem] rounded-lg',
  md: 'px-5 py-2.5 text-[0.9rem] rounded-[10px]',
  lg: 'px-[30px] py-[13px] text-[0.95rem] rounded-[10px]',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  children,
  className = '',
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 font-medium
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg
        disabled:cursor-not-allowed disabled:opacity-50 disabled:transform-none
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={isDisabled}
      {...rest}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
}
