# Design Document — Assignment Detail Page with AI Planner

## Overview

The Assignment Detail Page (`/assignments/[id]`) is a new feature for the CanvasAI student platform. It gives students a single destination to read assignment instructions, submit files, see teammates, and launch an AI-powered planning assistant. The AI Planner uses the Anthropic Claude API to stream a reasoning response and then present 2–3 milestone-based plan options. After the student selects a plan and completes a short permission flow (calendar reminders + Google Calendar OAuth), the confirmed milestones are persisted back to the assignment page as a scrollable timeline.

The feature is built entirely within the existing Next.js 15 App Router project. It extends the current `CourseAssignment` data model, adds a new dynamic route, introduces a streaming API route, and adds several new client components — all following the established design system tokens, Phosphor icon library, and component conventions already present in the codebase.

### Key Design Goals

- **Zero new dependencies** beyond `@anthropic-ai/sdk` (already planned for the API route). No new UI libraries.
- **Consistent visual language**: every new surface uses the same `bg-surface border border-ink-border rounded-2xl shadow-subtle` card pattern, brand tokens, and Phosphor icons as the rest of the app.
- **Progressive disclosure**: the AI Planner is a layered modal experience — streaming → plan selection → permission flow → confirmation — so the student is never overwhelmed.
- **Accessibility first**: tab bars use full ARIA roles, the modal traps focus and responds to Escape, and all interactive elements have visible focus rings.

---

## Architecture

The feature follows the existing App Router pattern: a server page fetches data from `lib/courses.ts`, passes it to client components, and a separate API route handles the Claude streaming call.

```
app/
  assignments/
    [id]/
      page.tsx                  ← Server component: resolves assignment + course, renders shell
app/
  api/
    ai-planner/
      route.ts                  ← API Route: streams Claude response via @anthropic-ai/sdk

components/
  assignment-detail/
    AssignmentHeader.tsx        ← Header: title, course, due date, status badge, AI Planner button
    AssignmentTabBar.tsx        ← Tab bar: Details / Teammates (client, manages active tab state)
    DetailsPanel.tsx            ← Details tab: instructions card + submission area
    SubmissionArea.tsx          ← Drag-and-drop file upload zone (client)
    TeammatesPanel.tsx          ← Teammates tab: list of TeammateCard rows
    TeammateCard.tsx            ← Single teammate row: avatar, name, role, online indicator
    MilestonePlanSection.tsx    ← "Your Plan" persistent timeline (client, shown post-confirmation)
    MilestoneCard.tsx           ← Single milestone: title, date, badge, checkbox
    AIPlannerModal.tsx          ← Full-screen modal shell + phase orchestration (client)
    ThinkingPhase.tsx           ← Phase 1: streaming token display + shimmer
    PlanSelectionPhase.tsx      ← Phase 2: horizontal plan cards
    PlanCard.tsx                ← Single plan card with milestone progress bar
    MilestoneProgressBar.tsx    ← Horizontal track with labeled milestone nodes
    PermissionFlow.tsx          ← Multi-step permission wizard (calendar + Google Calendar)
    ConfirmationStep.tsx        ← Final confirmation screen with Milestone_Cards

lib/
  courses.ts                    ← Extended with Teammate, Milestone types + richer mock data
```

### Data Flow

```
lib/courses.ts (mock data)
       │
       ▼
app/assignments/[id]/page.tsx  (server, resolves assignment + parent course)
       │
       ├──► AssignmentHeader        (receives assignment + course props)
       ├──► MilestonePlanSection    (receives milestones prop; hidden until confirmed)
       └──► AssignmentTabBar        (receives assignment prop)
                 ├──► DetailsPanel  (receives assignment prop)
                 └──► TeammatesPanel (receives teammates prop)

AIPlannerModal (client, receives assignment prop)
       │
       ├──► ThinkingPhase
       │         └── fetch('/api/ai-planner', { method: 'POST', body: assignment data })
       │                   └── app/api/ai-planner/route.ts → Anthropic SDK streaming
       ├──► PlanSelectionPhase
       ├──► PermissionFlow
       └──► ConfirmationStep
                 └── onConfirm(milestones) → lifted state → MilestonePlanSection visible
```

