<script lang="ts">
  import { IconMaximize, IconMinimize } from './icons';

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

  let {
    wpm,
    isPlaying,
    isFullscreen = false,
    onPlayPause,
    onPrev,
    onNext,
    onRestart,
    onWpmChange,
    onToggleFullscreen
  }: Props = $props();
</script>

<div class="controls-wrapper">
  <!-- Playback Controls -->
  <div class="playback-controls">
    <button onclick={onRestart} class="control-btn" aria-label="Restart (R)" title="Restart (R)">
      <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
        />
      </svg>
    </button>

    <button onclick={onPrev} class="control-btn" aria-label="Previous (←)" title="Previous (←)">
      <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
      </svg>
    </button>

    <button
      onclick={onPlayPause}
      class="play-btn"
      aria-label={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
      title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
    >
      {#if isPlaying}
        <svg class="icon-lg" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
        </svg>
      {:else}
        <svg class="icon-lg" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      {/if}
    </button>

    <button onclick={onNext} class="control-btn" aria-label="Next (→)" title="Next (→)">
      <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </button>

    {#if onToggleFullscreen}
      <button
        onclick={onToggleFullscreen}
        class="control-btn"
        aria-label={isFullscreen ? 'Exit fullscreen (F)' : 'Fullscreen (F)'}
        title={isFullscreen ? 'Exit fullscreen (F)' : 'Fullscreen (F)'}
      >
        {#if isFullscreen}
          <IconMinimize class="icon" />
        {:else}
          <IconMaximize class="icon" />
        {/if}
      </button>
    {/if}
  </div>

  <!-- Speed Slider -->
  <div class="speed-slider">
    <button
      onclick={() => onWpmChange(Math.max(100, wpm - 50))}
      class="speed-btn"
      aria-label="Decrease speed"
    >
      <svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
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
      class="slider"
    />

    <button
      onclick={() => onWpmChange(Math.min(1000, wpm + 50))}
      class="speed-btn"
      aria-label="Increase speed"
    >
      <svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    </button>
  </div>
</div>

<style>
  .controls-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }

  @media (min-width: 640px) {
    .controls-wrapper {
      gap: 1rem;
    }
  }

  .playback-controls {
    display: flex;
    align-items: center;
    gap: 0.125rem;
  }

  @media (min-width: 640px) {
    .playback-controls {
      gap: 0.25rem;
    }
  }

  .control-btn {
    padding: 0.625rem;
    border-radius: 9999px;
    transition: all 150ms;
    cursor: pointer;
    color: var(--color-reader-controls-text);
    background: transparent;
    border: none;
  }

  @media (min-width: 640px) {
    .control-btn {
      padding: 0.75rem;
    }
  }

  .control-btn:hover {
    color: var(--color-reader-controls-hover);
    background-color: var(--color-btn-secondary-hover-bg);
  }

  .play-btn {
    padding: 0.75rem;
    margin: 0 0.25rem;
    border-radius: 9999px;
    transition: all 150ms;
    cursor: pointer;
    background-color: var(--color-btn-primary-bg);
    color: var(--color-btn-primary-text);
    border: none;
  }

  @media (min-width: 640px) {
    .play-btn {
      padding: 1rem;
      margin: 0 0.5rem;
    }
  }

  .play-btn:hover {
    background-color: var(--color-btn-primary-hover);
  }

  .speed-slider {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 12rem;
  }

  @media (min-width: 640px) {
    .speed-slider {
      gap: 0.75rem;
      width: 16rem;
    }
  }

  .speed-btn {
    padding: 0.25rem;
    border-radius: 0.25rem;
    transition: all 150ms;
    cursor: pointer;
    color: var(--color-reader-controls-text);
    background: transparent;
    border: none;
  }

  @media (min-width: 640px) {
    .speed-btn {
      padding: 0.375rem;
    }
  }

  .speed-btn:hover {
    color: var(--color-reader-controls-hover);
    background-color: var(--color-btn-secondary-hover-bg);
  }

  .slider {
    flex: 1;
    height: 4px;
    border-radius: 9999px;
    appearance: none;
    cursor: pointer;
    background-color: var(--color-reader-progress-bg);
  }

  .slider::-webkit-slider-thumb {
    appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--color-accent);
    cursor: pointer;
  }

  .slider::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--color-accent);
    cursor: pointer;
    border: none;
  }

  .icon {
    width: 1rem;
    height: 1rem;
  }

  @media (min-width: 640px) {
    .icon {
      width: 1.25rem;
      height: 1.25rem;
    }
  }

  .icon-lg {
    width: 1.25rem;
    height: 1.25rem;
  }

  @media (min-width: 640px) {
    .icon-lg {
      width: 1.5rem;
      height: 1.5rem;
    }
  }

  .icon-sm {
    width: 0.875rem;
    height: 0.875rem;
  }

  @media (min-width: 640px) {
    .icon-sm {
      width: 1rem;
      height: 1rem;
    }
  }
</style>
