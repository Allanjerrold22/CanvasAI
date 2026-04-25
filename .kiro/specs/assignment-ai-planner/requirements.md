# Requirements Document

## Introduction

The Assignment Detail Page with AI Planner is a new feature for the CanvasAI student learning platform. It introduces a dedicated page at `/assignments/[id]` where students can view full assignment details, see their teammates, submit work, and launch an AI-powered planning assistant. The AI Planner uses the Claude API to generate milestone-based study plans tailored to the assignment's deadline and scope. Plans are presented in a polished popup overlay with a streaming "thinking" UI, horizontal milestone progress cards, and a guided permission flow that adds milestones to the student's calendar and schedules team meeting links in Google Calendar. The feature extends the existing design system (Tailwind tokens, Phosphor icons, rounded-2xl cards, pill badges) and integrates with the existing `CourseAssignment` data model.

---

## Glossary

- **Assignment_Detail_Page**: The Next.js page rendered at `/assignments/[id]` that displays full information for a single assignment.
- **Assignment_Header**: The top section of the Assignment_Detail_Page showing the assignment title, course name, due date, and status badge.
- **Details_Tab**: The tab panel on the Assignment_Detail_Page that shows the assignment description, instructions, and submission area.
- **Teammates_Tab**: The tab panel on the Assignment_Detail_Page that lists all teammates assigned to the same assignment.
- **Teammate_Card**: A row item in the Teammates_Tab showing a teammate's avatar, name, role, and online/offline status.
- **Submission_Area**: The file upload zone within the Details_Tab where a student can attach and submit assignment files.
- **AI_Planner_Button**: The trigger button on the Assignment_Detail_Page that opens the AI_Planner_Modal.
- **AI_Planner_Modal**: The full-screen popup overlay containing the AI planning interface, rendered with a white gradient background.
- **Thinking_Phase**: The first phase of the AI_Planner_Modal in which the Claude API streams a reasoning response token-by-token with a shimmer animation.
- **Plan_Selection_Phase**: The second phase of the AI_Planner_Modal in which 2–3 generated plan options are displayed as horizontal milestone cards for the student to choose from.
- **Plan_Card**: A selectable card in the Plan_Selection_Phase showing a plan name, milestone count, estimated completion date, and a horizontal milestone progress bar.
- **Milestone_Progress_Bar**: A horizontal bar within a Plan_Card that marks the position of each milestone as a labeled node along a timeline.
- **Permission_Flow**: The multi-step in-modal UI that requests calendar reminder permission and Google Calendar meeting scheduling permission after a plan is selected.
- **Milestone**: A named checkpoint within a plan, carrying a title, target date, and optional reminder flag.
- **Milestone_Card**: A post-confirmation card displayed in the Assignment_Detail_Page or modal that shows a milestone's title, date, and reminder badge.
- **Claude_API**: The Anthropic Claude API used as the AI backend for generating assignment plans.
- **Google_Calendar_API**: The Google Calendar API used to create milestone reminder events and schedule team meeting links.
- **Assignment_Data_Model**: The extended `CourseAssignment` type in `lib/courses.ts` that carries the additional fields needed by this feature.

---

## Requirements

### Requirement 1: Assignment Detail Page Route

**User Story:** As a student, I want to navigate to a dedicated page for each assignment, so that I can view full details, submit work, and access planning tools in one place.

#### Acceptance Criteria

1. THE Assignment_Detail_Page SHALL be accessible at the URL path `/assignments/[id]`, where `[id]` matches the `id` field of a `CourseAssignment` object.
2. WHEN a student clicks an assignment row on the global Assignments page (`/assignments`), THE Assignment row SHALL navigate the student to the corresponding Assignment_Detail_Page.
3. IF the `[id]` parameter does not match any known assignment, THEN THE Assignment_Detail_Page SHALL render a "Assignment not found" message and provide a link back to `/assignments`.
4. THE Assignment_Detail_Page SHALL render within the existing root layout, preserving the Sidebar navigation.

