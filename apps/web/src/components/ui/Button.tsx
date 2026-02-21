/**
 * Button — primary UI action element.
 *
 * Variants:
 *  - primary   (filled brand color)
 *  - secondary (outlined)
 *  - danger    (filled red)
 *  - ghost     (text-only)
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
    'bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500 shadow-md hover:shadow-lg transition-all',
  secondary:
    'border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 focus-visible:ring-primary-500 transition-all',
  danger:
    'bg-danger-600 text-white hover:bg-danger-700 focus-visible:ring-danger-500 shadow-md hover:shadow-lg transition-all',
  ghost:
    'text-neutral-600 hover:bg-neutral-100 focus-visible:ring-primary-500 transition-all',
};

const sizeStyles: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
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
        inline-flex items-center justify-center gap-2 rounded-xl font-medium
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        disabled:cursor-not-allowed disabled:opacity-50
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

