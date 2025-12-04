<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { libraryStore } from '$lib/stores/libraryStore';
  import { readerStore } from '$lib/stores/readerStore';
  import { dateService } from '$lib/services/dateService';
  import type { LibraryItem } from '$lib/types';

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
    if (confirm('Are you sure you want to delete this item?')) {
      libraryStore.deleteItem(id);
    }
  };

  const formatDate = (timestamp: number) => {
    return dateService.formatDate(timestamp);
  };
</script>

<div
  class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800"
>
  <div class="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8 md:mb-12">
      <h1 class="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white">Library</h1>
      <a
        href="/"
        class="px-4 py-2 md:px-6 md:py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors shadow-md text-sm md:text-base"
      >
        + Add New
      </a>
    </div>

    <!-- Library Items -->
    {#if items.length === 0}
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12 text-center">
        <div class="text-gray-400 dark:text-gray-500 mb-4">
          <svg
            class="w-16 h-16 md:w-20 md:h-20 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
        <h3 class="text-xl md:text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Your library is empty
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          Save texts from the home page to access them later
        </p>
        <a
          href="/"
          class="inline-block px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
        >
          Go to Home
        </a>
      </div>
    {:else}
      <div class="grid gap-4 md:gap-6">
        {#each items as item (item.id)}
          <div
            class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 md:p-6 hover:shadow-xl transition-shadow"
          >
            <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div class="flex-1 min-w-0">
                <h3
                  class="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-2 truncate"
                >
                  {item.title}
                </h3>
                <div
                  class="flex flex-wrap gap-3 md:gap-4 text-xs md:text-sm text-gray-600 dark:text-gray-400"
                >
                  <span class="flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                    {item.wordCount} words
                  </span>
                  <span class="flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {formatDate(item.createdAt)}
                  </span>
                </div>
              </div>
              <div class="flex gap-2 sm:gap-3">
                <button
                  onclick={() => handleRead(item)}
                  class="px-4 py-2 md:px-5 md:py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors text-sm md:text-base"
                >
                  Read
                </button>
                <button
                  onclick={() => handleDelete(item.id)}
                  class="px-4 py-2 md:px-5 md:py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors text-sm md:text-base"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
