/**
 * Reader Service
 *
 * RSVP (Rapid Serial Visual Presentation) reading logic.
 */

export interface ReaderState {
  words: string[];
  currentIndex: number;
  wpm: number;
  isPlaying: boolean;
  totalWords: number;
}

export interface PauseSettings {
  pauseAfterComma: { enabled: boolean; duration: number };
  pauseAfterPeriod: { enabled: boolean; duration: number };
  pauseAfterParagraph: { enabled: boolean; duration: number };
}

export interface ReaderConfig {
  initialWpm?: number;
  pauseSettings?: PauseSettings;
  onStateChange?: (state: ReaderState) => void;
  onComplete?: () => void;
}

class ReaderService {
  private words: string[] = [];
  private currentIndex: number = 0;
  private wpm: number = 300;
  private isPlaying: boolean = false;
  private intervalId: number | null = null;
  private pauseTimeoutId: number | null = null;
  private pauseSettings?: PauseSettings;
  private onStateChange?: (state: ReaderState) => void;
  private onComplete?: () => void;

  /**
   * Initialize the reader with text
   * @param text - Text to read
   * @param config - Optional configuration
   */
  initialize(text: string, config?: ReaderConfig): void {
    const wasPlaying = this.isPlaying;
    const previousIndex = this.currentIndex;
    const previousWords = this.words;
    this.stopInterval();

    const newWords = this.splitTextIntoWords(text);
    const isSameText = JSON.stringify(newWords) === JSON.stringify(previousWords);

    this.words = newWords;
    this.currentIndex = isSameText ? previousIndex : 0;
    this.wpm = config?.initialWpm || 300;
    this.isPlaying = false;
    this.pauseSettings = config?.pauseSettings;
    this.onStateChange = config?.onStateChange;
    this.onComplete = config?.onComplete;

    this.notifyStateChange();

    if (wasPlaying && isSameText) {
      this.play();
    }
  }

  /**
   * Split text into words
   * @param text - Text to split
   * @returns Array of words
   */
  private splitTextIntoWords(text: string): string[] {
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
  }

  /**
   * Get current reader state
   * @returns Current state
   */
  getState(): ReaderState {
    return {
      words: this.words,
      currentIndex: this.currentIndex,
      wpm: this.wpm,
      isPlaying: this.isPlaying,
      totalWords: this.words.length
    };
  }

  /**
   * Get current word
   * @returns Current word or empty string
   */
  getCurrentWord(): string {
    return this.words[this.currentIndex] || '';
  }

  /**
   * Start or resume playback
   */
  play(): void {
    if (this.currentIndex >= this.words.length) {
      this.currentIndex = 0;
    }
    this.isPlaying = true;
    this.startInterval();
    this.notifyStateChange();
  }

  /**
   * Pause playback
   */
  pause(): void {
    this.isPlaying = false;
    this.stopInterval();
    this.notifyStateChange();
  }

  /**
   * Toggle play/pause
   */
  togglePlayPause(): void {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  /**
   * Move to next word
   */
  nextWord(): void {
    if (this.currentIndex < this.words.length - 1) {
      this.currentIndex++;
      this.notifyStateChange();
    }
  }

  /**
   * Move to previous word
   */
  previousWord(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.notifyStateChange();
    }
  }

  /**
   * Restart from beginning
   */
  restart(): void {
    this.currentIndex = 0;
    this.pause();
  }

  /**
   * Set reading speed (WPM)
   * @param newWpm - Words per minute
   */
  setWpm(newWpm: number): void {
    this.wpm = newWpm;
    if (this.isPlaying) {
      this.stopInterval();
      this.startInterval();
    }
    this.notifyStateChange();
  }

  /**
   * Jump to specific word index
   * @param index - Word index
   */
  jumpToWord(index: number): void {
    if (index >= 0 && index < this.words.length) {
      this.currentIndex = index;
      this.notifyStateChange();
    }
  }

  /**
   * Get progress percentage
   * @returns Progress as percentage (0-100)
   */
  getProgress(): number {
    if (this.words.length === 0) return 0;
    return ((this.currentIndex + 1) / this.words.length) * 100;
  }

