# CanvasAI

An AI-powered platform for university students to manage courses, submit assignments, track deadlines, and study with SparkyAI.

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS** for styling
- **Phosphor Icons** (`@phosphor-icons/react`) for iconography
- **Inter** via `next/font/google`

## Design tokens

- Brand color: **ASU Maroon `#8C1D40`**
- Hover / selection: `rgba(140, 29, 64, 0.08)` (light maroon tint)
- Primary buttons: black (`#0B0B0C`)
- Surface: white on light-gray (`#F7F7F8`) app background

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Structure

```
app/
  layout.tsx            # Root layout (Inter font + Sidebar shell)
  page.tsx              # Landing / Courses
  assignments/page.tsx  # Assignments list
  calendar/page.tsx     # Month calendar
  sparky/page.tsx       # SparkyAI study assistant
  profile/page.tsx      # Student profile
components/
  Sidebar.tsx           # Left nav (Courses, Assignments, Calendar, SparkyAI, Logout)
  CourseCard.tsx        # Enrolled course card
  CourseTabs.tsx        # Active / Upcoming / Completed filter
  PageHeader.tsx        # Search + title + action
lib/
  courses.ts            # Mock course data
```
