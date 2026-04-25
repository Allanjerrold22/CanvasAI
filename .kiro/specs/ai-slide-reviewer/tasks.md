# Implementation Plan: AI Slide Reviewer

## Overview

This plan implements the AI Slide Reviewer feature, which adds a voice-powered slide briefing experience to the CanvasAI platform. Students can launch an AI Review from eligible files (PPT, PPTX, PDF) in the course Files tab, opening a dedicated viewer page with ElevenLabs voice narration, real-time transcription, and playback controls. The implementation proceeds incrementally: test framework setup, mock data layer, API route, UI components (bottom-up), voice agent hook, page wiring, and finally FileNode integration.

## Tasks

- [ ] 1. Set up test framework and project infrastructure
  - [ ] 1.1 Install Vitest, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event, jsdom, fast-check, and @vitejs/plugin-react as dev dependencies
    - Run: `npm install --save-dev vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom fast-check`
    - Add `"test": "vitest --run"` script to `package.json`
    - _Requirements: Design — Testing Strategy_
  - [ ] 1.2 Create `vitest.config.ts` at project root
    - Configure `plugins: [react()]`, `test.environment: "jsdom"`, `test.setupFiles: ["./setupTests.ts"]`, `test.globals: true`
    - Add path alias `"@"` resolving to project root
    - _Requirements: Design — Testing Strategy_
  - [ ] 1.3 Create `setupTests.ts` at project root
    - Import `@testing-library/jest-dom/vitest`
    - _Requirements: Design — Testing Strategy_

- [x] 2. Create mock slide data module (`lib/slides.ts`)
  - [x] 2.1 Define `SlideData` and `FileSlideSet` types and export the `isEligibleForReview` and `findFileNode` helper functions
    - `SlideData`: `{ title: string; bullets: string[]; hasImage: boolean }`
    - `FileSlideSet`: `{ fileId: string; slides: SlideData[] }`
    - `isEligibleForReview(fileName: string): boolean` — returns true for `.ppt`, `.pptx`, `.pdf` extensions (case-insensitive)
    - `findFileNode(nodes: CourseFileNode[], fileId: string): CourseFileNode | undefined` — recursive search
    - _Requirements: 1.1, 1.2, 3.1, 3.4_
  - [x] 2.2 Create mock slide data for all eligible files in the course data
    - Export a `Map<string, SlideData[]>` or keyed object with entries for: `file-lec01`, `file-lec02`, `file-lec03`, `file-ps1` through `file-ps4`, `des-file-lec01` through `des-file-lec04`, `des-file-syllabus`, `des-file-brand-examples`, `des-file-a1-brief`, `des-file-a2-brief`
    - Each file must have at least 4 slides; each slide must have a non-empty title, non-empty bullets array, and a hasImage boolean (~40% true)
    - Export a `getSlides(fileId: string): SlideData[] | undefined` lookup function
    - _Requirements: 3.1, 3.2, 3.3_
  - [ ]* 2.3 Write property tests for `isEligibleForReview` (Property 1)
    - **Property 1: File eligibility check**
    - Use fast-check to generate arbitrary file name strings with various extensions
    - Assert `isEligibleForReview` returns true iff extension is ppt/pptx/pdf
    - **Validates: Requirements 1.1, 1.2**
  - [ ]* 2.4 Write property tests for mock data structure invariants (Property 8)
    - **Property 8: Mock data structure invariants**
    - Iterate all entries in mock slide data; assert each has ≥4 slides, each slide has non-empty title, non-empty bullets array, and boolean hasImage
    - **Validates: Requirements 3.1, 3.2**
  - [ ]* 2.5 Write property test for slide data lookup correctness (Property 9)
    - **Property 9: Slide data lookup correctness**
    - For each file ID key in mock data, assert `getSlides(fileId)` returns the correct array
    - **Validates: Requirements 3.3**

- [ ] 3. Checkpoint — Ensure data layer tests pass
  - Run `npm test` and ensure all tests pass. Ask the user if questions arise.

