// AI Planner internal types — used by AIPlannerModal and child components

export type PlanMilestone = {
  id: string;
  title: string;
  targetDate: string; // ISO date string, e.g. "2026-04-21"
};

export type Plan = {
  id: string;
  name: string;               // e.g. "Steady Pace", "Sprint Mode", "Balanced"
  milestoneCount: number;
  estimatedCompletion: string; // ISO date string
  milestones: PlanMilestone[];
};
