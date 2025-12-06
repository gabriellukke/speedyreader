<script lang="ts">
  import { page } from '$app/stores';
  import LanguageSwitcher from './LanguageSwitcher.svelte';
  import { t } from '$lib/i18n';

  let currentPath = $derived($page.url.pathname);
</script>

<nav class="sticky top-0 z-50 bg-card border-b border-border">
  <div class="container mx-auto px-3 sm:px-4 max-w-4xl">
    <div class="flex items-center justify-between h-12 sm:h-14">
      <!-- Logo -->
      <a href="/" class="flex items-center gap-2 cursor-pointer shrink-0">
        <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
          <svg class="w-4 h-4 text-orange-300" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <span class="font-semibold text-foreground hidden sm:block">SpeedyReader</span>
      </a>

      <!-- Navigation -->
      <div class="flex items-center gap-1">
        <!-- Nav Links - Icons on mobile, text on desktop -->
        <a
          href="/"
          class="nav-link {currentPath === '/' ? 'nav-link-active' : ''}"
          aria-label={$t('nav.home')}
        >
          <svg class="w-5 h-5 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          <span class="hidden sm:inline">{$t('nav.home')}</span>
        </a>

        <a
          href="/library"
          class="nav-link {currentPath === '/library' ? 'nav-link-active' : ''}"
          aria-label={$t('nav.library')}
        >
          <svg class="w-5 h-5 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <span class="hidden sm:inline">{$t('nav.library')}</span>
        </a>

        <a
          href="/settings"
          class="nav-link {currentPath === '/settings' ? 'nav-link-active' : ''}"
          aria-label={$t('nav.settings')}
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </a>

        <div class="w-px h-5 bg-border mx-1 sm:mx-2"></div>

        <LanguageSwitcher />
      </div>
    </div>
  </div>
</nav>

<style>
  .nav-link {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 150ms;
    color: var(--muted-foreground);
    cursor: pointer;
  }

  .nav-link:hover {
    color: var(--foreground);
    background-color: var(--accent);
  }

  .nav-link-active {
    background-color: var(--accent);
    color: var(--accent-foreground);
  }

  @media (min-width: 640px) {
    .nav-link {
      padding: 0.375rem 0.75rem;
    }
  }
</style>
