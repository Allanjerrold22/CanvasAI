# Requirements Document

## Introduction

The AI Slide Reviewer is a feature for the CanvasAI student learning platform that allows students to receive AI-powered voice briefings of lecture slides uploaded by professors. When a student opens a PPT, PPTX, or PDF file from the course Files tab, they can launch an AI Review experience that presents slides in a minimalistic viewer while an ElevenLabs voice agent narrates each slide in 30–60 seconds. The student can interrupt the agent to ask questions, pause/resume playback, and follow along with a live transcription panel. The feature uses mock slide data (no actual file parsing) and integrates with the ElevenLabs Conversational AI API for voice narration.

## Glossary

- **Slide_Reviewer_Page**: The dedicated page at `/courses/[courseId]/review/[fileId]` that displays the slide viewer, voice agent controls, and transcription panel.
- **Voice_Agent**: The ElevenLabs Conversational AI voice agent that narrates slide content and responds to student questions.
- **Transcription_Panel**: The fixed panel at the bottom of the main slide view that displays real-time text transcription of the Voice_Agent speech.
- **Slide_Thumbnail_Sidebar**: The scrollable right sidebar showing thumbnail previews of all slides in the file.
- **Main_Slide_View**: The large central area displaying the currently selected slide at full size.
- **FileNode_Component**: The existing `FileNode.tsx` component that renders individual file and folder rows in the course Files tab.
- **AI_Review_Button**: The button rendered on eligible file rows (PPT, PPTX, PDF) in the FileNode_Component that navigates to the Slide_Reviewer_Page.
- **Playback_Controls**: The set of UI controls (play, pause, stop) that allow the student to manage Voice_Agent narration.
- **Mock_Slide_Data**: Simulated slide content (title, bullet points, image placeholder) used in place of actual file parsing.
- **Review_Session**: The period from when the student starts the AI review until they stop it or all slides have been narrated.

## Requirements

### Requirement 1: AI Review Button on Eligible Files

**User Story:** As a student, I want to see an AI Review button on presentation and PDF files in the course Files tab, so that I can quickly launch the slide review experience.

#### Acceptance Criteria

1. WHEN a file with extension `.ppt`, `.pptx`, or `.pdf` is rendered in the FileNode_Component, THE FileNode_Component SHALL display the AI_Review_Button next to the file name.
2. WHEN a file has an extension other than `.ppt`, `.pptx`, or `.pdf`, THE FileNode_Component SHALL NOT display the AI_Review_Button.
3. WHEN the student clicks the AI_Review_Button for a file, THE FileNode_Component SHALL navigate the student to the Slide_Reviewer_Page at the route `/courses/[courseId]/review/[fileId]`.
4. THE AI_Review_Button SHALL display a recognizable icon and the label "AI Review" styled consistently with the CanvasAI design system (brand color, pill-shaped, Phosphor icon).
5. WHEN the student hovers over the AI_Review_Button, THE AI_Review_Button SHALL display a visual hover state using the brand tint color.

### Requirement 2: Slide Reviewer Page Layout

**User Story:** As a student, I want a minimalistic slide viewer page that shows the selected slide prominently with all other slides accessible in a sidebar, so that I can focus on the current slide while navigating freely.

#### Acceptance Criteria

1. WHEN the student navigates to `/courses/[courseId]/review/[fileId]`, THE Slide_Reviewer_Page SHALL render a full-width layout with the Main_Slide_View occupying the left/center area and the Slide_Thumbnail_Sidebar on the right.
2. THE Main_Slide_View SHALL display the currently selected slide content including the slide title, bullet points, and an image placeholder area.
3. THE Slide_Thumbnail_Sidebar SHALL display scrollable thumbnail previews of all slides in the file, arranged vertically.
4. WHEN the student clicks a thumbnail in the Slide_Thumbnail_Sidebar, THE Slide_Reviewer_Page SHALL update the Main_Slide_View to display the selected slide.
5. THE Slide_Thumbnail_Sidebar SHALL visually highlight the currently selected slide thumbnail with a brand-colored border.
6. THE Slide_Reviewer_Page SHALL display a back navigation link to return to the course detail page.
7. THE Slide_Reviewer_Page SHALL display the file name and course name in a header area above the slide viewer.

### Requirement 3: Mock Slide Data Model

**User Story:** As a developer, I want mock slide data for each eligible file, so that the slide viewer can render realistic content without requiring actual file parsing.

#### Acceptance Criteria

1. THE Mock_Slide_Data SHALL provide a collection of slides for each eligible file, where each slide contains a title (string), a list of bullet points (array of strings), and an image placeholder flag (boolean).
2. THE Mock_Slide_Data SHALL provide a minimum of 4 slides per file to simulate a realistic lecture presentation.
3. WHEN the Slide_Reviewer_Page loads for a given file ID, THE Slide_Reviewer_Page SHALL retrieve and render the corresponding Mock_Slide_Data.
4. IF the Slide_Reviewer_Page receives an invalid or unknown file ID, THEN THE Slide_Reviewer_Page SHALL display an error state with a message and a link back to the course page.

### Requirement 4: ElevenLabs Voice Agent Integration

**User Story:** As a student, I want an AI voice agent to briefly explain each slide to me, so that I can quickly understand the lecture material before a test.

#### Acceptance Criteria

