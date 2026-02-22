/**
 * BarcodeBar — presentational barcode-style decoration (e.g. for booking card).
 */

interface BarcodeBarProps {
  className?: string;
}

export default function BarcodeBar({ className = '' }: BarcodeBarProps) {
  const bars = Array.from({ length: 22 }, () => ({
    w: 1 + Math.floor(Math.random() * 2),
    h: 10 + Math.random() * 12,
    opacity: 0.15 + Math.random() * 0.35,
  }));

  return (
    <div className={`flex gap-0.5 items-end ${className}`}>
      {bars.map((bar, i) => (
        <span
          key={i}
          className="rounded-sm bg-[rgba(255,255,255,.25)]"
          style={{
            width: bar.w,
            height: bar.h,
            opacity: bar.opacity,
          }}
        />
      ))}
    </div>
  );
}
