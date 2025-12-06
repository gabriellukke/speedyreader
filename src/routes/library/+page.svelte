<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { libraryStore } from '$lib/stores/libraryStore';
  import { readerStore } from '$lib/stores/readerStore';
  import { dateService } from '$lib/services/dateService';
  import type { LibraryItem } from '$lib/types';
  import { t } from '$lib/i18n';

  let items = $state<LibraryItem[]>([]);

  onMount(() => {
    libraryStore.loadFromLocalStorage();
    const unsubscribe = libraryStore.subscribe((state) => {
      items = state;
    });

    return unsubscribe;
  });

  const handleRead = (item: LibraryItem) => {
    readerStore.setCurrentText(item.title, item.content);
    goto('/read');
  };

  const handleDelete = (id: string) => {
    if (confirm($t('library.deleteConfirm'))) {
      libraryStore.deleteItem(id);
    }
  };

  const formatDate = (timestamp: number) => {
    return dateService.formatDate(timestamp);
  };
</script>

<div class="container mx-auto px-4 py-8 max-w-2xl">
  <div class="flex items-center justify-between mb-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        {$t('library.title')}
      </h1>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
        {items.length}
        {items.length === 1 ? 'item' : 'items'}
      </p>
    </div>
    <a
      href="/"
      class="px-4 py-2 rounded-md bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors cursor-pointer"
    >
      {$t('home.addNew')}
    </a>
  </div>

  {#if items.length === 0}
    <div
      class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-12 text-center"
    >
      <div
        class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 mb-4"
      >
        <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-1">
        {$t('library.empty')}
      </h3>
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
        {$t('library.emptyDescription')}
      </p>
      <a
        href="/"
        class="inline-block px-4 py-2 rounded-md bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors cursor-pointer"
      >
        {$t('library.goHome')}
      </a>
    </div>
  {:else}
    <div class="space-y-3">
      {#each items as item (item.id)}
        <div
          class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
        >
          <div class="flex items-center justify-between gap-4">
            <div class="min-w-0 flex-1">
              <h3 class="font-medium text-gray-900 dark:text-white truncate">
                {item.title}
              </h3>
              <div class="flex gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>{item.wordCount} {$t('library.words')}</span>
                <span>{formatDate(item.createdAt)}</span>
              </div>
            </div>
            <div class="flex gap-2">
              <button
                onclick={() => handleRead(item)}
                class="px-3 py-1.5 rounded-md bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors cursor-pointer"
              >
                {$t('library.read')}
              </button>
              <button
                onclick={() => handleDelete(item.id)}
                class="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                aria-label={$t('library.delete')}
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