- [x] 4. Create the API route (`app/api/slide-review/route.ts`)
  - [x] 4.1 Implement the POST handler for `/api/slide-review`
    - Read `ELEVENLABS_API_KEY` from `process.env`
    - If key missing: return `{ error: "ElevenLabs API key not configured" }` with status 503
    - Parse request body for `agentId` and `slideContent`
    - Call ElevenLabs `GET /v1/convai/conversation/get_signed_url?agent_id={agentId}` with `xi-api-key` header
    - Return `{ signedUrl }` on success; return `{ error }` with appropriate status on failure
    - Never expose the API key in the response
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
  - [ ]* 4.2 Write property test for API route error response structure (Property 16)
    - **Property 16: API route error response structure**
    - Mock various error scenarios (missing key, ElevenLabs 4xx/5xx, network failure)
    - Assert response has `error` string field and appropriate HTTP status code
    - **Validates: Requirements 10.4, 10.5**

- [x] 5. Create `PlaybackControls` component (`components/slide-reviewer/PlaybackControls.tsx`)
  - [x] 5.1 Implement the PlaybackControls component
    - Accept props: `status`, `onStart`, `onPause`, `onResume`, `onStop`
    - `idle`/`stopped`: render "Start Review" button with `SparkleIcon` in brand-colored pill
    - `playing`: render Pause button (`PauseIcon`), Stop button (`StopIcon`), and animated waveform indicator (three bars with staggered CSS animation)
    - `paused`: render Play button (`PlayIcon`) and Stop button (`StopIcon`)
    - All buttons must have `aria-label` attributes and be keyboard-focusable
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 9.2_
  - [ ]* 5.2 Write property test for playback controls status-to-UI mapping (Property 14)
    - **Property 14: Playback controls status-to-UI mapping**
    - Use fast-check to generate each status value; assert correct buttons are rendered per status
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.6**

- [x] 6. Create `MainSlideView` component (`components/slide-reviewer/MainSlideView.tsx`)
  - [x] 6.1 Implement the MainSlideView component
    - Accept props: `slide: SlideData`, `slideIndex: number`, `totalSlides: number`
    - Render slide title as `<h2>`, bullet points as `<ul>`, image placeholder `<div>` when `slide.hasImage` is true
    - Display "Slide X of Y" indicator with `aria-live="polite"`
    - Card styling: `bg-surface border border-ink-border rounded-2xl shadow-card p-8`
    - Handle empty bullets array gracefully (omit bullet list)
    - _Requirements: 2.2, 9.1, 9.4_
  - [ ]* 6.2 Write property test for main slide view content rendering (Property 3)
    - **Property 3: Main slide view renders slide content and position**
    - Generate arbitrary SlideData and slide index; assert title, all bullets, and "Slide X of Y" are present
    - **Validates: Requirements 2.2, 9.4**

- [x] 7. Create `SlideThumbnailSidebar` component (`components/slide-reviewer/SlideThumbnailSidebar.tsx`)
  - [x] 7.1 Implement the SlideThumbnailSidebar component
    - Accept props: `slides`, `currentIndex`, `narratingIndex`, `onSelectSlide`
    - Render scrollable `<nav>` with `role="list"` containing thumbnail cards
    - Each thumbnail shows miniature slide title + first bullet truncated
    - Active slide has `border-[var(--brand)]` highlight
    - Narrating slide shows pulsing dot indicator (`animate-pulse`)
    - Clicking a thumbnail calls `onSelectSlide(index)`
    - Auto-scroll active thumbnail into view using `scrollIntoView`
    - _Requirements: 2.3, 2.4, 2.5, 4.6_
  - [ ]* 7.2 Write property test for thumbnail count (Property 4)
    - **Property 4: Slide thumbnail sidebar renders all slides**
    - Generate arbitrary slide arrays; assert number of thumbnail elements equals array length
    - **Validates: Requirements 2.3**
  - [ ]* 7.3 Write property test for thumbnail click dispatch (Property 5)
    - **Property 5: Thumbnail click dispatches correct index**
    - Generate slide array and valid index; simulate click; assert `onSelectSlide` called with correct index
    - **Validates: Requirements 2.4**
  - [ ]* 7.4 Write property test for selected thumbnail highlighting (Property 6)
    - **Property 6: Selected thumbnail highlighting**
    - Generate slide array and valid currentIndex; assert exactly one thumbnail has brand border at correct position
    - **Validates: Requirements 2.5**
  - [ ]* 7.5 Write property test for narrating thumbnail indicator (Property 11)
    - **Property 11: Narrating thumbnail indicator**
    - Generate slide array and optional narratingIndex; assert exactly one or zero pulsing indicators at correct position
    - **Validates: Requirements 4.6**

