<script lang="ts">
  import { themeStore, type ThemePreference } from '$lib/stores/themeStore';

  let currentPreference = $state<ThemePreference>('system');
  let resolvedTheme = $state<'light' | 'dark'>('dark');

  themeStore.preference.subscribe((pref) => {
    currentPreference = pref;
  });

  themeStore.resolved.subscribe((theme) => {
    resolvedTheme = theme;
  });

  function handleChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    themeStore.setPreference(select.value as ThemePreference);
  }

  const labels: Record<ThemePreference, string> = {
    system: 'Auto',
    light: 'Light',
    dark: 'Dark'
  };
</script>

<div class="theme-switcher">
  <!-- Icon for mobile -->
  <div class="icon-wrapper sm:hidden">
    {#if resolvedTheme === 'dark'}
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      </svg>
    {:else}
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    {/if}
  </div>

  <select
    value={currentPreference}
    onchange={handleChange}
    class="switcher-select"
    aria-label="Select theme"
  >
    <option value="system">{labels.system}</option>
    <option value="light">{labels.light}</option>
    <option value="dark">{labels.dark}</option>
  </select>
</div>

<style>
  .theme-switcher {
    position: relative;
    display: flex;
    align-items: center;
  }

  .icon-wrapper {
    position: absolute;
    left: 0.5rem;
    pointer-events: none;
    color: var(--muted-foreground);
  }

  .switcher-select {
    appearance: none;
    padding: 0.5rem 1.5rem 0.5rem 2rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 150ms;
    background-color: transparent;
    border: 1px solid var(--border);
    color: var(--foreground);
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
    background-position: right 0.25rem center;
    background-repeat: no-repeat;
    background-size: 1.25em 1.25em;
  }

  .switcher-select:hover {
    background-color: var(--accent);
  }

  .switcher-select:focus {
    outline: none;
    ring: 1px solid var(--ring);
  }

  /* Mobile: hide text, show only icon */
  @media (max-width: 639px) {
    .switcher-select {
      width: 2.5rem;
      padding: 0.5rem;
      color: transparent;
      background-image: none;
    }
  }

  @media (min-width: 640px) {
    .icon-wrapper {
      display: none;
    }

    .switcher-select {
      padding: 0.375rem 1.5rem 0.375rem 0.5rem;
    }
  }
</style>
