<script lang="ts">
  interface Props {
    wpm: number;
    isPlaying: boolean;
    isFullscreen?: boolean;
    onPlayPause: () => void;
    onPrev: () => void;
    onNext: () => void;
    onRestart: () => void;
    onWpmChange: (wpm: number) => void;
    onToggleFullscreen?: () => void;
  }

  let { wpm, isPlaying, isFullscreen = false, onPlayPause, onPrev, onNext, onRestart, onWpmChange, onToggleFullscreen }: Props = $props();

  const btnClass = isFullscreen
    ? 'text-white/70 hover:text-white hover:bg-white/10'
    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800';

  const playBtnClass = isFullscreen
    ? 'bg-white text-black hover:bg-gray-200'
    : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-200';
</script>

<div class="flex flex-col items-center gap-4">
  <!-- Playback Controls -->
  <div class="flex items-center gap-1">
    <button
      onclick={onRestart}
      class="p-3 rounded-full transition-colors {btnClass}"
      aria-label="Restart (R)"
      title="Restart (R)"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    </button>

    <button
      onclick={onPrev}
      class="p-3 rounded-full transition-colors {btnClass}"
      aria-label="Previous (←)"
      title="Previous (←)"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
      </svg>
    </button>

    <button
      onclick={onPlayPause}
      class="p-4 mx-2 rounded-full transition-colors {playBtnClass}"
      aria-label={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
      title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
    >
      {#if isPlaying}
        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
        </svg>
      {:else}
        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      {/if}
    </button>

    <button
      onclick={onNext}
      class="p-3 rounded-full transition-colors {btnClass}"
      aria-label="Next (→)"
      title="Next (→)"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </button>

    {#if onToggleFullscreen}
      <button
        onclick={onToggleFullscreen}
        class="p-3 rounded-full transition-colors {btnClass}"
        aria-label={isFullscreen ? 'Exit fullscreen (F)' : 'Fullscreen (F)'}
        title={isFullscreen ? 'Exit fullscreen (F)' : 'Fullscreen (F)'}
      >
        {#if isFullscreen}
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
          </svg>
        {:else}
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
          </svg>
        {/if}
      </button>
    {/if}
  </div>

  <!-- Speed Slider -->
  <div class="flex items-center gap-3 w-64">
    <button
      onclick={() => onWpmChange(Math.max(100, wpm - 50))}
      class="p-1.5 rounded transition-colors {btnClass}"
      aria-label="Decrease speed"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12h-15" />
      </svg>
    </button>
    
    <input
      type="range"
      min="100"
      max="1000"
      step="50"
      value={wpm}
      oninput={(e) => onWpmChange(Number((e.target as HTMLInputElement).value))}
      class="flex-1 h-1 rounded-full appearance-none cursor-pointer slider {isFullscreen ? 'bg-white/20' : 'bg-gray-300 dark:bg-gray-600'}"
    />
    
    <button
      onclick={() => onWpmChange(Math.min(1000, wpm + 50))}
      class="p-1.5 rounded transition-colors {btnClass}"
      aria-label="Increase speed"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    </button>
  </div>
</div>

<style>
  .slider::-webkit-slider-thumb {
    appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #f97316;
    cursor: pointer;
  }

  .slider::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #f97316;
    cursor: pointer;
    border: none;
  }
</style>
