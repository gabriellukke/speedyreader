<script lang="ts">
	import { onMount } from 'svelte';

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

	let selectionRect = $state({ x: 0, y: 0, width: 0, height: 0 });
	let loadError = $state(false);
	let objectURL = '';

	// Load image when canvas ref changes
	$effect(() => {
		console.log('Effect triggered', { hasCanvas: !!canvasElement, imageLoaded, loadError, hasObjectURL: !!objectURL });
		if (canvasElement && !imageLoaded && !loadError && !objectURL) {
			console.log('Canvas available, loading image...');
			loadImage();
		}
	});

	onMount(() => {
		console.log('ImageCropper mounted', { hasCanvas: !!canvasElement, imageFile: imageFile.name });

		// Cleanup
		return () => {
			if (objectURL) {
				console.log('Cleaning up object URL');
				URL.revokeObjectURL(objectURL);
			}
		};
	});

	const loadImage = () => {
		try {
			console.log('Starting image load...', imageFile.name, imageFile.type, imageFile.size);

			if (!canvasElement) {
				console.error('Canvas not available');
				loadError = true;
				return;
			}

			img = new Image();
			ctx = canvasElement.getContext('2d');

			if (!ctx) {
				console.error('Failed to get canvas context');
				loadError = true;
				return;
			}

			console.log('Canvas context obtained');

			img.onload = () => {
				console.log('Image loaded successfully:', img.width, 'x', img.height);

				// Scale image to fit canvas while maintaining aspect ratio
				const maxWidth = 800;
				const maxHeight = 600;
				let width = img.width;
				let height = img.height;

				if (width > maxWidth) {
					height = (height * maxWidth) / width;
					width = maxWidth;
				}
				if (height > maxHeight) {
					width = (width * maxHeight) / height;
					height = maxHeight;
				}

				console.log('Canvas size:', width, 'x', height);
				canvasElement.width = width;
				canvasElement.height = height;

				drawImage();
				imageLoaded = true;
				console.log('Image rendering complete');
			};

			img.onerror = (e) => {
				console.error('Failed to load image:', e);
				loadError = true;
			};

			// Create object URL from file
			objectURL = URL.createObjectURL(imageFile);
			console.log('Object URL created:', objectURL);
			img.src = objectURL;
		} catch (error) {
			console.error('Error in loadImage:', error);
			loadError = true;
		}
	};

	const drawImage = () => {
		if (!ctx || !canvasElement) return;
		ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
		ctx.drawImage(img, 0, 0, canvasElement.width, canvasElement.height);
	};

	const drawSelection = () => {
		if (!ctx || !canvasElement) return;

		drawImage();

		if (isSelecting || hasSelection) {
			const x = Math.min(startX, currentX);
			const y = Math.min(startY, currentY);
			const width = Math.abs(currentX - startX);
			const height = Math.abs(currentY - startY);

			// Darken outside selection
			ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
			ctx.fillRect(0, 0, canvasElement.width, y);
			ctx.fillRect(0, y, x, height);
			ctx.fillRect(x + width, y, canvasElement.width - (x + width), height);
			ctx.fillRect(0, y + height, canvasElement.width, canvasElement.height - (y + height));

			// Draw selection border
			ctx.strokeStyle = '#3b82f6';
			ctx.lineWidth = 2;
			ctx.strokeRect(x, y, width, height);

			selectionRect = { x, y, width, height };
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
			hasSelection = Math.abs(currentX - startX) > 10 && Math.abs(currentY - startY) > 10;
			drawSelection();
		}
	};

	// Touch support
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
			hasSelection = Math.abs(currentX - startX) > 10 && Math.abs(currentY - startY) > 10;
			drawSelection();
		}
	};

	const handleExtractText = async () => {
		if (!hasSelection || !ctx || !canvasElement) return;

		// Calculate scale factors
		const scaleX = img.width / canvasElement.width;
		const scaleY = img.height / canvasElement.height;

		// Create a new canvas for the cropped image
		const cropCanvas = document.createElement('canvas');
		const cropCtx = cropCanvas.getContext('2d');
		if (!cropCtx) return;

		cropCanvas.width = selectionRect.width * scaleX;
		cropCanvas.height = selectionRect.height * scaleY;

		// Draw the cropped portion
		cropCtx.drawImage(
			img,
			selectionRect.x * scaleX,
			selectionRect.y * scaleY,
			cropCanvas.width,
			cropCanvas.height,
			0,
			0,
			cropCanvas.width,
			cropCanvas.height
		);

		// Convert to blob and then to File
		cropCanvas.toBlob((blob) => {
			if (blob) {
				const croppedFile = new File([blob], 'cropped-image.png', { type: 'image/png' });
				onCrop(croppedFile);
			}
		}, 'image/png');
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

<div class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
	<div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
		<div class="p-4 md:p-6">
			<h3 class="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
				Select Text Area
			</h3>
			<p class="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-1">
				Click and drag to select the text you want to extract
			</p>
			<p class="text-xs md:text-sm text-blue-600 dark:text-blue-400 mb-4">
				Tip: Selecting a specific area greatly improves accuracy
			</p>

			<div class="mb-4 flex justify-center bg-gray-100 dark:bg-gray-700 rounded-lg p-4 overflow-auto min-h-[300px] items-center">
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
						<svg class="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<p class="text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Failed to load image</p>
						<p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Please try a different image</p>
						<button
							onclick={onCancel}
							class="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-medium transition-colors"
						>
							Close
						</button>
					</div>
				{:else if !imageLoaded}
					<div class="text-center py-12">
						<div class="relative inline-flex">
							<div class="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
							<div class="absolute inset-0 flex items-center justify-center">
								<svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
								</svg>
							</div>
						</div>
						<p class="mt-6 text-base font-medium text-gray-700 dark:text-gray-300">Preparing image...</p>
						<p class="mt-2 text-sm text-gray-500 dark:text-gray-400">This should only take a moment</p>
					</div>
				{/if}
			</div>

			<div class="flex flex-col sm:flex-row gap-3">
				<button
					onclick={handleSelectAll}
					disabled={!imageLoaded}
					class="px-4 py-2.5 rounded-lg bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium transition-colors text-sm md:text-base"
				>
					Select All
				</button>
				<button
					onclick={handleExtractText}
					disabled={!hasSelection}
					class="flex-1 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold transition-colors text-sm md:text-base"
				>
					Extract Text from Selection
				</button>
				<button
					onclick={onCancel}
					class="px-6 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors text-sm md:text-base"
				>
					Cancel
				</button>
			</div>
		</div>
	</div>
</div>
