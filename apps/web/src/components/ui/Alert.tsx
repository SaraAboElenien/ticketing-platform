/**
 * Alert — inline message box for success or error.
 * Replaces repeated error/success box markup across pages.
 */

type AlertVariant = 'error' | 'success';

interface AlertProps {
  variant?: AlertVariant;
  children: React.ReactNode;
  className?: string;
  role?: string;
}

const variantStyles: Record<AlertVariant, string> = {
  error:
    'bg-[rgba(220,38,38,.1)] border-[rgba(220,38,38,.2)] text-[#F87171]',
  success:
    'bg-[rgba(5,150,105,.1)] border-[rgba(5,150,105,.2)] text-[#6EE7B7]',
};

export default function Alert({
  variant = 'error',
  children,
  className = '',
  role = 'alert',
}: AlertProps) {
  return (
    <div
      className={`rounded-[10px] border p-4 text-sm ${variantStyles[variant]} ${className}`}
      role={role}
    >
      {children}
    </div>
  );
}