---

### Requirement 2: Assignment Header

**User Story:** As a student, I want to see the assignment title, course, due date, and status at a glance, so that I immediately understand what is required and when it is due.

#### Acceptance Criteria

1. THE Assignment_Header SHALL display the assignment `title` as the primary heading.
2. THE Assignment_Header SHALL display the parent course `code` and `name` as a secondary label beneath the title.
3. THE Assignment_Header SHALL display the assignment `dueDate` string with a `CalendarDotsIcon` (Phosphor) prefix.
4. THE Assignment_Header SHALL display a status badge using the same pill badge styles as the global Assignments page: amber for `due`, emerald for `submitted`, and rose for `overdue`.
5. THE Assignment_Header SHALL include the AI_Planner_Button, styled as a pill button using `bg-[var(--brand)] text-white` with a `SparkleIcon` (Phosphor) prefix.
6. THE Assignment_Header SHALL include a back link to `/assignments` using an `ArrowLeftIcon` (Phosphor), consistent with the back link pattern in `app/courses/[id]/page.tsx`.

---

### Requirement 3: Details Tab and Teammates Tab Navigation

**User Story:** As a student, I want to switch between assignment details and my teammates list using a tab bar, so that I can access both views without leaving the page.

#### Acceptance Criteria

1. THE Assignment_Detail_Page SHALL render a tab bar with exactly two tabs in order: "Details" and "Teammates".
2. THE tab bar SHALL use `role="tablist"` and each tab button SHALL use `role="tab"` with `aria-selected` set to `true` for the active tab and `false` for inactive tabs.
3. Each tab panel SHALL use `role="tabpanel"` and be associated with its tab via `aria-controls` and `aria-labelledby`.
4. WHEN a student clicks a tab, THE tab bar SHALL update the active tab and display the corresponding panel without a full page reload.
5. THE tab bar SHALL default to the Details tab when the page first loads.
6. THE active tab SHALL be visually distinguished using `bg-[var(--brand-tint)] text-[var(--brand)]` styles, consistent with the existing CourseTabBar component.
7. WHILE a tab is inactive, THE tab bar SHALL render that tab with `text-ink-muted` and apply `hover:text-ink` on pointer hover.

---

### Requirement 4: Details Tab — Assignment Description and Instructions

**User Story:** As a student, I want to read the full assignment description and instructions on the Details tab, so that I understand exactly what is expected.

#### Acceptance Criteria

1. THE Details_Tab SHALL display an "Instructions" section containing the assignment's full description text.
2. THE Details_Tab SHALL render the description in a `bg-surface border border-ink-border rounded-2xl` card, consistent with the design system.
3. THE Details_Tab SHALL display assignment metadata including: point value, submission type, and any attached rubric reference, each as a labeled row within the card.
4. IF no description is available for the assignment, THEN THE Details_Tab SHALL display the placeholder text "No instructions provided for this assignment."

---

### Requirement 5: Details Tab — Submission Area

**User Story:** As a student, I want to upload and submit my assignment files directly from the detail page, so that I can complete my submission without navigating away.

#### Acceptance Criteria

1. THE Submission_Area SHALL render a dashed-border upload zone with a `UploadSimpleIcon` (Phosphor) and the label "Drag files here or click to browse".
2. WHEN a student clicks the Submission_Area, THE Submission_Area SHALL open the browser's native file picker.
3. WHEN a student drags a file over the Submission_Area, THE Submission_Area SHALL apply a highlighted border using `border-[var(--brand)]` and a `bg-[var(--brand-tint)]` background to indicate an active drop target.
4. WHEN a file is selected or dropped, THE Submission_Area SHALL display the file name, size, and a remove button within the upload zone.
5. THE Submission_Area SHALL include a "Submit Assignment" button, styled as `bg-ink text-white rounded-full`, that is disabled until at least one file is attached.
6. WHEN the assignment `status` is `submitted`, THE Submission_Area SHALL display a "Submitted" confirmation state with a `CheckCircleIcon` and the submission date, replacing the upload zone.

