# SpeedyReader

A modern RSVP (Rapid Serial Visual Presentation) reading application built with SvelteKit. Read faster by displaying text one word at a time at customizable speeds, with OCR support for extracting text from images.

## Features

- **RSVP Reading**: Display text word-by-word at adjustable speeds (100-1000 WPM)
- **OCR Support**: Extract text from images using Tesseract.js
- **Image Cropping**: Select and crop specific areas before OCR
- **Library Management**: Save and organize reading materials
- **Offline Support**: Works without an internet connection
- **Mobile Ready**: Deploy to iOS and Android with Capacitor

## Quick Start

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

### Build

```bash
# Production build
pnpm run build

# Preview build
pnpm run preview
```

### Format Code

```bash
# Format all files
pnpm run format
```

## Architecture

SpeedyReader uses clean architecture with separated concerns:

### Service Layer

Platform-agnostic business logic:

- **ocrService** - OCR operations with Tesseract.js
- **imageService** - Image processing and cropping
- **readerService** - RSVP reading logic and playback control
- **storageService** - Persistent storage with adapter pattern
- **textService** - Text validation, statistics, and utilities
- **dateService** - Date formatting and relative time

### Component Layer

Svelte components that use services:

- **RSVPReader** - RSVP display with playback controls
- **ImageCropper** - Interactive image selection and cropping
- **SpeedControls** - WPM adjustment interface

### Store Layer

Svelte stores for state management:

- **libraryStore** - Manages saved reading materials
- **readerStore** - Tracks current reading session

## Project Structure

```
src/
├── lib/
│   ├── components/        # UI components
│   ├── services/          # Business logic
│   ├── stores/            # State management
│   └── types/             # TypeScript types
└── routes/                # SvelteKit pages
    ├── +page.svelte       # Home (text input & OCR)
    ├── library/           # Library management
    └── read/              # RSVP reader
```

## Mobile Deployment

Deploy to iOS and Android using Capacitor:

```bash
# Install and setup
pnpm add @capacitor/core @capacitor/cli
pnpm exec cap init

# Add platforms
pnpm exec cap add ios
pnpm exec cap add android

# Build and sync
pnpm run build
pnpm exec cap sync

# Open native IDEs
pnpm exec cap open ios
pnpm exec cap open android
```

## Documentation

- **[Architecture Guide](docs/ARCHITECTURE.md)** - Detailed architecture overview
- **[Quick Start Guide](docs/QUICK-START.md)** - Common tasks and examples
- **[Refactoring Summary](docs/REFACTORING-SUMMARY.md)** - Development history and metrics
- **[Service Diagrams](docs/SERVICE-DIAGRAM.md)** - Visual architecture diagrams

## Tech Stack

- **SvelteKit 2.48.5** - Web framework
- **Svelte 5** - UI framework with runes
- **TypeScript** - Type safety
- **Tailwind CSS 4.x** - Styling
- **Tesseract.js** - OCR engine
- **Capacitor** - Native mobile wrapper

## Key Benefits

- **Clean Architecture**: Business logic separated from UI
- **Type Safety**: Full TypeScript coverage
- **Testability**: Services can be tested independently
- **Reusability**: Platform-agnostic services
- **Mobile Ready**: Same codebase for web and mobile

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `pnpm run format`
5. Submit a pull request

## License

[Add your license here]
