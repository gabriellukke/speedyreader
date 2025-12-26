<script lang="ts">
  import { pdfService } from '$lib/services/pdfService';
  import type { PDFProgress, PDFDocument } from '$lib/services/pdfService';
  import PDFPreview from './PDFPreview.svelte';
  import { t } from '$lib/i18n';
  import { toastStore } from '$lib/stores/toastStore';
  import { hapticFeedback } from '$lib/utils/capacitorUtils';
  import { ImpactStyle } from '@capacitor/haptics';

  let { onTextExtracted } = $props<{
    onTextExtracted: (text: string, title: string) => void;
  }>();

  let isProcessing = $state(false);
  let pdfProgress = $state<PDFProgress | null>(null);
  let fileInput = $state<HTMLInputElement | undefined>(undefined);
  let pdfDocument = $state<PDFDocument | null>(null);
  let currentFile = $state<File | null>(null);

  const processPDF = async (file: File) => {
    isProcessing = true;
    pdfProgress = { currentPage: 0, totalPages: 0, status: 'initializing' };
    currentFile = file;

    try {
      const result = await pdfService.parseDocument(file, (progress) => {
        pdfProgress = progress;
      });

      if (result.success && result.document) {
        pdfDocument = result.document;
      } else {
        toastStore.show(result.error || $t('errors.pdfFailed'), 'error');
      }
    } catch (error) {
      console.error('PDF Error:', error);
      toastStore.show($t('errors.pdfFailed'), 'error');
    } finally {
      isProcessing = false;
      pdfProgress = null;
    }
  };

  const handleSelection = (startPage: number, endPage: number, title: string) => {
    if (!pdfDocument) return;

    const text = pdfService.extractTextFromPages(pdfDocument.pages, startPage, endPage);
    onTextExtracted(text, title);
    toastStore.show($t('home.pdfExtracted'), 'success');
    pdfDocument = null;
    currentFile = null;
  };

  const handleCancel = () => {
    pdfDocument = null;
    currentFile = null;
  };

  const handlePDFUpload = (event: Event) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      if (!pdfService.isPDF(file)) {
        toastStore.show($t('errors.invalidPDF'), 'error');
        input.value = '';
        return;
      }
      processPDF(file);
    }
    input.value = '';
  };

  const openFileSelector = async () => {
    hapticFeedback(ImpactStyle.Light);
    fileInput?.click();
  };
</script>

<div class="bg-card text-card-foreground rounded-lg border border-border p-5">
  <h3 class="font-medium text-foreground mb-4">{$t('home.pdfSection')}</h3>

  <input
    type="file"
    accept="application/pdf,.pdf"
    bind:this={fileInput}
    onchange={handlePDFUpload}
    class="hidden"
  />

  <div class="space-y-4">
    <button
      onclick={openFileSelector}
      disabled={isProcessing}
      class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md border border-border bg-secondary text-secondary-foreground font-medium text-sm hover:bg-secondary/80 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
      </svg>
      {$t('home.uploadPDF')}
    </button>

    {#if isProcessing && pdfProgress}
      <div class="pt-2">
        <div class="flex items-center justify-between mb-1.5 text-sm">
          <span class="text-muted-foreground">
            {$t('home.loadingPDF')}
          </span>
          <span class="font-medium text-foreground">
            {pdfProgress.currentPage}/{pdfProgress.totalPages}
          </span>
        </div>
        <div class="w-full bg-muted rounded-full h-1.5">
          <div
            class="bg-primary h-1.5 rounded-full transition-all duration-300"
            style="width: {pdfProgress.totalPages > 0
              ? (pdfProgress.currentPage / pdfProgress.totalPages) * 100
              : 0}%"
          ></div>
        </div>
      </div>
    {/if}
  </div>
</div>

{#if pdfDocument}
  <PDFPreview document={pdfDocument} onSelect={handleSelection} onCancel={handleCancel} />
{/if}
