import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';

export type Theme = 'system' | 'light' | 'dark' | 'sepia';
export type FontFamily = 'system' | 'serif' | 'mono';

export interface Settings {
  theme: Theme;
  fontFamily: FontFamily;
  fontSize: number;
  defaultWpm: number;
}

const STORAGE_KEY = 'speedyreader-settings';

const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  fontFamily: 'system',
  fontSize: 100,
  defaultWpm: 300
};

function getStoredSettings(): Settings {
  if (!browser) return DEFAULT_SETTINGS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch {
    // Invalid JSON, use defaults
  }
  return DEFAULT_SETTINGS;
}

function getSystemTheme(): 'light' | 'dark' {
  if (!browser) return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
  if (!browser) return;

  const resolved = theme === 'system' ? getSystemTheme() : theme;
  const root = document.documentElement;

  root.classList.remove('dark', 'light', 'sepia');

  if (resolved === 'dark') {
    root.classList.add('dark');
  } else if (resolved === 'sepia') {
    root.classList.add('sepia');
  }
}

function createSettingsStore() {
  const { subscribe, set, update } = writable<Settings>(DEFAULT_SETTINGS);

  return {
    subscribe,

    init() {
      if (!browser) return;

      const settings = getStoredSettings();
      set(settings);
      applyTheme(settings.theme);

      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        const current = get({ subscribe });
        if (current.theme === 'system') {
          applyTheme('system');
        }
      });
    },

    setTheme(theme: Theme) {
      update((s) => {
        const updated = { ...s, theme };
        this.save(updated);
        applyTheme(theme);
        return updated;
      });
    },

    setFontFamily(fontFamily: FontFamily) {
      update((s) => {
        const updated = { ...s, fontFamily };
        this.save(updated);
        return updated;
      });
    },

    setFontSize(fontSize: number) {
      update((s) => {
        const updated = { ...s, fontSize: Math.max(50, Math.min(200, fontSize)) };
        this.save(updated);
        return updated;
      });
    },

    setDefaultWpm(defaultWpm: number) {
      update((s) => {
        const updated = { ...s, defaultWpm: Math.max(100, Math.min(1000, defaultWpm)) };
        this.save(updated);
        return updated;
      });
    },

    save(settings: Settings) {
      if (!browser) return;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    },

    reset() {
      set(DEFAULT_SETTINGS);
      this.save(DEFAULT_SETTINGS);
      applyTheme(DEFAULT_SETTINGS.theme);
    }
  };
}

export const settingsStore = createSettingsStore();
