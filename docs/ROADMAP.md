# SpeedyReader Roadmap

## Current Status

The core RSVP reader is functional with:

- Text input and OCR image import
- Adjustable WPM speed
- Progress bar with scrubbing
- Library for saved texts
- Dark/light/sepia theme support
- i18n (English/Portuguese)
- Keyboard shortcuts
- Settings page with theme, font, and speed preferences

---

## Phase 1: Polish & Settings

### Settings Page ✅

- [x] Theme selection (dark/light/sepia)
- [x] Font family choice
- [x] Font size for reader
- [x] Default WPM preference
- [x] Persist settings to localStorage

### Reader Improvements ⏭️ Skipped

- [x] Pause after punctuation (comma, period, paragraph) with configurable durations
- [ ] Show word count estimate before reading (skipped for now)
- [ ] Bookmark/resume position in saved texts (skipped for now)

### Library Enhancements ⏭️ Skipped

- [ ] Search saved texts (skipped for now)
- [ ] Sort by date/title/word count (skipped for now)
- [ ] Preview text before reading (skipped for now)
- [ ] Edit saved items (skipped for now)

---

## Phase 2: Mobile Deployment

### Capacitor Setup ✅

- [x] Initialize Capacitor project
- [x] Configure iOS project
- [x] Configure Android project
- [x] Handle safe areas (notches, home indicators)
- [ ] Test camera/OCR on native
- [x] Haptic feedback for interactions

### App Store Preparation

- [ ] App icons (all sizes)
- [ ] Screenshots for store listing
- [ ] App description and metadata
- [ ] Privacy policy

---

## Phase 3: Document Import

### PDF Support

- [ ] Integrate pdf.js library
- [ ] Extract text from PDFs
- [ ] Handle multi-page documents
- [ ] Progress indicator for large files

### ePUB Support

- [ ] Integrate epub.js library
- [ ] Extract chapters
- [ ] Chapter navigation
- [ ] Preserve reading position

---

## Phase 4: Analytics & Stats

### Reading Statistics

- [ ] Track words read per session
- [ ] Track time spent reading
- [ ] Calculate average WPM
- [ ] Reading streaks/history

### Dashboard

- [ ] Stats overview page
- [ ] Charts/visualizations
- [ ] Export reading history

---

## Phase 5: Advanced Features

### Reader Modes

- [ ] Chunk mode (2-3 words at a time)
- [ ] Focus mode (dim surroundings)
- [ ] Auto-adjust speed based on word length

### Social/Sharing

- [ ] Share reading stats
- [ ] Share text snippets

### Accessibility

- [ ] Screen reader improvements
- [ ] High contrast mode
- [ ] Reduced motion option

---

## Future Considerations

- Cloud sync for library
- Browser extension for reading web articles
- Text-to-speech integration
- Spaced repetition for learning
- Import from URLs (article extraction)
