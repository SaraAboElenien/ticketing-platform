/**
 * Decorative floating ticket cards for hero and signup right sections.
 * Matches the ticket illustration from tickethub (1).html and signup.html.
 */

import { useMemo } from 'react';

const TICKETS = [
  {
    id: 1,
    emoji: '🎭',
    badge: 'sold',
    badgeLabel: 'Sold Out',
    name: 'Comedy Show: Stand-Up Night',
    date: 'Feb 25, 2026 · 5:30 PM',
    venue: 'Comedy Cellar, NYC',
    num: '#TH-20482',
  },
  {
    id: 2,
    emoji: '🎷',
    badge: 'limited',
    badgeLabel: 'Limited',
    name: 'Jazz Night at Blue Note',
    date: 'Mar 5, 2026 · 5:30 PM',
    venue: 'Blue Note Jazz Club',
    num: '#TH-30917',
  },
  {
    id: 3,
    emoji: '🎸',
    badge: 'avail',
    badgeLabel: 'Available',
    name: 'Summer Music Festival 2026',
    date: 'Mar 20, 2026 · 5:30 PM',
    venue: 'Central Park, NYC',
    num: '#TH-11654',
  },
] as const;

function useBarcodeBars(seed: number) {
  return useMemo(() => {
    const bars: { width: number; height: number; opacity: number }[] = [];
    for (let i = 0; i < 22; i++) {
      bars.push({
        width: 1 + Math.floor((seed + i * 7) % 3),
        height: 12 + ((seed + i * 11) % 16),
        opacity: 0.2 + ((seed + i * 13) % 80) / 100,
      });
    }
    return bars;
  }, [seed]);
}

type Variant = 'hero' | 'signup';

export default function FloatingTicketCards({ variant }: { variant: Variant }) {
  const bars1 = useBarcodeBars(1);
  const bars2 = useBarcodeBars(2);
  const bars3 = useBarcodeBars(3);
  const barSets = [bars1, bars2, bars3];

  const stageClass = variant === 'hero' ? 'tickets-stage-hero' : 'tickets-stage-signup';
  const posClasses: Record<Variant, [string, string, string]> = {
    hero: ['tkt-hero-1', 'tkt-hero-2', 'tkt-hero-3'],
    signup: ['tkt-signup-1', 'tkt-signup-2', 'tkt-signup-3'],
  };

  return (
    <div className={stageClass}>
      {variant === 'hero' && <div className="tickets-glow" aria-hidden />}
      {TICKETS.map((t, i) => (
        <div
          key={t.id}
          className={`tkt tkt${t.id} ${posClasses[variant][i]}`}
          aria-hidden
        >
          <div className="tkt-top">
            <div className="tkt-top-glow" />
            <span className="tkt-top-emoji">{t.emoji}</span>
          </div>
          <div className="tkt-tear">
            <div className="tkt-notch" />
            <div className="tkt-notch" />
          </div>
          <div className="tkt-body">
            <span className={`tkt-badge ${t.badge}`}>{t.badgeLabel}</span>
            <div className="tkt-event">{t.name}</div>
            <div className="tkt-row">📅 {t.date}</div>
            <div className="tkt-row">📍 {t.venue}</div>
            <div className="tkt-barcode">
              <div className="tkt-barcode-lines">
                {barSets[i].map((b, j) => (
                  <span
                    key={j}
                    style={{
                      width: b.width,
                      height: b.height,
                      opacity: b.opacity,
                    }}
                  />
                ))}
              </div>
              <div className="tkt-num">{t.num}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
