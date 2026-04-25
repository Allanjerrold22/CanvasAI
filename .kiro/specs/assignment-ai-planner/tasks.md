# Implementation Plan: Assignment Detail Page with AI Planner

## Overview

Implement the Assignment Detail Page (`/assignments/[id]`) with an AI-powered planning assistant. The work is broken into incremental steps: extend the data model, build the static page shell and header, add the tab bar and panels, wire up the submission area, build the AI Planner modal phases in order (thinking → plan selection → permission flow → confirmation), and finally surface the confirmed milestone timeline on the page.

## Tasks

- [x] 1. Extend data models and update mock data in `lib/courses.ts`
  - Add `Teammate` and `Milestone` types to `lib/courses.ts`
  - Extend `CourseAssignment` with optional `description`, `points`, `submissionType`, `teammates`, and `milestones` fields
  - Add rich mock data to at least one assignment in `cse-310` with a full `description`, `points`, `submissionType`, at least 3 teammates (mixed online/offline), and an empty `milestones` array
  - Export the `Plan` and `PlanMilestone` types (used by AI Planner components) from a new file `lib/types.ts`
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6_

- [x] 2. Update global assignments page to source data from `lib/courses.ts`
  - Modify `app/assignments/page.tsx` to replace the local static array with data derived from `courses` in `lib/courses.ts` (flatten all `course.assignments` arrays, attach the parent course label)
  - Wrap each assignment `<li>` in a `<Link href={/assignments/${a.id}}>` so clicking navigates to the detail page
  - _Requirements: 1.2, 14.7_

- [x] 3. Create the `app/assignments/[id]/page.tsx` server component and `AssignmentDetailClient` wrapper
  - Create `app/assignments/[id]/page.tsx` as a server component that resolves the assignment by `id` across all courses in `lib/courses.ts`
  - Render a "Assignment not found" card with a back link to `/assignments` when no match is found
  - Create `components/assignment-detail/AssignmentDetailClient.tsx` as a client component that holds `useState` for modal open/close and confirmed milestones, and renders `AssignmentHeader`, `MilestonePlanSection` (hidden until milestones exist), and `AssignmentTabBar`
  - _Requirements: 1.1, 1.3, 1.4_

- [x] 4. Implement `AssignmentHeader` component
  - Create `components/assignment-detail/AssignmentHeader.tsx`
  - Render back link to `/assignments` with `ArrowLeftIcon`
  - Render assignment `title` as `<h1>`, course `code` + `name` as secondary label
  - Render `dueDate` with `CalendarDotsIcon`
  - Render status badge (amber/emerald/rose pill) matching the global assignments page style
  - Render AI Planner button with `SparkleIcon`, `bg-[var(--brand)] text-white rounded-full`, calling `onOpenPlanner` prop
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [ ]* 4.1 Write property test for `AssignmentHeader` — Property 1: all required fields rendered
    - **Property 1: Assignment header renders all required fields for any assignment**
    - **Validates: Requirements 2.1, 2.2, 2.3**

  - [ ]* 4.2 Write property test for `AssignmentHeader` — Property 2: status badge color
    - **Property 2: Status badge color matches assignment status**
    - **Validates: Requirements 2.4**

  - [ ]* 4.3 Write property test for `AssignmentHeader` — Property 3: AI Planner button always visible
    - **Property 3: AI Planner button is always visible regardless of assignment status**
    - **Validates: Requirements 7.1**

