export const DESIGN_TOKENS = {
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
    },
  },
  spacing: {
    base: '8px',
    sectionGap: '24px',
    cardGap: '16px',
  },
  layout: {
    maxWidth: '1400px',
    sidebarWidth: '280px',
  },
} as const;