1. WHEN the student clicks the "Start Review" button on the Slide_Reviewer_Page, THE Voice_Agent SHALL begin narrating the content of the currently selected slide.
2. THE Voice_Agent SHALL use the ElevenLabs Conversational AI API, authenticating with the API key stored in `process.env.ELEVENLABS_API_KEY`.
3. THE Voice_Agent SHALL narrate each slide for approximately 30 to 60 seconds, providing a concise briefing of the slide title and bullet points.
4. WHEN the Voice_Agent finishes narrating the current slide, THE Slide_Reviewer_Page SHALL automatically advance to the next slide and the Voice_Agent SHALL begin narrating the next slide.
5. WHEN the Voice_Agent finishes narrating the last slide in the file, THE Review_Session SHALL end and the Playback_Controls SHALL reflect the stopped state.
6. THE Slide_Reviewer_Page SHALL display a visual indicator (pulsing animation or icon) on the slide thumbnail currently being narrated by the Voice_Agent.

### Requirement 5: Student Interruption and Questions

**User Story:** As a student, I want to interrupt the voice agent and ask questions about the current slide, so that I can clarify concepts I do not understand.

#### Acceptance Criteria

1. WHILE the Voice_Agent is narrating a slide, THE Slide_Reviewer_Page SHALL allow the student to interrupt by speaking (using the browser microphone).
2. WHEN the student interrupts with a question, THE Voice_Agent SHALL pause the slide narration, process the student question, and respond conversationally.
3. WHEN the Voice_Agent finishes answering the student question, THE Voice_Agent SHALL resume narrating the current slide from where the narration was interrupted.
4. THE Slide_Reviewer_Page SHALL request microphone permission from the browser before starting the Review_Session.
5. IF the student denies microphone permission, THEN THE Slide_Reviewer_Page SHALL display a message explaining that microphone access is required for the conversational feature and allow the student to proceed with listen-only mode.

### Requirement 6: Real-Time Transcription Panel

**User Story:** As a student, I want to see a live transcription of what the voice agent is saying, so that I can read along and reference the content visually.

#### Acceptance Criteria

1. WHILE the Voice_Agent is speaking, THE Transcription_Panel SHALL display the real-time text transcription of the Voice_Agent speech at the bottom of the Main_Slide_View.
2. THE Transcription_Panel SHALL automatically scroll to show the most recent transcription text as new content appears.
3. WHEN a new slide narration begins, THE Transcription_Panel SHALL visually separate the new slide transcription from the previous slide transcription with a slide heading divider.
4. THE Transcription_Panel SHALL display both the Voice_Agent narration and the student questions (if any) with distinct visual styling to differentiate speakers.
5. THE Transcription_Panel SHALL have a fixed maximum height and become scrollable when the transcription content exceeds the visible area.

### Requirement 7: Playback Controls

**User Story:** As a student, I want to pause, resume, and stop the voice narration, so that I can control the review pace according to my needs.

#### Acceptance Criteria

1. WHILE the Voice_Agent is narrating, THE Playback_Controls SHALL display a Pause button that, when clicked, pauses the Voice_Agent narration.
2. WHILE the Voice_Agent narration is paused, THE Playback_Controls SHALL display a Play button that, when clicked, resumes the Voice_Agent narration from where it was paused.
3. THE Playback_Controls SHALL display a Stop button that, when clicked, ends the current Review_Session entirely.
4. WHEN the Review_Session is stopped, THE Playback_Controls SHALL reset to display a "Start Review" button to allow the student to begin a new session.
5. THE Playback_Controls SHALL be positioned in a fixed toolbar area between the Main_Slide_View and the Transcription_Panel.
6. WHILE the Voice_Agent is narrating, THE Playback_Controls SHALL display a visual indicator (animated waveform or pulsing dot) to show that audio is active.

### Requirement 8: Slide Navigation During Review

**User Story:** As a student, I want to manually navigate to any slide during the review session, so that I can skip ahead or revisit a previous slide.

#### Acceptance Criteria

1. WHILE a Review_Session is active, WHEN the student clicks a slide thumbnail in the Slide_Thumbnail_Sidebar, THE Voice_Agent SHALL stop narrating the current slide and begin narrating the newly selected slide.
2. WHEN the student manually navigates to a slide, THE Transcription_Panel SHALL append a navigation marker indicating the slide change.
3. THE Slide_Reviewer_Page SHALL support keyboard navigation: the right arrow key advances to the next slide and the left arrow key returns to the previous slide.

### Requirement 9: Responsive and Accessible Layout

**User Story:** As a student, I want the slide reviewer to be accessible and usable on different screen sizes, so that I can use the feature on my laptop or desktop.

#### Acceptance Criteria

1. THE Slide_Reviewer_Page SHALL use semantic HTML elements and ARIA attributes for the slide viewer, sidebar, transcription panel, and playback controls.
2. THE Playback_Controls SHALL be fully operable using keyboard navigation (Tab to focus, Enter/Space to activate).
3. THE Transcription_Panel SHALL use an ARIA live region so that screen readers announce new transcription text as it appears.
4. WHILE the Voice_Agent is narrating, THE Slide_Reviewer_Page SHALL display the current slide number and total slide count (e.g., "Slide 3 of 12") in a visible and accessible location.

### Requirement 10: API Route for Voice Agent

**User Story:** As a developer, I want a server-side API route that securely communicates with the ElevenLabs API, so that the API key is never exposed to the client.

#### Acceptance Criteria

1. THE Slide_Reviewer_Page SHALL communicate with the ElevenLabs API through a Next.js API route at `/api/slide-review`.
2. THE API route SHALL read the ElevenLabs API key from `process.env.ELEVENLABS_API_KEY` and never expose the key to the client.
3. WHEN the API route receives a request with slide content, THE API route SHALL forward the content to the ElevenLabs Conversational AI API and return the response to the client.
4. IF the ElevenLabs API returns an error or is unreachable, THEN THE API route SHALL return a structured error response with an appropriate HTTP status code and error message.
5. IF the `ELEVENLABS_API_KEY` environment variable is not configured, THEN THE API route SHALL return a 503 status with a message indicating the service is not configured.
