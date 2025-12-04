# SpeedyReader Architecture

## Overview

This document describes the architecture of SpeedyReader, designed with clean separation of concerns and cross-platform reusability in mind. The architecture supports both web deployment and native mobile apps through Capacitor.

## Project Structure

```
src/
├── lib/
│   ├── components/          # UI Components (Svelte)
│   │   ├── ImageCropper.svelte
│   │   ├── RSVPReader.svelte
│   │   └── SpeedControls.svelte
│   ├── services/            # Platform-agnostic business logic
│   │   ├── index.ts         # Barrel export
│   │   ├── ocrService.ts    # OCR operations
│   │   ├── imageService.ts  # Image processing
│   │   ├── readerService.ts # RSVP reading logic
│   │   ├── storageService.ts # Storage abstraction
│   │   ├── textService.ts   # Text utilities
│   │   └── dateService.ts   # Date formatting
│   ├── stores/              # Svelte stores (state management)
│   │   ├── libraryStore.ts
│   │   └── readerStore.ts
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   └── utils/               # Platform-specific utilities
│       └── ocrUtils.ts      # Tesseract.js wrapper
└── routes/                  # SvelteKit pages
    ├── +page.svelte         # Home (input)
    ├── library/+page.svelte # Library management
    └── read/+page.svelte    # RSVP reader
```

## Architecture Layers

### 1. Services Layer (Platform-Agnostic)

All business logic is extracted into services that can be reused across platforms.

#### OCR Service (`ocrService.ts`)

- **Purpose**: Handle OCR operations
- **Key Methods**:
  - `processImage(file, language, onProgress)` - Extract text from images
  - `setDefaultLanguage(language)` - Set OCR language
  - `isLanguageSupported(code)` - Validate language support
- **Mobile Integration**: Works with web APIs; can use Capacitor plugins for native camera access

#### Image Service (`imageService.ts`)

- **Purpose**: Image manipulation and processing
- **Key Methods**:
  - `loadImage(file)` - Load and validate images
  - `calculateScaledDimensions(dimensions, maxW, maxH)` - Aspect ratio scaling
  - `cropImage(image, selection, canvasDimensions)` - Crop selected area
  - `drawImageWithSelection(ctx, image, dimensions, selection)` - Canvas rendering
- **Mobile Integration**: Canvas API works in Capacitor; can use native plugins if needed

#### Reader Service (`readerService.ts`)

- **Purpose**: RSVP reading logic and playback control
- **Key Methods**:
  - `initialize(text, config)` - Set up reader with text
  - `play()` / `pause()` - Control playback
  - `nextWord()` / `previousWord()` - Navigate words
  - `setWpm(wpm)` - Adjust reading speed
  - `getProgress()` - Get reading progress
- **Mobile Integration**: Pure JavaScript, works across platforms

#### Storage Service (`storageService.ts`)

- **Purpose**: Persistent storage abstraction
- **Key Methods**:
  - `get<T>(key)` - Retrieve and parse JSON
  - `set<T>(key, value)` - Store with JSON serialization
  - `remove(key)` - Delete item
  - `clear()` - Clear all storage
- **Adapters**:
  - `LocalStorageAdapter` - Browser localStorage
  - `MemoryStorageAdapter` - In-memory (testing)
- **Mobile Integration**: Works with browser localStorage; Capacitor apps use the same API

#### Text Service (`textService.ts`)

- **Purpose**: Text processing and validation
- **Key Methods**:
  - `validateText(text, minLength)` - Validate text content
  - `countWords(text)` - Word count calculation
  - `getTextStats(text, wpm)` - Statistics and estimated reading time
  - `truncate(text, maxLength)` - Truncate with ellipsis
  - `cleanText(text)` - Normalize whitespace
- **Mobile Integration**: Platform-agnostic

#### Date Service (`dateService.ts`)

- **Purpose**: Date formatting utilities
- **Key Methods**:
  - `formatDate(timestamp, locale, options)` - Locale-aware date formatting
  - `formatRelativeTime(timestamp)` - Human-readable relative times
  - `formatDateTime(timestamp)` - Full datetime strings
  - `isToday(timestamp)` - Check if date is today
- **Mobile Integration**: Platform-agnostic

### 2. Components Layer (UI)

Svelte components that use services for business logic.

#### RSVPReader.svelte

- Clean separation between UI and business logic
- Uses `createReaderService()` for all reading logic
- Focused on presentation and user interaction

#### ImageCropper.svelte

- UI handles user interaction and display
- Uses `imageService` for all image processing
- Canvas rendering delegated to service layer

#### SpeedControls.svelte

- Pure presentation component
- No business logic (was already clean)

### 3. Stores Layer (State Management)

Svelte stores using services for persistence and calculations.

#### libraryStore.ts

- Uses `storageService` for localStorage operations
- Uses `textService` for word counting
- Uses `dateService` for timestamps

#### readerStore.ts

- Simple in-memory store
- Could be enhanced with `storageService` for persistence

### 4. Routes Layer (Pages)

SvelteKit pages orchestrating components and services.

## Data Flow

```
User Action (Component)
    ↓
Service Method Call
    ↓
Business Logic Execution
    ↓
State Update (Store or Component State)
    ↓
UI Re-render
```

### Example: OCR Flow

