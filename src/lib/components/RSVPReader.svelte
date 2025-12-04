<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import SpeedControls from './SpeedControls.svelte';
  import { createReaderService } from '$lib/services/readerService';
  import type { ReaderState } from '$lib/services/readerService';

  interface Props {
    text: string;
    initialWpm?: number;
  }

  let { text, initialWpm = 300 }: Props = $props();

  // Reader service instance
  const reader = createReaderService();

  // Local state synced with service
  let currentWord = $state('');
  let currentIndex = $state(0);
  let totalWords = $state(0);
  let wpm = $state(initialWpm);
  let isPlaying = $state(false);

  // Initialize reader when text changes
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

<div class="flex flex-col items-center justify-center w-full h-full min-h-[60vh] px-4">
  <!-- Word Display -->
  <div class="mb-8 md:mb-12 text-center">
    <div
      class="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight min-h-[80px] md:min-h-[120px] flex items-center justify-center"
    >
      {currentWord}
    </div>
  </div>

  <!-- Progress -->
  <div class="mb-6 text-sm md:text-base text-gray-600 dark:text-gray-400">
    Word {currentIndex + 1} of {totalWords}
  </div>

  <!-- Controls -->
  <SpeedControls
    {wpm}
    {isPlaying}
    onPlayPause={togglePlayPause}
    onPrev={prevWord}
    onNext={nextWord}
    onRestart={restart}
    onWpmChange={handleWpmChange}
  />
</div>
