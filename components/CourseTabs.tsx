"use client";

import { useState } from "react";
import {
  LightningIcon,
  ClockCounterClockwiseIcon,
  ArchiveIcon,
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
  const filtered = courses.filter((c) => c.status === active);

  return (
    <>
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
              <span
                className={isActive ? "text-[var(--brand)]" : "text-ink-subtle"}
              >
                {t.icon}
              </span>
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6 grid gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {filtered.length === 0 ? (
          <EmptyState tab={active} />
        ) : (
          filtered.map((c) => <CourseCard key={c.id} course={c} />)
        )}
      </div>
    </>
  );
}

function EmptyState({ tab }: { tab: TabId }) {
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
