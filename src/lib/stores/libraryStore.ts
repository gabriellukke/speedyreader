import { writable } from 'svelte/store';
import type { LibraryItem } from '$lib/types';
import { storageService } from '$lib/services/storageService';
import { textService } from '$lib/services/textService';
import { dateService } from '$lib/services/dateService';

const STORAGE_KEY = 'speedyreader-library';

function createLibraryStore() {
  const { subscribe, set, update } = writable<LibraryItem[]>([]);

  return {
    subscribe,
    loadFromLocalStorage: async () => {
      if (typeof window === 'undefined') return;
      try {
        const stored = await storageService.get<LibraryItem[]>(STORAGE_KEY);
        if (stored) {
          set(stored);
        }
      } catch (e) {
        console.error('Failed to load library from storage:', e);
      }
    },
    saveToLocalStorage: async (items: LibraryItem[]) => {
      if (typeof window === 'undefined') return;
      try {
        await storageService.set(STORAGE_KEY, items);
        set(items);
      } catch (e) {
        console.error('Failed to save library to storage:', e);
      }
    },
    addItem: (item: Omit<LibraryItem, 'id' | 'createdAt' | 'wordCount'>) => {
      update((items) => {
        const newItem: LibraryItem = {
          ...item,
          id: crypto.randomUUID(),
          createdAt: dateService.now(),
          wordCount: textService.countWords(item.content)
        };
        const newItems = [newItem, ...items];
        if (typeof window !== 'undefined') {
          storageService.set(STORAGE_KEY, newItems);
        }
        return newItems;
      });
    },
    deleteItem: (id: string) => {
      update((items) => {
        const newItems = items.filter((item) => item.id !== id);
        if (typeof window !== 'undefined') {
          storageService.set(STORAGE_KEY, newItems);
        }
        return newItems;
      });
    }
  };
}

export const libraryStore = createLibraryStore();
