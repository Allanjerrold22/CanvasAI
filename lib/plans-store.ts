// Plans storage utilities

import { Plan, PlanMilestone } from "./types";
import { Teammate } from "./courses";

export type SavedPlan = {
  id: string;
  planName: string;
  courseId: string;
  courseCode: string;
  assignmentId: string;
  assignmentTitle: string;
  teammates?: Teammate[];
  milestones: (PlanMilestone & { completed: boolean })[];
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
};

const PLANS_STORAGE_KEY = "saved-plans";

export function loadPlansFromStorage(): SavedPlan[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(PLANS_STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function savePlansToStorage(plans: SavedPlan[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(plans));
  } catch (err) {
    console.error("Failed to save plans to localStorage:", err);
  }
}

export function savePlan(
  plan: Plan,
  courseId: string,
  courseCode: string,
  assignmentId: string,
  assignmentTitle: string,
  teammates?: Teammate[]
): SavedPlan {
  const now = new Date().toISOString();
  const savedPlan: SavedPlan = {
    id: `plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    planName: plan.name,
    courseId,
    courseCode,
    assignmentId,
    assignmentTitle,
    teammates,
    milestones: plan.milestones.map((m) => ({ ...m, completed: false })),
    createdAt: now,
    updatedAt: now,
  };

  const existingPlans = loadPlansFromStorage();
  // Remove any existing plan for the same assignment
  const filtered = existingPlans.filter((p) => p.assignmentId !== assignmentId);
  const updatedPlans = [...filtered, savedPlan];
  savePlansToStorage(updatedPlans);

  return savedPlan;
}

export function updatePlan(planId: string, updates: Partial<SavedPlan>): SavedPlan | null {
  const plans = loadPlansFromStorage();
  const index = plans.findIndex((p) => p.id === planId);
  if (index === -1) return null;

  const updatedPlan = {
    ...plans[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  plans[index] = updatedPlan;
  savePlansToStorage(plans);

  return updatedPlan;
}

export function deletePlan(planId: string): boolean {
  const plans = loadPlansFromStorage();
  const filtered = plans.filter((p) => p.id !== planId);
  if (filtered.length === plans.length) return false;
  savePlansToStorage(filtered);
  return true;
}

export function getPlanByAssignment(assignmentId: string): SavedPlan | null {
  const plans = loadPlansFromStorage();
  return plans.find((p) => p.assignmentId === assignmentId) || null;
}

export function toggleMilestoneComplete(planId: string, milestoneId: string): SavedPlan | null {
  const plans = loadPlansFromStorage();
  const plan = plans.find((p) => p.id === planId);
  if (!plan) return null;

  const milestone = plan.milestones.find((m) => m.id === milestoneId);
  if (milestone) {
    milestone.completed = !milestone.completed;
    plan.updatedAt = new Date().toISOString();
    savePlansToStorage(plans);
  }

  return plan;
}

export function getCompletedCount(plan: SavedPlan): number {
  return plan.milestones.filter((m) => m.completed).length;
}