- [x] 8. Create `TranscriptionPanel` component (`components/slide-reviewer/TranscriptionPanel.tsx`)
  - [x] 8.1 Implement the TranscriptionPanel component
    - Accept props: `entries: TranscriptionEntry[]`, `currentSlideIndex: number`
    - Fixed max height (`max-h-[200px]`) with `overflow-y-auto`
    - Use `aria-live="polite"` and `role="log"` for screen reader support
    - Group entries by slide with heading dividers ("Slide X") when slide index changes
    - Agent text in default ink color; student text with `text-[var(--brand)]` prefixed with "You:"
    - Auto-scroll to bottom on new entries using `useEffect` with a ref
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 9.1, 9.3_
  - [ ]* 8.2 Write property test for transcription entry rendering (Property 12)
    - **Property 12: Transcription entries render with speaker-differentiated styling**
    - Generate arbitrary TranscriptionEntry arrays; assert all texts present and agent/student have different CSS classes
    - **Validates: Requirements 6.1, 6.4**
  - [ ]* 8.3 Write property test for slide heading dividers (Property 13)
    - **Property 13: Slide heading dividers in transcription**
    - Generate entries spanning multiple distinct slideIndex values; assert correct number of dividers
    - **Validates: Requirements 6.3**

- [ ] 9. Checkpoint — Ensure all component tests pass
  - Run `npm test` and ensure all tests pass. Ask the user if questions arise.

- [x] 10. Create the `useVoiceAgent` hook (`hooks/useVoiceAgent.ts`)
  - [x] 10.1 Implement the useVoiceAgent custom hook
    - Define `VoiceAgentState` and `UseVoiceAgentReturn` types (including `TranscriptionEntry` type)
    - `startSession`: request microphone permission, call `POST /api/slide-review` for signed URL, open WebSocket
    - Handle WebSocket events: `user_transcript`, `agent_response`, `audio`, `interruption`, `ping`
    - Manage audio playback using `AudioContext` and queued audio chunks
    - `pauseSession`: suspend AudioContext, pause WebSocket message processing
    - `resumeSession`: resume AudioContext and message processing
    - `stopSession`: close WebSocket, stop microphone stream, reset state
    - `navigateToSlide`: interrupt current narration and start narrating new slide
    - **Fallback mode**: if API returns 503, use `SpeechSynthesis` to read slide content and generate mock transcription entries
    - Handle microphone permission denial: set `micPermission: "denied"`, allow listen-only mode
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5, 8.1_