The modal is mounted inside the `[id]/page.tsx` shell. Confirmed milestones are lifted via a callback prop (`onPlanConfirmed`) to the page's client wrapper, which stores them in `useState` and passes them down to `MilestonePlanSection`.

---

## Components and Interfaces

### `app/assignments/[id]/page.tsx`

Server component. Resolves the assignment by `id` across all courses in `lib/courses.ts`. Passes the resolved `assignment` and `course` to a client wrapper component (`AssignmentDetailClient`) that manages the modal open/close state and confirmed milestones.

```typescript
// Props passed to AssignmentDetailClient
type AssignmentDetailClientProps = {
  assignment: CourseAssignment;
  course: Course;
};
```

### `AssignmentHeader`

Receives `assignment` and `course`. Renders:
- Back link (`ArrowLeftIcon`, href `/assignments`)
- Title as `<h1>`
- Course code + name as secondary label
- Due date with `CalendarDotsIcon`
- Status badge (amber/emerald/rose pill)
- AI Planner button (`SparkleIcon`, `bg-[var(--brand)] text-white rounded-full`)

The AI Planner button calls an `onOpenPlanner` callback prop — it does not manage modal state itself.

### `AssignmentTabBar`

Client component. Manages `activeTab: 'details' | 'teammates'` state. Renders a `role="tablist"` pill bar matching the `CourseTabBar` pattern exactly. Renders `DetailsPanel` and `TeammatesPanel` in `role="tabpanel"` divs, toggled via `hidden` attribute.

### `DetailsPanel`

Receives `assignment`. Renders:
- Instructions card (`bg-surface border border-ink-border rounded-2xl`) with description text or placeholder
- Metadata rows: points, submission type
- `SubmissionArea` component

### `SubmissionArea`

Client component. Manages `files: File[]` and `isDragOver: boolean` state. Renders:
- Dashed-border drop zone with `UploadSimpleIcon` and label
- Drag-over state: `border-[var(--brand)] bg-[var(--brand-tint)]`
- File list with name, size, and remove button per file
- "Submit Assignment" button (disabled when `files.length === 0`)
- Submitted state: `CheckCircleIcon` + submission date (when `assignment.status === 'submitted'`)

Uses a hidden `<input type="file">` triggered by clicking the zone.

### `TeammatesPanel`

Receives `teammates: Teammate[]`. Renders a `bg-surface border border-ink-border rounded-2xl shadow-subtle` container with `divide-y divide-ink-border` rows. Empty state when array is empty.

### `TeammateCard`

Receives a `Teammate`. Renders:
- Avatar circle with initials, gradient background using `avatarColor`
- Online indicator dot: `bg-emerald-500` (online) or `border-2 border-ink-border bg-surface` (offline), positioned `absolute bottom-0 right-0`
- Name and role text

### `AIPlannerModal`

Client component. Manages:
- `phase: 'thinking' | 'plan-selection' | 'permission' | 'confirmation'`
- `streamedText: string` (accumulated tokens)
- `plans: Plan[]` (parsed from Claude response)
- `selectedPlan: Plan | null`
- `calendarPermission: 'granted' | 'skipped' | null`
- `googlePermission: 'granted' | 'skipped' | null`

Renders a fixed full-viewport overlay. Applies `overflow-hidden` to `document.body` on mount, removes on unmount. Listens for `keydown` Escape to close. Renders the appropriate phase component based on `phase` state.

### `ThinkingPhase`

Receives `assignmentTitle`, `description`, `dueDate`, and `onComplete(plans: Plan[])` callback. On mount, calls `fetch('/api/ai-planner', { method: 'POST', body: JSON.stringify({ title, description, dueDate }) })` and reads the `ReadableStream` body, appending each decoded chunk to `streamedText`. When the stream ends, parses the response into `Plan[]` and calls `onComplete`.

