import * as pdfjsLib from 'pdfjs-dist';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';

let workerInitialized = false;

function initializeWorker() {
  if (!workerInitialized) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).href;
    workerInitialized = true;
  }
}

export interface PDFMetadata {
  title?: string;
  author?: string;
  subject?: string;
  numPages: number;
}

export interface PDFPage {
  pageNumber: number;
  text: string;
  wordCount: number;
}

export interface PDFChapter {
  title: string;
  startPage: number;
  endPage: number;
  pageCount: number;
  wordCount: number;
}

export interface PDFDocument {
  metadata: PDFMetadata;
  pages: PDFPage[];
  chapters: PDFChapter[];
}

export interface PDFResult {
  text: string;
  success: boolean;
  error?: string;
  pageCount?: number;
}

export interface PDFProgress {
  currentPage: number;
  totalPages: number;
  status: string;
}

class PDFService {
  /**
   * Parse PDF and extract structured document with metadata and pages
   */
  async parseDocument(
    pdfFile: File,
    onProgress?: (progress: PDFProgress) => void
  ): Promise<{ success: boolean; document?: PDFDocument; error?: string }> {
    try {
      initializeWorker();

      const arrayBuffer = await pdfFile.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      const metadata = await pdf.getMetadata();
      const metadataInfo = metadata.info as Record<string, unknown> | null;
      const totalPages = pdf.numPages;

      const pages: PDFPage[] = [];

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        if (onProgress) {
          onProgress({
            currentPage: pageNum,
            totalPages,
            status: `Loading page ${pageNum} of ${totalPages}`
          });
        }

        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        const lineMap = new Map<number, Array<{ x: number; str: string; width: number }>>();

        textContent.items.forEach((item) => {
          if (!('str' in item)) return;
          const textItem = item as TextItem;

          const transform = textItem.transform;
          const x = transform[4];
          const y = Math.round(transform[5]);
          const str = textItem.str;
          const width = textItem.width || 0;

          if (!lineMap.has(y)) {
            lineMap.set(y, []);
          }
          lineMap.get(y)!.push({ x, str, width });
        });

        const sortedYs = Array.from(lineMap.keys()).sort((a, b) => b - a);

        const lines: string[] = [];
        for (const y of sortedYs) {
          const items = lineMap.get(y)!;
          items.sort((a, b) => a.x - b.x);

          let line = '';
          let lastX = -1;
          let lastWidth = 0;

          for (const item of items) {
            if (lastX !== -1) {
              const gap = item.x - (lastX + lastWidth);
              if (gap > 1) {
                line += ' ';
              }
            }
            line += item.str;
            lastX = item.x;
            lastWidth = item.width;
          }

          if (line.trim()) {
            lines.push(line.trim());
          }
        }

        const pageText = lines.join('\n');

        const wordCount = pageText.split(/\s+/).filter((word) => word.length > 0).length;

        pages.push({
          pageNumber: pageNum,
          text: pageText,
          wordCount
        });
      }

      const chapters = this.detectChapters(pages);

      const getStringValue = (value: unknown): string | undefined => {
        return typeof value === 'string' ? value : undefined;
      };

      const pdfMetadata: PDFMetadata = {
        title: getStringValue(metadataInfo?.Title) || pdfFile.name.replace(/\.pdf$/i, ''),
        author: getStringValue(metadataInfo?.Author),
        subject: getStringValue(metadataInfo?.Subject),
        numPages: totalPages
      };

      return {
        success: true,
        document: {
          metadata: pdfMetadata,
          pages,
          chapters
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'PDF parsing failed'
      };
    }
  }

  private isLikelyChapterStart(
    firstLine: string,
    secondLine: string,
    thirdLine: string,
    pageWordCount: number
  ): boolean {
    const trimmedFirst = firstLine.trim();
    if (!trimmedFirst) return false;

    const allText = `${firstLine} ${secondLine} ${thirdLine}`.toLowerCase();
    const wordCount = trimmedFirst.split(/\s+/).length;

    const explicitChapterPatterns = [
      /^chapter\s+\d+/i,
      /^chapter\s+[ivxlcdm]+/i,
      /^capítulo\s+\d+/i,
      /^capítulo\s+[ivxlcdm]+/i,
      /^parte\s+\d+/i,
      /^part\s+\d+/i,
      /^seção\s+\d+/i,
      /^section\s+\d+/i
    ];

    for (const pattern of explicitChapterPatterns) {
      if (pattern.test(trimmedFirst) || pattern.test(allText)) {
        return true;
      }
    }

    const isVeryShort = wordCount >= 1 && wordCount <= 6;
    const hasLowWordCount = pageWordCount < 150;
    const isAllCaps = trimmedFirst === trimmedFirst.toUpperCase() && trimmedFirst.length > 2;
    const startsCapital = /^[A-Z]/.test(trimmedFirst);
    const hasNoEndPunctuation = !/[.!?;,]$/.test(trimmedFirst);

    if (isVeryShort && hasLowWordCount && startsCapital && hasNoEndPunctuation) {
      return true;
    }

    if (isAllCaps && isVeryShort && hasLowWordCount) {
      return true;
    }

    const startsWithNumber = /^\d+[\.\:]?\s+[A-Z]/.test(trimmedFirst);
    const romanNumeral = /^[IVXLCDM]+[\.\:]?\s/i.test(trimmedFirst);

    if ((startsWithNumber || romanNumeral) && wordCount <= 10) {
      return true;
    }

    return false;
  }

