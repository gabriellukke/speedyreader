<script lang="ts">
  import type { LibraryItem } from '$lib/types';
  import { t } from '$lib/i18n';

  let { item, onRead, onDelete, formatDate } = $props<{
    item: LibraryItem;
    onRead: (item: LibraryItem) => void;
    onDelete: (item: LibraryItem) => void;
    formatDate: (timestamp: number) => string;
  }>();
</script>

<div
  class="bg-card text-card-foreground rounded-lg border border-border p-4 hover:border-ring transition-colors"
>
  <div class="flex items-center justify-between gap-4">
    <div class="min-w-0 flex-1">
      <h3 class="font-medium text-foreground truncate">
        {item.title}
      </h3>
      <div class="flex gap-3 text-xs text-muted-foreground mt-1">
        <span>{item.wordCount} {$t('library.words')}</span>
        <span>{formatDate(item.createdAt)}</span>
      </div>
    </div>
    <div class="flex gap-2">
      <button
        onclick={() => onRead(item)}
        class="px-3 py-1.5 rounded-md bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors cursor-pointer"
      >
        {$t('library.read')}
      </button>
      <button
        onclick={() => onDelete(item)}
        class="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
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
