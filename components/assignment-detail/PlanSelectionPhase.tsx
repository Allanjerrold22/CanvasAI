"use client";

import { CalendarDotsIcon } from "@phosphor-icons/react/dist/ssr";
import { Plan } from "@/lib/types";
import PlanCard from "./PlanCard";

type Props = {
  plans: Plan[];
  selectedPlan: Plan | null;
  onSelect: (plan: Plan) => void;
  onConfirm: () => void;
};

export default function PlanSelectionPhase({
  plans,
  selectedPlan,
  onSelect,
  onConfirm,
}: Props) {
  return (
    <div className="p-8 flex flex-col gap-6 overflow-y-auto flex-1">
      {/* Header */}
      <div>
        <div className="text-[18px] font-semibold tracking-tight">Choose your plan</div>
        <div className="text-[13px] text-ink-muted mt-1">
          Select the approach that fits your schedule best.
        </div>
      </div>

      {/* Plan cards — single column list */}
      <div className="flex flex-col gap-3">
        {plans.map((plan, index) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            selected={selectedPlan?.id === plan.id}
            onSelect={() => onSelect(plan)}
            animationDelay={index * 80}
          />
        ))}
      </div>

      {/* CTA button — only when a plan is selected */}
      {selectedPlan && (
        <div className="flex justify-end animate-fadeUp">
          <button
            onClick={onConfirm}
            className="inline-flex items-center gap-2 bg-[var(--brand)] text-white text-[13px] font-medium px-5 py-2.5 rounded-full hover:bg-[var(--brand)]/90 transition-colors"
          >
            <CalendarDotsIcon size={14} />
            Set Up Reminders &amp; Meetings
          </button>
        </div>
      )}
    </div>
  );
}