Renders:
- Pulsing `SparkleIcon` in `text-[var(--brand)]`
- Thin brand-colored progress bar at top of modal
- Scrollable `<pre>`-style area with streamed text
- Shimmer animation on the last line via a CSS keyframe class

### `PlanSelectionPhase`

Receives `plans: Plan[]` and `onSelect(plan: Plan)` callback. Renders 2–3 `PlanCard` components in a horizontal flex row. Each card fades up with a staggered delay (0ms, 80ms, 160ms) via inline `animationDelay` style and a CSS `@keyframes fadeUp` animation. Shows the CTA button once a plan is selected.

### `PlanCard`

Receives `plan: Plan`, `selected: boolean`, `onSelect()`. Renders:
- Plan name, milestone count, estimated completion date
- `MilestoneProgressBar`
- Selected state: `bg-[var(--brand-tint)] border-[var(--brand)]` + checkmark badge (`CheckCircleIcon`, `text-[var(--brand)]`) in top-right corner
- Hover: `border-[var(--brand)] shadow-card` (via Tailwind `group-hover` or direct hover classes)

### `MilestoneProgressBar`

Receives `milestones: Milestone[]` and `dueDate: string`. Renders a horizontal track (`h-1 bg-ink-border rounded-full`). For each milestone, calculates its proportional position between today and the due date and renders an absolutely-positioned filled circle (`w-3 h-3 rounded-full bg-[var(--brand)]`) with a label below (title truncated to 12 characters).

### `PermissionFlow`

Manages `step: 1 | 2` state. Renders `CalendarPermissionStep` (Step 1) or `GoogleCalendarStep` (Step 2) based on current step. Passes `onAllow`, `onSkip`, and `onAdvance` callbacks.

### `ConfirmationStep`

Receives `plan: Plan`, `calendarPermission`, `googlePermission`. Renders:
- `CheckCircleIcon` in `text-emerald-500`
- Heading "Your plan is set!"
- List of `MilestoneCard` components with reminder/meeting badges
- "View in Calendar" button (href `/calendar`, closes modal)
- "Done" button (closes modal, triggers `onConfirm(milestones)`)

### `MilestonePlanSection`

Client component. Receives `milestones: Milestone[]` and `onEditPlan()`. Renders:
- Section heading "Your Plan" with "Edit Plan" button
- Thin progress bar (filled width = `completedCount / total * 100%`)
- Horizontal scrollable row of `MilestoneCard` components

### `MilestoneCard`

Client component. Manages `completed: boolean` state (initialized from `milestone.completed`). Renders:
- Completion checkbox
- Title (strikethrough + `text-ink-muted` when completed)
- `bg-emerald-100` background when completed
- Target date
- Reminder badge: amber "Reminder set" or grey "No reminder"
- Optional blue "Meeting scheduled" badge

---

## Data Models

### Extended `CourseAssignment` type

```typescript
// lib/courses.ts additions

export type Teammate = {
  id: string;
  name: string;
  role: string;         // e.g. "Team Lead", "Member"
  initials: string;     // e.g. "AS"
  avatarColor: string;  // CSS gradient string or hex, e.g. "#8C1D40"
  online: boolean;
};

export type Milestone = {
  id: string;
  title: string;
  targetDate: string;       // ISO date string, e.g. "2026-04-21"
  completed: boolean;
  reminderSet: boolean;
  meetingScheduled: boolean;
};

export type CourseAssignment = {
  id: string;
  title: string;
  dueDate: string;
  status: "due" | "submitted" | "overdue";
  // New optional fields:
  description?: string;
  points?: number;
  submissionType?: string;  // e.g. "File Upload", "Text Entry"
  teammates?: Teammate[];
  milestones?: Milestone[];
};
```

### AI Planner internal types

These types are used only within the AI Planner components and the API route — they are not persisted to `lib/courses.ts` until the user confirms a plan.

