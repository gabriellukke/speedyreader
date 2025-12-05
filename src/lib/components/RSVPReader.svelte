<script lang="ts">
  import { onDestroy } from 'svelte';
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

  onDestroy(() => {
    reader.destroy();
  });
</script>

<div class="flex flex-col h-full w-full {isFullscreen ? 'bg-black' : ''}">
  <!-- Progress Bar - Top -->
  <div class="flex-shrink-0 h-1.5 bg-gray-200 dark:bg-gray-800 w-full relative overflow-hidden">
    <div
      class="h-full transition-all duration-150 ease-out {isPlaying ? 'progress-animated' : 'bg-gray-900 dark:bg-white'}"
      style="width: {progress}%"
    ></div>
  </div>

  <!-- Main Reader Area -->
  <div class="flex-1 flex flex-col items-center justify-center px-4 {isFullscreen ? 'bg-black' : ''}">
    <!-- Word Display -->
    <div class="mb-8 md:mb-12 text-center">
      <div
        class="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight min-h-[80px] md:min-h-[120px] flex items-center justify-center {isFullscreen ? 'text-white' : ''}"
      >
        {currentWord}
      </div>
    </div>

    <!-- Progress Text -->
    <div class="mb-6 text-sm text-gray-500 dark:text-gray-400 {isFullscreen ? '!text-gray-500' : ''}">
      {currentIndex + 1} / {totalWords}
    </div>

    <!-- Controls -->
    <SpeedControls
      {wpm}
      {isPlaying}
      {isFullscreen}
      onPlayPause={togglePlayPause}
      onPrev={prevWord}
      onNext={nextWord}
      onRestart={restart}
      onWpmChange={handleWpmChange}
      {onToggleFullscreen}
    />
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
