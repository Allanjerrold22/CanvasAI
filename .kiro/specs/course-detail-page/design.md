# Design Document — Course Detail Page

## Overview

The Course Detail Page adds a dedicated `/courses/[id]` route to the CanvasAI Next.js application. When a student clicks a `CourseCard` on the home page they land on a full-screen view of that course, organized into three tab panels: **Overview**, **Files**, and **Assignments**.

The feature is purely front-end: it extends the existing `Course` type in `lib/courses.ts` with three optional fields (`overview`, `files`, `assignments`), populates mock data for at least one course, and renders everything using the existing Tailwind design tokens, Phosphor icons, and component patterns already established in the codebase.

No external data fetching, authentication changes, or new dependencies are required.

---

## Architecture

The feature follows the existing Next.js App Router conventions used throughout the project.

```
app/
  courses/
    [id]/
      page.tsx          ← Server component; resolves course by id, renders layout
components/
  course-detail/
    HeroBanner.tsx      ← Full-width gradient banner
    CourseTabBar.tsx    ← Pill tab switcher (client component)
    OverviewPanel.tsx   ← Professor overview + metadata card
    FilesPanel.tsx      ← Finder-style file tree (client component)
    AssignmentsPanel.tsx← Course-scoped assignment list
    FileNode.tsx        ← Recursive file/folder row (client component)
lib/
  courses.ts            ← Extended with CourseFileNode, CourseAssignment types + mock data
```

### Data flow

```mermaid
graph TD
    A[Home page — CourseCard click] -->|Link href /courses/id| B[app/courses/id/page.tsx]
    B -->|courses.find(id)| C{Course found?}
    C -->|No| D[Not-found UI]
    C -->|Yes| E[HeroBanner]
    E --> F[CourseTabBar]
    F -->|active tab state| G[OverviewPanel]
    F -->|active tab state| H[FilesPanel]
    F -->|active tab state| I[AssignmentsPanel]
```

### Routing

`app/courses/[id]/page.tsx` is a **Server Component**. It imports `courses` from `lib/courses.ts`, finds the matching course by `id`, and either renders the page or returns a not-found state. No `generateStaticParams` is required for the mock-data phase.

The `CourseCard` component gains a wrapping `<Link href={/courses/${course.id}}>` so clicking the card navigates to the detail page.

---

## Components and Interfaces

### `app/courses/[id]/page.tsx`

```ts
// Props injected by Next.js App Router
type Props = { params: { id: string } }
```

- Looks up `courses.find(c => c.id === params.id)`.
- If not found: renders a centered "Course not found" message with a `<Link href="/">` back to home.
- If found: renders `<HeroBanner>`, then `<CourseTabBar>` with the course passed as a prop.

### `components/course-detail/HeroBanner.tsx`

```ts
type HeroBannerProps = { course: Course }
```

- Full-width `<div>` with `min-h-[220px]` and inline `background` style matching the CourseCard gradient: `linear-gradient(135deg, {accent} 0%, {accent}CC 45%, #ffffff22 100%)`.
- Renders: eyebrow code label (uppercase, reduced opacity), `<h1>` course name, professor + semester metadata, status badge.
- Status badge reuses the same `statusStyles` map from `CourseCard`.

### `components/course-detail/CourseTabBar.tsx` (client)

```ts
type CourseTabBarProps = { course: Course }
type TabId = "overview" | "files" | "assignments"
```

- Manages `activeTab` state with `useState<TabId>("overview")`.
- Renders a `role="tablist"` pill bar identical in style to the existing `CourseTabs` component.
- Conditionally renders the active panel below the tab bar.
- Each tab button: `role="tab"`, `aria-selected`, `id="tab-{id}"`, `aria-controls="panel-{id}"`.
- Each panel `<div>`: `role="tabpanel"`, `id="panel-{id}"`, `aria-labelledby="tab-{id}"`.

### `components/course-detail/OverviewPanel.tsx`

```ts
type OverviewPanelProps = { course: Course }
```

- Two-column layout (`lg:grid lg:grid-cols-[1fr_320px] gap-8`) that stacks on narrow viewports.
- Left column: Professor_Overview card (`bg-surface border border-ink-border rounded-2xl p-6`) with heading, professor byline, and overview text.
- Right column: Metadata card listing `code`, `semester`, `duration`, `professor`, and `tags` (tags rendered as pill badges with `border border-ink-border text-ink-muted rounded-full`).

### `components/course-detail/FilesPanel.tsx` (client)

```ts
type FilesPanelProps = { files: CourseFileNode[] | undefined }
```

- Renders a `bg-surface border border-ink-border rounded-2xl` container.
- If `files` is empty/undefined: renders the empty-state message.
- Otherwise: maps over top-level nodes and renders `<FileNode>` for each.
- Manages a `Set<string>` of expanded folder ids in state.

### `components/course-detail/FileNode.tsx` (client)

```ts
type FileNodeProps = {
  node: CourseFileNode
  depth: number
  expanded: Set<string>
  onToggle: (id: string) => void
}
```

