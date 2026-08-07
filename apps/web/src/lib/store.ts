'use client';

import { create } from 'zustand';
import type { ExperienceMode } from '@creator/shared';

interface AppState {
  mode: ExperienceMode;
  theme: 'dark' | 'light';
  setMode: (mode: ExperienceMode) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  mode: 'intermediate',
  theme: 'dark',
  setMode: (mode) => set({ mode }),
  setTheme: (theme) => {
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = theme;
    }
    set({ theme });
  },
  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },
}));
