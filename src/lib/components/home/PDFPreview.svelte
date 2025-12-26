<script lang="ts">
  import type { PDFDocument } from '$lib/services';
  import { t } from '$lib/i18n';

  let { document, onSelect, onCancel } = $props<{
    document: PDFDocument;
    onSelect: (startPage: number, endPage: number, title: string) => void;
    onCancel: () => void;
  }>();

  let selectedChapters = $state<Set<number>>(new Set([0]));

  const toggleChapter = (index: number) => {
    const newSelected = new Set(selectedChapters);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    selectedChapters = newSelected;
  };

  const selectAll = () => {
    selectedChapters = new Set(document.chapters.map((_, i) => i));
  };

  const selectNone = () => {
    selectedChapters = new Set();
  };

  const handleExtract = () => {
    if (selectedChapters.size === 0) return;

    const selectedIndices = Array.from(selectedChapters).sort((a, b) => a - b);
    const firstChapter = document.chapters[selectedIndices[0]];
    const lastChapter = document.chapters[selectedIndices[selectedIndices.length - 1]];

    const title =
      selectedChapters.size === 1
        ? firstChapter.title
        : selectedChapters.size === document.chapters.length
          ? document.metadata.title || 'Full Document'
          : `${firstChapter.title} - ${lastChapter.title}`;

    onSelect(firstChapter.startPage, lastChapter.endPage, title);
  };

  const totalWords = $derived(
    document.chapters
      .filter((_, i) => selectedChapters.has(i))
      .reduce((sum, ch) => sum + ch.wordCount, 0)
  );

  const estimatedMinutes = $derived(Math.ceil(totalWords / 300));
</script>

<div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
  <div
    class="bg-card text-card-foreground rounded-lg border border-border max-w-2xl w-full max-h-[90vh] flex flex-col"
  >
    <div class="p-5 border-b border-border">
      <h2 class="text-xl font-bold text-foreground mb-1">
        {document.metadata.title}
      </h2>
      {#if document.metadata.author}
        <p class="text-sm text-muted-foreground">
          {$t('pdfPreview.by')}
          {document.metadata.author}
        </p>
      {/if}
      <p class="text-xs text-muted-foreground mt-2">
        {document.metadata.numPages}
        {$t('pdfPreview.pages')} •
        {document.chapters.length}
        {$t('pdfPreview.sections')}
      </p>
    </div>

    <div class="p-5 border-b border-border flex items-center justify-between">
      <div class="text-sm">
        <span class="text-muted-foreground">{$t('pdfPreview.selected')}:</span>
        <span class="font-medium text-foreground ml-1">
          {selectedChapters.size} / {document.chapters.length}
        </span>
        {#if selectedChapters.size > 0}
          <span class="text-muted-foreground ml-3">
            (~{totalWords.toLocaleString()}
            {$t('pdfPreview.words')}, ~{estimatedMinutes}
            {$t('pdfPreview.min')})
          </span>
        {/if}
      </div>
      <div class="flex gap-2">
        <button
          onclick={selectAll}
          class="text-xs px-3 py-1.5 rounded-md border border-border bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
        >
          {$t('pdfPreview.selectAll')}
        </button>
        <button
          onclick={selectNone}
          class="text-xs px-3 py-1.5 rounded-md border border-border bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
        >
          {$t('pdfPreview.selectNone')}
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto p-5">
      <div class="space-y-2">
        {#each document.chapters as chapter, index}
          <button
            onclick={() => toggleChapter(index)}
            class="w-full text-left p-4 rounded-lg border transition-all {selectedChapters.has(
              index
            )
              ? 'border-primary bg-primary/5'
              : 'border-border bg-card hover:bg-muted/50'}"
          >
            <div class="flex items-start gap-3">
              <div
                class="mt-0.5 w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 {selectedChapters.has(
                  index
                )
                  ? 'bg-primary border-primary'
                  : 'border-input bg-background'}"
              >
                {#if selectedChapters.has(index)}
                  <svg class="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24">
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="3"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                {/if}
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-medium text-foreground truncate mb-1">
                  {chapter.title}
                </h3>
                <p class="text-xs text-muted-foreground">
                  {$t('pdfPreview.pages')}
                  {chapter.startPage}–{chapter.endPage} ({chapter.pageCount}
                  {chapter.pageCount === 1 ? $t('pdfPreview.page') : $t('pdfPreview.pages')}) • {chapter.wordCount.toLocaleString()}
                  {$t('pdfPreview.words')}
                </p>
              </div>
            </div>
          </button>
        {/each}
      </div>
    </div>

    <div class="p-5 border-t border-border flex gap-3">
      <button
        onclick={onCancel}
        class="flex-1 px-4 py-2.5 rounded-md border border-border bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-colors"
      >
        {$t('pdfPreview.cancel')}
      </button>
      <button
        onclick={handleExtract}
        disabled={selectedChapters.size === 0}
        class="flex-1 px-4 py-2.5 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {$t('pdfPreview.extract')}
      </button>
    </div>
  </div>
</div>
