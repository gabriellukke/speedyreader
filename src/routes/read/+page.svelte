<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { readerStore } from '$lib/stores/readerStore';
  import RSVPReader from '$lib/components/RSVPReader.svelte';
  import { t } from '$lib/i18n';

  let currentText = $state('');
  let currentTitle = $state('');

  onMount(() => {
    const unsubscribe = readerStore.subscribe((state) => {
      currentText = state.currentText;
      currentTitle = state.currentTitle;

      // Redirect if no text
      if (!state.currentText) {
        goto('/');
      }
    });

    return unsubscribe;
  });
</script>

<div class="min-h-screen bg-white dark:bg-gray-900">
  <div class="container mx-auto px-4 py-6 md:py-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6 md:mb-8">
      <a
        href="/"
        class="px-4 py-2 md:px-5 md:py-2.5 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium transition-colors text-sm md:text-base"
      >
        {$t('reader.back')}
      </a>
      <h2 class="text-lg md:text-xl font-semibold text-gray-900 dark:text-white truncate ml-4">
        {currentTitle}
      </h2>
      <div class="w-20 md:w-24"></div>
    </div>

    <!-- Reader -->
    {#if currentText}
      <RSVPReader text={currentText} initialWpm={300} />
    {/if}
  </div>
</div>
