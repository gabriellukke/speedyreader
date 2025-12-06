import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Theme = 'dark' | 'light' | 'sepia';

const STORAGE_KEY = 'speedyreader-theme';
const DEFAULT_THEME: Theme = 'dark';

function getInitialTheme(): Theme {
  if (!browser) return DEFAULT_THEME;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && isValidTheme(stored)) {
    return stored;
  }

  return DEFAULT_THEME;
}

function isValidTheme(value: string): value is Theme {
  return ['dark', 'light', 'sepia'].includes(value);
}

function applyTheme(theme: Theme) {
  if (!browser) return;

  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(STORAGE_KEY, theme);
}

function createThemeStore() {
  const { subscribe, set, update } = writable<Theme>(getInitialTheme());

  return {
    subscribe,
    set: (theme: Theme) => {
      applyTheme(theme);
      set(theme);
    },
    toggle: () => {
      update((current) => {
        const themes: Theme[] = ['dark', 'light', 'sepia'];
        const nextIndex = (themes.indexOf(current) + 1) % themes.length;
        const next = themes[nextIndex];
        applyTheme(next);
        return next;
      });
    },
    init: () => {
      const theme = getInitialTheme();
      applyTheme(theme);
      set(theme);
    }
  };
}

export const themeStore = createThemeStore();
