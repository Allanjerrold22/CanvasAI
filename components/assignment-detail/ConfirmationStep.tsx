"use client";

import { CheckCircleIcon, CalendarDotsIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { Plan } from "@/lib/types";
import { Milestone } from "@/lib/courses";
import MilestoneCard from "./MilestoneCard";

type Props = {
  plan: Plan;
  calendarPermission: "granted" | "skipped";
  googlePermission: "granted" | "skipped";
  onConfirm: (milestones: Milestone[]) => void;
  onClose: () => void;
};

function planMilestonesToMilestones(
  plan: Plan,
  calPerm: string,
  googlePerm: string
): Milestone[] {
  return plan.milestones.map((m) => ({
    id: m.id,
    title: m.title,
    targetDate: m.targetDate,
    completed: false,
    reminderSet: calPerm === "granted",
    meetingScheduled: googlePerm === "granted",
  }));
}

export default function ConfirmationStep({
  plan,
  calendarPermission,
  googlePermission,
  onConfirm,
  onClose,
}: Props) {
  return (
    <div className="p-8 flex flex-col gap-6 overflow-y-auto flex-1">
      {/* Success icon + heading */}
      <div className="text-center">
        <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 grid place-items-center mb-4">
          <CheckCircleIcon size={28} weight="fill" className="text-emerald-500" />
        </div>
        <div className="text-[20px] font-semibold">Your plan is set!</div>
        <div className="text-[13px] text-ink-muted mt-1">
          {plan.name} · {plan.milestoneCount} milestones
        </div>
      </div>

      {/* Milestone cards */}
      <div className="flex flex-col gap-3">
        {plan.milestones.map((m) => (
          <MilestoneCard
            key={m.id}
            milestone={{
              id: m.id,
              title: m.title,
              targetDate: m.targetDate,
              completed: false,
              reminderSet: calendarPermission === "granted",
              meetingScheduled: googlePermission === "granted",
            }}
            reminderSet={calendarPermission === "granted"}
            meetingScheduled={googlePermission === "granted"}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <Link
          href="/calendar"
          onClick={onClose}
          className="inline-flex items-center gap-2 text-[13px] font-medium text-[var(--brand)] hover:underline"
        >
          <CalendarDotsIcon size={14} />
          View in Calendar
        </Link>
        <button
          onClick={() =>
            onConfirm(planMilestonesToMilestones(plan, calendarPermission, googlePermission))
          }
          className="bg-ink text-white text-[13px] font-medium px-5 py-2.5 rounded-full hover:bg-ink/90 transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
}
