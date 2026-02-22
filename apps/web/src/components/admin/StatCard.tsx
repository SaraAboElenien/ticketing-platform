/**
 * StatCard — admin dashboard stat card with top gradient bar.
 * Variants: sc-purple, sc-green, sc-blue, sc-amber.
 */

type StatVariant = 'purple' | 'green' | 'blue' | 'amber';

interface StatCardProps {
  variant?: StatVariant;
  icon: string;
  value: string | number;
  label: string;
  badge?: string;
  className?: string;
}

const variantClass: Record<StatVariant, string> = {
  purple: 'sc-purple',
  green: 'sc-green',
  blue: 'sc-blue',
  amber: 'sc-amber',
};

export default function StatCard({
  variant = 'purple',
  icon,
  value,
  label,
  badge,
  className = '',
}: StatCardProps) {
  return (
    <div
      className={`stat-card ${variantClass[variant]} relative bg-bg2 border border-[rgba(255,255,255,.07)] rounded-[14px] px-[22px] py-5 overflow-hidden hover:border-[rgba(124,58,237,.3)] hover:-translate-y-0.5 transition-all ${className}`}
    >
      <div className="text-[1.4rem] mb-3">{icon}</div>
      <div className="text-[1.8rem] font-bold tracking-[-0.03em] mb-1">
        {value}
      </div>
      <div className="text-[0.78rem] text-[rgba(248,249,255,.45)]">{label}</div>
      {badge && (
        <span className="absolute top-[18px] right-[18px] text-[0.72rem] font-semibold px-2 py-[3px] rounded-[6px] bg-[rgba(5,150,105,.12)] text-[#6EE7B7] border border-[rgba(5,150,105,.2)]">
          {badge}
        </span>
      )}
    </div>
  );
}
