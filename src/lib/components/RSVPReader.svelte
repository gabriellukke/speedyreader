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

  const toggleControls = () => {
    showControls = !showControls;
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
      case 'KeyH':
        e.preventDefault();
        toggleControls();
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
    reader.destroy();
  });
</script>

<div class="reader-container {isFullscreen ? 'reader-fullscreen' : ''}">
  <!-- Progress Bar - Top -->
  <div class="progress-bar">
    <div
      class="progress-fill {isPlaying ? 'progress-animated' : ''}"
      style="width: {progress}%;"
    ></div>
  </div>

  <!-- Toggle Controls Button - Top Right -->
  <button
    onclick={toggleControls}
    class="toggle-btn"
    aria-label={showControls ? 'Hide controls (H)' : 'Show controls (H)'}
    title={showControls ? 'Hide controls (H)' : 'Show controls (H)'}
  >
    {#if showControls}
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
        />
      </svg>
    {:else}
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
        />
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    {/if}
  </button>

  <!-- Word Display - True Center -->
  <div class="word-container">
    <div class="word-display">
      {currentWord}
    </div>
  </div>

  <!-- Controls Overlay - Bottom -->
  <div class="controls-overlay {showControls ? '' : 'controls-hidden'}">
    <div class="controls-inner">
      <!-- Progress Text -->
      <div class="progress-text">
        {currentIndex + 1} / {totalWords} · {wpm} WPM
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
</div>

<style>
  .reader-container {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: calc(100vh - 4rem);
    overflow: hidden;
    background-color: var(--color-reader-bg);
  }

  .reader-fullscreen {
    min-height: 100vh;
  }

  .progress-bar {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    z-index: 10;
    background-color: var(--color-reader-progress-bg);
  }

  .progress-fill {
    height: 100%;
    transition: width 150ms ease-out;
    background-color: var(--color-reader-progress-fill);
  }

  .progress-animated {
    background: repeating-linear-gradient(
      -45deg,
      var(--color-accent),
      var(--color-accent) 10px,
      var(--color-accent-hover) 10px,
      var(--color-accent-hover) 20px
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

  .toggle-btn {
    position: absolute;
    top: 1rem;
    right: 1rem;
    z-index: 20;
    padding: 0.5rem;
    border-radius: 9999px;
    transition: all 150ms;
    cursor: pointer;
    color: var(--color-reader-controls-text);
    background: transparent;
    border: none;
  }

  .toggle-btn:hover {
    color: var(--color-reader-controls-hover);
    background-color: var(--color-btn-secondary-hover-bg);
  }

  .word-container {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .word-display {
    font-size: 3rem;
    font-weight: 700;
    letter-spacing: -0.025em;
    text-align: center;
    user-select: none;
    padding: 0 1rem;
    color: var(--color-reader-text);
  }

  @media (min-width: 640px) {
    .word-display {
      font-size: 3.75rem;
    }
  }

  @media (min-width: 768px) {
    .word-display {
      font-size: 4.5rem;
    }
  }

  @media (min-width: 1024px) {
    .word-display {
      font-size: 6rem;
    }
  }

  @media (min-width: 1280px) {
    .word-display {
      font-size: 8rem;
    }
  }

  .controls-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding-bottom: 1.5rem;
    transition: all 300ms;
  }

  @media (min-width: 640px) {
    .controls-overlay {
      padding-bottom: 2rem;
    }
  }

  .controls-hidden {
    opacity: 0;
    transform: translateY(1rem);
    pointer-events: none;
  }

  .controls-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }

  @media (min-width: 640px) {
    .controls-inner {
      gap: 1rem;
    }
  }

  .progress-text {
    font-size: 0.75rem;
    color: var(--color-reader-controls-text);
  }

  @media (min-width: 640px) {
    .progress-text {
      font-size: 0.875rem;
    }
  }
</style>
