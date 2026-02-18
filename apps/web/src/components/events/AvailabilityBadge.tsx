/**
 * AvailabilityBadge — shows ticket availability with semantic coloring.
 *
 * Thresholds (from the plan):
 *  - ratio > 0.30  → success  "Available"
 *  - 0.05 < ratio  → warning  "Limited"
 *  - 0 < ratio     → danger   "Almost Sold Out"
 *  - ratio === 0   → danger   "Sold Out"
 */

import Badge from '@/components/ui/Badge';

interface AvailabilityBadgeProps {
  availableTickets: number;
  totalTickets: number;
}

export default function AvailabilityBadge({
  availableTickets,
  totalTickets,
}: AvailabilityBadgeProps) {
  // Guard against division by zero
  const ratio = totalTickets > 0 ? availableTickets / totalTickets : 0;

  if (availableTickets === 0) {
    return <Badge variant="danger">Sold Out</Badge>;
  }
  if (ratio <= 0.05) {
    return <Badge variant="danger">Almost Sold Out</Badge>;
  }
  if (ratio <= 0.3) {
    return <Badge variant="warning">Limited</Badge>;
  }
  return <Badge variant="success">Available</Badge>;
}

