import { extractTextFromImage as tesseractExtract } from '$lib/utils/ocrUtils';
import type { OCRProgress, Language } from '$lib/utils/ocrUtils';

export type { OCRProgress, Language };

/**
 * OCR Service
 *
 * Service for OCR (Optical Character Recognition) operations.
 */

export interface OCRServiceConfig {
  defaultLanguage?: string;
  onProgress?: (progress: OCRProgress) => void;
}

export interface OCRResult {
  text: string;
  success: boolean;
  error?: string;
}

class OCRService {
  private defaultLanguage: string = 'eng';

  /**
   * Process an image file and extract text using OCR
   * @param imageFile - The image file to process
   * @param language - Language code for OCR (default: 'eng')
   * @param onProgress - Optional progress callback
   * @returns OCR result with text or error
   */
  async processImage(
    imageFile: File,
    language?: string,
    onProgress?: (progress: OCRProgress) => void
  ): Promise<OCRResult> {
    try {
      const lang = language || this.defaultLanguage;
      const text = await tesseractExtract(imageFile, lang, onProgress);

      return {
        text,
        success: true
      };
    } catch (error) {
      return {
        text: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown OCR error'
      };
    }
  }

  /**
   * Set the default language for OCR operations
   * @param language - Language code
   */
  setDefaultLanguage(language: string): void {
    this.defaultLanguage = language;
  }

  /**
   * Get the current default language
   * @returns Current default language code
   */
  getDefaultLanguage(): string {
    return this.defaultLanguage;
  }

  /**
   * Validate if a language code is supported
   * @param languageCode - Language code to validate
   * @returns True if language is supported
   */
  isLanguageSupported(languageCode: string): boolean {
    const supportedCodes = [
      'eng',
      'por',
      'spa',
      'fra',
      'deu',
      'ita',
      'jpn',
      'kor',
      'chi_sim',
      'rus'
    ];
    return supportedCodes.includes(languageCode);
  }
}

// Export singleton instance
export const ocrService = new OCRService();
