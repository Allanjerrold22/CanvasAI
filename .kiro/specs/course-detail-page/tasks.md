# Tasks — Course Detail Page

## Task List

- [ ] 1. Extend data models in `lib/courses.ts`
  - [ ] 1.1 Add `CourseFileNode` recursive type
  - [ ] 1.2 Add `CourseAssignment` type
  - [ ] 1.3 Add optional `overview`, `files`, and `assignments` fields to the `Course` type
  - [ ] 1.4 Enrich at least one mock course entry (`cse-310`) with `overview`, `files` tree, and `assignments` covering all three status values

- [ ] 2. Update `CourseCard` to link to the course detail page
  - [ ] 2.1 Wrap the `CourseCard` article in a `<Link href={/courses/${course.id}}>` so clicking navigates to the detail page

- [ ] 3. Create `components/course-detail/HeroBanner.tsx`
  - [ ] 3.1 Render full-width banner with `min-h-[220px]` and inline gradient style using `course.accent`
  - [ ] 3.2 Render eyebrow course code (uppercase, reduced opacity), `<h1>` course name, professor + semester metadata
  - [ ] 3.3 Render status badge with correct pill styles per status value

- [ ] 4. Create `components/course-detail/OverviewPanel.tsx`
  - [ ] 4.1 Render two-column layout (`lg:grid lg:grid-cols-[1fr_320px]`) that stacks on narrow viewports
  - [ ] 4.2 Render Professor_Overview card with overview text and professor byline
  - [ ] 4.3 Render metadata card with `code`, `semester`, `duration`, `professor`, and `tags` as pill badges

- [ ] 5. Create `components/course-detail/FileNode.tsx`
  - [ ] 5.1 Render folder rows with `FolderIcon`, folder name, and caret icon (rotated when expanded)
  - [ ] 5.2 Render file rows with extension-mapped Phosphor icon, file name, size, and modifiedAt metadata
  - [ ] 5.3 Apply `paddingLeft: depth * 16` indentation per nesting level
  - [ ] 5.4 Handle folder click to call `onToggle(node.id)`
  - [ ] 5.5 Handle file click to call `window.open(node.url, "_blank")`
  - [ ] 5.6 Recursively render children when folder is expanded

- [ ] 6. Create `components/course-detail/FilesPanel.tsx`
  - [ ] 6.1 Render `bg-surface border border-ink-border rounded-2xl` container
  - [ ] 6.2 Manage expanded folder ids in a `Set<string>` state
  - [ ] 6.3 Render empty-state message when `files` is undefined or empty
  - [ ] 6.4 Map over top-level nodes and render `<FileNode>` for each

- [ ] 7. Create `components/course-detail/AssignmentsPanel.tsx`
  - [ ] 7.1 Render panel header with title and "Submit assignment" button (`bg-ink text-white rounded-full`)
  - [ ] 7.2 Render `bg-surface border border-ink-border rounded-2xl shadow-subtle` list with `divide-y divide-ink-border`
  - [ ] 7.3 Render each assignment row with status icon, title, due date, and status badge (matching `app/assignments/page.tsx` styles)
  - [ ] 7.4 Render empty-state message when `assignments` is undefined or empty

- [ ] 8. Create `components/course-detail/CourseTabBar.tsx`
  - [ ] 8.1 Manage `activeTab` state with `useState<TabId>("overview")`
  - [ ] 8.2 Render `role="tablist"` pill bar with three tabs (Overview, Files, Assignments) using existing CourseTabs styles
  - [ ] 8.3 Set `role="tab"`, `aria-selected`, `id`, and `aria-controls` on each tab button
  - [ ] 8.4 Render active panel with `role="tabpanel"`, `id`, and `aria-labelledby`
  - [ ] 8.5 Conditionally render `OverviewPanel`, `FilesPanel`, or `AssignmentsPanel` based on active tab

- [ ] 9. Create `app/courses/[id]/page.tsx`
  - [ ] 9.1 Look up course by `params.id` from the `courses` array
  - [ ] 9.2 Render "Course not found" message with a link back to home when id is unknown
  - [ ] 9.3 Render `<HeroBanner>` and `<CourseTabBar>` with the resolved course

- [ ] 10. Verify the build passes
  - [ ] 10.1 Run `next build` (or `tsc --noEmit`) and fix any TypeScript errors
