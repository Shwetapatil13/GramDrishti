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
          black: '#131313',
        },
        surface: {
          slate: '#1a1a1a',
          elevated: '#222222',
          border: '#2d2d2d',
        },
        brand: {
          mint: '#3cffd0',
          console: '#309875',
          violet: '#5200ff',
          blue: '#3860be',
        },
        text: {
          primary: '#ffffff',
          secondary: '#949494',
          muted: '#e9e9e9',
          inverted: '#131313',
        },
        semantic: {
          success: '#3cffd0',
          warning: '#f59e0b',
          danger: '#ef4444',
          info: '#3860be',
        },
        score: {
          excellent: '#3cffd0',
          good: '#86efac',
          medium: '#f59e0b',
          poor: '#ef4444',
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
          '0%, 100%': { borderColor: '#309875' },
          '50%': { borderColor: '#3cffd0' },
        }
      }
    },
  },
  plugins: [],
} satisfies Config