  /**
   * Calculate total estimated time from a starting index including all pauses
   * @param startIndex - Starting word index
   * @returns Total time in seconds
   */
  getTotalTimeFromIndex(startIndex: number): number {
    if (startIndex >= this.words.length - 1) return 0;

    const baseSecondsPerWord = 60 / this.wpm;
    let totalSeconds = 0;

    for (let i = startIndex; i < this.words.length - 1; i++) {
      const word = this.words[i];
      const nextWord = this.words[i + 1];

      totalSeconds += baseSecondsPerWord;

      if (this.pauseSettings) {
        if (word.endsWith(',')) {
          if (this.pauseSettings.pauseAfterComma.enabled) {
            totalSeconds += this.pauseSettings.pauseAfterComma.duration / 1000;
          }
        }

        if (word.endsWith('.') || word.endsWith('!') || word.endsWith('?')) {
          if (this.pauseSettings.pauseAfterPeriod.enabled) {
            totalSeconds += this.pauseSettings.pauseAfterPeriod.duration / 1000;
          }

          const nextStartsWithCapital = nextWord.length > 0 && /^[A-Z]/.test(nextWord);
          if (nextStartsWithCapital && this.pauseSettings.pauseAfterParagraph.enabled) {
            totalSeconds += this.pauseSettings.pauseAfterParagraph.duration / 1000;
          }
        }
      }
    }

    return totalSeconds;
  }

  /**
   * Calculate estimated time remaining including pauses
   * @returns Time remaining in seconds
   */
  getTimeRemaining(): number {
    return this.getTotalTimeFromIndex(this.currentIndex);
  }

  /**
   * Get pause duration for current word
   */
  private getPauseDuration(word: string): number {
    if (!this.pauseSettings) return 0;

    let pauseMs = 0;

    if (word.endsWith(',')) {
      if (this.pauseSettings.pauseAfterComma.enabled) {
        pauseMs = Math.max(pauseMs, this.pauseSettings.pauseAfterComma.duration);
      }
    }

    if (word.endsWith('.') || word.endsWith('!') || word.endsWith('?')) {
      if (this.pauseSettings.pauseAfterPeriod.enabled) {
        pauseMs = Math.max(pauseMs, this.pauseSettings.pauseAfterPeriod.duration);
      }
    }

    return pauseMs;
  }

  /**
   * Check if there's a paragraph break after current word
   */
  private isParagraphBreak(currentIndex: number): boolean {
    if (!this.pauseSettings?.pauseAfterParagraph.enabled) return false;
    if (currentIndex >= this.words.length - 1) return false;

    const currentWord = this.words[currentIndex];
    const nextWord = this.words[currentIndex + 1];

    const endsWithSentencePunctuation =
      currentWord.endsWith('.') || currentWord.endsWith('!') || currentWord.endsWith('?');

    const nextStartsWithCapital = nextWord.length > 0 && /^[A-Z]/.test(nextWord);

    return endsWithSentencePunctuation && nextStartsWithCapital;
  }

  /**
   * Start the reading interval
   */
  private startInterval(): void {
    const baseIntervalMs = 60000 / this.wpm;
    const currentWord = this.words[this.currentIndex];
    const pauseMs = this.getPauseDuration(currentWord);
    const isParagraph = this.isParagraphBreak(this.currentIndex);
    const paragraphPauseMs =
      isParagraph && this.pauseSettings?.pauseAfterParagraph.enabled
        ? this.pauseSettings.pauseAfterParagraph.duration
        : 0;

    const totalDelay = baseIntervalMs + pauseMs + paragraphPauseMs;

    this.intervalId = window.setTimeout(() => {
      if (this.currentIndex < this.words.length - 1) {
        this.currentIndex++;
        this.notifyStateChange();

        if (this.isPlaying) {
          this.startInterval();
        }
      } else {
        this.pause();
        if (this.onComplete) {
          this.onComplete();
        }
      }
    }, totalDelay);
  }

  /**
   * Stop the reading interval
   */
  private stopInterval(): void {
    if (this.intervalId !== null) {
      clearTimeout(this.intervalId);
      this.intervalId = null;
    }
    if (this.pauseTimeoutId !== null) {
      clearTimeout(this.pauseTimeoutId);
      this.pauseTimeoutId = null;
    }
  }

  /**
   * Notify state change listeners
   */
  private notifyStateChange(): void {
    if (this.onStateChange) {
      this.onStateChange(this.getState());
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.stopInterval();
    this.words = [];
    this.currentIndex = 0;
    this.isPlaying = false;
    this.onStateChange = undefined;
    this.onComplete = undefined;
  }
}

/**
 * Create a new reader service instance
 * @returns New ReaderService instance
 */
export function createReaderService(): ReaderService {
  return new ReaderService();
}

// Export singleton instance for simple use cases
export const readerService = new ReaderService();
