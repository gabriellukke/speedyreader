/**
 * Storage Service
 *
 * Storage abstraction with adapter pattern for different storage backends.
 */

export interface StorageAdapter {
  getItem(key: string): string | null | Promise<string | null>;
  setItem(key: string, value: string): void | Promise<void>;
  removeItem(key: string): void | Promise<void>;
  clear(): void | Promise<void>;
}

/**
 * Browser localStorage adapter
 */
class LocalStorageAdapter implements StorageAdapter {
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }

  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
}

/**
 * In-memory storage adapter (fallback or testing)
 */
class MemoryStorageAdapter implements StorageAdapter {
  private storage: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.storage.get(key) || null;
  }

  setItem(key: string, value: string): void {
    this.storage.set(key, value);
  }

  removeItem(key: string): void {
    this.storage.delete(key);
  }

  clear(): void {
    this.storage.clear();
  }
}

/**
 * Storage Service with JSON serialization
 */
class StorageService {
  private adapter: StorageAdapter;

  constructor(adapter?: StorageAdapter) {
    this.adapter = adapter || new LocalStorageAdapter();
  }

  /**
   * Get item from storage and parse as JSON
   * @param key - Storage key
   * @returns Parsed value or null
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const item = await this.adapter.getItem(key);
      if (item === null) return null;
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Error parsing stored value for key "${key}":`, error);
      return null;
    }
  }

  /**
   * Store item as JSON
   * @param key - Storage key
   * @param value - Value to store
   */
  async set<T>(key: string, value: T): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      await this.adapter.setItem(key, serialized);
    } catch (error) {
      console.error(`Error storing value for key "${key}":`, error);
    }
  }

  /**
   * Remove item from storage
   * @param key - Storage key
   */
  async remove(key: string): Promise<void> {
    try {
      await this.adapter.removeItem(key);
    } catch (error) {
      console.error(`Error removing key "${key}":`, error);
    }
  }

  /**
   * Clear all storage
   */
  async clear(): Promise<void> {
    try {
      await this.adapter.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }

  /**
   * Get raw string value (no JSON parsing)
   * @param key - Storage key
   * @returns Raw string value or null
   */
  async getRaw(key: string): Promise<string | null> {
    return this.adapter.getItem(key);
  }

  /**
   * Set raw string value (no JSON serialization)
   * @param key - Storage key
   * @param value - Raw string value
   */
  async setRaw(key: string, value: string): Promise<void> {
    await this.adapter.setItem(key, value);
  }

  /**
   * Check if key exists in storage
   * @param key - Storage key
   * @returns True if key exists
   */
  async has(key: string): Promise<boolean> {
    const value = await this.adapter.getItem(key);
    return value !== null;
  }
}

/**
 * Create storage service with custom adapter
 * @param adapter - Optional storage adapter
 * @returns StorageService instance
 */
export function createStorageService(adapter?: StorageAdapter): StorageService {
  return new StorageService(adapter);
}

// Export singleton instance using localStorage
export const storageService = new StorageService();

// Export adapters for custom implementations
export { LocalStorageAdapter, MemoryStorageAdapter };