- Renders a single row with `paddingLeft: depth * 16` px.
- Folder row: `FolderIcon`, folder name, caret (`CaretRightIcon` rotated 90° when expanded).
- File row: extension-mapped icon, file name, size + modifiedAt metadata in `text-ink-muted`.
- File extension → icon mapping:

| Extension | Icon |
|-----------|------|
| `.pdf` | `FilePdfIcon` |
| `.docx`, `.txt`, `.md` | `FileTextIcon` |
| `.pptx` | `FilePptIcon` |
| `.zip`, `.tar`, `.gz` | `FileArchiveIcon` |
| `.js`, `.ts`, `.py`, `.c`, `.cpp` | `FileCodeIcon` |
| (default) | `FileIcon` |

- When a folder is clicked: calls `onToggle(node.id)`.
- When a file is clicked: `window.open(node.url, "_blank")`.
- Recursively renders children when the folder is expanded.

### `components/course-detail/AssignmentsPanel.tsx`

```ts
type AssignmentsPanelProps = { assignments: CourseAssignment[] | undefined }
```

- Renders a panel header with title and "Submit assignment" button (`bg-ink text-white rounded-full`).
- If `assignments` is empty/undefined: renders the empty-state message.
- Otherwise: renders a `bg-surface border border-ink-border rounded-2xl shadow-subtle` list with `divide-y divide-ink-border` rows.
- Each row: status icon in a `w-9 h-9 rounded-lg bg-surface-muted` container, title + due date, status badge — identical structure to `app/assignments/page.tsx`.

---

## Data Models

### Extended `Course` type

```ts
// lib/courses.ts additions

export type CourseFileNode = {
  id: string;
  name: string;
  type: "folder" | "file";
  size?: string;           // e.g. "2.4 MB" — files only
  modifiedAt?: string;     // e.g. "Apr 12, 2025" — files only
  url?: string;            // download/view URL — files only
  children?: CourseFileNode[]; // folders only
};

export type CourseAssignment = {
  id: string;
  title: string;
  dueDate: string;
  status: "due" | "submitted" | "overdue";
};

// Course type gains three optional fields:
export type Course = {
  // ... existing fields unchanged ...
  overview?: string;
  files?: CourseFileNode[];
  assignments?: CourseAssignment[];
};
```

### Mock data additions

At minimum, the `cse-310` course entry is enriched with:

- `overview`: a multi-sentence professor description.
- `files`: two top-level folders (`Lectures`, `Problem Sets`), each containing at least two nested files of varying extensions.
- `assignments`: three entries covering all three status values (`due`, `submitted`, `overdue`).

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

This feature is primarily a rendering/UI feature built on React components. The core logic amenable to property-based testing is the **rendering logic** — given a course object, the rendered output must contain specific data. These properties hold universally across all valid course inputs.

The project has no test framework installed. The testing strategy section specifies how to set one up. The properties below are written for **Vitest** with **@testing-library/react** and **fast-check** for property-based testing.

---

### Property 1: Hero Banner renders all course identity fields

*For any* course object with valid `code`, `name`, `professor`, `semester`, and `accent` fields, the rendered `HeroBanner` component SHALL contain the course name, course code, professor name, semester, and the accent color in the gradient style attribute.

**Validates: Requirements 2.2, 2.3, 2.4, 2.5**

---

### Property 2: Hero Banner status badge reflects course status

*For any* course object, the rendered `HeroBanner` SHALL contain a status badge whose text matches the course's `status` field (`"Active"`, `"Upcoming"`, or `"Completed"`), and the badge SHALL carry the CSS classes corresponding to that status.

**Validates: Requirements 2.6, 2.7, 2.8, 2.9**

---

### Property 3: Tab Bar ARIA attributes are consistent with active tab

*For any* tab selection state (overview, files, or assignments), the rendered `CourseTabBar` SHALL have exactly one tab button with `aria-selected="true"` (the active tab) and all other tab buttons with `aria-selected="false"`.

**Validates: Requirements 3.2, 3.3**

---

### Property 4: Clicking a tab makes it the active tab

*For any* tab in the tab bar, clicking that tab SHALL result in it becoming the active tab (aria-selected="true") and its corresponding panel becoming visible.

**Validates: Requirements 3.4**

---

### Property 5: Overview Panel renders all course metadata fields

*For any* course object, the rendered `OverviewPanel` SHALL contain the course `code`, `semester`, `duration`, `professor`, and all entries from `course.tags`.

**Validates: Requirements 4.2, 4.3, 4.4**

---

### Property 6: Overview Panel renders professor overview text

*For any* course object with a non-empty `overview` string, the rendered `OverviewPanel` SHALL contain that overview text.

**Validates: Requirements 4.1**

---

### Property 7: Files Panel renders all top-level file tree nodes

*For any* course with a non-empty `files` array, the rendered `FilesPanel` SHALL contain a rendered row for every top-level `CourseFileNode` in the array.

**Validates: Requirements 5.1, 5.2**

---

### Property 8: File node indentation is proportional to depth

*For any* `FileNode` rendered at depth `N`, the inline `paddingLeft` style SHALL equal `N * 16` pixels.

