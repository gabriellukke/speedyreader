/**
 * Text Service
 *
 * Text processing and validation utilities.
 */

export interface TextValidationResult {
  isValid: boolean;
  error?: string;
}

export interface TextStats {
  wordCount: number;
  characterCount: number;
  estimatedReadingTime: number; // in seconds at 300 WPM
}

class TextService {
  /**
   * Validate text content
   * @param text - Text to validate
   * @param minLength - Minimum character length (default: 1)
   * @returns Validation result
   */
  validateText(text: string, minLength: number = 1): TextValidationResult {
    const trimmed = text.trim();

    if (!trimmed) {
      return {
        isValid: false,
        error: 'Text cannot be empty'
      };
    }

    if (trimmed.length < minLength) {
      return {
        isValid: false,
        error: `Text must be at least ${minLength} characters`
      };
    }

    return { isValid: true };
  }

  /**
   * Count words in text
   * @param text - Text to count
   * @returns Word count
   */
  countWords(text: string): number {
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  }

  /**
   * Get text statistics
   * @param text - Text to analyze
   * @param wpm - Words per minute for reading time calculation (default: 300)
   * @returns Text statistics
   */
  getTextStats(text: string, wpm: number = 300): TextStats {
    const trimmed = text.trim();
    const wordCount = this.countWords(trimmed);
    const characterCount = trimmed.length;
    const estimatedReadingTime = (wordCount / wpm) * 60; // in seconds

    return {
      wordCount,
      characterCount,
      estimatedReadingTime
    };
  }

  /**
   * Format reading time in human-readable format
   * @param seconds - Time in seconds
   * @returns Formatted time string (e.g., "2m 30s")
   */
  formatReadingTime(seconds: number): string {
    if (seconds < 60) {
      return `${Math.ceil(seconds)}s`;
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.ceil(seconds % 60);

    if (remainingSeconds === 0) {
      return `${minutes}m`;
    }

    return `${minutes}m ${remainingSeconds}s`;
  }

  /**
   * Truncate text to specified length
   * @param text - Text to truncate
   * @param maxLength - Maximum length
   * @param ellipsis - Ellipsis string (default: "...")
   * @returns Truncated text
   */
  truncate(text: string, maxLength: number, ellipsis: string = '...'): string {
    if (text.length <= maxLength) {
      return text;
    }

    return text.substring(0, maxLength - ellipsis.length) + ellipsis;
  }

  /**
   * Clean and normalize text
   * @param text - Text to clean
   * @returns Cleaned text
   */
  cleanText(text: string): string {
    return text
      .trim()
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/\n{3,}/g, '\n\n'); // Limit consecutive newlines
  }

  /**
   * Generate a title from text content
   * @param text - Text to generate title from
   * @param maxLength - Maximum title length (default: 50)
   * @returns Generated title
   */
  generateTitle(text: string, maxLength: number = 50): string {
    const cleaned = this.cleanText(text);
    const firstLine = cleaned.split('\n')[0];
    return this.truncate(firstLine, maxLength);
  }

  /**
   * Check if text is empty or only whitespace
   * @param text - Text to check
   * @returns True if empty
   */
  isEmpty(text: string): boolean {
    return !text || text.trim().length === 0;
  }

  /**
   * Sanitize text for safe display (basic XSS prevention)
   * @param text - Text to sanitize
   * @returns Sanitized text
   */
  sanitize(text: string): string {
    return text
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Extract preview from text
   * @param text - Full text
   * @param wordLimit - Number of words for preview (default: 20)
   * @returns Preview text
   */
  getPreview(text: string, wordLimit: number = 20): string {
    const words = text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);

    if (words.length <= wordLimit) {
      return text;
    }

    return words.slice(0, wordLimit).join(' ') + '...';
  }
}

// Export singleton instance
export const textService = new TextService();