```typescript
// Used in AIPlannerModal and child components

export type Plan = {
  id: string;
  name: string;           // e.g. "Steady Pace", "Sprint Mode", "Balanced"
  milestoneCount: number;
  estimatedCompletion: string;  // ISO date string
  milestones: PlanMilestone[];
};

export type PlanMilestone = {
  id: string;
  title: string;
  targetDate: string;  // ISO date string
};
```

### API Route request/response

```typescript
// POST /api/ai-planner
// Request body:
{
  title: string;
  description: string;
  dueDate: string;
}

// Response: text/event-stream (Server-Sent Events)
// Each chunk is a raw text token from Claude.
// After streaming completes, the full text is parsed client-side
// to extract 2–3 plan objects embedded in a structured JSON block
// that Claude is prompted to include at the end of its response.
```

The API route uses the `@anthropic-ai/sdk` package with `stream: true`. The system prompt instructs Claude to first reason about the assignment (the streamed "thinking" text), then output a JSON block delimited by `---PLANS_START---` / `---PLANS_END---` containing the plan array. The client splits on these delimiters to separate the display text from the structured data.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Assignment header renders all required fields for any assignment

*For any* `CourseAssignment` and its parent `Course`, rendering the `AssignmentHeader` component SHALL produce output that contains the assignment title, the course code, the course name, and the due date string.

**Validates: Requirements 2.1, 2.2, 2.3**

---

### Property 2: Status badge color matches assignment status

*For any* `CourseAssignment` with status `"due"`, `"submitted"`, or `"overdue"`, the rendered status badge SHALL apply the correct color class: amber for `"due"`, emerald for `"submitted"`, and rose for `"overdue"`.

**Validates: Requirements 2.4**

---

### Property 3: AI Planner button is always visible regardless of assignment status

*For any* `CourseAssignment` regardless of its `status` value, the `AssignmentHeader` SHALL render the AI Planner button.

**Validates: Requirements 7.1**

---

### Property 4: Tab ARIA attributes are always consistent with active tab state

*For any* active tab selection (`"details"` or `"teammates"`), the active tab button SHALL have `aria-selected="true"` and the inactive tab button SHALL have `aria-selected="false"`. The active panel SHALL be visible and the inactive panel SHALL have the `hidden` attribute.

**Validates: Requirements 3.2, 3.3, 3.4, 3.6**

---

### Property 5: Details tab renders description for any assignment with a description

*For any* `CourseAssignment` with a non-empty `description` field, the `DetailsPanel` SHALL render that description text within the instructions card. *For any* assignment with no `description`, the placeholder text "No instructions provided for this assignment." SHALL be rendered instead.

**Validates: Requirements 4.1, 4.4**

---

### Property 6: Details tab renders all metadata fields present on an assignment

*For any* `CourseAssignment` that has `points` and `submissionType` fields set, the `DetailsPanel` SHALL render both values as labeled rows within the metadata card.

**Validates: Requirements 4.3**

---

### Property 7: Submission area button disabled state matches file attachment state

*For any* state of the `SubmissionArea` component, the "Submit Assignment" button SHALL be disabled when the attached file list is empty and enabled when at least one file is attached.

**Validates: Requirements 5.5**

---

### Property 8: Submission area shows confirmation state for submitted assignments

*For any* `CourseAssignment` with `status === "submitted"`, the `SubmissionArea` SHALL render the submitted confirmation state (with `CheckCircleIcon`) instead of the upload zone.

**Validates: Requirements 5.6**

---

### Property 9: Drag-over state applies brand highlight styles

*For any* drag-over event on the `SubmissionArea`, the drop zone SHALL apply `border-[var(--brand)]` border and `bg-[var(--brand-tint)]` background. When the drag leaves or a drop occurs, those styles SHALL be removed.

**Validates: Requirements 5.3**

---

### Property 10: File selection displays file info for any selected file

*For any* `File` object selected or dropped into the `SubmissionArea`, the component SHALL render the file's name and size, along with a remove button.

