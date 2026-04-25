"use client";

import { CheckIcon } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { Milestone } from "@/lib/courses";

type Props = {
  milestone: Milestone;
  reminderSet: boolean;
  meetingScheduled: boolean;
};

export default function MilestoneCard({ milestone, reminderSet, meetingScheduled }: Props) {
  const [completed, setCompleted] = useState(milestone.completed);

  return (
    <div
      className={`rounded-xl border p-4 transition-colors ${
        completed ? "bg-emerald-50 border-emerald-200" : "bg-surface border-ink-border"
      }`}
    >
      {/* Top row: checkbox + title */}
      <div className="flex items-start gap-3">
        <button
          onClick={() => setCompleted(!completed)}
          className={`mt-0.5 w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center transition-colors ${
            completed
              ? "bg-emerald-500 border-emerald-500"
              : "border-ink-border hover:border-[var(--brand)]"
          }`}
        >
          {completed && <CheckIcon size={10} weight="bold" className="text-white" />}
        </button>
        <div
          className={`text-[13px] font-medium leading-snug ${
            completed ? "line-through text-ink-muted" : ""
          }`}
        >
          {milestone.title}
        </div>
      </div>

      {/* Target date */}
      <div className="mt-2 ml-7 text-[11.5px] text-ink-muted">
        {new Date(milestone.targetDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </div>

      {/* Badges */}
      <div className="mt-2 ml-7 flex flex-wrap gap-1.5">
        {reminderSet ? (
          <span className="text-[10.5px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
            Reminder set
          </span>
        ) : (
          <span className="text-[10.5px] font-medium px-2 py-0.5 rounded-full bg-surface-muted text-ink-subtle">
            No reminder
          </span>
        )}
        {meetingScheduled && (
          <span className="text-[10.5px] font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
            Meeting scheduled
          </span>
        )}
      </div>
    </div>
  );
}
