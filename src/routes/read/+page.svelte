<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { readerStore } from '$lib/stores/readerStore';
  import { settingsStore } from '$lib/stores/settingsStore';
  import RSVPReader from '$lib/components/RSVPReader.svelte';
  import ReaderHeader from '$lib/components/read/ReaderHeader.svelte';
  import { isNativePlatform } from '$lib/utils/capacitorUtils';

  let currentText = $state('');
  let currentTitle = $state('');
  let isFullscreen = $state(false);
  let isLandscape = $state(false);
  let containerEl: HTMLElement;
  let settings = $state($settingsStore);

  $effect(() => {
    settings = $settingsStore;
  });

  const checkOrientation = () => {
    isLandscape = window.innerWidth > window.innerHeight;
  };

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

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      unsubscribe();
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  });

  let shouldHideHeader = $derived(isFullscreen || (isNativePlatform() && isLandscape));

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
  class="reader-page {isLandscape && isNativePlatform() ? 'reader-landscape' : ''}"
>
  {#if !shouldHideHeader}
    <ReaderHeader title={currentTitle} />
  {/if}

  <!-- Reader Content -->
  <main class="reader-main">
    {#if currentText}
      <RSVPReader
        text={currentText}
        initialWpm={settings.defaultWpm}
        isFullscreen={isFullscreen || (isNativePlatform() && isLandscape)}
        onToggleFullscreen={toggleFullscreen}
        autoHideControls={isNativePlatform() && isLandscape}
      />
    {/if}
  </main>
</div>

<style>
  .reader-page {
    min-height: 100vh;
    height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: var(--background);
    color: var(--foreground);
  }

  .reader-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: var(--background);
    min-height: 0;
    overflow: hidden;
  }

  /* Fullscreen specific styles */
  .reader-page:fullscreen,
  .reader-page:-webkit-full-screen {
    background-color: var(--background);
  }

  .reader-page:fullscreen .reader-main,
  .reader-page:-webkit-full-screen .reader-main {
    background-color: var(--background);
  }

  /* Landscape mode on mobile - remove side padding and use full width */
  @media (orientation: landscape) {
    .reader-landscape {
      padding-left: 0;
      padding-right: 0;
    }

    .reader-landscape .reader-main {
      padding-left: 0;
      padding-right: 0;
    }
  }
</style>