- [x] 11. Create `SlideReviewerClient` component (`components/slide-reviewer/SlideReviewerClient.tsx`)
  - [x] 11.1 Implement the SlideReviewerClient component
    - Accept props: `courseName`, `fileName`, `fileId`, `slides: SlideData[]`
    - Manage `currentSlideIndex` state
    - Instantiate `useVoiceAgent` hook
    - Render header with back link (`<Link>` to `/courses/{courseId}`) + file name + course name
    - Render two-column grid: MainSlideView (left/center) + SlideThumbnailSidebar (right)
    - Render PlaybackControls toolbar between main view and transcription
    - Render TranscriptionPanel below controls
    - Wire playback control callbacks to useVoiceAgent methods
    - Handle keyboard navigation (ArrowLeft/ArrowRight) via `useEffect` with `keydown` listener, clamping at boundaries
    - When voice agent signals slide completion, advance `currentSlideIndex` and send new slide context
    - Handle error state for missing slide data
    - _Requirements: 2.1, 2.2, 2.4, 2.6, 2.7, 4.4, 8.1, 8.2, 8.3, 9.1_
  - [ ]* 11.2 Write property test for header displaying course and file names (Property 7)
    - **Property 7: Header displays course and file names**
    - Generate arbitrary non-empty course name and file name; assert both present in rendered header
    - **Validates: Requirements 2.7**
  - [ ]* 11.3 Write property test for keyboard navigation with boundary clamping (Property 15)
    - **Property 15: Keyboard navigation with boundary clamping**
    - Generate slide array length and current index; simulate ArrowLeft/ArrowRight; assert index clamped correctly
    - **Validates: Requirements 8.3**
  - [ ]* 11.4 Write property test for auto-advance on narration completion (Property 10)
    - **Property 10: Auto-advance on narration completion**
    - Generate slide array length and current index; simulate narration completion; assert index advances or session stops at last slide
    - **Validates: Requirements 4.4, 4.5**

- [x] 12. Create the Slide Reviewer page (`app/courses/[courseId]/review/[fileId]/page.tsx`)
  - [x] 12.1 Implement the server component page
    - Resolve `courseId` from `courses` array in `lib/courses.ts`
    - Recursively search course's `files` tree using `findFileNode` to find file matching `fileId`
    - If course not found: render error state ("Course not found") with back link to `/`
    - If file not found: render error state ("File not found") with back link to `/courses/{courseId}`
    - If file not eligible type: render error state ("This file type does not support AI Review") with back link
    - If valid: load slides from `getSlides(fileId)`, render `<SlideReviewerClient>` with course name, file name, file ID, and slide data
    - _Requirements: 2.1, 3.3, 3.4_

- [x] 13. Modify `FileNode` component to add AI Review button
  - [x] 13.1 Update `FileNode` to accept a `courseId` prop and render the AI Review button on eligible files
    - Add `courseId: string` to `FileNodeProps`
    - Import `Link` from `next/link` and `SparkleIcon` from Phosphor
    - After file metadata span, conditionally render AI Review button for files with `.ppt`, `.pptx`, or `.pdf` extensions (use `isEligibleForReview`)
    - Button: `<Link>` styled as pill (`rounded-full px-2.5 py-1 text-[11.5px] font-medium`) with brand color, SparkleIcon, and label "AI Review"
    - `onClick` calls `e.stopPropagation()` to prevent parent row click
    - Add hover state using `hover:bg-[var(--brand-tint)]`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  - [x] 13.2 Update `FilesPanel` to pass `courseId` prop to `FileNode`
    - Add `courseId` prop to `FilesPanel` component
    - Pass `courseId` through to each `<FileNode>` instance
    - _Requirements: 1.3_
  - [x] 13.3 Update `CourseTabBar` (or parent) to pass `courseId` to `FilesPanel`
    - Ensure `courseId` flows from the course detail page through to `FilesPanel`
    - _Requirements: 1.3_
  - [ ]* 13.4 Write property test for AI Review link href construction (Property 2)
    - **Property 2: AI Review link href construction**
    - Generate arbitrary courseId and fileId; render FileNode for an eligible file; assert link href equals `/courses/{courseId}/review/{fileId}`
    - **Validates: Requirements 1.3**

- [ ] 14. Checkpoint — Ensure all tests pass and build succeeds
  - Run `npm test` and `npx tsc --noEmit` to verify all tests pass and TypeScript compiles without errors. Ask the user if questions arise.

- [ ] 15. Final verification
  - [ ] 15.1 Run `npm run build` to verify the Next.js build succeeds with all new routes and components
    - Confirm `/courses/[courseId]/review/[fileId]` route is valid
    - Confirm `/api/slide-review` API route is valid
    - Fix any build errors
    - _Requirements: All_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The `useVoiceAgent` hook includes a SpeechSynthesis fallback so the full UI works without an ElevenLabs API key
- All code is TypeScript, matching the existing project conventions
