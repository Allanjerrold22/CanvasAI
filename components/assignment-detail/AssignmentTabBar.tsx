"use client";

import { useState } from "react";
import { NotePencilIcon, UsersIcon, SparkleIcon } from "@phosphor-icons/react/dist/ssr";
import { CourseAssignment, Course } from "@/lib/courses";
import DetailsPanel from "./DetailsPanel";
import TeammatesPanel from "./TeammatesPanel";
import PracticeModal from "@/components/PracticeModal";

type Props = {
  assignment: CourseAssignment;
  course?: Course;
};

type TabId = "details" | "teammates" | "sparky";

export default function AssignmentTabBar({ assignment, course }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("details");
  const [showPractice, setShowPractice] = useState(false);

  const tabs = [
    { id: "details" as TabId, label: "Details", icon: <NotePencilIcon size={14} /> },
    { id: "teammates" as TabId, label: "Teammates", icon: <UsersIcon size={14} /> },
    { id: "sparky" as TabId, label: "Ask Sparky", icon: <SparkleIcon size={14} weight="fill" /> },
  ];

  const practiceContext = [
    course ? `Course: ${course.name} (${course.code})` : "",
    `Assignment: ${assignment.title}`,
    `Due: ${assignment.dueDate}`,
    assignment.points !== undefined ? `Points: ${assignment.points}` : "",
    assignment.description ? `\nInstructions:\n${assignment.description}` : "",
    `\nHelp the student understand this assignment. Guide them with questions and hints. Do NOT give direct answers or write their work for them.`,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <div className="px-8 py-8">
      <div
        role="tablist"
        aria-label="Assignment sections"
        className="inline-flex items-center gap-1 p-1 bg-surface border border-ink-border rounded-full shadow-subtle"
      >
        {tabs.map(({ id, label, icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              role="tab"
              aria-selected={isActive}
              id={`tab-${id}`}
              aria-controls={`panel-${id}`}
              onClick={() => {
                if (id === "sparky") {
                  setShowPractice(true);
                } else {
                  setActiveTab(id);
                }
              }}
              className={[
                "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-colors",
                isActive && id !== "sparky"
                  ? "bg-[var(--brand-tint)] text-[var(--brand)]"
                  : id === "sparky"
                  ? "text-ink-muted hover:bg-[var(--brand-tint)] hover:text-[var(--brand)]"
                  : "text-ink-muted hover:text-ink",
              ].join(" ")}
            >
              <span
                className={
                  isActive && id !== "sparky"
                    ? "text-[var(--brand)]"
                    : id === "sparky"
                    ? "text-[var(--brand)]"
                    : "text-ink-subtle"
                }
              >
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

      {showPractice && (
        <PracticeModal
          title={assignment.title}
          context={practiceContext}
          onClose={() => setShowPractice(false)}
        />
      )}
    </div>
  );
}
