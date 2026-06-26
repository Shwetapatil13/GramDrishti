import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'dark' | 'light';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

// Function to initialize theme before React renders to prevent flash
export const initializeTheme = () => {
  try {
    const stored = localStorage.getItem('gramdrishti-theme');
    if (stored) {
      const state = JSON.parse(stored).state;
      if (state && state.theme) {
        document.documentElement.setAttribute('data-theme', state.theme);
        return;
      }
    }
  } catch {
    // Ignore
  }
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
};

export const useTheme = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'dark', // Default, will be hydrated from localStorage
      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === 'dark' ? 'light' : 'dark';
          document.documentElement.setAttribute('data-theme', newTheme);
          return { theme: newTheme };
        }),
      setTheme: (theme: Theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        set({ theme });
      },
    }),
    {
      name: 'gramdrishti-theme',
      onRehydrateStorage: () => (state) => {
        if (state) {
          document.documentElement.setAttribute('data-theme', state.theme);
        }
      },
    }
  )
);