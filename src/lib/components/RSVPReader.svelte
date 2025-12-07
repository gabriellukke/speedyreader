<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import SpeedControls from './SpeedControls.svelte';
  import { createReaderService } from '$lib/services/readerService';
  import type { ReaderState } from '$lib/services/readerService';
  import { settingsStore } from '$lib/stores/settingsStore';
  import { hapticFeedback } from '$lib/utils/capacitorUtils';
  import { ImpactStyle } from '@capacitor/haptics';

  interface Props {
    text: string;
    initialWpm?: number;
    isFullscreen?: boolean;
    onToggleFullscreen?: () => void;
    autoHideControls?: boolean;
  }

  let {
    text,
    initialWpm,
    isFullscreen = false,
    onToggleFullscreen,
    autoHideControls = false
  }: Props = $props();

  const reader = createReaderService();

  let settings = $state($settingsStore);

  $effect(() => {
    settings = $settingsStore;
  });

  let effectiveWpm = $derived(initialWpm ?? settings.defaultWpm);

  let fontFamilyClass = $derived(() => {
    switch (settings.fontFamily) {
      case 'serif':
        return 'font-serif';
      case 'mono':
        return 'font-mono';
      default:
        return 'font-sans';
    }
  });

  let fontSizeScale = $derived(settings.fontSize / 100);

  let currentWord = $state('');
  let currentIndex = $state(0);
  let totalWords = $state(0);
  let wpm = $state(300);
  let isPlaying = $state(false);
  let showControls = $state(true);
  let timerTick = $state(0);

  $effect(() => {
    if (autoHideControls) {
      showControls = false;
    }
  });
  let totalEstimatedTime = $state<number>(0);
  let startTime = $state<number | null>(null);
  let pausedElapsedTime = $state<number>(0);
  let isManualJump = $state(false);

  let progress = $derived(totalWords > 1 ? (currentIndex / (totalWords - 1)) * 100 : 0);

  let remainingTime = $derived.by(() => {
    if (totalWords === 0 || wpm <= 0) return '';

    timerTick;

    let remaining: number;

    if (isPlaying && totalEstimatedTime > 0 && startTime !== null) {
      const elapsed = (Date.now() - startTime) / 1000 + pausedElapsedTime;
      remaining = Math.max(0, totalEstimatedTime - elapsed);
    } else {
      remaining = reader.getTimeRemaining();
    }

    if (remaining <= 0) return '';

    const h = Math.floor(remaining / 3600);
    const m = Math.floor((remaining % 3600) / 60);
    const s = Math.floor(remaining % 60);

    const fmt = (n: number, unit: string) => `${n} ${unit}${n !== 1 ? 's' : ''}`;
    const parts = [
      h > 0 && fmt(h, 'hour'),
      m > 0 && fmt(m, 'minute'),
      (s > 0 || (!h && !m)) && fmt(s, 'second')
    ].filter(Boolean) as string[];

    const last = parts.pop();
    return `~ ${parts.length ? `${parts.join(' ')} and ${last}` : last}`;
  });

  let lastText = $state('');
  let lastWpm = $state(0);
  let lastPauseComma = $state({ enabled: false, duration: 0 });
  let lastPausePeriod = $state({ enabled: false, duration: 0 });
  let lastPauseParagraph = $state({ enabled: false, duration: 0 });

  function pauseSettingsEqual(
    a: { enabled: boolean; duration: number },
    b: { enabled: boolean; duration: number }
  ): boolean {
    return a.enabled === b.enabled && a.duration === b.duration;
  }

  $effect(() => {
    if (!text) {
      lastText = '';
      return;
    }

    const currentText = text;
    const currentWpm = effectiveWpm;
    const currentPauseComma = settings.pauseAfterComma;
    const currentPausePeriod = settings.pauseAfterPeriod;
    const currentPauseParagraph = settings.pauseAfterParagraph;

    const textChanged = currentText !== lastText;
    const wpmChanged = currentWpm !== lastWpm;
    const pauseCommaChanged = !pauseSettingsEqual(currentPauseComma, lastPauseComma);
    const pausePeriodChanged = !pauseSettingsEqual(currentPausePeriod, lastPausePeriod);
    const pauseParagraphChanged = !pauseSettingsEqual(currentPauseParagraph, lastPauseParagraph);

    if (
      textChanged ||
      wpmChanged ||
      pauseCommaChanged ||
      pausePeriodChanged ||
      pauseParagraphChanged
    ) {
      lastText = currentText;
      lastWpm = currentWpm;
      lastPauseComma = { ...currentPauseComma };
      lastPausePeriod = { ...currentPausePeriod };
      lastPauseParagraph = { ...currentPauseParagraph };

      reader.initialize(currentText, {
        initialWpm: currentWpm,
        pauseSettings: {
          pauseAfterComma: currentPauseComma,
          pauseAfterPeriod: currentPausePeriod,
          pauseAfterParagraph: currentPauseParagraph
        },
        onStateChange: (state: ReaderState) => {
          currentWord = state.words[state.currentIndex] || '';
          const wasPlaying = isPlaying;
          currentIndex = state.currentIndex;
          totalWords = state.totalWords;
          wpm = state.wpm;
          isPlaying = state.isPlaying;

          if (!wasPlaying && isPlaying) {
            totalEstimatedTime = reader.getTotalTimeFromIndex(currentIndex);
            startTime = Date.now();
            pausedElapsedTime = 0;
            isManualJump = false;
          } else if (wasPlaying && !isPlaying) {
            if (startTime !== null) {
              pausedElapsedTime += (Date.now() - startTime) / 1000;
              startTime = null;
            }
          } else if (isManualJump && isPlaying) {
            totalEstimatedTime = reader.getTotalTimeFromIndex(currentIndex);
            startTime = Date.now();
            pausedElapsedTime = 0;
            isManualJump = false;
          }
        }
      });
    }
  });

  const toggleControls = () => {
    showControls = !showControls;
  };

  const togglePlayPause = () => {
    hapticFeedback(ImpactStyle.Medium);
    reader.togglePlayPause();
  };

  const nextWord = () => {
    hapticFeedback(ImpactStyle.Light);
    isManualJump = true;
    reader.nextWord();
  };

  const prevWord = () => {
    hapticFeedback(ImpactStyle.Light);
    isManualJump = true;
    reader.previousWord();
  };

  const restart = () => {
    hapticFeedback(ImpactStyle.Medium);
    isManualJump = true;
    reader.restart();
  };

  const handleWpmChange = (newWpm: number) => {
    reader.setWpm(newWpm);
  };

  const handleProgressClick = (e: MouseEvent | TouchEvent) => {
    const bar = e.currentTarget as HTMLElement;
    const rect = bar.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const targetIndex = Math.floor(percent * totalWords);
    isManualJump = true;
    reader.jumpToWord(targetIndex);
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

    const timerInterval = setInterval(() => {
      if (isPlaying && totalEstimatedTime > 0) {
        timerTick++;
      }
    }, 1000);

    return () => {
      window.removeEventListener('keydown', handleKeydown);
      clearInterval(timerInterval);
    };
  });

  onDestroy(() => {
    reader.destroy();
  });
