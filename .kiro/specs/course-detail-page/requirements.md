# Requirements Document

## Introduction

The Course Detail Page is a dedicated page within the CanvasAI student learning platform that students reach by clicking a CourseCard on the Courses home page. The page presents a full-screen view of a single course, organized into three tabs: Overview, Files, and Assignments. It reuses the existing design system (Tailwind tokens, Phosphor icons, rounded-2xl cards, pill badges) and extends the existing `Course` type with additional per-course data such as a professor overview, file tree, and course-specific assignments.

## Glossary

- **Course_Detail_Page**: The Next.js page rendered at `/courses/[id]` that displays all information for a single course.
- **Hero_Banner**: The full-width decorative header at the top of the Course_Detail_Page, styled with the course's accent color gradient.
- **Tab_Bar**: The pill-shaped tab switcher component that controls which content panel is visible.
- **Overview_Panel**: The tab panel that displays the professor's course description and key course metadata.
- **Files_Panel**: The tab panel that renders the course file system in a Mac Finder-style folder/file browser.
- **Assignments_Panel**: The tab panel that lists assignments scoped to the current course, styled consistently with the global Assignments page.
- **File_Node**: A single item in the course file tree; either a Folder_Node or a File_Node.
- **Folder_Node**: A File_Node that contains child File_Nodes and can be expanded or collapsed.
- **CourseCard**: The existing card component in `components/CourseCard.tsx` that represents a course on the home page.
- **Assignment**: A graded task associated with a course, carrying a title, due date, and status (`due`, `submitted`, or `overdue`).
- **Professor_Overview**: A text block authored by the professor that describes the course goals, topics, and expectations.

---

## Requirements

### Requirement 1: Course Detail Page Route

**User Story:** As a student, I want to navigate to a dedicated page for each course, so that I can access all course-specific content in one place.

#### Acceptance Criteria

1. THE Course_Detail_Page SHALL be accessible at the URL path `/courses/[id]`, where `[id]` matches the `id` field of a `Course` object.
2. WHEN a student clicks a CourseCard on the home page, THE CourseCard SHALL navigate the student to the corresponding Course_Detail_Page.
3. IF the `[id]` parameter does not match any known course, THEN THE Course_Detail_Page SHALL render a "Course not found" message and provide a link back to the home page.
4. THE Course_Detail_Page SHALL render within the existing root layout, preserving the Sidebar navigation.

---

### Requirement 2: Hero Banner

**User Story:** As a student, I want to see a visually distinctive banner at the top of the course page, so that I can immediately identify which course I am viewing.

#### Acceptance Criteria

1. THE Hero_Banner SHALL span the full width of the content area and have a minimum height of 220px.
2. THE Hero_Banner SHALL render a gradient background using the course's `accent` hex color, matching the pattern used in the CourseCard cover: `linear-gradient(135deg, {accent} 0%, {accent}CC 45%, #ffffff22 100%)`.
3. THE Hero_Banner SHALL display the course `code` in uppercase with reduced opacity as an eyebrow label above the course `name`.
4. THE Hero_Banner SHALL display the course `name` as the primary heading in white text.
5. THE Hero_Banner SHALL display the `professor` name and `semester` as secondary metadata in white text with reduced opacity.
6. THE Hero_Banner SHALL display the course status badge (Active / Upcoming / Completed) using the same pill badge styles as CourseCard.
7. WHEN the course `status` is `active`, THE Hero_Banner SHALL render the status badge with `bg-emerald-100 text-emerald-700` styles.
8. WHEN the course `status` is `upcoming`, THE Hero_Banner SHALL render the status badge with `bg-amber-100 text-amber-700` styles.
9. WHEN the course `status` is `completed`, THE Hero_Banner SHALL render the status badge with `bg-ink-border/70 text-ink-muted` styles.

---

### Requirement 3: Tab Bar Navigation

**User Story:** As a student, I want to switch between Overview, Files, and Assignments views using a tab bar, so that I can focus on the content I need without leaving the page.

#### Acceptance Criteria

1. THE Tab_Bar SHALL render three tabs in order: Overview, Files, and Assignments.
2. THE Tab_Bar SHALL use `role="tablist"` and each tab button SHALL use `role="tab"` with `aria-selected` set to `true` for the active tab and `false` for inactive tabs.
3. Each tab panel SHALL use `role="tabpanel"` and be associated with its tab via `aria-controls` / `aria-labelledby`.
4. WHEN a student clicks a tab, THE Tab_Bar SHALL update the active tab and display the corresponding panel without a full page reload.
5. THE Tab_Bar SHALL default to the Overview tab when the page first loads.
6. THE active tab SHALL be visually distinguished using `bg-[var(--brand-tint)] text-[var(--brand)]` styles, consistent with the existing CourseTabs component.
7. WHILE a tab is inactive, THE Tab_Bar SHALL render that tab with `text-ink-muted` and apply `hover:text-ink` on pointer hover.

---

### Requirement 4: Overview Tab — Professor Overview

**User Story:** As a student, I want to read the professor's course overview on the Overview tab, so that I understand the course goals, topics, and expectations.

#### Acceptance Criteria