- [x] 5. Implement `AssignmentTabBar`, `DetailsPanel`, and `TeammatesPanel`
  - [x] 5.1 Create `components/assignment-detail/AssignmentTabBar.tsx` as a client component
    - Manage `activeTab: 'details' | 'teammates'` state, defaulting to `'details'`
    - Render `role="tablist"` pill bar with two `role="tab"` buttons using `aria-selected`, `aria-controls`, and `id` attributes
    - Render `DetailsPanel` and `TeammatesPanel` in `role="tabpanel"` divs, toggled via `hidden` attribute
    - Apply `bg-[var(--brand-tint)] text-[var(--brand)]` to active tab; `text-ink-muted hover:text-ink` to inactive tab
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [ ]* 5.2 Write property test for `AssignmentTabBar` — Property 4: ARIA attributes consistent with active tab
    - **Property 4: Tab ARIA attributes are always consistent with active tab state**
    - **Validates: Requirements 3.2, 3.3, 3.4, 3.6**

  - [x] 5.3 Create `components/assignment-detail/DetailsPanel.tsx`
    - Render instructions card (`bg-surface border border-ink-border rounded-2xl`) with `description` text or placeholder "No instructions provided for this assignment."
    - Render metadata rows for `points` and `submissionType` when present
    - Render `SubmissionArea` component (to be created in task 6)
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ]* 5.4 Write property test for `DetailsPanel` — Property 5: description renders or shows placeholder
    - **Property 5: Details tab renders description for any assignment with a description**
    - **Validates: Requirements 4.1, 4.4**

  - [ ]* 5.5 Write property test for `DetailsPanel` — Property 6: metadata fields rendered when present
    - **Property 6: Details tab renders all metadata fields present on an assignment**
    - **Validates: Requirements 4.3**

  - [x] 5.6 Create `components/assignment-detail/TeammatesPanel.tsx` and `TeammateCard.tsx`
    - `TeammatesPanel`: render `bg-surface border border-ink-border rounded-2xl shadow-subtle` container with `divide-y divide-ink-border` rows; render empty-state message when `teammates` is empty or undefined
    - `TeammateCard`: render initials avatar with `avatarColor` gradient, name, role, and online indicator dot (filled green or hollow grey, `absolute bottom-0 right-0`)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ]* 5.7 Write property test for `TeammatesPanel` — Property 11: one card per teammate
    - **Property 11: Teammates tab renders exactly one card per teammate**
    - **Validates: Requirements 6.1, 6.5**

  - [ ]* 5.8 Write property test for `TeammateCard` — Property 12: all fields rendered correctly
    - **Property 12: Teammate card renders all fields for any teammate**
    - **Validates: Requirements 6.2, 6.3**

- [x] 6. Implement `SubmissionArea` component
  - Create `components/assignment-detail/SubmissionArea.tsx` as a client component
  - Manage `files: File[]` and `isDragOver: boolean` state
  - Render dashed-border drop zone with `UploadSimpleIcon` and label "Drag files here or click to browse"
  - Apply `border-[var(--brand)] bg-[var(--brand-tint)]` on drag-over; remove on drag-leave/drop
  - Render file list with name, size, and remove button per file
  - Render "Submit Assignment" button (`bg-ink text-white rounded-full`), disabled when `files.length === 0`
  - Render submitted confirmation state (`CheckCircleIcon` + submission date) when `assignment.status === 'submitted'`
  - Use a hidden `<input type="file">` triggered by clicking the zone
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [ ]* 6.1 Write property test for `SubmissionArea` — Property 7: button disabled state matches file list
    - **Property 7: Submission area button disabled state matches file attachment state**
    - **Validates: Requirements 5.5**

  - [ ]* 6.2 Write property test for `SubmissionArea` — Property 8: submitted state for submitted assignments
    - **Property 8: Submission area shows confirmation state for submitted assignments**
    - **Validates: Requirements 5.6**

  - [ ]* 6.3 Write property test for `SubmissionArea` — Property 9: drag-over applies brand styles
    - **Property 9: Drag-over state applies brand highlight styles**
    - **Validates: Requirements 5.3**

  - [ ]* 6.4 Write property test for `SubmissionArea` — Property 10: file info displayed for any selected file
    - **Property 10: File selection displays file info for any selected file**
    - **Validates: Requirements 5.4**

- [ ] 7. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Create the AI Planner API route
  - Create `app/api/ai-planner/route.ts`
  - Accept `POST` with JSON body `{ title, description, dueDate }`
  - Return `500 { error: "API key not configured" }` when `ANTHROPIC_API_KEY` is missing
  - Use `@anthropic-ai/sdk` with streaming enabled; pipe the `ReadableStream` back as `text/event-stream`
  - Include a system prompt that instructs Claude to reason about the assignment first, then output a JSON block delimited by `---PLANS_START---` / `---PLANS_END---` containing 2–3 plan objects
  - _Requirements: 8.1, 8.7_

