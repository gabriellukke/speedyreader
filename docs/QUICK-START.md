# Quick Start Guide

SpeedyReader is built with clean architecture, separating business logic from UI components.

## Service Layer

```
src/lib/services/          # All business logic
├── ocrService.ts          # OCR operations
├── imageService.ts        # Image processing
├── readerService.ts       # RSVP reading logic
├── storageService.ts      # Data persistence
├── textService.ts         # Text utilities
├── dateService.ts         # Date formatting
└── index.ts               # Barrel exports
```

## Using Services

### Import from barrel (recommended)

```typescript
import { readerService, textService, ocrService } from '$lib/services';
```

### Or import individually

```typescript
import { readerService } from '$lib/services/readerService';
```

## Common Tasks

### 1. Validate Text

```typescript
import { textService } from '$lib/services';

const validation = textService.validateText(userInput);
if (!validation.isValid) {
  alert(validation.error);
}
```

### 2. Use RSVP Reader

```typescript
import { createReaderService } from '$lib/services';

const reader = createReaderService();

reader.initialize(text, {
  initialWpm: 300,
  onStateChange: (state) => {
    // Update UI with state.currentIndex, state.words, etc.
  }
});

reader.play();
reader.setWpm(400);
reader.pause();
```

### 3. Process OCR

```typescript
import { ocrService } from '$lib/services';

const result = await ocrService.processImage(imageFile, 'eng', (progress) => {
  console.log(`${Math.round(progress.progress * 100)}%`);
});

if (result.success) {
  console.log('Extracted:', result.text);
}
```

### 4. Store Data

```typescript
import { storageService } from '$lib/services';

// Save
await storageService.set('preferences', { theme: 'dark' });

// Load
const prefs = await storageService.get('preferences');
```

### 5. Get Text Stats

```typescript
import { textService } from '$lib/services';

const stats = textService.getTextStats(text, 300);
console.log(`${stats.wordCount} words`);
console.log(`Reading time: ${textService.formatReadingTime(stats.estimatedReadingTime)}`);
```

## Building & Running

### Development

```bash
pnpm run dev
```

### Build

```bash
pnpm run build
```

### Preview Production Build

```bash
pnpm run preview
```

## Documentation Files

1. **[REFACTORING-SUMMARY.md](./REFACTORING-SUMMARY.md)** - What changed and why
2. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Complete architecture guide
3. **[SERVICE-DIAGRAM.md](./SERVICE-DIAGRAM.md)** - Visual diagrams
4. **This file** - Quick reference

## Key Benefits

✅ **Platform-agnostic business logic**
✅ **Ready for Capacitor deployment**
✅ **Easy to test each service independently**
✅ **Clean separation of concerns**
✅ **Type-safe throughout**

## Mobile Deployment with Capacitor

Deploy to iOS and Android:

1. Install Capacitor: `pnpm add @capacitor/core @capacitor/cli`
2. Initialize: `pnpm exec cap init`
3. Add platforms: `pnpm exec cap add ios android`
4. Build: `pnpm run build`
5. Sync: `pnpm exec cap sync`
6. Open native IDE: `pnpm exec cap open ios` or `android`

## Testing (Recommended Next Step)

Create tests for services:

```typescript
// Example: src/lib/services/__tests__/textService.test.ts
import { describe, it, expect } from 'vitest';
import { textService } from '../textService';

describe('textService', () => {
  it('validates empty text', () => {
    const result = textService.validateText('');
    expect(result.isValid).toBe(false);
  });

  it('counts words correctly', () => {
    expect(textService.countWords('Hello world')).toBe(2);
  });
});
```

## Questions?

- Check inline JSDoc comments in service files
- Read [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed explanations
- All services have type definitions for IDE autocomplete

## Summary

Your codebase is now:

- ✅ Cleaner
- ✅ More maintainable
- ✅ Platform-agnostic
- ✅ Ready for scaling

Happy coding! 🚀