**Validates: Requirements 5.4**

---

### Property 11: Teammates tab renders exactly one card per teammate

*For any* `teammates` array of length N (N ≥ 1), the `TeammatesPanel` SHALL render exactly N `TeammateCard` rows. When N = 0, the empty-state message SHALL be rendered instead.

**Validates: Requirements 6.1, 6.5**

---

### Property 12: Teammate card renders all fields for any teammate

*For any* `Teammate` object, the `TeammateCard` SHALL render the teammate's initials, full name, and role. The online indicator SHALL be a filled green dot when `online === true` and a hollow grey dot when `online === false`.

**Validates: Requirements 6.2, 6.3**

---

### Property 13: Modal body scroll lock matches modal open state

*For any* open/closed state of the `AIPlannerModal`, `document.body` SHALL have `overflow-hidden` applied when the modal is open and SHALL NOT have it when the modal is closed.

**Validates: Requirements 7.6**

---

### Property 14: Streamed tokens accumulate in display order

*For any* sequence of text chunks delivered by the streaming API response, each chunk SHALL be appended to the display area in the order received, so the full accumulated text equals the concatenation of all chunks in arrival order.

**Validates: Requirements 8.2**

---

### Property 15: Thinking phase transitions to plan selection after stream completion

*For any* completed streaming response that contains a valid `---PLANS_START---` / `---PLANS_END---` block, the `AIPlannerModal` SHALL transition from `"thinking"` phase to `"plan-selection"` phase and the parsed plans SHALL be passed to `PlanSelectionPhase`.

**Validates: Requirements 8.6**

---

### Property 16: Plan selection renders one card per plan

*For any* array of 2–3 `Plan` objects returned by the AI, the `PlanSelectionPhase` SHALL render exactly that many `PlanCard` components.

**Validates: Requirements 9.1**

---

### Property 17: Plan card renders all required fields for any plan

*For any* `Plan` object, the `PlanCard` SHALL render the plan name, milestone count label, and estimated completion date.

**Validates: Requirements 9.2**

---

### Property 18: Milestone progress bar renders one node per milestone

*For any* `Plan` with N milestones, the `MilestoneProgressBar` SHALL render exactly N milestone nodes. Each node label SHALL be the milestone title truncated to at most 12 characters.

**Validates: Requirements 9.3, 9.4**

---

### Property 19: Plan selection shows CTA button if and only if a plan is selected

*For any* state of `PlanSelectionPhase`, the "Set Up Reminders & Meetings" CTA button SHALL be visible when `selectedPlan !== null` and SHALL NOT be visible when `selectedPlan === null`.

**Validates: Requirements 9.7**

---

### Property 20: Plan card selected state is applied to the clicked card only

*For any* click on a `PlanCard`, that card SHALL render with `bg-[var(--brand-tint)] border-[var(--brand)]` and a checkmark badge, while all other cards SHALL render without those styles.

**Validates: Requirements 9.6**

---

### Property 21: Permission flow Step 1 lists all milestones from the selected plan

*For any* selected `Plan` with N milestones, the Step 1 calendar permission screen SHALL render exactly N milestone preview items, each showing the milestone title and target date.

**Validates: Requirements 10.3**

---

### Property 22: Permission flow advances correctly from Step 1 regardless of choice

*For any* selected plan, clicking "Allow" on Step 1 SHALL record `calendarPermission = 'granted'` and advance to Step 2. Clicking "Skip" SHALL record `calendarPermission = 'skipped'` and advance to Step 2.

**Validates: Requirements 10.5, 10.6**

---

### Property 23: Permission flow advances to confirmation when Step 2 is skipped

*For any* selected plan, clicking "Skip" on Step 2 SHALL advance the `PermissionFlow` to the confirmation step with `googlePermission = 'skipped'`.

**Validates: Requirements 11.5**

---

### Property 24: Confirmation screen renders one Milestone_Card per milestone with correct badges