---

### Requirement 6: Teammates Tab

**User Story:** As a student, I want to see a list of my teammates for this assignment, so that I can coordinate and collaborate effectively.

#### Acceptance Criteria

1. THE Teammates_Tab SHALL display a list of Teammate_Cards, one per teammate assigned to the assignment.
2. THE Teammate_Card SHALL display the teammate's avatar (initials-based, using a gradient background consistent with the Sidebar profile card), full name, and role (e.g., "Team Lead", "Member").
3. THE Teammate_Card SHALL display an online/offline status indicator: a filled green dot for online and a hollow grey dot for offline, positioned at the bottom-right of the avatar.
4. THE Teammates_Tab SHALL render the teammate list inside a `bg-surface border border-ink-border rounded-2xl shadow-subtle` container with rows separated by `divide-y divide-ink-border`.
5. IF the assignment has no teammates, THEN THE Teammates_Tab SHALL display the empty-state message "No teammates assigned to this assignment."

---

### Requirement 7: AI Planner Button and Modal Trigger

**User Story:** As a student, I want to open an AI planning assistant from the assignment page, so that I can generate a structured study plan tailored to my deadline.

#### Acceptance Criteria

1. THE AI_Planner_Button SHALL be visible in the Assignment_Header at all times regardless of assignment status.
2. WHEN a student clicks the AI_Planner_Button, THE AI_Planner_Modal SHALL open with a smooth fade-in transition (opacity 0 → 1, duration 200ms).
3. THE AI_Planner_Modal SHALL render as a full-viewport overlay with a white gradient background: `linear-gradient(135deg, #ffffff 0%, #f7f7f8 50%, rgba(140,29,64,0.04) 100%)`.
4. THE AI_Planner_Modal SHALL render its content panel with a slide-up entrance animation (translateY 24px → 0, duration 300ms, ease-out).
5. THE AI_Planner_Modal SHALL include a close button (×) in the top-right corner that dismisses the modal.
6. WHEN the AI_Planner_Modal is open, THE page body SHALL not scroll (overflow hidden applied to body).
7. WHEN a student presses the Escape key while the AI_Planner_Modal is open, THE AI_Planner_Modal SHALL close.

---

### Requirement 8: AI Planner — Thinking Phase (Streaming UI)

**User Story:** As a student, I want to see the AI reasoning through my assignment in real time, so that I feel confident the plan is thoughtful and tailored to my specific work.

#### Acceptance Criteria

1. WHEN the AI_Planner_Modal opens, THE Thinking_Phase SHALL begin immediately by sending the assignment title, description, and due date to the Claude_API via a streaming request.
2. THE Thinking_Phase SHALL render a vertical scrollable area in which Claude's streamed response tokens appear one by one from top to bottom.
3. WHILE tokens are streaming, THE Thinking_Phase SHALL apply a shimmer animation to the last rendered line: a horizontal gradient sweep from `transparent` → `rgba(140,29,64,0.15)` → `transparent` cycling at 1.5s intervals.
4. THE Thinking_Phase SHALL display a pulsing `SparkleIcon` (Phosphor) in `text-[var(--brand)]` at the top of the streaming area to indicate active AI generation.
5. THE Thinking_Phase SHALL display a subtle progress indicator (e.g., animated dots or a thin brand-colored progress bar at the top of the modal) while streaming is in progress.
6. WHEN streaming completes, THE Thinking_Phase SHALL transition to the Plan_Selection_Phase with a smooth cross-fade (duration 250ms).
7. IF the Claude_API request fails, THEN THE Thinking_Phase SHALL display an inline error message "Unable to generate a plan. Please try again." with a retry button.

---

### Requirement 9: AI Planner — Plan Selection Phase