</script>

<div class="reader-container {isFullscreen ? 'reader-fullscreen' : ''}">
  <!-- Progress Bar - Top -->
  <div
    class="progress-bar"
    onclick={handleProgressClick}
    ontouchstart={handleProgressClick}
    onkeydown={(e) => {
      if (e.key === 'ArrowLeft') {
        isManualJump = true;
        prevWord();
      }
      if (e.key === 'ArrowRight') {
        isManualJump = true;
        nextWord();
      }
    }}
    role="slider"
    aria-valuenow={currentIndex}
    aria-valuemin={0}
    aria-valuemax={totalWords}
    tabindex="0"
  >
    <div
      class="progress-fill {isPlaying ? 'progress-animated' : ''}"
      style="width: {progress}%;"
    ></div>
    <span class="progress-time">{remainingTime}</span>
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
  <div
    class="word-container"
    onclick={togglePlayPause}
    ontouchstart={togglePlayPause}
    onkeydown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        togglePlayPause();
      }
    }}
    role="button"
    tabindex="0"
    aria-label={isPlaying ? 'Pause (tap or press Space)' : 'Play (tap or press Space)'}
  >
    <div class="word-display {fontFamilyClass()}" style="--font-scale: {fontSizeScale};">
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
    flex: 1;
    overflow: hidden;
    background-color: var(--background);
  }

  .reader-fullscreen {
    min-height: 100vh;
    background-color: var(--background);
  }

  .progress-bar {
    position: absolute;
    top: max(env(safe-area-inset-top), 0px);
    left: 0;
    right: 0;
    height: 2rem;
    z-index: 10;
    overflow: hidden;
    background-color: var(--muted);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    user-select: none;
  }

  .progress-fill {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    transition: width 150ms ease-out;
    background: linear-gradient(
      -45deg,
      var(--ring) 25%,
      var(--accent) 25%,
      var(--accent) 50%,
      var(--ring) 50%,
      var(--ring) 75%,
      var(--accent) 75%
    );
    background-size: 20px 20px;
  }

  .progress-animated {
    animation: progress-stripe 0.5s linear infinite;
  }

  @keyframes progress-stripe {
    from {
      background-position: 0 0;
    }
    to {
      background-position: 20px 20px;
    }
  }

  .progress-time {
    position: relative;
    z-index: 1;
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--foreground);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    letter-spacing: 0.025em;
    pointer-events: none;
  }

  .toggle-btn {
    position: absolute;
    top: calc(2.5rem + max(env(safe-area-inset-top), 0px));
    right: 1rem;
    z-index: 20;
    padding: 0.5rem;
    border-radius: 9999px;
    transition: all 150ms;
    cursor: pointer;
    background: transparent;
    border: none;
    color: var(--muted-foreground);
  }

  .toggle-btn:hover {
    color: var(--foreground);
    background-color: var(--accent);
  }

  .word-container {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }

  .word-display {
    --base-size: 3rem;
    font-size: calc(var(--base-size) * var(--font-scale, 1));
    font-weight: 700;
    letter-spacing: -0.025em;
    text-align: center;
    user-select: none;
    padding: 0 1rem;
    color: var(--foreground);
  }

  @media (min-width: 640px) {
    .word-display {
      --base-size: 3.75rem;
    }
  }

  @media (min-width: 768px) {
    .word-display {
      --base-size: 4.5rem;
    }
  }

  @media (min-width: 1024px) {
    .word-display {
      --base-size: 6rem;
    }
  }

  @media (min-width: 1280px) {
    .word-display {
      --base-size: 8rem;
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
    color: var(--muted-foreground);
  }

  @media (min-width: 640px) {
    .progress-text {
      font-size: 0.875rem;
    }
  }
</style>
