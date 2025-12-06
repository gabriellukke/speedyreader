<script lang="ts">
  import { page } from '$app/stores';
  import LanguageSwitcher from './LanguageSwitcher.svelte';
  import { t } from '$lib/i18n';

  let currentPath = $derived($page.url.pathname);
</script>

<nav
  class="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800"
>
  <div class="container mx-auto px-4 max-w-4xl">
    <div class="flex items-center justify-between h-14">
      <a href="/" class="flex items-center gap-2 cursor-pointer">
        <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
          <svg class="w-4 h-4 text-orange-300" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <span class="font-semibold text-gray-900 dark:text-white hidden sm:block">
          SpeedyReader
        </span>
      </a>

      <div class="flex items-center gap-1">
        <a
          href="/"
          class="px-3 py-1.5 rounded-md text-sm font-medium transition-colors {currentPath === '/'
            ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}"
        >
          {$t('nav.home')}
        </a>
        <a
          href="/library"
          class="px-3 py-1.5 rounded-md text-sm font-medium transition-colors {currentPath ===
          '/library'
            ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}"
        >
          {$t('nav.library')}
        </a>

        <div class="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-2"></div>

        <LanguageSwitcher />
      </div>
    </div>
  </div>
</nav>
