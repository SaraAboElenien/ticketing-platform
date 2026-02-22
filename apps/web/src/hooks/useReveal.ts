/**
 * useReveal — observes elements with [data-reveal] and adds .visible when they enter view.
 * Handles dynamically loaded content (e.g. event/booking cards that mount after fetch).
 */

import { useEffect } from 'react';

function observeRevealElements(io: IntersectionObserver) {
  document.querySelectorAll('[data-reveal]:not(.visible)').forEach((node) => {
    io.observe(node);
  });
}

export function useReveal(deps: unknown[] = []) {
  useEffect(() => {
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

    // Initial run
    observeRevealElements(io);

    // Watch for dynamically added [data-reveal] (e.g. after events/bookings fetch)
    const mo = new MutationObserver(() => observeRevealElements(io));
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, deps);
}
