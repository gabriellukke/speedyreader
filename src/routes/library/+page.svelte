<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { libraryStore } from '$lib/stores/libraryStore';
  import { readerStore } from '$lib/stores/readerStore';
  import { dateService } from '$lib/services/dateService';
  import { toastStore } from '$lib/stores/toastStore';
  import type { LibraryItem } from '$lib/types';
  import { t } from '$lib/i18n';
  import PageHeader from '$lib/components/PageHeader.svelte';
  import EmptyState from '$lib/components/EmptyState.svelte';
  import LibraryItemCard from '$lib/components/library/LibraryItemCard.svelte';
  import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';

  let items = $state<LibraryItem[]>([]);
  let showDeleteDialog = $state(false);
  let itemToDelete = $state<LibraryItem | null>(null);

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

  const handleDeleteClick = (item: LibraryItem) => {
    itemToDelete = item;
    showDeleteDialog = true;
  };

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      libraryStore.deleteItem(itemToDelete.id);
      toastStore.show($t('library.itemDeleted'), 'success');
      itemToDelete = null;
    }
    showDeleteDialog = false;
  };

  const formatDate = (timestamp: number) => {
    return dateService.formatDate(timestamp);
  };

  const emptyStateIcon = `
    <svg class="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  `;
</script>

<div class="min-h-screen container mx-auto px-4 py-8 max-w-2xl safe-area-content">
  <PageHeader
    title={$t('library.title')}
    subtitle="{items.length} {items.length === 1 ? 'item' : 'items'}"
    action={{ label: $t('home.addNew'), href: '/' }}
  />

  {#if items.length === 0}
    <EmptyState
      icon={emptyStateIcon}
      title={$t('library.empty')}
      description={$t('library.emptyDescription')}
      actionLabel={$t('library.goHome')}
      actionHref="/"
    />
  {:else}
    <div class="space-y-3">
      {#each items as item (item.id)}
        <LibraryItemCard {item} onRead={handleRead} onDelete={handleDeleteClick} {formatDate} />
      {/each}
    </div>
  {/if}
</div>

<ConfirmDialog
  bind:open={showDeleteDialog}
  title={$t('library.delete')}
  description={$t('library.deleteConfirm')}
  confirmLabel={$t('library.delete')}
  cancelLabel={$t('home.cancel')}
  onConfirm={handleDeleteConfirm}
  destructive={true}
/>
