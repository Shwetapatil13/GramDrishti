import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          black: 'var(--canvas-black)',
        },
        surface: {
          slate: 'var(--surface-slate)',
          elevated: 'var(--surface-elevated)',
          border: 'var(--surface-border)',
        },
        brand: {
          mint: 'var(--brand-mint)',
          console: 'var(--brand-console)',
          violet: 'var(--brand-violet)',
          blue: 'var(--brand-blue)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          inverted: 'var(--text-inverted)',
        },
        semantic: {
          success: 'var(--semantic-success)',
          warning: 'var(--semantic-warning)',
          danger: 'var(--semantic-danger)',
          info: 'var(--semantic-info)',
        },
        score: {
          excellent: 'var(--score-excellent)',
          good: 'var(--score-good)',
          medium: 'var(--score-medium)',
          poor: 'var(--score-poor)',
        }
      },
      fontFamily: {
        grotesk: ['Space Grotesk', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      borderRadius: {
        card: '20px',
        button: '24px',
        tag: '20px',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' }
        },
        'pulse-border': {
          '0%, 100%': { borderColor: 'var(--brand-console)' },
          '50%': { borderColor: 'var(--brand-mint)' },
        }
      }
    },
  },
  plugins: [],
} satisfies Config