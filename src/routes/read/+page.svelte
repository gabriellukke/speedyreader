<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { readerStore } from '$lib/stores/readerStore';
  import RSVPReader from '$lib/components/RSVPReader.svelte';
  import { t } from '$lib/i18n';

  let currentText = $state('');
  let currentTitle = $state('');
  let isFullscreen = $state(false);
  let containerEl: HTMLElement;

  onMount(() => {
    const unsubscribe = readerStore.subscribe((state) => {
      currentText = state.currentText;
      currentTitle = state.currentTitle;

      if (!state.currentText) {
        goto('/');
      }
    });

    const handleFullscreenChange = () => {
      isFullscreen = !!document.fullscreenElement;
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      unsubscribe();
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  });

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await containerEl?.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };
</script>

<div
  bind:this={containerEl}
  class="min-h-screen flex flex-col {isFullscreen ? 'bg-black' : 'bg-white dark:bg-gray-950'} text-gray-900 dark:text-white"
>
  <!-- Header - Hidden in fullscreen -->
  {#if !isFullscreen}
    <header class="shrink-0 border-b border-gray-100 dark:border-gray-800">
      <div class="container mx-auto px-4 max-w-5xl">
        <div class="flex items-center justify-between h-14">
          <a
            href="/"
            class="flex items-center gap-2 px-3 py-1.5 -ml-3 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            {$t('reader.back')}
          </a>
          
          <h1 class="absolute left-1/2 -translate-x-1/2 text-sm md:text-base font-medium text-gray-700 dark:text-gray-300 truncate max-w-[200px] md:max-w-md">
            {currentTitle}
          </h1>
          
          <a
            href="/library"
            class="flex items-center gap-2 px-3 py-1.5 -mr-3 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <span class="text-sm font-medium hidden sm:inline">{$t('nav.library')}</span>
          </a>
        </div>
      </div>
    </header>
  {/if}

  <!-- Reader Content -->
  <main class="flex-1">
    {#if currentText}
      <RSVPReader 
        text={currentText} 
        initialWpm={300} 
        {isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />
    {/if}
  </main>
</div>
