/**
 * Image Processing Service
 *
 * Service for image manipulation and processing operations.
 */

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface SelectionRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ImageLoadResult {
  success: boolean;
  image?: HTMLImageElement;
  dimensions?: ImageDimensions;
  error?: string;
}

export interface CropResult {
  success: boolean;
  file?: File;
  error?: string;
}

class ImageService {
  /**
   * Load an image file and return dimensions
   * @param imageFile - File to load
   * @returns Promise with image and dimensions
   */
  async loadImage(imageFile: File): Promise<ImageLoadResult> {
    return new Promise((resolve) => {
      const img = new Image();
      const objectURL = URL.createObjectURL(imageFile);

      img.onload = () => {
        URL.revokeObjectURL(objectURL);
        resolve({
          success: true,
          image: img,
          dimensions: {
            width: img.width,
            height: img.height
          }
        });
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectURL);
        resolve({
          success: false,
          error: 'Failed to load image'
        });
      };

      img.src = objectURL;
    });
  }

  /**
   * Calculate scaled dimensions to fit within max bounds while maintaining aspect ratio
   * @param originalDimensions - Original image dimensions
   * @param maxWidth - Maximum width
   * @param maxHeight - Maximum height
   * @returns Scaled dimensions
   */
  calculateScaledDimensions(
    originalDimensions: ImageDimensions,
    maxWidth: number,
    maxHeight: number
  ): ImageDimensions {
    let { width, height } = originalDimensions;

    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }
    if (height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }

    return { width, height };
  }

  /**
   * Create object URL from file
   * @param file - File to create URL from
   * @returns Object URL string
   */
  createObjectURL(file: File): string {
    return URL.createObjectURL(file);
  }

  /**
   * Revoke object URL to free memory
   * @param url - Object URL to revoke
   */
  revokeObjectURL(url: string): void {
    URL.revokeObjectURL(url);
  }

  /**
   * Crop an image based on selection rectangle
   * @param image - Source image
   * @param selection - Selection rectangle
   * @param canvasDisplayDimensions - Dimensions of the display canvas
   * @returns Promise with cropped image file
   */
  async cropImage(
    image: HTMLImageElement,
    selection: SelectionRect,
    canvasDisplayDimensions: ImageDimensions
  ): Promise<CropResult> {
    try {
      // Calculate scale factors
      const scaleX = image.width / canvasDisplayDimensions.width;
      const scaleY = image.height / canvasDisplayDimensions.height;

      // Create a new canvas for the cropped image
      const cropCanvas = document.createElement('canvas');
      const cropCtx = cropCanvas.getContext('2d');

      if (!cropCtx) {
        return {
          success: false,
          error: 'Failed to create canvas context'
        };
      }

      cropCanvas.width = selection.width * scaleX;
      cropCanvas.height = selection.height * scaleY;

      // Draw the cropped portion
      cropCtx.drawImage(
        image,
        selection.x * scaleX,
        selection.y * scaleY,
        cropCanvas.width,
        cropCanvas.height,
        0,
        0,
        cropCanvas.width,
        cropCanvas.height
      );

      // Convert to blob and then to File
      const blob = await new Promise<Blob | null>((resolve) => {
        cropCanvas.toBlob(resolve, 'image/png');
      });

      if (!blob) {
        return {
          success: false,
          error: 'Failed to create image blob'
        };
      }

      const croppedFile = new File([blob], 'cropped-image.png', { type: 'image/png' });

      return {
        success: true,
        file: croppedFile
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown cropping error'
      };
    }
  }

  /**
   * Draw image on canvas with optional selection overlay
   * @param ctx - Canvas rendering context
   * @param image - Image to draw
   * @param canvasDimensions - Canvas dimensions
   * @param selection - Optional selection rectangle to highlight
   */
  drawImageWithSelection(
    ctx: CanvasRenderingContext2D,
    image: HTMLImageElement,
    canvasDimensions: ImageDimensions,
    selection?: SelectionRect
  ): void {
    // Clear and draw image
    ctx.clearRect(0, 0, canvasDimensions.width, canvasDimensions.height);
    ctx.drawImage(image, 0, 0, canvasDimensions.width, canvasDimensions.height);

    // Draw selection overlay if provided
    if (selection && selection.width > 0 && selection.height > 0) {
      // Darken outside selection
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvasDimensions.width, selection.y);
      ctx.fillRect(0, selection.y, selection.x, selection.height);
      ctx.fillRect(
        selection.x + selection.width,
        selection.y,
        canvasDimensions.width - (selection.x + selection.width),
        selection.height
      );
      ctx.fillRect(
        0,
        selection.y + selection.height,
        canvasDimensions.width,
        canvasDimensions.height - (selection.y + selection.height)
      );

      // Draw selection border
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.strokeRect(selection.x, selection.y, selection.width, selection.height);
    }
  }

  /**
   * Calculate selection rectangle from start and current coordinates
   * @param startX - Starting X coordinate
   * @param startY - Starting Y coordinate
   * @param currentX - Current X coordinate
   * @param currentY - Current Y coordinate
   * @returns Normalized selection rectangle
   */
  calculateSelectionRect(
    startX: number,
    startY: number,
    currentX: number,
    currentY: number
  ): SelectionRect {
    const x = Math.min(startX, currentX);
    const y = Math.min(startY, currentY);
    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);

    return { x, y, width, height };
  }

  /**
   * Check if selection is valid (large enough)
   * @param selection - Selection rectangle
   * @param minSize - Minimum size in pixels (default: 10)
   * @returns True if selection is valid
   */
  isValidSelection(selection: SelectionRect, minSize: number = 10): boolean {
    return selection.width > minSize && selection.height > minSize;
  }
}

// Export singleton instance
export const imageService = new ImageService();
