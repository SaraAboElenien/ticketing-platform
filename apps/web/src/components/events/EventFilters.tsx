/**
 * EventFilters — search, status, and price filters for the events list.
 * TicketHub dark theme: bg-bg2 inputs, purple focus.
 */

import { useState } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import type { EventQuery } from '@/types';

interface EventFiltersProps {
  query: Partial<EventQuery>;
  onChange: (q: Partial<EventQuery>) => void;
}

const filterSelectClass =
  'filter-select pr-8 pl-[14px] py-[10px] bg-bg2 border border-[rgba(255,255,255,.07)] rounded-[10px] text-[#F8F9FF] font-outfit text-[0.85rem] outline-none cursor-pointer focus:border-[rgba(124,58,237,.45)] transition-all w-full';

export default function EventFilters({ query, onChange }: EventFiltersProps) {
  const [search, setSearch] = useState(query.search ?? '');
  const [status, setStatus] = useState(query.status ?? '');
  const [minPrice, setMinPrice] = useState(query.minPrice?.toString() ?? '');
  const [maxPrice, setMaxPrice] = useState(query.maxPrice?.toString() ?? '');

  const handleApply = () => {
    const minPriceNum = minPrice ? Math.max(0, Number(minPrice)) : undefined;
    const maxPriceNum = maxPrice ? Math.max(0, Number(maxPrice)) : undefined;
    onChange({
      ...query,
      search: search || undefined,
      status: (status as EventQuery['status']) || undefined,
      minPrice: minPriceNum !== undefined && minPriceNum > 0 ? minPriceNum : undefined,
      maxPrice: maxPriceNum !== undefined && maxPriceNum > 0 ? maxPriceNum : undefined,
      page: 1,
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
    <div className="sticky top-16 z-50 flex items-center gap-3 flex-wrap px-4 sm:px-8 lg:px-[52px] py-5 border-b border-[rgba(255,255,255,.07)] bg-[rgba(14,20,32,.6)] backdrop-blur-[12px]">
      <div className="flex-1 min-w-[220px] relative">
        <span className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[rgba(248,249,255,.2)] text-[0.9rem] pointer-events-none">🔍</span>
        <input
          type="text"
          placeholder="Search event name or description…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleApply()}
          className="w-full pl-[38px] pr-[14px] py-[10px] bg-bg2 border border-[rgba(255,255,255,.07)] rounded-[10px] text-[#F8F9FF] font-outfit text-[0.88rem] outline-none placeholder-[rgba(248,249,255,.2)] focus:border-[rgba(124,58,237,.45)] focus:shadow-[0_0_0_3px_rgba(124,58,237,.1)] transition-all"
        />
      </div>
      <div className="w-px h-7 bg-[rgba(255,255,255,.07)]" />
      <div className="flex items-center gap-2">
        <span className="text-[0.75rem] text-[rgba(248,249,255,.2)] whitespace-nowrap">Status</span>
        <select
          className={filterSelectClass}
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
      <div className="flex items-center gap-2">
        <span className="text-[0.75rem] text-[rgba(248,249,255,.2)] whitespace-nowrap">Min $</span>
        <input
          type="number"
          min={0}
          step="0.01"
          placeholder="0"
          value={minPrice}
          onChange={(e) => {
            const v = e.target.value;
            if (v === '' || (!isNaN(Number(v)) && Number(v) >= 0)) setMinPrice(v);
          }}
          className="w-[90px] px-[14px] py-[10px] bg-bg2 border border-[rgba(255,255,255,.07)] rounded-[10px] text-[#F8F9FF] font-outfit text-[0.85rem] outline-none placeholder-[rgba(248,249,255,.2)] focus:border-[rgba(124,58,237,.45)] transition-all"
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[0.75rem] text-[rgba(248,249,255,.2)] whitespace-nowrap">Max $</span>
        <input
          type="number"
          min={0}
          step="0.01"
          placeholder="∞"
          value={maxPrice}
          onChange={(e) => {
            const v = e.target.value;
            if (v === '' || (!isNaN(Number(v)) && Number(v) >= 0)) setMaxPrice(v);
          }}
          className="w-[90px] px-[14px] py-[10px] bg-bg2 border border-[rgba(255,255,255,.07)] rounded-[10px] text-[#F8F9FF] font-outfit text-[0.85rem] outline-none placeholder-[rgba(248,249,255,.2)] focus:border-[rgba(124,58,237,.45)] transition-all"
        />
      </div>
      <Button variant="secondary" size="sm" onClick={handleReset}>
        Reset
      </Button>
      <Button size="sm" onClick={handleApply}>
        Apply
      </Button>
    </div>
  );
}