**Validates: Requirements 5.6**

---

### Property 9: File metadata is rendered for file nodes

*For any* `CourseFileNode` of type `"file"` that has both `size` and `modifiedAt` fields, the rendered `FileNode` SHALL contain both the size string and the modifiedAt string.

**Validates: Requirements 5.8**

---

### Property 10: Folder toggle is a round-trip (idempotent over two clicks)

*For any* folder node, clicking it once SHALL expand it (children visible), and clicking it a second time SHALL collapse it back to the original state (children hidden).

**Validates: Requirements 5.4, 5.5**

---

### Property 11: Assignments Panel renders all assignment fields

*For any* `CourseAssignment` array, the rendered `AssignmentsPanel` SHALL contain a row for every assignment, and each row SHALL contain the assignment `title` and `dueDate`.

**Validates: Requirements 6.1, 6.2**

---

**Property Reflection — Redundancy Check:**

- Properties 1 and 5 both test "renders course fields" but target different components (`HeroBanner` vs `OverviewPanel`) — kept separate.
- Properties 3 and 4 both relate to tab ARIA state but test different triggers (static state vs click interaction) — kept separate.
- Properties 7 and 9 both test `FilesPanel` rendering but at different granularities (top-level nodes vs file metadata) — kept separate.
- Properties 10 (folder toggle round-trip) subsumes the caret direction check from requirement 5.5 since the caret state is derived from the same expanded boolean — no separate property needed.
- No redundancies identified that warrant consolidation.

---

## Error Handling

| Scenario | Handling |
|---|---|
| Unknown course `id` in URL | `page.tsx` renders a centered "Course not found" message with a `<Link href="/">` back to home. No error is thrown. |
| Course has no `overview` | `OverviewPanel` renders the professor byline and metadata card; the overview text block is omitted or shows a placeholder. |
| Course has no `files` | `FilesPanel` renders the empty-state message: "No files have been uploaded for this course yet." |
| Course has no `assignments` | `AssignmentsPanel` renders the empty-state message: "No assignments for this course yet." |
| File node has no `url` | The click handler is a no-op; `window.open` is not called. |
| File node has no `size` or `modifiedAt` | Those metadata fields are simply omitted from the row. |

---

## Testing Strategy

### Framework Setup

The project has no test framework. Add **Vitest** with **@testing-library/react** and **fast-check**:

```bash
npm install --save-dev vitest @vitejs/plugin-react @testing-library/react @testing-library/user-event jsdom fast-check
```

Add a `vitest.config.ts` at the project root and a `setupTests.ts` for jsdom configuration.

### Unit Tests (Example-Based)

Focus on specific behaviors and edge cases:

- `HeroBanner` renders correct status badge classes for each of the three status values.
- `CourseTabBar` defaults to the Overview tab on initial render.
- `FilesPanel` renders the empty-state message when `files` is undefined or empty.
- `AssignmentsPanel` renders the empty-state message when `assignments` is undefined or empty.
- `AssignmentsPanel` renders the "Submit assignment" button.
- `FileNode` calls `window.open` with the correct URL when a file is clicked.
- Clicking a `CourseCard` navigates to `/courses/{id}`.
- The not-found page renders when an unknown id is provided.

### Property-Based Tests (fast-check)

Each property test uses `fc.assert(fc.property(...))` with a minimum of **100 iterations**.

Tag format for each test: `// Feature: course-detail-page, Property {N}: {property_text}`

| Property | Generator | Assertion |
|---|---|---|
| P1: Hero Banner renders course identity | `fc.record({ code, name, professor, semester, accent })` | Rendered HTML contains all fields and accent in style |
| P2: Hero Banner status badge | `fc.constantFrom("active","upcoming","completed")` | Badge text and classes match status |
| P3: Tab ARIA consistency | `fc.constantFrom("overview","files","assignments")` | Exactly one `aria-selected="true"` |
| P4: Tab click activates tab | `fc.constantFrom("overview","files","assignments")` | After click, that tab is active |
| P5: Overview Panel metadata | `fc.record({ code, semester, duration, professor, tags })` | All fields present in rendered output |
| P6: Overview Panel overview text | `fc.string({ minLength: 1 })` | Overview text present in rendered output |
| P7: Files Panel top-level nodes | `fc.array(fileNodeArb, { minLength: 1 })` | All node names present in rendered output |
| P8: File node indentation | `fc.integer({ min: 0, max: 5 })` | paddingLeft === depth * 16 |
| P9: File metadata rendering | `fc.record({ size: fc.string(), modifiedAt: fc.string() })` | Both fields present in rendered output |
| P10: Folder toggle round-trip | `fc.record({ id: fc.string(), name: fc.string() })` | Two clicks returns to collapsed state |
| P11: Assignments Panel rows | `fc.array(assignmentArb, { minLength: 1 })` | All titles and dueDates present |

### Integration / Smoke Tests

- TypeScript compilation (`tsc --noEmit`) verifies all type extensions are correct.
- Next.js build (`next build`) verifies the new route is valid.
