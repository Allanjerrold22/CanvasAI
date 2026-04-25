"use client";

import { useState } from "react";
import { TrashIcon } from "@phosphor-icons/react/dist/ssr";
import { Milestone } from "@/lib/courses";
import MilestoneCard from "./MilestoneCard";

type Props = {
  milestones: Milestone[];
  planName?: string;
  onEditPlan: () => void;
  onDeletePlan?: () => void;
};

export default function MilestonePlanSection({ milestones, planName, onEditPlan, onDeletePlan }: Props) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const completedCount = milestones.filter(m => m.completed).length;
  const total = milestones.length;

  return (
    <div className="px-8 py-6 border-b border-ink-border">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[15px] font-semibold">Your Plan</div>
          {planName && (
            <div className="text-[11px] text-ink-muted mt-0.5">{planName}</div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {onDeletePlan && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-[12.5px] font-medium text-ink-muted hover:text-red-600 transition-colors inline-flex items-center gap-1"
            >
              <TrashIcon size={13} />
              Delete
            </button>
          )}
          <button
            onClick={onEditPlan}
            className="text-[12.5px] font-medium text-[var(--brand)] hover:underline"
          >
            Edit Plan
          </button>
        </div>
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

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-ink-border/30 w-full max-w-sm mx-4 p-6 animate-slideUp">
            <h3 className="text-[15px] font-semibold mb-2">Delete Plan</h3>
            <p className="text-[13px] text-ink-muted mb-4">
              Are you sure you want to delete this plan? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-[13px] text-ink-muted hover:text-ink px-3 py-1.5"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeletePlan?.();
                  setShowDeleteConfirm(false);
                }}
                className="text-[13px] font-medium bg-red-600 text-white px-4 py-1.5 rounded-full hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
