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
      className="flex items-center justify-between border-t border-[rgba(255,255,255,.07)] pt-4"
      aria-label="Pagination"
    >
      <p className="text-sm text-[rgba(248,249,255,.45)]">
        Page <span className="font-medium text-[#F8F9FF]">{page}</span> of{' '}
        <span className="font-medium text-[#F8F9FF]">{totalPages}</span>
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

