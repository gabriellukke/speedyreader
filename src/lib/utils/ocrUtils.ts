import Tesseract from 'tesseract.js';

export interface OCRProgress {
  status: string;
  progress: number;
}

export interface Language {
  code: string;
  name: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'eng', name: 'English', flag: '' },
  { code: 'por', name: 'Portuguese', flag: '' },
  { code: 'spa', name: 'Spanish', flag: '' },
  { code: 'fra', name: 'French', flag: '' },
  { code: 'deu', name: 'German', flag: '' },
  { code: 'ita', name: 'Italian', flag: '' },
  { code: 'jpn', name: 'Japanese', flag: '' },
  { code: 'kor', name: 'Korean', flag: '' },
  { code: 'chi_sim', name: 'Chinese (Simplified)', flag: '' },
  { code: 'rus', name: 'Russian', flag: '' }
];

export async function extractTextFromImage(
  imageFile: File,
  language: string = 'eng',
  onProgress?: (progress: OCRProgress) => void
): Promise<string> {
  const result = await Tesseract.recognize(imageFile, language, {
    logger: (m) => {
      if (onProgress && m.status) {
        onProgress({
          status: m.status,
          progress: m.progress || 0
        });
      }
    }
  });

  return result.data.text.trim();
}
