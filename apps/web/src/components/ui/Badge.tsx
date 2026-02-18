/**
 * Badge — semantic status indicator.
 *
 * Uses the ticketing color system:
 *  success → green (available, confirmed)
 *  warning → amber (limited)
 *  danger  → red   (sold out, cancelled, error)
 *  info    → blue  (informational)
 *  neutral → gray  (disabled, draft)
 */

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  /** Optional icon to render before the label */
  icon?: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-success-100 text-success-700',
  warning: 'bg-warning-100 text-warning-700',
  danger: 'bg-danger-100 text-danger-700',
  info: 'bg-info-100 text-info-600',
  neutral: 'bg-neutral-100 text-neutral-600',
};

export default function Badge({
  variant = 'neutral',
  children,
  className = '',
  icon,
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full px-2.5 py-0.5
        text-xs font-medium
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {icon}
      {children}
    </span>
  );
}

