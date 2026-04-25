"use client";

import { useState } from "react";
import {
  LightningIcon,
  ClockCounterClockwiseIcon,
  ArchiveIcon,
  MagnifyingGlassIcon,
  XIcon,
} from "@phosphor-icons/react/dist/ssr";
import CourseCard from "./CourseCard";
import type { Course } from "@/lib/courses";

type TabId = "active" | "upcoming" | "completed";

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "active", label: "Active", icon: <LightningIcon size={14} weight="fill" /> },
  {
    id: "upcoming",
    label: "Upcoming",
    icon: <ClockCounterClockwiseIcon size={14} />,
  },
  { id: "completed", label: "Completed", icon: <ArchiveIcon size={14} /> },
];

export default function CourseTabs({ courses }: { courses: Course[] }) {
  const [active, setActive] = useState<TabId>("active");
  const [query, setQuery] = useState("");

  const filtered = courses
    .filter((c) => c.status === active)
    .filter((c) => {
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.professor.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q))
      );
    });

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        {/* Tabs */}
        <div
          role="tablist"
          aria-label="Course filters"
          className="inline-flex items-center gap-1 p-1 bg-surface border border-ink-border rounded-full shadow-subtle"
        >
          {tabs.map((t) => {
            const isActive = active === t.id;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActive(t.id)}
                className={[
                  "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-colors",
                  isActive
                    ? "bg-[var(--brand-tint)] text-[var(--brand)]"
                    : "text-ink-muted hover:text-ink",
                ].join(" ")}
              >
                <span className={isActive ? "text-[var(--brand)]" : "text-ink-subtle"}>
                  {t.icon}
                </span>
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses…"
            className="pl-8 pr-8 py-1.5 text-[13px] bg-surface border border-ink-border rounded-full shadow-subtle placeholder:text-ink-subtle text-ink focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20 focus:border-[var(--brand)] transition-all w-48 focus:w-64"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink transition-colors"
              aria-label="Clear search"
            >
              <XIcon size={12} />
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {filtered.length === 0 ? (
          <EmptyState tab={active} hasQuery={!!query.trim()} />
        ) : (
          filtered.map((c) => <CourseCard key={c.id} course={c} />)
        )}
      </div>
    </>
  );
}

function EmptyState({ tab, hasQuery }: { tab: TabId; hasQuery: boolean }) {
  if (hasQuery) {
    return (
      <div className="col-span-full py-16 text-center text-ink-muted text-sm">
        No courses match your search.
      </div>
    );
  }
  const copy: Record<TabId, string> = {
    active: "No active courses this semester.",
    upcoming: "No upcoming courses yet — check back after registration opens.",
    completed: "You haven't completed any courses yet.",
  };
  return (
    <div className="col-span-full py-16 text-center text-ink-muted text-sm">
      {copy[tab]}
    </div>
  );
}
