/**
 * EventFilters — search, status, and price filters for the events list.
 * TicketHub dark theme: bg-bg2 inputs, purple focus.
 */

import { useState } from 'react';
import type { EventQuery } from '@/types';

interface EventFiltersProps {
  query: Partial<EventQuery>;
  onChange: (q: Partial<EventQuery>) => void;
  /** When "admin", render inside a card (no sticky bar) and use bg-bg3 for inputs */
  variant?: 'default' | 'admin';
}

export default function EventFilters({ query, onChange, variant = 'default' }: EventFiltersProps) {
  const [search, setSearch] = useState(query.search ?? '');
  const [status, setStatus] = useState(query.status ?? '');
  const [minPrice, setMinPrice] = useState(query.minPrice?.toString() ?? '');
  const [maxPrice, setMaxPrice] = useState(query.maxPrice?.toString() ?? '');

  const isAdmin = variant === 'admin';
  const inputBg = isAdmin ? 'bg-bg3' : 'bg-bg2';
  const wrapperClass = isAdmin
    ? 'flex items-center gap-3 flex-wrap'
    : 'sticky top-16 z-50 flex items-center gap-3 flex-wrap px-4 sm:px-8 lg:px-[52px] py-5 border-b border-[rgba(255,255,255,.07)] bg-[rgba(14,20,32,.6)] backdrop-blur-[12px]';

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
    <div className={wrapperClass}>
      <div className="flex-1 min-w-[200px] relative">
        <span className="absolute left-[13px] top-1/2 -translate-y-1/2 text-[rgba(248,249,255,.2)] text-[0.85rem] pointer-events-none">🔍</span>
        <input
          type="text"
          placeholder="Search event name or description…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleApply()}
          className={`w-full pl-[36px] pr-[13px] py-[10px] ${inputBg} border border-[rgba(255,255,255,.07)] rounded-[9px] text-[#F8F9FF] font-outfit text-[0.85rem] outline-none placeholder-[rgba(248,249,255,.2)] focus:border-[rgba(124,58,237,.45)] focus:shadow-[0_0_0_3px_rgba(124,58,237,.1)] transition-all`}
        />
      </div>
      <div className="w-px h-[26px] bg-[rgba(255,255,255,.07)]" />
      <span className="text-[0.75rem] text-[rgba(248,249,255,.2)] whitespace-nowrap">Status</span>
      <select
        className={`f-select pr-8 pl-[13px] py-[9px] ${inputBg} border border-[rgba(255,255,255,.07)] rounded-[9px] text-[#F8F9FF] font-outfit text-[0.83rem] outline-none cursor-pointer focus:border-[rgba(124,58,237,.45)] transition-all`}
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option value="">All</option>
        <option value="published">Published</option>
        <option value="draft">Draft</option>
        <option value="cancelled">Cancelled</option>
        <option value="completed">Completed</option>
      </select>
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
        className={`w-[82px] px-[13px] py-[9px] ${inputBg} border border-[rgba(255,255,255,.07)] rounded-[9px] text-[#F8F9FF] font-outfit text-[0.83rem] outline-none placeholder-[rgba(248,249,255,.2)] focus:border-[rgba(124,58,237,.45)] transition-all`}
      />
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
        className={`w-[82px] px-[13px] py-[9px] ${inputBg} border border-[rgba(255,255,255,.07)] rounded-[9px] text-[#F8F9FF] font-outfit text-[0.83rem] outline-none placeholder-[rgba(248,249,255,.2)] focus:border-[rgba(124,58,237,.45)] transition-all`}
      />
      <button
        type="button"
        onClick={handleReset}
        className="px-4 py-[9px] bg-transparent text-[rgba(248,249,255,.45)] border border-[rgba(255,255,255,.07)] rounded-[9px] font-outfit text-[0.83rem] cursor-pointer hover:text-[#F8F9FF] hover:border-[rgba(255,255,255,.15)] transition-all"
      >
        Reset
      </button>
      <button
        type="button"
        onClick={handleApply}
        className="px-5 py-[9px] bg-purple text-[#F8F9FF] border-0 rounded-[9px] font-outfit text-[0.83rem] font-semibold cursor-pointer hover:bg-purple-light hover:-translate-y-px transition-all"
      >
        Apply
      </button>
    </div>
  );
}