- [x] 9. Implement `AIPlannerModal` shell and `ThinkingPhase`
  - [x] 9.1 Create `components/assignment-detail/AIPlannerModal.tsx` as a client component
    - Manage `phase`, `streamedText`, `plans`, `selectedPlan`, `calendarPermission`, `googlePermission` state
    - Apply `overflow-hidden` to `document.body` on mount; remove on unmount
    - Listen for `keydown` Escape to close; render close button (×) in top-right corner
    - Render full-viewport overlay with `linear-gradient(135deg, #ffffff 0%, #f7f7f8 50%, rgba(140,29,64,0.04) 100%)` background
    - Apply fade-in (opacity 0→1, 200ms) on overlay and slide-up (translateY 24px→0, 300ms ease-out) on content panel
    - Render the appropriate phase component based on `phase` state
    - _Requirements: 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

  - [ ]* 9.2 Write property test for `AIPlannerModal` — Property 13: body scroll lock matches open state
    - **Property 13: Modal body scroll lock matches modal open state**
    - **Validates: Requirements 7.6**

  - [x] 9.3 Create `components/assignment-detail/ThinkingPhase.tsx`
    - On mount, `fetch('/api/ai-planner', { method: 'POST', body: JSON.stringify({ title, description, dueDate }) })` and read `ReadableStream`, appending each decoded chunk to `streamedText`
    - Render pulsing `SparkleIcon` in `text-[var(--brand)]`, thin brand-colored progress bar at top, and scrollable `<pre>`-style area with `aria-live="polite"` for streamed text
    - Apply shimmer CSS keyframe animation to the last rendered line
    - On stream end, parse `---PLANS_START---` / `---PLANS_END---` block into `Plan[]`; fall back to 2 default plan templates if parsing fails; call `onComplete(plans)`
    - On error, set phase to `'error'` and render inline error message with retry button
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

  - [ ]* 9.4 Write property test for `ThinkingPhase` — Property 14: streamed tokens accumulate in order
    - **Property 14: Streamed tokens accumulate in display order**
    - **Validates: Requirements 8.2**

  - [ ]* 9.5 Write property test for `AIPlannerModal` — Property 15: transitions to plan selection after stream
    - **Property 15: Thinking phase transitions to plan selection after stream completion**
    - **Validates: Requirements 8.6**

- [x] 10. Implement `PlanSelectionPhase`, `PlanCard`, and `MilestoneProgressBar`
  - [x] 10.1 Create `components/assignment-detail/MilestoneProgressBar.tsx`
    - Render horizontal track (`h-1 bg-ink-border rounded-full`) with relative positioning
    - For each milestone, calculate proportional position between today and `dueDate` and render an absolutely-positioned filled circle (`w-3 h-3 rounded-full bg-[var(--brand)]`) with a label below (title truncated to 12 characters)
    - _Requirements: 9.3, 9.4_

  - [ ]* 10.2 Write property test for `MilestoneProgressBar` — Property 18: one node per milestone, labels truncated
    - **Property 18: Milestone progress bar renders one node per milestone**
    - **Validates: Requirements 9.3, 9.4**

  - [x] 10.3 Create `components/assignment-detail/PlanCard.tsx`
    - Render plan name, milestone count label, estimated completion date, and `MilestoneProgressBar`
    - Apply selected state: `bg-[var(--brand-tint)] border-[var(--brand)]` + `CheckCircleIcon` badge in top-right corner
    - Apply hover: `border-[var(--brand)] shadow-card`
    - _Requirements: 9.2, 9.5, 9.6_

  - [ ]* 10.4 Write property test for `PlanCard` — Property 17: all required fields rendered for any plan
    - **Property 17: Plan card renders all required fields for any plan**
    - **Validates: Requirements 9.2**

  - [x] 10.5 Create `components/assignment-detail/PlanSelectionPhase.tsx`
    - Render 2–3 `PlanCard` components in a horizontal flex row
    - Animate each card with staggered fade-up (0ms, 80ms, 160ms delays) via inline `animationDelay` and a CSS `@keyframes fadeUp`
    - Show "Set Up Reminders & Meetings" CTA button (`bg-[var(--brand)] text-white rounded-full`) only when `selectedPlan !== null`
    - _Requirements: 9.1, 9.7, 9.8_

  - [ ]* 10.6 Write property test for `PlanSelectionPhase` — Property 16: one card per plan
    - **Property 16: Plan selection renders one card per plan**
    - **Validates: Requirements 9.1**

  - [ ]* 10.7 Write property test for `PlanSelectionPhase` — Property 19: CTA visible iff plan selected
    - **Property 19: Plan selection shows CTA button if and only if a plan is selected**
    - **Validates: Requirements 9.7**

  - [ ]* 10.8 Write property test for `PlanSelectionPhase` — Property 20: selected state on clicked card only
    - **Property 20: Plan card selected state is applied to the clicked card only**
    - **Validates: Requirements 9.6**