**User Story:** As a student, I want to choose from 2–3 AI-generated plan options presented as visual cards, so that I can pick the approach that best fits my schedule and working style.

#### Acceptance Criteria

1. THE Plan_Selection_Phase SHALL display 2–3 Plan_Cards arranged horizontally (side by side) within the modal content area.
2. THE Plan_Card SHALL display: a plan name (e.g., "Steady Pace", "Sprint Mode", "Balanced"), a milestone count label (e.g., "4 milestones"), and an estimated completion date.
3. THE Plan_Card SHALL display a Milestone_Progress_Bar: a horizontal track with labeled nodes at each milestone position, where node position is proportional to the time between the current date and the due date.
4. THE Milestone_Progress_Bar SHALL render each milestone node as a filled circle with a short label below it (milestone title truncated to 12 characters).
5. WHEN a student hovers over a Plan_Card, THE Plan_Card SHALL apply a `border-[var(--brand)]` border and `shadow-card` elevation to indicate selectability.
6. WHEN a student clicks a Plan_Card, THE Plan_Card SHALL render a selected state with `bg-[var(--brand-tint)] border-[var(--brand)]` and a checkmark badge in the top-right corner.
7. WHEN a plan is selected, THE Plan_Selection_Phase SHALL display a "Set Up Reminders & Meetings" CTA button in `bg-[var(--brand)] text-white rounded-full` style below the cards.
8. THE Plan_Selection_Phase SHALL animate each Plan_Card into view with a staggered fade-up (each card delayed by 80ms from the previous) when the phase first renders.

---

### Requirement 10: Permission Flow — Calendar Reminders

**User Story:** As a student, I want to grant the app permission to add milestone reminders to my calendar, so that I receive timely notifications for each step of my plan.

#### Acceptance Criteria

1. WHEN a student clicks "Set Up Reminders & Meetings", THE Permission_Flow SHALL replace the Plan_Selection_Phase content with Step 1: a calendar reminder permission request screen.
2. THE Step 1 screen SHALL display a `CalendarDotsIcon` (Phosphor) illustration, a heading "Add milestone reminders to your calendar?", and a brief description of what will be added.
3. THE Step 1 screen SHALL list each milestone from the selected plan as a preview item showing the milestone title and target date.
4. THE Step 1 screen SHALL include an "Allow" button (styled `bg-[var(--brand)] text-white rounded-full`) and a "Skip" link in `text-ink-muted`.
5. WHEN a student clicks "Allow" on Step 1, THE Permission_Flow SHALL record calendar permission as granted and advance to Step 2.
6. WHEN a student clicks "Skip" on Step 1, THE Permission_Flow SHALL record calendar permission as skipped and advance to Step 2.

---

### Requirement 11: Permission Flow — Google Calendar Meeting Scheduling

**User Story:** As a student, I want to grant the app permission to schedule team meeting links in Google Calendar, so that my team has structured check-in sessions aligned with the plan milestones.

#### Acceptance Criteria

1. THE Step 2 screen SHALL display a Google Calendar icon, a heading "Schedule team meetings in Google Calendar?", and a description explaining that one meeting will be created per milestone.
2. THE Step 2 screen SHALL include an "Connect Google Calendar" button styled with the Google brand color (`#4285F4`) and a Google icon, and a "Skip" link in `text-ink-muted`.
3. WHEN a student clicks "Connect Google Calendar", THE Permission_Flow SHALL initiate the Google OAuth flow in a popup window.
4. WHEN the Google OAuth flow completes successfully, THE Permission_Flow SHALL advance to the confirmation step.
5. WHEN a student clicks "Skip" on Step 2, THE Permission_Flow SHALL advance to the confirmation step without scheduling meetings.
6. IF the Google OAuth flow fails or is cancelled, THEN THE Permission_Flow SHALL display an inline error "Could not connect to Google Calendar. Please try again." and remain on Step 2.

