import { writable } from 'svelte/store';

interface ReaderState {
  currentTitle: string;
  currentText: string;
}

function createReaderStore() {
  const { subscribe, set, update } = writable<ReaderState>({
    currentTitle: '',
    currentText: ''
  });

  return {
    subscribe,
    setCurrentText: (title: string, text: string) => {
      set({ currentTitle: title, currentText: text });
    },
    clearCurrentText: () => {
      set({ currentTitle: '', currentText: '' });
    }
  };
}

export const readerStore = createReaderStore();
