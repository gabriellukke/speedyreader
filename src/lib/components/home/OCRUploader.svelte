<script lang="ts">
  import { onMount } from 'svelte';
  import { SUPPORTED_LANGUAGES } from '$lib/utils/ocrUtils';
  import ImageCropper from '$lib/components/ImageCropper.svelte';
  import { ocrService } from '$lib/services/ocrService';
  import { storageService } from '$lib/services/storageService';
  import type { OCRProgress } from '$lib/services/ocrService';
  import { t } from '$lib/i18n';
  import { toastStore } from '$lib/stores/toastStore';
  import {
    isNativePlatform,
    takePhoto,
    selectPhotoFromGallery,
    hapticFeedback
  } from '$lib/utils/capacitorUtils';
  import { ImpactStyle } from '@capacitor/haptics';

  let { onTextExtracted } = $props<{
    onTextExtracted: (text: string, shouldAppend: boolean) => void;
  }>();

  let isProcessingOCR = $state(false);
  let ocrProgress = $state<OCRProgress | null>(null);
  let fileInput = $state<HTMLInputElement | undefined>(undefined);
  let cameraInput = $state<HTMLInputElement | undefined>(undefined);
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

  const processOCR = async (file: File) => {
    isProcessingOCR = true;
    ocrProgress = { status: 'initializing', progress: 0 };

    try {
      const result = await ocrService.processImage(file, selectedLanguage, (progress) => {
        ocrProgress = progress;
      });

      if (result.success && result.text) {
        onTextExtracted(result.text, appendOCRText);
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

  const openFileSelector = async () => {
    hapticFeedback(ImpactStyle.Light);

    if (isNativePlatform()) {
      const file = await selectPhotoFromGallery();
      if (file) {
        pendingImageFile = file;
        showCropper = true;
      }
    } else {
      fileInput?.click();
    }
  };

  const openCamera = async () => {
    hapticFeedback(ImpactStyle.Medium);

    if (isNativePlatform()) {
      const file = await takePhoto();
      if (file) {
        pendingImageFile = file;
        showCropper = true;
      }
    } else {
      cameraInput?.click();
    }
  };
</script>

<div class="bg-card text-card-foreground rounded-lg border border-border p-5">
  <h3 class="font-medium text-foreground mb-4">{$t('home.ocrSection')}</h3>

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
        <label for="language" class="block text-sm text-muted-foreground mb-1.5">
          {$t('home.ocrLanguage')}
        </label>
        <select
          id="language"
          bind:value={selectedLanguage}
          disabled={isProcessingOCR}
          class="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground cursor-pointer disabled:opacity-50"
        >
          {#each SUPPORTED_LANGUAGES as lang}
            <option value={lang.code}>{lang.name}</option>
          {/each}
        </select>
      </div>

      <div class="flex items-end pb-0.5">
        <label class="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground">
          <input
            type="checkbox"
            bind:checked={appendOCRText}
            disabled={isProcessingOCR}
            class="w-4 h-4 rounded border-input text-primary focus:ring-ring"
          />
          {$t('home.appendText')}
        </label>
      </div>
    </div>

    <div class="flex gap-3">
      <button
        onclick={openCamera}
        disabled={isProcessingOCR}
        class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md border border-border bg-secondary text-secondary-foreground font-medium text-sm hover:bg-secondary/80 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
        class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md border border-border bg-secondary text-secondary-foreground font-medium text-sm hover:bg-secondary/80 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
          <span class="text-muted-foreground">
            {ocrProgress.status === 'recognizing text'
              ? $t('home.extracting')
              : $t('home.loadingOCR')}
          </span>
          <span class="font-medium text-foreground">
            {Math.round(ocrProgress.progress * 100)}%
          </span>
        </div>
        <div class="w-full bg-muted rounded-full h-1.5">
          <div
            class="bg-primary h-1.5 rounded-full transition-all duration-300"
            style="width: {ocrProgress.progress * 100}%"
          ></div>
        </div>
      </div>
    {/if}
  </div>
</div>

{#if showCropper && pendingImageFile}
  <ImageCropper
    imageFile={pendingImageFile}
    onCrop={handleCropComplete}
    onCancel={handleCropCancel}
  />
{/if}
