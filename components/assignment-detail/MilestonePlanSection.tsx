"use client";

import { Milestone } from "@/lib/courses";
import MilestoneCard from "./MilestoneCard";

type Props = {
  milestones: Milestone[];
  onEditPlan: () => void;
};

export default function MilestonePlanSection({ milestones, onEditPlan }: Props) {
  const completedCount = milestones.filter(m => m.completed).length;
  const total = milestones.length;

  return (
    <div className="px-8 py-6 border-b border-ink-border">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-[15px] font-semibold">Your Plan</div>
        <button
          onClick={onEditPlan}
          className="text-[12.5px] font-medium text-[var(--brand)] hover:underline"
        >
          Edit Plan
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-[11.5px] text-ink-muted mb-1.5">
          <span>{completedCount} of {total} milestones completed</span>
          <span>{Math.round((completedCount / total) * 100)}%</span>
        </div>
        <div className="h-1.5 bg-ink-border/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--brand)] rounded-full transition-all duration-500"
            style={{ width: `${(completedCount / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Horizontal scrollable milestone cards */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
        {milestones.map(m => (
          <div key={m.id} className="shrink-0 w-[200px]">
            <MilestoneCard
              milestone={m}
              reminderSet={m.reminderSet}
              meetingScheduled={m.meetingScheduled}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
