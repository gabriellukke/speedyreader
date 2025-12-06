<script lang="ts">
  import { onMount } from 'svelte';
  import { imageService } from '$lib/services/imageService';
  import type { SelectionRect, ImageDimensions } from '$lib/services/imageService';

  interface Props {
    imageFile: File;
    onCrop: (croppedFile: File) => void;
    onCancel: () => void;
  }

  let { imageFile, onCrop, onCancel }: Props = $props();

  let canvasElement: HTMLCanvasElement | undefined;
  let ctx: CanvasRenderingContext2D | null = null;
  let img: HTMLImageElement;
  let imageLoaded = $state(false);

  let isSelecting = $state(false);
  let startX = $state(0);
  let startY = $state(0);
  let currentX = $state(0);
  let currentY = $state(0);
  let hasSelection = $state(false);

  let selectionRect = $state<SelectionRect>({ x: 0, y: 0, width: 0, height: 0 });
  let loadError = $state(false);
  let objectURL = '';
  let canvasDimensions = $state<ImageDimensions>({ width: 0, height: 0 });

  $effect(() => {
    if (canvasElement && !imageLoaded && !loadError && !objectURL) {
      loadImage();
    }
  });

  onMount(() => {
    return () => {
      if (objectURL) {
        imageService.revokeObjectURL(objectURL);
      }
    };
  });

  const loadImage = async () => {
    try {
      if (!canvasElement) {
        loadError = true;
        return;
      }

      ctx = canvasElement.getContext('2d');

      if (!ctx) {
        loadError = true;
        return;
      }

      const result = await imageService.loadImage(imageFile);

      if (!result.success || !result.image || !result.dimensions) {
        loadError = true;
        return;
      }

      img = result.image;

      const maxWidth = 800;
      const maxHeight = 600;
      const scaledDimensions = imageService.calculateScaledDimensions(
        result.dimensions,
        maxWidth,
        maxHeight
      );

      canvasElement.width = scaledDimensions.width;
      canvasElement.height = scaledDimensions.height;
      canvasDimensions = scaledDimensions;

      drawImage();
      imageLoaded = true;
    } catch (error) {
      console.error('Error in loadImage:', error);
      loadError = true;
    }
  };

  const drawImage = () => {
    if (!ctx || !canvasElement) return;
    imageService.drawImageWithSelection(ctx, img, canvasDimensions);
  };

  const drawSelection = () => {
    if (!ctx || !canvasElement) return;

    if (isSelecting || hasSelection) {
      const rect = imageService.calculateSelectionRect(startX, startY, currentX, currentY);
      selectionRect = rect;
      imageService.drawImageWithSelection(ctx, img, canvasDimensions, rect);
    } else {
      drawImage();
    }
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (!canvasElement) return;
    const rect = canvasElement.getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;
    currentX = startX;
    currentY = startY;
    isSelecting = true;
    hasSelection = false;
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isSelecting || !canvasElement) return;
    const rect = canvasElement.getBoundingClientRect();
    currentX = e.clientX - rect.left;
    currentY = e.clientY - rect.top;
    drawSelection();
  };

  const handleMouseUp = () => {
    if (isSelecting) {
      isSelecting = false;
      const rect = imageService.calculateSelectionRect(startX, startY, currentX, currentY);
      hasSelection = imageService.isValidSelection(rect);
      drawSelection();
    }
  };

  const handleTouchStart = (e: TouchEvent) => {
    if (!canvasElement) return;
    e.preventDefault();
    const rect = canvasElement.getBoundingClientRect();
    const touch = e.touches[0];
    startX = touch.clientX - rect.left;
    startY = touch.clientY - rect.top;
    currentX = startX;
    currentY = startY;
    isSelecting = true;
    hasSelection = false;
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isSelecting || !canvasElement) return;
    e.preventDefault();
    const rect = canvasElement.getBoundingClientRect();
    const touch = e.touches[0];
    currentX = touch.clientX - rect.left;
    currentY = touch.clientY - rect.top;
    drawSelection();
  };

  const handleTouchEnd = (e: TouchEvent) => {
    e.preventDefault();
    if (isSelecting) {
      isSelecting = false;
      const rect = imageService.calculateSelectionRect(startX, startY, currentX, currentY);
      hasSelection = imageService.isValidSelection(rect);
      drawSelection();
    }
  };

  const handleExtractText = async () => {
    if (!hasSelection || !ctx || !canvasElement) return;

    const result = await imageService.cropImage(img, selectionRect, canvasDimensions);

    if (result.success && result.file) {
      onCrop(result.file);
    } else {
      console.error('Failed to crop image:', result.error);
    }
  };

  const handleSelectAll = () => {
    if (!canvasElement) return;
    startX = 0;
    startY = 0;
    currentX = canvasElement.width;
    currentY = canvasElement.height;
    hasSelection = true;
    drawSelection();
  };
</script>

<div class="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
  <div
    class="bg-card text-card-foreground rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto"
  >
    <div class="p-4 md:p-6">
      <h3 class="text-xl md:text-2xl font-bold text-foreground mb-2">Select Text Area</h3>
      <p class="text-sm md:text-base text-muted-foreground mb-1">
        Click and drag to select the text you want to extract
      </p>
      <p class="text-xs md:text-sm text-primary mb-4">
        Tip: Selecting a specific area greatly improves accuracy
      </p>

      <div
        class="mb-4 flex justify-center bg-muted rounded-lg p-4 overflow-auto min-h-[300px] items-center"
      >
        <canvas
          bind:this={canvasElement}
          onmousedown={handleMouseDown}
          onmousemove={handleMouseMove}
          onmouseup={handleMouseUp}
          onmouseleave={handleMouseUp}
          ontouchstart={handleTouchStart}
          ontouchmove={handleTouchMove}
          ontouchend={handleTouchEnd}
          class="cursor-crosshair max-w-full shadow-lg"
          class:hidden={!imageLoaded}
        ></canvas>

        {#if loadError}
          <div class="text-center py-12">
            <svg
              class="w-16 h-16 text-destructive mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p class="text-base font-medium text-foreground mb-2">Failed to load image</p>
            <p class="text-sm text-muted-foreground mb-4">Please try a different image</p>
            <button
              onclick={onCancel}
              class="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 font-medium transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        {:else if !imageLoaded}
          <div class="text-center py-12">
            <div class="relative inline-flex">
              <div
                class="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary"
              ></div>
              <div class="absolute inset-0 flex items-center justify-center">
                <svg
                  class="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            <p class="mt-6 text-base font-medium text-foreground">Preparing image...</p>
            <p class="mt-2 text-sm text-muted-foreground">This should only take a moment</p>
          </div>
        {/if}
      </div>

      <div class="flex flex-col sm:flex-row gap-3">
        <button
          onclick={handleSelectAll}
          disabled={!imageLoaded}
          class="px-4 py-2.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors text-sm md:text-base cursor-pointer"
        >
          Select All
        </button>
        <button
          onclick={handleExtractText}
          disabled={!hasSelection}
          class="flex-1 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors text-sm md:text-base cursor-pointer"
        >
          Extract Text from Selection
        </button>
        <button
          onclick={onCancel}
          class="px-6 py-2.5 rounded-lg bg-destructive text-white hover:bg-destructive/90 font-medium transition-colors text-sm md:text-base cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</div>
