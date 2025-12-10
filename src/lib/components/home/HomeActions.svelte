<script lang="ts">
  import { goto } from '$app/navigation';
  import { readerStore } from '$lib/stores/readerStore';
  import { libraryStore } from '$lib/stores/libraryStore';
  import { textService } from '$lib/services/textService';
  import { toastStore } from '$lib/stores/toastStore';
  import { t } from '$lib/i18n';

  let { title, content, onClearForm } = $props<{
    title: string;
    content: string;
    onClearForm?: () => void;
  }>();

  const handleReadNow = () => {
    const validation = textService.validateText(content);
    if (!validation.isValid) {
      toastStore.show(validation.error || $t('home.emptyText'), 'error');
      return;
    }
    readerStore.setCurrentText(title || 'Untitled', content);
    goto('/read');
  };

  const handleSaveToLibrary = () => {
    const validation = textService.validateText(content);
    if (!validation.isValid) {
      toastStore.show(validation.error || $t('home.emptyText'), 'error');
      return;
    }
    libraryStore.addItem({
      title: title || 'Untitled',
      content: content
    });
    toastStore.show($t('reader.textSaved'), 'success');
    onClearForm?.();
  };
</script>

<div class="flex gap-3 pt-2">
  <button
    onclick={handleReadNow}
    class="flex-1 px-4 py-2.5 rounded-md bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors cursor-pointer"
  >
    {$t('home.startReading')}
  </button>
  <button
    onclick={handleSaveToLibrary}
    class="px-4 py-2.5 rounded-md border border-border bg-secondary text-secondary-foreground font-medium text-sm hover:bg-secondary/80 transition-colors cursor-pointer"
  >
    {$t('reader.saveToLibrary')}
  </button>
</div>
