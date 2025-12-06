import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';

export type ThemePreference = 'system' | 'light' | 'dark';
type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'speedyreader-theme';

function getSystemTheme(): ResolvedTheme {
  if (!browser) return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredPreference(): ThemePreference {
  if (!browser) return 'system';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }
  return 'system';
}

function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference === 'system') {
    return getSystemTheme();
  }
  return preference;
}

function applyTheme(theme: ResolvedTheme) {
  if (!browser) return;
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

function createThemeStore() {
  const preference = writable<ThemePreference>('system');
  const resolved = writable<ResolvedTheme>('dark');

  return {
    preference: { subscribe: preference.subscribe },
    resolved: { subscribe: resolved.subscribe },

    init() {
      if (!browser) return;

      const storedPref = getStoredPreference();
      preference.set(storedPref);

      const resolvedTheme = resolveTheme(storedPref);
      resolved.set(resolvedTheme);
      applyTheme(resolvedTheme);

      // Listen for system theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        const currentPref = get(preference);
        if (currentPref === 'system') {
          const newResolved = getSystemTheme();
          resolved.set(newResolved);
          applyTheme(newResolved);
        }
      };
      mediaQuery.addEventListener('change', handleChange);
    },

    setPreference(pref: ThemePreference) {
      if (!browser) return;
      preference.set(pref);
      localStorage.setItem(STORAGE_KEY, pref);

      const resolvedTheme = resolveTheme(pref);
      resolved.set(resolvedTheme);
      applyTheme(resolvedTheme);
    }
  };
}

export const themeStore = createThemeStore();
