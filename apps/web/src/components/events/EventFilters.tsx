/**
 * EventFilters — search, date, price, and status filters for the events list.
 */

import { useState } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import type { EventQuery } from '@/types';

interface EventFiltersProps {
  query: Partial<EventQuery>;
  onChange: (q: Partial<EventQuery>) => void;
}

export default function EventFilters({ query, onChange }: EventFiltersProps) {
  const [search, setSearch] = useState(query.search ?? '');
  const [status, setStatus] = useState(query.status ?? '');
  const [minPrice, setMinPrice] = useState(query.minPrice?.toString() ?? '');
  const [maxPrice, setMaxPrice] = useState(query.maxPrice?.toString() ?? '');

  const handleApply = () => {
    onChange({
      ...query,
      search: search || undefined,
      status: (status as EventQuery['status']) || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      page: 1, // Reset to first page on filter change
    });
  };

  const handleReset = () => {
    setSearch('');
    setStatus('');
    setMinPrice('');
    setMaxPrice('');
    onChange({ page: 1, limit: query.limit });
  };

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex flex-wrap items-end gap-3">
        {/* Search */}
        <div className="min-w-[200px] flex-1">
          <Input
            label="Search"
            placeholder="Event name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
          />
        </div>

        {/* Status */}
        <div className="w-40">
          <label className="block text-sm font-medium text-neutral-700 mb-1">Status</label>
          <select
            className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Price range */}
        <div className="w-28">
          <Input
            label="Min Price"
            type="number"
            placeholder="0"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
        </div>
        <div className="w-28">
          <Input
            label="Max Price"
            type="number"
            placeholder="∞"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>

        {/* Action buttons */}
        <Button size="sm" onClick={handleApply}>
          Apply
        </Button>
        <Button variant="ghost" size="sm" onClick={handleReset}>
          Reset
        </Button>
      </div>
    </div>
  );
}

