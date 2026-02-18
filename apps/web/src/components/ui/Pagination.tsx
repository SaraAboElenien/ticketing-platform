/**
 * Pagination — simple previous / next page navigation with page info.
 */

import Button from './Button';
import type { PaginationMeta } from '@/types';

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

export default function Pagination({ meta, onPageChange }: PaginationProps) {
  const { page = 1, totalPages = 1, hasNext, hasPrev } = meta;

  if (totalPages <= 1) return null;

  return (
    <nav
      className="flex items-center justify-between border-t border-neutral-200 pt-4"
      aria-label="Pagination"
    >
      <p className="text-sm text-neutral-600">
        Page <span className="font-medium">{page}</span> of{' '}
        <span className="font-medium">{totalPages}</span>
      </p>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={!hasPrev}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={!hasNext}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </nav>
  );
}

