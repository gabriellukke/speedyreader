/**
 * Date Service
 *
 * Date formatting and manipulation utilities.
 */

export interface DateFormatOptions {
  year?: 'numeric' | '2-digit';
  month?: 'numeric' | '2-digit' | 'narrow' | 'short' | 'long';
  day?: 'numeric' | '2-digit';
  hour?: 'numeric' | '2-digit';
  minute?: 'numeric' | '2-digit';
  second?: 'numeric' | '2-digit';
}

class DateService {
  /**
   * Format timestamp to readable date string
   * @param timestamp - Unix timestamp in milliseconds
   * @param locale - Locale string (default: 'en-US')
   * @param options - Date format options
   * @returns Formatted date string
   */
  formatDate(timestamp: number, locale: string = 'en-US', options?: DateFormatOptions): string {
    const defaultOptions: DateFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };

    return new Date(timestamp).toLocaleDateString(locale, options || defaultOptions);
  }

  /**
   * Format timestamp to relative time (e.g., "2 hours ago")
   * @param timestamp - Unix timestamp in milliseconds
   * @returns Relative time string
   */
  formatRelativeTime(timestamp: number): string {
    const now = Date.now();
    const diffInSeconds = Math.floor((now - timestamp) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    }

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
      return `${diffInWeeks} ${diffInWeeks === 1 ? 'week' : 'weeks'} ago`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
    }

    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
  }

  /**
   * Format timestamp to full datetime string
   * @param timestamp - Unix timestamp in milliseconds
   * @param locale - Locale string (default: 'en-US')
   * @returns Formatted datetime string
   */
  formatDateTime(timestamp: number, locale: string = 'en-US'): string {
    return new Date(timestamp).toLocaleString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Get current timestamp
   * @returns Current Unix timestamp in milliseconds
   */
  now(): number {
    return Date.now();
  }

  /**
   * Check if timestamp is today
   * @param timestamp - Unix timestamp in milliseconds
   * @returns True if timestamp is today
   */
  isToday(timestamp: number): boolean {
    const date = new Date(timestamp);
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  /**
   * Check if timestamp is within the last N days
   * @param timestamp - Unix timestamp in milliseconds
   * @param days - Number of days
   * @returns True if within the last N days
   */
  isWithinDays(timestamp: number, days: number): boolean {
    const now = Date.now();
    const diffInDays = Math.floor((now - timestamp) / (1000 * 60 * 60 * 24));
    return diffInDays <= days;
  }
}

// Export singleton instance
export const dateService = new DateService();
