"use client";

import { useState } from "react";
import { CalendarDotsIcon } from "@phosphor-icons/react/dist/ssr";
import { Plan } from "@/lib/types";

type Props = {
  plan: Plan;
  onComplete: (
    calendarPermission: "granted" | "skipped",
    googlePermission: "granted" | "skipped"
  ) => void;
};

export default function PermissionFlow({ plan, onComplete }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [calPerm, setCalPerm] = useState<"granted" | "skipped" | null>(null);

  if (step === 1) {
    return (
      <div className="p-8 flex flex-col gap-6 overflow-y-auto flex-1">
        {/* Icon + heading */}
        <div className="text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 grid place-items-center mb-4">
            <CalendarDotsIcon size={28} className="text-amber-600" />
          </div>
          <div className="text-[18px] font-semibold">
            Add milestone reminders to your calendar?
          </div>
          <div className="text-[13px] text-ink-muted mt-1.5 max-w-sm mx-auto">
            We'll add a reminder for each milestone so you stay on track.
          </div>
        </div>

        {/* Milestone preview list */}
        <div className="bg-surface-muted rounded-xl p-4 flex flex-col gap-2">
          {plan.milestones.map((m) => (
            <div key={m.id} className="flex items-center justify-between text-[13px]">
              <span className="font-medium">{m.title}</span>
              <span className="text-ink-muted">
                {new Date(m.targetDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={() => {
              setCalPerm("granted");
              setStep(2);
            }}
            className="w-full max-w-xs bg-[var(--brand)] text-white text-[13px] font-medium py-2.5 rounded-full hover:bg-[var(--brand)]/90 transition-colors"
          >
            Allow
          </button>
          <button
            onClick={() => {
              setCalPerm("skipped");
              setStep(2);
            }}
            className="text-[13px] text-ink-muted hover:text-ink transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 flex flex-col gap-6 overflow-y-auto flex-1">
      <div className="text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-100 grid place-items-center mb-4">
          {/* Google Calendar icon — simple colored "G" placeholder */}
          <span className="text-[22px] font-bold text-blue-600">G</span>
        </div>
        <div className="text-[18px] font-semibold">
          Schedule team meetings in Google Calendar?
        </div>
        <div className="text-[13px] text-ink-muted mt-1.5 max-w-sm mx-auto">
          We'll create one meeting per milestone for your team to check in.
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={() => {
            onComplete(calPerm!, "granted");
          }}
          className="w-full max-w-xs text-white text-[13px] font-medium py-2.5 rounded-full transition-colors"
          style={{ backgroundColor: "#4285F4" }}
        >
          Connect Google Calendar
        </button>
        <button
          onClick={() => {
            onComplete(calPerm!, "skipped");
          }}
          className="text-[13px] text-ink-muted hover:text-ink transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
