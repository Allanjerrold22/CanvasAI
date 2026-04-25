"use client";

import { useState } from "react";
import {
  BookOpenIcon,
  FolderIcon,
  NotePencilIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { Course } from "@/lib/courses";
import OverviewPanel from "./OverviewPanel";
import FilesPanel from "./FilesPanel";
import AssignmentsPanel from "./AssignmentsPanel";

type TabId = "overview" | "files" | "assignments";

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "overview", label: "Overview", icon: <BookOpenIcon size={14} /> },
  { id: "files", label: "Files", icon: <FolderIcon size={14} weight="fill" /> },
  {
    id: "assignments",
    label: "Assignments",
    icon: <NotePencilIcon size={14} />,
  },
];

export default function CourseTabBar({ course }: { course: Course }) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  return (
    <div>
      {/* Tab bar */}
      <div
        role="tablist"
        aria-label="Course sections"
        className="inline-flex items-center gap-1 p-1 bg-surface border border-ink-border rounded-full shadow-subtle"
      >
        {tabs.map((t) => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              id={`tab-${t.id}`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${t.id}`}
              onClick={() => setActiveTab(t.id)}
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

      {/* Panels */}
      <div className="mt-6">
        {tabs.map((t) => (
          <div
            key={t.id}
            id={`panel-${t.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${t.id}`}
            hidden={activeTab !== t.id}
          >
            {t.id === "overview" && <OverviewPanel course={course} />}
            {t.id === "files" && (
              <FilesPanel files={course.files} courseId={course.id} />
            )}
            {t.id === "assignments" && (
              <AssignmentsPanel assignments={course.assignments} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
