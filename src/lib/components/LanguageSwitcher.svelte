<script lang="ts">
  import { locale, setLocale, availableLocales } from '$lib/i18n';

  function handleChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    setLocale(target.value);
  }

  // Get short code for mobile display
  function getShortCode(code: string): string {
    return code.toUpperCase().slice(0, 2);
  }
</script>

<div class="lang-switcher">
  <!-- Globe icon for mobile -->
  <div class="icon-wrapper sm:hidden">
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
      />
    </svg>
  </div>

  <select
    value={$locale}
    onchange={handleChange}
    class="switcher-select"
    aria-label="Select language"
  >
    {#each availableLocales as { code, name }}
      <option value={code}>{name}</option>
    {/each}
  </select>
</div>

<style>
  .lang-switcher {
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
