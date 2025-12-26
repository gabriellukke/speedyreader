/**
 * Services Barrel Export
 *
 * Central export point for all platform-agnostic services.
 * Import services from this file for cleaner imports.
 */

// OCR Service
export { ocrService } from './ocrService';
export type { OCRProgress, OCRResult, OCRServiceConfig, Language } from './ocrService';

// Image Service
export { imageService } from './imageService';
export type { ImageDimensions, SelectionRect, ImageLoadResult, CropResult } from './imageService';

// Reader Service
export { readerService, createReaderService } from './readerService';
export type { ReaderState, ReaderConfig } from './readerService';

// Storage Service
export {
  storageService,
  createStorageService,
  LocalStorageAdapter,
  MemoryStorageAdapter
} from './storageService';
export type { StorageAdapter } from './storageService';

// Text Service
export { textService } from './textService';
export type { TextValidationResult, TextStats } from './textService';

// Date Service
export { dateService } from './dateService';
export type { DateFormatOptions } from './dateService';

// PDF Service
export { pdfService } from './pdfService';
export type {
  PDFResult,
  PDFProgress,
  PDFDocument,
  PDFMetadata,
  PDFPage,
  PDFChapter
} from './pdfService';
