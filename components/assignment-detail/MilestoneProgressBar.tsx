import { PlanMilestone } from "@/lib/types";

type Props = {
  milestones: PlanMilestone[];
  dueDate: string; // ISO date string
};

export default function MilestoneProgressBar({ milestones, dueDate }: Props) {
  const today = new Date();
  const due = new Date(dueDate);
  const totalMs = due.getTime() - today.getTime();

  return (
    <div className="relative h-8 flex items-center">
      {/* Track */}
      <div className="absolute left-0 right-0 h-1 bg-ink-border/40 rounded-full" />

      {/* Milestone nodes */}
      {milestones.map((milestone) => {
        const target = new Date(milestone.targetDate);
        const milestoneMs = target.getTime() - today.getTime();
        const pct = Math.max(0, Math.min(100, (milestoneMs / totalMs) * 100));

        return (
          <div
            key={milestone.id}
            className="absolute"
            style={{ left: `${pct}%`, transform: "translateX(-50%)" }}
          >
            {/* Circle */}
            <div className="w-3 h-3 rounded-full bg-[var(--brand)] border-2 border-white shadow-sm" />
            {/* Label */}
            <div className="absolute top-4 text-[9px] text-ink-muted whitespace-nowrap">
              {milestone.title.slice(0, 12)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