---

### Requirement 12: Permission Flow — Confirmation and Milestone Cards

**User Story:** As a student, I want to see a confirmation screen after granting permissions, so that I know my plan has been saved and my milestones are set up.

#### Acceptance Criteria

1. WHEN all permission steps are complete, THE Permission_Flow SHALL display a confirmation screen with a `CheckCircleIcon` (Phosphor, `text-emerald-500`), a heading "Your plan is set!", and a summary of what was created.
2. THE confirmation screen SHALL list each Milestone_Card showing: milestone title, target date formatted as "MMM D, YYYY", and a reminder badge ("Reminder set" in amber or "No reminder" in grey) based on whether calendar permission was granted.
3. WHEN Google Calendar permission was granted, THE Milestone_Card SHALL also display a "Meeting scheduled" badge in blue.
4. THE confirmation screen SHALL include a "View in Calendar" button that navigates to `/calendar` and closes the modal.
5. THE confirmation screen SHALL include a "Done" button that closes the modal and returns the student to the Assignment_Detail_Page.
6. WHEN the modal is closed after confirmation, THE Assignment_Detail_Page SHALL display a persistent milestone timeline section below the tab bar, showing all Milestone_Cards in a horizontal scrollable row.

---

### Requirement 13: Milestone Timeline on Assignment Detail Page

**User Story:** As a student, I want to see my active plan's milestones directly on the assignment page after setup, so that I can track progress without reopening the AI planner.

#### Acceptance Criteria

1. WHEN a plan has been confirmed, THE Assignment_Detail_Page SHALL render a "Your Plan" section between the Assignment_Header and the tab bar.
2. THE "Your Plan" section SHALL display a horizontal scrollable row of Milestone_Cards.
3. THE Milestone_Card SHALL display: milestone title, target date, a reminder badge, and a completion checkbox.
4. WHEN a student checks the completion checkbox on a Milestone_Card, THE Milestone_Card SHALL apply a strikethrough to the title and a `bg-emerald-100` background to indicate completion.
5. THE "Your Plan" section SHALL display a thin horizontal progress bar above the milestone row, where the filled portion reflects the percentage of completed milestones.
6. THE "Your Plan" section SHALL include an "Edit Plan" button that reopens the AI_Planner_Modal in Plan_Selection_Phase with the current plan pre-selected.

---

### Requirement 14: Data Model Extensions

**User Story:** As a developer, I want the assignment and course data models to carry the additional fields needed by the Assignment Detail Page, so that all panels can render realistic content without external data fetching.

#### Acceptance Criteria

1. THE `CourseAssignment` type in `lib/courses.ts` SHALL be extended with an optional `description` field of type `string` containing the full assignment instructions.
2. THE `CourseAssignment` type SHALL be extended with an optional `points` field of type `number` representing the point value of the assignment.
3. THE `CourseAssignment` type SHALL be extended with an optional `submissionType` field of type `string` (e.g., `"File Upload"`, `"Text Entry"`).
4. THE `CourseAssignment` type SHALL be extended with an optional `teammates` field of type `Teammate[]`, where `Teammate` includes: `id` (string), `name` (string), `role` (string), `initials` (string), `avatarColor` (string), and `online` (boolean).
5. THE `CourseAssignment` type SHALL be extended with an optional `milestones` field of type `Milestone[]`, where `Milestone` includes: `id` (string), `title` (string), `targetDate` (string), `completed` (boolean), `reminderSet` (boolean), and `meetingScheduled` (boolean).
6. THE mock data in `lib/courses.ts` SHALL include at least one assignment with a populated `description`, `points`, `submissionType`, `teammates` (at least 3 entries with mixed online/offline status), and an empty `milestones` array (populated after AI planner confirmation).
7. THE global assignments list in `app/assignments/page.tsx` SHALL be updated to source its data from `lib/courses.ts` rather than a local static array, so that assignment IDs are consistent across pages.
