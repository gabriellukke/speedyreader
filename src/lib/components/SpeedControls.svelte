<script lang="ts">
  interface Props {
    wpm: number;
    isPlaying: boolean;
    onPlayPause: () => void;
    onPrev: () => void;
    onNext: () => void;
    onRestart: () => void;
    onWpmChange: (wpm: number) => void;
  }

  let { wpm, isPlaying, onPlayPause, onPrev, onNext, onRestart, onWpmChange }: Props = $props();
</script>

<div class="w-full max-w-md space-y-6">
  <!-- Playback Controls -->
  <div class="flex items-center justify-center gap-3 md:gap-4">
    <button
      onclick={onRestart}
      class="p-3 md:p-4 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      aria-label="Restart"
    >
      <svg class="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
    </button>

    <button
      onclick={onPrev}
      class="p-3 md:p-4 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      aria-label="Previous word"
    >
      <svg class="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </button>

    <button
      onclick={onPlayPause}
      class="p-4 md:p-5 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-lg"
      aria-label={isPlaying ? 'Pause' : 'Play'}
    >
      {#if isPlaying}
        <svg class="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      {:else}
        <svg class="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      {/if}
    </button>

    <button
      onclick={onNext}
      class="p-3 md:p-4 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      aria-label="Next word"
    >
      <svg class="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  </div>

  <!-- WPM Slider -->
  <div class="px-2">
    <div class="flex items-center justify-between mb-2">
      <label for="wpm-slider" class="text-sm md:text-base font-medium">Speed</label>
      <span class="text-sm md:text-base font-bold">{wpm} WPM</span>
    </div>
    <input
      id="wpm-slider"
      type="range"
      min="100"
      max="1000"
      step="50"
      value={wpm}
      oninput={(e) => onWpmChange(Number((e.target as HTMLInputElement).value))}
      class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
    />
    <div class="flex justify-between text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
      <span>Slow</span>
      <span>Fast</span>
    </div>
  </div>
</div>

<style>
  .slider::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #2563eb;
    cursor: pointer;
  }

  .slider::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #2563eb;
    cursor: pointer;
    border: none;
  }

  .slider::-webkit-slider-thumb:hover {
    background: #1d4ed8;
  }

  .slider::-moz-range-thumb:hover {
    background: #1d4ed8;
  }
</style>
