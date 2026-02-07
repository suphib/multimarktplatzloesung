import { create } from 'zustand';

export type Theme = 'schlicht' | 'dunkel' | 'modern';

const VALID_THEMES: Theme[] = ['schlicht', 'dunkel', 'modern'];

function applyThemeClass(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove('dark', 'modern');
  if (theme === 'dunkel') root.classList.add('dark');
  else if (theme === 'modern') root.classList.add('modern');
}

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  initTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'schlicht',
  setTheme: (theme: Theme) => {
    localStorage.setItem('theme', theme);
    applyThemeClass(theme);
    set({ theme });
  },
  initTheme: () => {
    const stored = localStorage.getItem('theme');
    if (stored && VALID_THEMES.includes(stored as Theme)) {
      const theme = stored as Theme;
      applyThemeClass(theme);
      set({ theme });
    } else {
      localStorage.setItem('theme', 'schlicht');
      applyThemeClass('schlicht');
      set({ theme: 'schlicht' });
    }
  },
}));