*For any* confirmed plan with N milestones, the confirmation screen SHALL render exactly N `MilestoneCard` components. Each card SHALL show a "Reminder set" badge when `calendarPermission === 'granted'` and a "No reminder" badge when `calendarPermission === 'skipped'`. Each card SHALL show a "Meeting scheduled" badge when `googlePermission === 'granted'`.

**Validates: Requirements 12.1, 12.2, 12.3**

---

### Property 25: Milestone timeline appears on the page after plan confirmation

*For any* plan confirmed through the full permission flow, closing the modal SHALL cause the `MilestonePlanSection` to become visible on the `Assignment_Detail_Page`, containing the same milestones from the confirmed plan.

**Validates: Requirements 12.6, 13.1, 13.2**

---

### Property 26: Milestone card completion checkbox toggles visual state

*For any* `MilestoneCard`, checking the completion checkbox SHALL apply a strikethrough to the title and a `bg-emerald-100` background. Unchecking SHALL remove both styles.

**Validates: Requirements 13.4**

---

### Property 27: Milestone timeline progress bar reflects completion ratio

*For any* set of milestones where K out of N are completed, the progress bar fill width SHALL equal `(K / N) * 100%`.

**Validates: Requirements 13.5**

---

## Error Handling

### API Route Errors

- **Missing `ANTHROPIC_API_KEY`**: The API route returns `500` with `{ error: "API key not configured" }`. The `ThinkingPhase` component catches this and renders the inline error message with a retry button.
- **Anthropic SDK error / network failure**: The `fetch` call in `ThinkingPhase` is wrapped in a `try/catch`. On any error, `phase` is set to `'error'` and the error UI is shown.
- **Malformed plan JSON**: If the streamed response does not contain a valid `---PLANS_START---` / `---PLANS_END---` block, or the JSON inside is invalid, the client falls back to a set of 2 default plan templates so the user is never stuck.
- **Stream interruption**: If the `ReadableStream` reader throws mid-stream, the partial text is preserved and the error state is shown with a retry option.

### Google OAuth Errors

- **Popup blocked**: Detected via `window.open` returning `null`. An inline message "Please allow popups for this site to connect Google Calendar." is shown.
- **OAuth cancelled or failed**: The popup's `postMessage` callback receives an error code. The `PermissionFlow` stays on Step 2 and shows the inline error "Could not connect to Google Calendar. Please try again."
- **Timeout**: If no `postMessage` is received within 2 minutes, the flow treats it as a cancellation.

### Route Not Found

- If `params.id` does not match any assignment across all courses, the server page renders a centered "Assignment not found" card with a back link to `/assignments`.

### File Upload Errors

- File type/size validation is client-side only (no server upload in this mock). If a file exceeds a reasonable size limit (e.g., 50 MB), the `SubmissionArea` shows an inline error below the file entry.

---

## Testing Strategy

### Unit Tests (example-based)

Focus on specific behaviors and edge cases that are not covered by property tests:

- `AssignmentHeader` renders back link with correct href
- `AssignmentTabBar` defaults to "Details" tab on first render
- `SubmissionArea` renders submitted confirmation state for `status === 'submitted'`
- `TeammatesPanel` renders empty-state message when `teammates` is empty or undefined
- `AIPlannerModal` closes on Escape key press
- `AIPlannerModal` closes on close button click
- `ThinkingPhase` renders error message and retry button on API failure
- `ConfirmationStep` "View in Calendar" button has href `/calendar`
- `MilestonePlanSection` "Edit Plan" button triggers `onEditPlan` callback

### Property-Based Tests

Property-based testing is appropriate for this feature because many components have universal behaviors that should hold across a wide range of input data (arbitrary assignment objects, teammate arrays, milestone arrays, plan structures). The input space is large and varied, and many edge cases (empty strings, long titles, unusual dates) are best discovered through randomized generation.