```
User clicks "Upload Image"
    ↓
+page.svelte calls processOCR()
    ↓
ocrService.processImage(file, language, onProgress)
    ↓
Tesseract.js processes image
    ↓
Service returns { success: true, text: "..." }
    ↓
+page.svelte updates content state
    ↓
Textarea displays extracted text
```

## Capacitor Mobile Integration

### Services

All services are designed to work across platforms:

- `readerService.ts` - Pure JavaScript, no platform dependencies
- `textService.ts` - Pure JavaScript utilities
- `dateService.ts` - Standard date APIs
- `storageService.ts` - Uses web localStorage API
- `ocrService.ts` - Web APIs with optional native enhancements
- `imageService.ts` - Canvas API with optional native plugins

### Components

Svelte components work in Capacitor web views:

- `RSVPReader.svelte` - Standard web component
- `ImageCropper.svelte` - Uses canvas API
- `SpeedControls.svelte` - Pure UI component

### State Management

Svelte stores function normally in Capacitor environments.

### Optional Native Enhancements

Add Capacitor plugins for enhanced native features:

```bash
# Camera access
pnpm add @capacitor/camera

# Filesystem
pnpm add @capacitor/filesystem

# Status bar styling
pnpm add @capacitor/status-bar
```

Then use in your existing components:

```typescript
import { Camera } from '@capacitor/camera';

// Existing web code continues to work
// Add native camera option
const takePhoto = async () => {
  const photo = await Camera.getPhoto({
    resultType: CameraResultType.Uri,
    source: CameraSource.Camera
  });
};
```

## Benefits of This Architecture

### 1. **Separation of Concerns**

- Business logic isolated in services
- UI components focus on presentation
- Easy to test each layer independently

### 2. **Reusability**

- Services can be used across web and mobile platforms
- Platform-agnostic business logic
- Consistent behavior across deployments

### 3. **Testability**

- Services can be unit tested without UI
- Easy to mock dependencies
- Adapters enable testing with in-memory storage

### 4. **Maintainability**

- Clear file organization
- Single responsibility per service
- Type-safe interfaces

### 5. **Extensibility**

- Easy to add new services
- Adapters allow platform customization
- Barrel exports simplify imports

## Testing Strategy

### Unit Tests (Services)

```typescript
// Example: textService.test.ts
import { textService } from '@/services/textService';

test('validates empty text', () => {
  const result = textService.validateText('');
  expect(result.isValid).toBe(false);
  expect(result.error).toBe('Text cannot be empty');
});

test('counts words correctly', () => {
  const count = textService.countWords('Hello world');
  expect(count).toBe(2);
});
```

### Integration Tests (Components)

```typescript
// Example: RSVPReader.test.ts
import { render, fireEvent } from '@testing-library/svelte';
import RSVPReader from '@/components/RSVPReader.svelte';

test('plays and pauses reading', async () => {
  const { getByRole } = render(RSVPReader, {
    props: { text: 'Hello world test', initialWpm: 300 }
  });

  const playButton = getByRole('button', { name: /play/i });
  await fireEvent.click(playButton);
  // Assert playback started
});
```

## Performance Considerations

### Service Instances

- Most services are singletons (one instance per app)
- `createReaderService()` allows multiple readers if needed
- Services are lightweight (no heavy initialization)

### Memoization

- Text statistics are calculated once and cached in LibraryItem
- Word arrays are created only when text changes
- Image dimensions calculated during load, not on every render

### Lazy Loading

- Services imported on-demand
- OCR library loaded only when needed
- Images processed asynchronously

## Future Enhancements

### 1. Add Unit Tests

- Create `__tests__` directory for each service
- Use Vitest or Jest
- Aim for >80% coverage

### 2. Add Service Documentation

- JSDoc comments (already started)
- Generate API documentation with TypeDoc
- Create usage examples

### 3. Enhance Error Handling

- Create custom error types
- Add error reporting service
- Implement retry logic for failed operations

### 4. Add Analytics Service

- Track reading statistics
- Monitor OCR performance
- User behavior insights

### 5. Offline Sync Service

- Queue operations when offline
- Sync when connection restored
- Conflict resolution

## Capacitor Setup Checklist

To add mobile support with Capacitor:

- [ ] Install Capacitor: `pnpm add @capacitor/core @capacitor/cli`
- [ ] Initialize Capacitor: `pnpm exec cap init`
- [ ] Add iOS platform: `pnpm exec cap add ios`
- [ ] Add Android platform: `pnpm exec cap add android`
- [ ] Build web app: `pnpm run build`
- [ ] Sync to native: `pnpm exec cap sync`
- [ ] (Optional) Add Camera plugin: `pnpm add @capacitor/camera`
- [ ] (Optional) Add native status bar: `pnpm add @capacitor/status-bar`
- [ ] Test on iOS: `pnpm exec cap open ios`
- [ ] Test on Android: `pnpm exec cap open android`

## Conclusion

This architecture provides a solid foundation for:

- **Current**: Clean, maintainable web application
- **Future**: Easy mobile deployment with Capacitor
- **Long-term**: Sustainable codebase growth

The clear separation between business logic (services) and presentation (components) enables code reuse across platforms. The same SvelteKit codebase can be deployed to web and wrapped with Capacitor for iOS and Android.
