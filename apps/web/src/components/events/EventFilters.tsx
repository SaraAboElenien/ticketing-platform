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
    // Ensure price values are non-negative
    const minPriceNum = minPrice ? Math.max(0, Number(minPrice)) : undefined;
    const maxPriceNum = maxPrice ? Math.max(0, Number(maxPrice)) : undefined;
    
    onChange({
      ...query,
      search: search || undefined,
      status: (status as EventQuery['status']) || undefined,
      minPrice: minPriceNum !== undefined && minPriceNum > 0 ? minPriceNum : undefined,
      maxPrice: maxPriceNum !== undefined && maxPriceNum > 0 ? maxPriceNum : undefined,
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
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-end gap-4">
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
            min="0"
            step="0.01"
            placeholder="0"
            value={minPrice}
            onChange={(e) => {
              const value = e.target.value;
              // Prevent negative values
              if (value === '' || (!isNaN(Number(value)) && Number(value) >= 0)) {
                setMinPrice(value);
              }
            }}
          />
        </div>
        <div className="w-28">
          <Input
            label="Max Price"
            type="number"
            min="0"
            step="0.01"
            placeholder="∞"
            value={maxPrice}
            onChange={(e) => {
              const value = e.target.value;
              // Prevent negative values
              if (value === '' || (!isNaN(Number(value)) && Number(value) >= 0)) {
                setMaxPrice(value);
              }
            }}
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

