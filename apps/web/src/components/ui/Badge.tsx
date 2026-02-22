/**
 * Badge — semantic status indicator.
 * TicketHub dark theme: template-aligned status styles (Sold Out red, Limited amber, Available green, Cancelled gray).
 */

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-[rgba(5,150,105,.12)] text-[#6EE7B7] border border-[rgba(5,150,105,.2)]',
  warning: 'bg-[rgba(217,119,6,.12)] text-[#FCD34D] border border-[rgba(217,119,6,.2)]',
  danger: 'bg-[rgba(220,38,38,.12)] text-[#F87171] border border-[rgba(220,38,38,.2)]',
  info: 'bg-[rgba(59,130,246,.12)] text-[#60A5FA] border border-[rgba(59,130,246,.2)]',
  neutral: 'bg-[rgba(100,116,139,.12)] text-[#94A3B8] border border-[rgba(100,116,139,.2)]',
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
        inline-flex items-center gap-1.5 rounded-[5px] px-2.5 py-[3px] text-[0.72rem] font-semibold tracking-[0.04em]
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {icon}
      {children}
    </span>
  );
}
