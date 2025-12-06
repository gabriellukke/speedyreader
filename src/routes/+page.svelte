<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { readerStore } from '$lib/stores/readerStore';
  import { libraryStore } from '$lib/stores/libraryStore';
  import { SUPPORTED_LANGUAGES } from '$lib/utils/ocrUtils';
  import ImageCropper from '$lib/components/ImageCropper.svelte';
  import { ocrService } from '$lib/services/ocrService';
  import { textService } from '$lib/services/textService';
  import { storageService } from '$lib/services/storageService';
  import type { OCRProgress } from '$lib/services/ocrService';
  import { t } from '$lib/i18n';
  import { toastStore } from '$lib/stores/toastStore';

  let title = $state('');
  let content = $state('');
  let isProcessingOCR = $state(false);
  let ocrProgress = $state<OCRProgress | null>(null);
  let fileInput: HTMLInputElement;
  let cameraInput: HTMLInputElement;

  let showCropper = $state(false);
  let pendingImageFile = $state<File | null>(null);
  let selectedLanguage = $state('eng');
  let appendOCRText = $state(false);

  onMount(async () => {
    const savedLanguage = await storageService.getRaw('ocrLanguage');
    if (savedLanguage) {
      selectedLanguage = savedLanguage;
      ocrService.setDefaultLanguage(savedLanguage);
    }
  });

  $effect(() => {
    if (selectedLanguage) {
      storageService.setRaw('ocrLanguage', selectedLanguage);
      ocrService.setDefaultLanguage(selectedLanguage);
    }
  });

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
    title = '';
    content = '';
  };

  const processOCR = async (file: File) => {
    isProcessingOCR = true;
    ocrProgress = { status: 'initializing', progress: 0 };

    try {
      const result = await ocrService.processImage(file, selectedLanguage, (progress) => {
        ocrProgress = progress;
      });

      if (result.success && result.text) {
        const extractedText = result.text;
        if (appendOCRText && content) {
          content = content + '\n\n' + extractedText;
        } else {
          content = extractedText;
        }
        if (!title) {
          title = 'Image Text';
        }
      } else {
        toastStore.show(result.error || $t('errors.noTextFound'), 'error');
      }
    } catch (error) {
      console.error('OCR Error:', error);
      toastStore.show($t('errors.ocrFailed'), 'error');
    } finally {
      isProcessingOCR = false;
      ocrProgress = null;
    }
  };

  const handleImageUpload = (event: Event) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toastStore.show($t('errors.invalidImage'), 'error');
        input.value = '';
        return;
      }
      pendingImageFile = file;
      showCropper = true;
    }
    input.value = '';
  };

  const handleCropComplete = async (croppedFile: File) => {
    showCropper = false;
    pendingImageFile = null;
    await processOCR(croppedFile);
  };

  const handleCropCancel = () => {
    showCropper = false;
    pendingImageFile = null;
  };

  const openFileSelector = () => {
    fileInput.click();
  };

  const openCamera = () => {
    cameraInput.click();
  };
</script>

<div class="container mx-auto px-4 py-8 max-w-2xl">
  <div class="text-center mb-8">
    <h1 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
      {$t('home.title')}
    </h1>
    <p class="text-gray-600 dark:text-gray-400">
      {$t('home.subtitle')}
    </p>
  </div>

  <div class="space-y-6">
    <!-- Text Input Section -->
    <div
      class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5"
    >
      <div class="space-y-4">
        <div>
          <label
            for="title"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
          >
            {$t('home.titleLabel')}
          </label>
          <input
            id="title"
            type="text"
            bind:value={title}
            placeholder={$t('home.titlePlaceholder')}
            class="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent text-sm"
          />
        </div>

        <div>
          <label
            for="content"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
          >
            {$t('home.contentLabel')}
          </label>
          <textarea
            id="content"
            bind:value={content}
            placeholder={$t('home.inputPlaceholder')}
            rows="8"
            class="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent resize-none text-sm"
            disabled={isProcessingOCR}
          ></textarea>
        </div>

        <div class="flex gap-3 pt-2">
          <button
            onclick={handleReadNow}
            class="flex-1 px-4 py-2.5 rounded-md bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors cursor-pointer"
          >
            {$t('home.startReading')}
          </button>
          <button
            onclick={handleSaveToLibrary}
            class="px-4 py-2.5 rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            {$t('reader.saveToLibrary')}
          </button>
        </div>
      </div>
    </div>

    <!-- OCR Section -->
    <div
      class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5"
    >
      <h3 class="font-medium text-gray-900 dark:text-white mb-4">{$t('home.ocrSection')}</h3>

      <input
        type="file"
        accept="image/*"
        bind:this={fileInput}
        onchange={handleImageUpload}
        class="hidden"
      />
      <input
        type="file"
        accept="image/*"
        capture="environment"
        bind:this={cameraInput}
        onchange={handleImageUpload}
        class="hidden"
      />

      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label for="language" class="block text-sm text-gray-600 dark:text-gray-400 mb-1.5">
              {$t('home.ocrLanguage')}
            </label>
            <select
              id="language"
              bind:value={selectedLanguage}
              disabled={isProcessingOCR}
              class="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm cursor-pointer disabled:opacity-50"
            >
              {#each SUPPORTED_LANGUAGES as lang}
                <option value={lang.code}>{lang.name}</option>
              {/each}
            </select>
          </div>

          <div class="flex items-end pb-0.5">
            <label
              class="flex items-center gap-2 cursor-pointer text-sm text-gray-600 dark:text-gray-400"
            >
              <input
                type="checkbox"
                bind:checked={appendOCRText}
                disabled={isProcessingOCR}
                class="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-gray-900 dark:focus:ring-white"
              />
              {$t('home.appendText')}
            </label>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            onclick={openCamera}
            disabled={isProcessingOCR}
            class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {$t('home.takePhoto')}
          </button>
          <button
            onclick={openFileSelector}
            disabled={isProcessingOCR}
            class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            {$t('home.uploadImage')}
          </button>
        </div>

        {#if isProcessingOCR && ocrProgress}
          <div class="pt-2">
            <div class="flex items-center justify-between mb-1.5 text-sm">
              <span class="text-gray-600 dark:text-gray-400">
                {ocrProgress.status === 'recognizing text'
                  ? $t('home.extracting')
                  : $t('home.loadingOCR')}
              </span>
              <span class="font-medium text-gray-900 dark:text-white">
                {Math.round(ocrProgress.progress * 100)}%
              </span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div
                class="bg-gray-900 dark:bg-white h-1.5 rounded-full transition-all duration-300"
                style="width: {ocrProgress.progress * 100}%"
              ></div>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>

  <p class="text-center text-xs text-gray-500 dark:text-gray-500 mt-8">
    {$t('home.footer')}
  </p>
</div>

{#if showCropper && pendingImageFile}
  <ImageCropper
    imageFile={pendingImageFile}
    onCrop={handleCropComplete}
    onCancel={handleCropCancel}
  />
{/if}