  private isFrontMatter(title: string): boolean {
    const lowerTitle = title.toLowerCase();
    const frontMatterPatterns = [
      /^sum[aá]rio/i,
      /^summary/i,
      /^introdu[cç][aã]o/i,
      /^introduction/i,
      /^pref[aá]cio/i,
      /^preface/i,
      /^apresenta[cç][aã]o/i,
      /^presentation/i,
      /^nota/i,
      /^note/i,
      /^agradecimentos/i,
      /^acknowledgments/i,
      /^acknowledgements/i,
      /^dedicat[oó]ria/i,
      /^dedication/i,
      /^conte[uú]do/i,
      /^contents/i,
      /^table of contents/i,
      /^[ií]ndice/i,
      /^index/i
    ];

    return frontMatterPatterns.some((pattern) => pattern.test(lowerTitle));
  }

  private detectChapters(pages: PDFPage[]): PDFChapter[] {
    const chapters: PDFChapter[] = [];
    const chapterCandidates: Array<{ pageIndex: number; lineIndex: number; title: string }> = [];

    pages.forEach((page, pageIndex) => {
      const lines = page.text.split('\n').filter((l) => l.trim());
      if (lines.length === 0) return;

      for (let i = 0; i < lines.length; i++) {
        const currentLine = lines[i].trim();
        const nextLine = lines[i + 1]?.trim() || '';
        const prevLine = lines[i - 1]?.trim() || '';
        const lineAfterNext = lines[i + 2]?.trim() || '';

        const isIsolated = i > 0 && (!prevLine || prevLine.length < 20);
        const hasSpaceAfter = !nextLine || nextLine.length < 20;

        if (this.isLikelyChapterStart(currentLine, nextLine, lineAfterNext, page.wordCount)) {
          if (!this.isFrontMatter(currentLine)) {
            chapterCandidates.push({
              pageIndex,
              lineIndex: i,
              title: currentLine
            });
          }
        } else if (isIsolated && hasSpaceAfter && currentLine.length > 10 && currentLine.length < 100) {
          const wordCount = currentLine.split(/\s+/).length;
          if (wordCount >= 2 && wordCount <= 12 && /^[A-Z]/.test(currentLine) && !/[.!?;,]$/.test(currentLine)) {
            if (!this.isFrontMatter(currentLine)) {
              chapterCandidates.push({
                pageIndex,
                lineIndex: i,
                title: currentLine
              });
            }
          }
        }
      }
    });

    if (chapterCandidates.length === 0 || chapterCandidates.length > 50) {
      return this.createPageRangeChapters(pages);
    }

    chapterCandidates.forEach((candidate, index) => {
      const startPage = pages[candidate.pageIndex].pageNumber;
      const nextCandidate = chapterCandidates[index + 1];
      const endPage = nextCandidate
        ? pages[nextCandidate.pageIndex].pageNumber - 1
        : pages[pages.length - 1].pageNumber;

      const chapterPages = pages.filter(
        (p) => p.pageNumber >= startPage && p.pageNumber <= endPage
      );
      const totalWords = chapterPages.reduce((sum, p) => sum + p.wordCount, 0);

      chapters.push({
        title: candidate.title,
        startPage,
        endPage,
        pageCount: endPage - startPage + 1,
        wordCount: totalWords
      });
    });

    return chapters;
  }

  private createPageRangeChapters(pages: PDFPage[]): PDFChapter[] {
    const chapters: PDFChapter[] = [];
    const pagesPerChapter = 10;

    for (let i = 0; i < pages.length; i += pagesPerChapter) {
      const chapterPages = pages.slice(i, i + pagesPerChapter);
      const startPage = chapterPages[0].pageNumber;
      const endPage = chapterPages[chapterPages.length - 1].pageNumber;
      const wordCount = chapterPages.reduce((sum, p) => sum + p.wordCount, 0);

      chapters.push({
        title: `Pages ${startPage}-${endPage}`,
        startPage,
        endPage,
        pageCount: chapterPages.length,
        wordCount
      });
    }

    return chapters;
  }

  extractTextFromPages(pages: PDFPage[], startPage: number, endPage: number): string {
    return pages
      .filter((p) => p.pageNumber >= startPage && p.pageNumber <= endPage)
      .map((p) => p.text)
      .join('\n\n')
      .trim();
  }

  async extractText(
    pdfFile: File,
    onProgress?: (progress: PDFProgress) => void
  ): Promise<PDFResult> {
    const result = await this.parseDocument(pdfFile, onProgress);

    if (!result.success || !result.document) {
      return {
        text: '',
        success: false,
        error: result.error
      };
    }

    const text = result.document.pages.map((p) => p.text).join('\n\n');

    return {
      text,
      success: true,
      pageCount: result.document.metadata.numPages
    };
  }

  isPDF(file: File): boolean {
    return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  }
}

export const pdfService = new PDFService();
