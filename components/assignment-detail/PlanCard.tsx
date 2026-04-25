"use client";

import {
  CheckCircle as CheckCircleIcon,
  Lightning as LightningIcon,
  Timer as TimerIcon,
  Scales as ScalesIcon,
} from "@phosphor-icons/react/dist/ssr";
import { Plan } from "@/lib/types";

type Props = {
  plan: Plan;
  selected: boolean;
  onSelect: () => void;
  animationDelay?: number;
};

const planIcons: Record<string, React.ReactNode> = {
  "Steady Pace": <TimerIcon size={20} weight="duotone" />,
  "Sprint Mode": <LightningIcon size={20} weight="duotone" />,
  "Balanced": <ScalesIcon size={20} weight="duotone" />,
};

export default function PlanCard({
  plan,
  selected,
  onSelect,
  animationDelay,
}: Props) {
  const icon = planIcons[plan.name] ?? <TimerIcon size={20} weight="duotone" />;

  return (
    <div
      onClick={onSelect}
      style={{ animationDelay: `${animationDelay ?? 0}ms` }}
      className={`
        relative w-full rounded-2xl border p-5 cursor-pointer animate-fadeUp card-3d
        ${
          selected
            ? "bg-[var(--brand-tint)] border-[var(--brand)] shadow-lg"
            : "bg-white border-ink-border/60 hover:border-[var(--brand)]/40"
        }
      `}
    >
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className={`w-11 h-11 rounded-xl grid place-items-center shrink-0 ${
          selected ? "bg-[var(--brand)] text-white" : "bg-surface-muted text-ink-muted"
        }`}>
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-semibold">{plan.name}</span>
            {selected && (
              <CheckCircleIcon size={16} weight="fill" className="text-[var(--brand)]" />
            )}
          </div>
          <div className="text-[12.5px] text-ink-muted mt-0.5">
            {plan.milestoneCount} milestones · Est.{" "}
            {new Date(plan.estimatedCompletion).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </div>
        </div>

        {/* Milestone chips */}
        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
          {plan.milestones.slice(0, 3).map((m) => (
            <span
              key={m.id}
              className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-surface-muted text-ink-subtle"
            >
              {m.title.length > 10 ? m.title.slice(0, 10) + "…" : m.title}
            </span>
          ))}
          {plan.milestones.length > 3 && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-surface-muted text-ink-subtle">
              +{plan.milestones.length - 3}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