**Library**: [fast-check](https://github.com/dubzzz/fast-check) — the standard PBT library for TypeScript/JavaScript.

**Configuration**: Each property test runs a minimum of **100 iterations**.

**Tag format**: Each test is tagged with a comment:
`// Feature: assignment-ai-planner, Property N: <property_text>`

**Properties to implement** (one test per property, referencing the Correctness Properties section above):

| Property | Component Under Test | Key Generators |
|---|---|---|
| 1 | `AssignmentHeader` | `fc.record({ title, dueDate, status, ... })` + `fc.record({ code, name })` |
| 2 | `AssignmentHeader` | `fc.constantFrom('due', 'submitted', 'overdue')` |
| 3 | `AssignmentHeader` | `fc.constantFrom('due', 'submitted', 'overdue')` |
| 4 | `AssignmentTabBar` | `fc.constantFrom('details', 'teammates')` |
| 5 | `DetailsPanel` | `fc.option(fc.string({ minLength: 1 }))` for description |
| 6 | `DetailsPanel` | `fc.integer({ min: 1, max: 500 })` for points, `fc.string()` for submissionType |
| 7 | `SubmissionArea` | `fc.array(fc.record({ name: fc.string(), size: fc.integer() }))` |
| 8 | `SubmissionArea` | `fc.constantFrom('submitted')` for status |
| 9 | `SubmissionArea` | Simulate dragover/dragleave events |
| 10 | `SubmissionArea` | `fc.record({ name: fc.string(), size: fc.integer() })` for File-like objects |
| 11 | `TeammatesPanel` | `fc.array(fc.record({ id, name, role, initials, avatarColor, online }))` |
| 12 | `TeammateCard` | `fc.record({ name, role, initials, online: fc.boolean() })` |
| 13 | `AIPlannerModal` | `fc.boolean()` for open state |
| 14 | `ThinkingPhase` | `fc.array(fc.string())` for token chunks |
| 15 | `AIPlannerModal` | Mock stream with valid plan JSON block |
| 16 | `PlanSelectionPhase` | `fc.array(planArb, { minLength: 2, maxLength: 3 })` |
| 17 | `PlanCard` | `fc.record({ name, milestoneCount, estimatedCompletion, milestones })` |
| 18 | `MilestoneProgressBar` | `fc.array(milestoneArb, { minLength: 1, maxLength: 8 })` |
| 19 | `PlanSelectionPhase` | `fc.option(planArb)` for selectedPlan |
| 20 | `PlanSelectionPhase` | `fc.array(planArb, { minLength: 2, maxLength: 3 })` + index |
| 21 | `PermissionFlow` (Step 1) | `fc.array(milestoneArb, { minLength: 1, maxLength: 6 })` |
| 22 | `PermissionFlow` (Step 1) | `fc.constantFrom('allow', 'skip')` |
| 23 | `PermissionFlow` (Step 2) | Skip action |
| 24 | `ConfirmationStep` | `fc.array(milestoneArb)` + `fc.constantFrom('granted', 'skipped')` × 2 |
| 25 | `AssignmentDetailClient` | Full plan confirmation flow with mock modal |
| 26 | `MilestoneCard` | `fc.record({ title, targetDate, completed: fc.boolean() })` |
| 27 | `MilestonePlanSection` | `fc.array(milestoneArb)` with random `completed` values |

### Integration Tests

- `GET /api/ai-planner` with a real (or mocked) Anthropic SDK call returns a streaming response
- The global assignments page (`/assignments`) sources data from `lib/courses.ts` and renders assignment IDs that match the `[id]` route
- Google OAuth popup flow (mocked): verify correct OAuth URL is constructed and `postMessage` callback advances the flow

### Accessibility Tests

- Tab bar keyboard navigation: Tab/Shift-Tab moves focus between tabs; Enter/Space activates a tab
- Modal focus trap: Tab cycles only within the modal while it is open; focus returns to the AI Planner button on close
- All interactive elements have visible focus rings (`:focus-visible` outline)
- Status badges and online indicators have `aria-label` or `title` attributes for screen readers
- The streaming text area has `aria-live="polite"` so screen readers announce new content
