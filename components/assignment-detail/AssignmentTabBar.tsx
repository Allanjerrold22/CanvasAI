"use client";

import { useState } from "react";
import { NotePencilIcon, UsersIcon } from "@phosphor-icons/react/dist/ssr";
import { CourseAssignment } from "@/lib/courses";
import DetailsPanel from "./DetailsPanel";
import TeammatesPanel from "./TeammatesPanel";

type Props = {
  assignment: CourseAssignment;
};

type TabId = "details" | "teammates";

export default function AssignmentTabBar({ assignment }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("details");

  return (
    <div className="px-8 py-8">
      <div
        role="tablist"
        aria-label="Assignment sections"
        className="inline-flex items-center gap-1 p-1 bg-surface border border-ink-border rounded-full shadow-subtle"
      >
        {(
          [
            { id: "details" as TabId, label: "Details", icon: <NotePencilIcon size={14} /> },
            { id: "teammates" as TabId, label: "Teammates", icon: <UsersIcon size={14} /> },
          ] as const
        ).map(({ id, label, icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              role="tab"
              aria-selected={isActive}
              id={`tab-${id}`}
              aria-controls={`panel-${id}`}
              onClick={() => setActiveTab(id)}
              className={[
                "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-colors",
                isActive
                  ? "bg-[var(--brand-tint)] text-[var(--brand)]"
                  : "text-ink-muted hover:text-ink",
              ].join(" ")}
            >
              <span className={isActive ? "text-[var(--brand)]" : "text-ink-subtle"}>
                {icon}
              </span>
              {label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id="panel-details"
        aria-labelledby="tab-details"
        hidden={activeTab !== "details"}
      >
        <DetailsPanel assignment={assignment} />
      </div>

      <div
        role="tabpanel"
        id="panel-teammates"
        aria-labelledby="tab-teammates"
        hidden={activeTab !== "teammates"}
      >
        <TeammatesPanel teammates={assignment.teammates ?? []} />
      </div>
    </div>
  );
}
