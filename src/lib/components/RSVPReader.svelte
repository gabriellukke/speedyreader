<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import SpeedControls from './SpeedControls.svelte';
  import { createReaderService } from '$lib/services/readerService';
  import type { ReaderState } from '$lib/services/readerService';

  interface Props {
    text: string;
    initialWpm?: number;
    isFullscreen?: boolean;
    onToggleFullscreen?: () => void;
  }

  let { text, initialWpm = 300, isFullscreen = false, onToggleFullscreen }: Props = $props();

  const reader = createReaderService();

  let currentWord = $state('');
  let currentIndex = $state(0);
  let totalWords = $state(0);
  let wpm = $state(initialWpm);
  let isPlaying = $state(false);
  let showControls = $state(true);
  let hideTimeout: ReturnType<typeof setTimeout> | null = null;

  let progress = $derived(totalWords > 0 ? ((currentIndex + 1) / totalWords) * 100 : 0);

  $effect(() => {
    if (text) {
      reader.initialize(text, {
        initialWpm,
        onStateChange: (state: ReaderState) => {
          currentWord = state.words[state.currentIndex] || '';
          currentIndex = state.currentIndex;
          totalWords = state.totalWords;
          wpm = state.wpm;
          isPlaying = state.isPlaying;
        }
      });
    }
  });

  $effect(() => {
    if (isPlaying) {
      startHideTimer();
    } else {
      showControls = true;
      clearHideTimer();
    }
  });

  const startHideTimer = () => {
    clearHideTimer();
    hideTimeout = setTimeout(() => {
      if (isPlaying) {
        showControls = false;
      }
    }, 2000);
  };

  const clearHideTimer = () => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }
  };

  const handleMouseMove = () => {
    if (isPlaying) {
      showControls = true;
      startHideTimer();
    }
  };

  const handleClick = () => {
    if (isPlaying && !showControls) {
      showControls = true;
      startHideTimer();
    }
  };

  const togglePlayPause = () => {
    reader.togglePlayPause();
  };

  const nextWord = () => {
    reader.nextWord();
  };

  const prevWord = () => {
    reader.previousWord();
  };

  const restart = () => {
    reader.restart();
  };

  const handleWpmChange = (newWpm: number) => {
    reader.setWpm(newWpm);
  };

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    switch (e.code) {
      case 'Space':
        e.preventDefault();
        togglePlayPause();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        prevWord();
        break;
      case 'ArrowRight':
        e.preventDefault();
        nextWord();
        break;
      case 'KeyR':
        e.preventDefault();
        restart();
        break;
      case 'KeyF':
        e.preventDefault();
        onToggleFullscreen?.();
        break;
    }
  };

  onMount(() => {
    window.addEventListener('keydown', handleKeydown);
    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  });

  onDestroy(() => {
    clearHideTimer();
    reader.destroy();
  });
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="relative w-full h-full min-h-[calc(100vh-4rem)] {isFullscreen ? 'bg-black min-h-screen' : ''}"
  onmousemove={handleMouseMove}
  onclick={handleClick}
>
  <!-- Progress Bar - Top -->
  <div class="absolute top-0 left-0 right-0 h-1 {isFullscreen ? 'bg-gray-900' : 'bg-gray-200 dark:bg-gray-800'}">
    <div
      class="h-full transition-all duration-150 ease-out {isPlaying ? 'progress-animated' : (isFullscreen ? 'bg-white' : 'bg-gray-900 dark:bg-white')}"
      style="width: {progress}%"
    ></div>
  </div>

  <!-- Word Display - Centered -->
  <div class="absolute inset-0 flex items-center justify-center px-4">
    <div
      class="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight text-center select-none {isFullscreen ? 'text-white' : 'text-gray-900 dark:text-white'}"
    >
      {currentWord}
    </div>
  </div>

  <!-- Controls Overlay - Bottom -->
  <div
    class="absolute bottom-0 left-0 right-0 pb-8 pt-20 transition-opacity duration-300 {showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}"
    style="background: linear-gradient(to top, {isFullscreen ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.7)'} 0%, transparent 100%)"
  >
    <div class="flex flex-col items-center gap-4">
      <!-- Progress Text -->
      <div class="text-sm text-gray-300">
        {currentIndex + 1} / {totalWords} · {wpm} WPM
      </div>

      <!-- Controls -->
      <SpeedControls
        {wpm}
        {isPlaying}
        isFullscreen={true}
        onPlayPause={togglePlayPause}
        onPrev={prevWord}
        onNext={nextWord}
        onRestart={restart}
        onWpmChange={handleWpmChange}
        {onToggleFullscreen}
      />
    </div>
  </div>
</div>

<style>
  .progress-animated {
    background: repeating-linear-gradient(
      -45deg,
      #f97316,
      #f97316 10px,
      #ea580c 10px,
      #ea580c 20px
    );
    background-size: 200% 100%;
    animation: progress-stripe 0.5s linear infinite;
  }

  @keyframes progress-stripe {
    0% {
      background-position: 0 0;
    }
    100% {
      background-position: 28px 0;
    }
  }
</style>
