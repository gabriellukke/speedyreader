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

export interface ReaderConfig {
  initialWpm?: number;
  onStateChange?: (state: ReaderState) => void;
  onComplete?: () => void;
}

class ReaderService {
  private words: string[] = [];
  private currentIndex: number = 0;
  private wpm: number = 300;
  private isPlaying: boolean = false;
  private intervalId: number | null = null;
  private onStateChange?: (state: ReaderState) => void;
  private onComplete?: () => void;

  /**
   * Initialize the reader with text
   * @param text - Text to read
   * @param config - Optional configuration
   */
  initialize(text: string, config?: ReaderConfig): void {
    this.words = this.splitTextIntoWords(text);
    this.currentIndex = 0;
    this.wpm = config?.initialWpm || 300;
    this.isPlaying = false;
    this.onStateChange = config?.onStateChange;
    this.onComplete = config?.onComplete;

    this.notifyStateChange();
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
   * Calculate estimated time remaining
   * @returns Time remaining in seconds
   */
  getTimeRemaining(): number {
    const wordsRemaining = this.words.length - this.currentIndex;
    const secondsPerWord = 60 / this.wpm;
    return wordsRemaining * secondsPerWord;
  }

  /**
   * Start the reading interval
   */
  private startInterval(): void {
    const intervalMs = 60000 / this.wpm;
    this.intervalId = window.setInterval(() => {
      if (this.currentIndex < this.words.length - 1) {
        this.currentIndex++;
        this.notifyStateChange();
      } else {
        this.pause();
        if (this.onComplete) {
          this.onComplete();
        }
      }
    }, intervalMs);
  }

  /**
   * Stop the reading interval
   */
  private stopInterval(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
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
