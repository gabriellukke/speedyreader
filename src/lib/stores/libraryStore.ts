import { writable } from 'svelte/store';
import type { LibraryItem } from '$lib/types';

const STORAGE_KEY = 'speedyreader-library';

function createLibraryStore() {
	const { subscribe, set, update } = writable<LibraryItem[]>([]);

	return {
		subscribe,
		loadFromLocalStorage: () => {
			if (typeof window === 'undefined') return;
			try {
				const stored = localStorage.getItem(STORAGE_KEY);
				if (stored) {
					set(JSON.parse(stored));
				}
			} catch (e) {
				console.error('Failed to load library from localStorage:', e);
			}
		},
		saveToLocalStorage: (items: LibraryItem[]) => {
			if (typeof window === 'undefined') return;
			try {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
				set(items);
			} catch (e) {
				console.error('Failed to save library to localStorage:', e);
			}
		},
		addItem: (item: Omit<LibraryItem, 'id' | 'createdAt' | 'wordCount'>) => {
			update((items) => {
				const newItem: LibraryItem = {
					...item,
					id: crypto.randomUUID(),
					createdAt: Date.now(),
					wordCount: item.content.trim().split(/\s+/).length
				};
				const newItems = [newItem, ...items];
				if (typeof window !== 'undefined') {
					localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
				}
				return newItems;
			});
		},
		deleteItem: (id: string) => {
			update((items) => {
				const newItems = items.filter((item) => item.id !== id);
				if (typeof window !== 'undefined') {
					localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
				}
				return newItems;
			});
		}
	};
}

export const libraryStore = createLibraryStore();