1. THE Overview_Panel SHALL display a Professor_Overview section containing a text description of the course authored by the professor.
2. THE Overview_Panel SHALL display the professor's name and title as a byline beneath the Professor_Overview heading.
3. THE Overview_Panel SHALL display a course metadata card containing: course `code`, `semester`, `duration`, `professor`, and `tags`.
4. THE Overview_Panel SHALL render each tag from `course.tags` as a pill badge using `border border-ink-border text-ink-muted rounded-full` styles, consistent with CourseCard tags.
5. THE Overview_Panel SHALL use a two-column layout on viewports ≥ 1024px wide, with the Professor_Overview occupying the wider left column and the metadata card in the narrower right column.
6. WHILE the viewport width is less than 1024px, THE Overview_Panel SHALL stack the Professor_Overview and metadata card vertically in a single column.

---

### Requirement 5: Files Tab — Finder-Style File Browser

**User Story:** As a student, I want to browse course files in a Mac Finder-style folder tree, so that I can locate and access lecture notes, readings, and other materials intuitively.

#### Acceptance Criteria

1. THE Files_Panel SHALL render a hierarchical list of Folder_Nodes and File_Nodes representing the course file system.
2. THE Files_Panel SHALL display each Folder_Node with a folder icon (Phosphor `FolderIcon`) and the folder name.
3. THE Files_Panel SHALL display each File_Node with a file-type icon appropriate to the file extension (e.g., `FilePdfIcon` for `.pdf`, `FileTextIcon` for `.docx`/`.txt`, `FilePptIcon` for `.pptx`, `FileCodeIcon` for `.zip`/code files) using Phosphor icons.
4. WHEN a student clicks a Folder_Node, THE Files_Panel SHALL toggle the expanded state of that folder, revealing or hiding its child File_Nodes.
5. WHEN a Folder_Node is expanded, THE Files_Panel SHALL render a caret/chevron icon in the rotated-down position; WHEN collapsed, THE Files_Panel SHALL render the caret in the right-pointing position.
6. THE Files_Panel SHALL indent child File_Nodes by 16px per nesting level to visually communicate hierarchy.
7. WHEN a student clicks a File_Node, THE Files_Panel SHALL open the file in a new browser tab.
8. THE Files_Panel SHALL display the file size and last-modified date as secondary metadata for each File_Node in `text-ink-muted` style.
9. THE Files_Panel SHALL render the file tree inside a `bg-surface border border-ink-border rounded-2xl` container consistent with the design system.
10. WHEN the course has no files, THE Files_Panel SHALL display an empty-state message: "No files have been uploaded for this course yet."

---

### Requirement 6: Assignments Tab — Course-Scoped Assignment List

**User Story:** As a student, I want to see only the assignments for the current course on the Assignments tab, so that I can track deadlines and submission status without distraction from other courses.

#### Acceptance Criteria

1. THE Assignments_Panel SHALL display a list of Assignment items scoped to the current course, using the same list UI as the global Assignments page (`app/assignments/page.tsx`).
2. THE Assignments_Panel SHALL render each Assignment in a list row containing: a status icon, assignment title, due date, and a status badge.
3. WHEN an Assignment has status `due`, THE Assignments_Panel SHALL render the row with a `ClockIcon` and an amber pill badge labeled "Due".
4. WHEN an Assignment has status `submitted`, THE Assignments_Panel SHALL render the row with a `CheckCircleIcon` and an emerald pill badge labeled "Submitted".
5. WHEN an Assignment has status `overdue`, THE Assignments_Panel SHALL render the row with a `WarningCircleIcon` and a rose pill badge labeled "Overdue".
6. THE Assignments_Panel SHALL render the assignment list inside a `bg-surface border border-ink-border rounded-2xl shadow-subtle` container with rows separated by `divide-y divide-ink-border`.
7. WHEN the course has no assignments, THE Assignments_Panel SHALL display an empty-state message: "No assignments for this course yet."
8. THE Assignments_Panel SHALL include a "Submit assignment" button in the panel header, styled as `bg-ink text-white rounded-full`, consistent with the global Assignments page action button.

---

### Requirement 7: Data Model Extensions

**User Story:** As a developer, I want the Course type and mock data to carry the additional fields needed by the Course Detail Page, so that all panels can render realistic content without external data fetching.

#### Acceptance Criteria

1. THE Course type in `lib/courses.ts` SHALL be extended with an optional `overview` field of type `string` containing the professor's course description.
2. THE Course type SHALL be extended with an optional `files` field of type `CourseFileNode[]`, where `CourseFileNode` is a recursive type representing the file tree.
3. THE `CourseFileNode` type SHALL include: `id` (string), `name` (string), `type` (`"folder"` | `"file"`), `size` (optional string for files), `modifiedAt` (optional string), `url` (optional string for files), and `children` (optional `CourseFileNode[]` for folders).
4. THE Course type SHALL be extended with an optional `assignments` field of type `CourseAssignment[]` containing assignments scoped to that course.
5. THE `CourseAssignment` type SHALL include: `id` (string), `title` (string), `dueDate` (string), and `status` (`"due"` | `"submitted"` | `"overdue"`).
6. THE mock data in `lib/courses.ts` SHALL include at least one course with a populated `overview`, `files` tree of at least two folders with nested files, and at least three `assignments` covering all three status values.
