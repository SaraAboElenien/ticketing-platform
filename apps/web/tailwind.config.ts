import type { Config } from 'tailwindcss';

/*
 * Modern, sophisticated color palette for the ticketing platform.
 *
 * Design Philosophy:
 *  - Deep purple/violet primary (sophisticated, premium feel)
 *  - Teal/cyan accent (fresh, energetic highlights)
 *  - Warm neutral grays (inviting, approachable)
 *  - 60-70% neutral tones (backgrounds, cards, body text)
 *  - Saturated colors reserved for CTAs and status indicators
 *  - WCAG AA contrast ratios (>=4.5:1 for text)
 *  - Semantic naming: success/warning/danger, not raw hex names
 */
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        /* ── TicketHub dark theme (from design templates) ──── */
        bg: '#080C14',
        bg2: '#0E1420',
        bg3: '#141B2D',
        purple: '#7C3AED',
        'purple-light': '#9B5CF6',

        /* ── Brand / Primary (Deep Purple/Violet) ─────────── */
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6', // default - vibrant purple
          600: '#7c3aed', // main brand color
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },

        /* ── Accent (Teal/Cyan) ─────────────────────────── */
        accent: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6', // default accent
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },

        /* ── Warm Neutrals (majority of UI) ───────────────── */
        neutral: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
          950: '#0c0a09',
        },

        /* ── Semantic statuses ───────────────────────────── */
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          400: '#4ade80',
          500: '#22c55e', // available, confirmed
          600: '#16a34a',
          700: '#15803d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          400: '#fbbf24',
          500: '#f59e0b', // limited availability
          600: '#d97706',
          700: '#b45309',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          400: '#f87171',
          500: '#ef4444', // sold out, errors
          600: '#dc2626',
          700: '#b91c1c',
        },
        info: {
          50: '#eff6ff',
          100: '#dbeafe',
          400: '#60a5fa',
          500: '#3b82f6', // informational
          600: '#2563eb',
        },
      },

      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        sans: ['Outfit', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        navIn: 'navIn 0.6s ease both',
        fadeUp: 'fadeUp 0.7s ease both',
        gridDrift: 'gridDrift 20s ease-in-out infinite alternate',
        glowPulse: 'glowPulse 6s ease-in-out infinite',
      },
      keyframes: {
        navIn: {
          from: { opacity: '0', transform: 'translateY(-10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        gridDrift: {
          from: { transform: 'translateY(0)' },
          to: { transform: 'translateY(-20px)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.8', transform: 'translate(-50%, -55%) scale(1)' },
          '50%': { opacity: '1', transform: 'translate(-50%, -55%) scale(1.08)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;

