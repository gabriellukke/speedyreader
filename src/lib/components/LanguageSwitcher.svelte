<script lang="ts">
  import { locale, setLocale, availableLocales } from '$lib/i18n';

  function handleChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    setLocale(target.value);
  }
</script>

<div class="inline-block">
  <select
    value={$locale}
    onchange={handleChange}
    class="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    {#each availableLocales as { code, name }}
      <option value={code}>{name}</option>
    {/each}
  </select>
</div>
