/**
 * useReveal — observes elements with [data-reveal] and adds .visible when they enter view.
 * Call once in Layout so scroll reveal works on EventCard, BookingCard, etc.
 */

import { useEffect } from 'react';

export function useReveal(deps: unknown[] = []) {
  useEffect(() => {
    const el = document.querySelectorAll('[data-reveal]');
    if (el.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -20px 0px' }
    );

    el.forEach((node) => io.observe(node));
    return () => io.disconnect();
  }, deps);
}