- [x] 11. Implement `PermissionFlow`, `ConfirmationStep`, and `MilestoneCard`
  - [x] 11.1 Create `components/assignment-detail/MilestoneCard.tsx` as a client component
    - Manage `completed: boolean` state initialized from `milestone.completed`
    - Render completion checkbox, title (strikethrough + `text-ink-muted` when completed), `bg-emerald-100` background when completed
    - Render target date, reminder badge (amber "Reminder set" or grey "No reminder"), and optional blue "Meeting scheduled" badge
    - _Requirements: 12.2, 12.3, 13.3, 13.4_

  - [ ]* 11.2 Write property test for `MilestoneCard` — Property 26: checkbox toggles visual state
    - **Property 26: Milestone card completion checkbox toggles visual state**
    - **Validates: Requirements 13.4**

  - [x] 11.3 Create `components/assignment-detail/PermissionFlow.tsx`
    - Manage `step: 1 | 2` state
    - Step 1: render `CalendarDotsIcon`, heading "Add milestone reminders to your calendar?", milestone preview list (title + target date per milestone), "Allow" button, and "Skip" link
    - Step 2: render Google Calendar icon, heading "Schedule team meetings in Google Calendar?", "Connect Google Calendar" button (`#4285F4`), and "Skip" link
    - On "Connect Google Calendar": open OAuth popup via `window.open`; handle `postMessage` callback to advance or show inline error; handle popup-blocked case; handle 2-minute timeout
    - Record `calendarPermission` and `googlePermission` and advance to confirmation
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

  - [ ]* 11.4 Write property test for `PermissionFlow` Step 1 — Property 21: lists all milestones
    - **Property 21: Permission flow Step 1 lists all milestones from the selected plan**
    - **Validates: Requirements 10.3**

  - [ ]* 11.5 Write property test for `PermissionFlow` Step 1 — Property 22: advances correctly on Allow or Skip
    - **Property 22: Permission flow advances correctly from Step 1 regardless of choice**
    - **Validates: Requirements 10.5, 10.6**

  - [ ]* 11.6 Write property test for `PermissionFlow` Step 2 — Property 23: Skip advances to confirmation
    - **Property 23: Permission flow advances to confirmation when Step 2 is skipped**
    - **Validates: Requirements 11.5**

  - [x] 11.7 Create `components/assignment-detail/ConfirmationStep.tsx`
    - Render `CheckCircleIcon` (`text-emerald-500`), heading "Your plan is set!", and list of `MilestoneCard` components
    - Pass `calendarPermission` and `googlePermission` to each `MilestoneCard` to control badge display
    - Render "View in Calendar" button (href `/calendar`, closes modal) and "Done" button (closes modal, calls `onConfirm(milestones)`)
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

  - [ ]* 11.8 Write property test for `ConfirmationStep` — Property 24: one MilestoneCard per milestone with correct badges
    - **Property 24: Confirmation screen renders one Milestone_Card per milestone with correct badges**
    - **Validates: Requirements 12.1, 12.2, 12.3**

- [ ] 12. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 13. Implement `MilestonePlanSection` and wire confirmed milestones to the page
  - [x] 13.1 Create `components/assignment-detail/MilestonePlanSection.tsx` as a client component
    - Render "Your Plan" heading with "Edit Plan" button (calls `onEditPlan` prop)
    - Render thin horizontal progress bar where fill width = `(completedCount / total) * 100%`
    - Render horizontal scrollable row of `MilestoneCard` components
    - _Requirements: 13.1, 13.2, 13.3, 13.5, 13.6_

  - [ ]* 13.2 Write property test for `MilestonePlanSection` — Property 27: progress bar reflects completion ratio
    - **Property 27: Milestone timeline progress bar reflects completion ratio**
    - **Validates: Requirements 13.5**

  - [x] 13.3 Wire `onPlanConfirmed` callback in `AssignmentDetailClient`
    - Pass `onPlanConfirmed` from `AssignmentDetailClient` down through `AIPlannerModal` → `ConfirmationStep`
    - On confirmation, store milestones in `useState` and render `MilestonePlanSection` between `AssignmentHeader` and `AssignmentTabBar`
    - Pass `onEditPlan` to `MilestonePlanSection` to reopen the modal in `plan-selection` phase
    - _Requirements: 12.6, 13.1_

  - [ ]* 13.4 Write property test for `AssignmentDetailClient` — Property 25: milestone timeline appears after confirmation
    - **Property 25: Milestone timeline appears on the page after plan confirmation**
    - **Validates: Requirements 12.6, 13.1, 13.2**

- [ ] 14. Set up property-based testing infrastructure
  - Install `fast-check` as a dev dependency: `npm install --save-dev fast-check`
  - Install a React testing library if not present: `npm install --save-dev @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom`
  - Create `jest.config.ts` (or `jest.config.js`) configured for Next.js with `jsdom` environment
  - Create `jest.setup.ts` importing `@testing-library/jest-dom`
  - Create `__tests__/assignment-ai-planner/` directory for all property and unit tests
  - _Requirements: (testing infrastructure for all properties above)_

- [ ] 15. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use `fast-check` with a minimum of 100 iterations per property
- Each property test file should include the tag comment: `// Feature: assignment-ai-planner, Property N: <property_text>`
- The `Plan` and `PlanMilestone` types live in `lib/types.ts` and are imported by AI Planner components; they are not persisted to `lib/courses.ts` until the user confirms a plan
- The Google OAuth flow in `PermissionFlow` uses a mock implementation (no real OAuth credentials required for the mock data phase)
- Task 14 (testing infrastructure) can be done first if tests are being written alongside implementation
