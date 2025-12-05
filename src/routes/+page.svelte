<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { readerStore } from '$lib/stores/readerStore';
  import { libraryStore } from '$lib/stores/libraryStore';
  import { SUPPORTED_LANGUAGES } from '$lib/utils/ocrUtils';
  import ImageCropper from '$lib/components/ImageCropper.svelte';
  import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte';
  import { ocrService } from '$lib/services/ocrService';
  import { textService } from '$lib/services/textService';
  import { storageService } from '$lib/services/storageService';
  import type { OCRProgress } from '$lib/services/ocrService';
  import { t } from '$lib/i18n';

  let title = $state('');
  let content = $state('');
  let showSuccess = $state(false);
  let isProcessingOCR = $state(false);
  let ocrProgress = $state<OCRProgress | null>(null);
  let fileInput: HTMLInputElement;
  let cameraInput: HTMLInputElement;

  let showCropper = $state(false);
  let pendingImageFile = $state<File | null>(null);
  let selectedLanguage = $state('eng');
  let appendOCRText = $state(false);

  // Load saved language preference
  onMount(async () => {
    const savedLanguage = await storageService.getRaw('ocrLanguage');
    if (savedLanguage) {
      selectedLanguage = savedLanguage;
      ocrService.setDefaultLanguage(savedLanguage);
    }
  });

  // Save language preference when it changes
  $effect(() => {
    if (selectedLanguage) {
      storageService.setRaw('ocrLanguage', selectedLanguage);
      ocrService.setDefaultLanguage(selectedLanguage);
    }
  });

  const handleReadNow = () => {
    const validation = textService.validateText(content);
    if (!validation.isValid) {
      alert(validation.error || $t('home.emptyText'));
      return;
    }
    readerStore.setCurrentText(title || 'Untitled', content);
    goto('/read');
  };

  const handleSaveToLibrary = () => {
    const validation = textService.validateText(content);
    if (!validation.isValid) {
      alert(validation.error || $t('home.emptyText'));
      return;
    }
    libraryStore.addItem({
      title: title || 'Untitled',
      content: content
    });
    showSuccess = true;
    setTimeout(() => {
      showSuccess = false;
    }, 3000);
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
        // Replace or append based on user preference
        if (appendOCRText && content) {
          content = content + '\n\n' + extractedText;
        } else {
          content = extractedText;
        }
        if (!title) {
          title = 'Image Text';
        }
      } else {
        alert(result.error || $t('errors.noTextFound'));
      }
    } catch (error) {
      console.error('OCR Error:', error);
      alert($t('errors.ocrFailed'));
    } finally {
      isProcessingOCR = false;
      ocrProgress = null;
    }
  };

  const handleImageUpload = (event: Event) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    console.log('handleImageUpload called', { file, hasFile: !!file });
    if (file) {
      console.log('File details:', { name: file.name, type: file.type, size: file.size });
      if (!file.type.startsWith('image/')) {
        alert($t('errors.invalidImage'));
        input.value = '';
        return;
      }
      pendingImageFile = file;
      showCropper = true;
      console.log('Set showCropper to true');
    }
    input.value = '';
  };

  const handleCropComplete = async (croppedFile: File) => {
    console.log('Crop complete, processing OCR...');
    showCropper = false;
    pendingImageFile = null;
    await processOCR(croppedFile);
  };

  const handleCropCancel = () => {
    console.log('Crop cancelled');
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

<div
  class="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800"
>
  <div class="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
    <!-- Header -->
    <div class="text-center mb-8 md:mb-12">
      <div class="flex justify-end mb-4">
        <LanguageSwitcher />
      </div>
      <h1 class="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4">
        {$t('home.title')}
      </h1>
      <p class="text-base md:text-lg text-gray-600 dark:text-gray-300">
        {$t('home.subtitle')}
      </p>
    </div>

    <!-- Navigation -->
    <div class="flex gap-3 mb-6 md:mb-8 justify-center">
      <a
        href="/library"
        class="px-4 py-2 md:px-6 md:py-3 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors font-medium shadow-md text-sm md:text-base"
      >
        {$t('nav.library')}
      </a>
    </div>

    <!-- Success Message -->
    {#if showSuccess}
      <div
        class="mb-6 p-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg text-center font-medium"
      >
        {$t('reader.textSaved')}
      </div>
    {/if}

    <!-- Main Content -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8">
      <!-- Title Input -->
      <div class="mb-6">
        <label
          for="title"
          class="block text-sm md:text-base font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {$t('home.titleLabel')}
        </label>
        <input
          id="title"
          type="text"
          bind:value={title}
          placeholder={$t('home.titlePlaceholder')}
          class="w-full px-4 py-3 md:py-3.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base md:text-lg"
        />
      </div>

      <!-- Content Textarea -->
      <div class="mb-6">
        <label
          for="content"
          class="block text-sm md:text-base font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {$t('home.contentLabel')}
        </label>
        <textarea
          id="content"
          bind:value={content}
          placeholder={$t('home.inputPlaceholder')}
          rows="12"
          class="w-full px-4 py-3 md:py-3.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-base md:text-lg"
          disabled={isProcessingOCR}
        ></textarea>
      </div>

      <!-- Hidden File Inputs -->
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

      <!-- OCR Buttons -->
      <div class="mb-6">
        <div class="flex items-center gap-2 mb-3">
          <div class="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
          <span class="text-sm text-gray-500 dark:text-gray-400">{$t('home.ocrSection')}</span>
          <div class="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
        </div>

        <!-- Language Selector -->
        <div class="mb-3">
          <label
            for="language"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            {$t('home.ocrLanguage')}
          </label>
          <select
            id="language"
            bind:value={selectedLanguage}
            disabled={isProcessingOCR}
            class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {#each SUPPORTED_LANGUAGES as lang}
              <option value={lang.code}>
                {lang.name}
              </option>
            {/each}
          </select>
        </div>

        <!-- Append Option -->
        <div class="mb-3">
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              bind:checked={appendOCRText}
              disabled={isProcessingOCR}
              class="w-4 h-4 text-blue-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <span class="text-sm text-gray-700 dark:text-gray-300">
              {$t('home.appendText')}
            </span>
          </label>
        </div>

        <div class="flex flex-col sm:flex-row gap-3">
          <button
            onclick={openCamera}
            disabled={isProcessingOCR}
            class="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium transition-colors text-sm md:text-base"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            class="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium transition-colors text-sm md:text-base"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {$t('home.uploadImage')}
          </button>
        </div>
      </div>

      <!-- OCR Progress -->
      {#if isProcessingOCR && ocrProgress}
        <div class="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-blue-900 dark:text-blue-200">
              {ocrProgress.status === 'recognizing text' ? $t('home.extracting') : $t('home.loadingOCR')}
            </span>
            <span class="text-sm font-bold text-blue-900 dark:text-blue-200">
              {Math.round(ocrProgress.progress * 100)}%
            </span>
          </div>
          <div class="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
            <div
              class="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
              style="width: {ocrProgress.progress * 100}%"
            ></div>
          </div>
        </div>
      {/if}

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row gap-3 md:gap-4">
        <button
          onclick={handleReadNow}
          class="flex-1 px-6 py-3.5 md:py-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base md:text-lg shadow-lg hover:shadow-xl transition-all"
        >
          {$t('home.startReading')}
        </button>
        <button
          onclick={handleSaveToLibrary}
          class="flex-1 px-6 py-3.5 md:py-4 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-semibold text-base md:text-lg shadow-lg hover:shadow-xl transition-all"
        >
          {$t('reader.saveToLibrary')}
        </button>
      </div>
    </div>

    <!-- Footer -->
    <div class="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
      <p>{$t('home.footer')}</p>
    </div>
  </div>
</div>

<!-- Image Cropper Modal -->
{#if showCropper && pendingImageFile}
  <ImageCropper
    imageFile={pendingImageFile}
    onCrop={handleCropComplete}
    onCancel={handleCropCancel}
  />
{/if}
