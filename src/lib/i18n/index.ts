import { addMessages, init, locale as i18nLocale, t as i18nT } from 'svelte-i18n';

import en from './locales/en.json';
import pt from './locales/pt.json';

const LOCALE_STORAGE_KEY = 'speedyreader-locale';

addMessages('en', en);
addMessages('pt', pt);

function getBrowserLocale(): string {
  if (typeof window === 'undefined') return 'en';
  const browserLocale = window.navigator.language.split('-')[0];
  return ['en', 'pt'].includes(browserLocale) ? browserLocale : 'en';
}

function getInitialLocale(): string {
  if (typeof window === 'undefined') return 'en';
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  return stored || getBrowserLocale();
}

init({
  fallbackLocale: 'en',
  initialLocale: getInitialLocale()
});

export function setLocale(newLocale: string) {
  i18nLocale.set(newLocale);
  localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
}

export const locale = i18nLocale;
export const t = i18nT;

export const availableLocales = [
  { code: 'en', name: 'English' },
  { code: 'pt', name: 'Português' }
];
