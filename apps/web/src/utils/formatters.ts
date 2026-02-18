/**
 * Formatting helpers shared across the UI.
 * Keeps display logic out of components.
 */

/** Format a price in USD (e.g. "$75.00") */
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents);
}

/** Format an ISO date string into a readable form (e.g. "Jul 15, 2026 at 7:00 PM") */
export function formatDate(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** Format a short date (e.g. "Jul 15, 2026") */
export function formatShortDate(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Plural-aware ticket label (e.g. "1 ticket", "5 tickets") */
export function ticketLabel(count: number): string {
  return `${count} ticket${count === 1 ? '' : 's'}`;
}

