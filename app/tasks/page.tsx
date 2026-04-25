"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ListChecksIcon,
  TargetIcon,
  CheckCircleIcon,
  CircleIcon,
  TrashIcon,
  PencilSimpleIcon,
  CalendarDotsIcon,
  DotsThreeIcon,
} from "@phosphor-icons/react/dist/ssr";
import PageHeader from "@/components/PageHeader";
import { SavedPlan, loadPlansFromStorage, deletePlan, toggleMilestoneComplete, getCompletedCount } from "@/lib/plans-store";
import { courses, Teammate } from "@/lib/courses";

type TabId = "plans" | "tasks";

// Helper to get teammates for a plan (from saved data or fallback to course data)
function getTeammatesForPlan(plan: SavedPlan): Teammate[] | undefined {
  if (plan.teammates && plan.teammates.length > 0) {
    return plan.teammates;
  }
  // Fallback: look up from course data
  const course = courses.find((c) => c.id === plan.courseId);
  if (course?.assignments) {
    const assignment = course.assignments.find((a) => a.id === plan.assignmentId);
    return assignment?.teammates;
  }
  return undefined;
}

export default function TasksPage() {
  const [activeTab, setActiveTab] = useState<TabId>("plans");
  const [plans, setPlans] = useState<SavedPlan[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    setPlans(loadPlansFromStorage());
  }, []);

  function handleDeletePlan(planId: string) {
    deletePlan(planId);
    setPlans(loadPlansFromStorage());
    setDeleteConfirm(null);
  }

  function handleToggleMilestone(planId: string, milestoneId: string) {
    toggleMilestoneComplete(planId, milestoneId);
    setPlans(loadPlansFromStorage());
  }

  // Flatten all milestones for the Tasks tab
  const allTasks = plans.flatMap((plan) =>
    plan.milestones.map((m) => ({
      ...m,
      planId: plan.id,
      courseCode: plan.courseCode,
      assignmentTitle: plan.assignmentTitle,
      assignmentId: plan.assignmentId,
    }))
  );

  const pendingTasks = allTasks.filter((t) => !t.completed);
  const completedTasks = allTasks.filter((t) => t.completed);

  return (
    <div className="py-8 max-w-[1200px] mx-auto">
      <PageHeader
        title="Tasks & Plans"
        subtitle="Track your AI-generated study plans and milestones."
      />

      {/* Tabs */}
      <div className="mt-6 flex items-center gap-1 p-1 bg-surface border border-ink-border rounded-full w-fit shadow-subtle">
        <button
          onClick={() => setActiveTab("plans")}
          className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors ${
            activeTab === "plans"
              ? "bg-[var(--brand-tint)] text-[var(--brand)]"
              : "text-ink-muted hover:text-ink"
          }`}
        >
          <TargetIcon size={14} weight={activeTab === "plans" ? "fill" : "regular"} />
          Plans
          <span className="ml-1 text-[11px] px-1.5 py-0.5 rounded-full bg-surface-muted">
            {plans.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("tasks")}
          className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors ${
            activeTab === "tasks"
              ? "bg-[var(--brand-tint)] text-[var(--brand)]"
              : "text-ink-muted hover:text-ink"
          }`}
        >
          <ListChecksIcon size={14} weight={activeTab === "tasks" ? "fill" : "regular"} />
          Tasks
          <span className="ml-1 text-[11px] px-1.5 py-0.5 rounded-full bg-surface-muted">
            {pendingTasks.length}
          </span>
        </button>
      </div>

      {/* Content */}
      <div className="mt-6">
        {activeTab === "plans" && (
          <PlansView
            plans={plans}
            onDelete={(id) => setDeleteConfirm(id)}
            onToggleMilestone={handleToggleMilestone}
          />
        )}
        {activeTab === "tasks" && (
          <TasksView
            pendingTasks={pendingTasks}
            completedTasks={completedTasks}
            onToggle={handleToggleMilestone}
          />
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-ink-border/30 w-full max-w-sm mx-4 p-6 animate-slideUp">
            <h3 className="text-[15px] font-semibold mb-2">Delete Plan</h3>
            <p className="text-[13px] text-ink-muted mb-4">
              Are you sure you want to delete this plan? This will also remove all associated calendar events.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="text-[13px] text-ink-muted hover:text-ink px-3 py-1.5"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePlan(deleteConfirm)}
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

function PlansView({
  plans,
  onDelete,
  onToggleMilestone,
}: {
  plans: SavedPlan[];
  onDelete: (id: string) => void;
  onToggleMilestone: (planId: string, milestoneId: string) => void;
}) {
  if (plans.length === 0) {
    return (
      <div className="text-center py-16 text-ink-muted">
        <TargetIcon size={40} className="mx-auto mb-3 opacity-40" />
        <p className="text-[14px]">No plans yet</p>
        <p className="text-[12px] mt-1">
          Use the AI Planner on any assignment to create a study plan.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
      {plans.map((plan) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          onDelete={() => onDelete(plan.id)}
          onToggleMilestone={(mId) => onToggleMilestone(plan.id, mId)}
        />
      ))}
    </div>
  );
}

function PlanCard({
  plan,
  onDelete,
  onToggleMilestone,
}: {
  plan: SavedPlan;
  onDelete: () => void;
  onToggleMilestone: (milestoneId: string) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const completed = getCompletedCount(plan);
  const total = plan.milestones.length;
  const progress = total > 0 ? (completed / total) * 100 : 0;
  const teammates = getTeammatesForPlan(plan);

  return (
    <div className="bg-surface border border-ink-border rounded-xl shadow-subtle overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-ink-border/50">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[11px] text-ink-muted font-medium uppercase tracking-wide">
              {plan.courseCode}
            </div>
            <h3 className="text-[14px] font-semibold leading-tight mt-0.5 line-clamp-2">
              {plan.assignmentTitle}
            </h3>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-7 h-7 grid place-items-center rounded-md text-ink-subtle hover:bg-surface-muted"
            >
              <DotsThreeIcon size={18} weight="bold" />
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-8 z-20 bg-white border border-ink-border rounded-lg shadow-lg py-1 min-w-[120px]">
                  <Link
                    href={`/assignments/${plan.assignmentId}`}
                    className="flex items-center gap-2 px-3 py-1.5 text-[12px] text-ink-muted hover:bg-surface-muted hover:text-ink"
                  >
                    <PencilSimpleIcon size={14} />
                    Edit Plan
                  </Link>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onDelete();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-red-600 hover:bg-red-50"
                  >
                    <TrashIcon size={14} />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Teammates */}
        {teammates && teammates.length > 0 && (
          <div className="mt-2 flex items-center gap-1.5">
            <div className="flex -space-x-1.5">
              {teammates.slice(0, 4).map((t) => (
                <div
                  key={t.id}
                  className="w-6 h-6 rounded-full grid place-items-center text-white text-[9px] font-semibold border-2 border-white"
                  style={{ backgroundColor: t.avatarColor }}
                  title={t.name}
                >
                  {t.initials}
                </div>
              ))}
              {teammates.length > 4 && (
                <div className="w-6 h-6 rounded-full grid place-items-center text-[9px] font-semibold border-2 border-white bg-surface-muted text-ink-muted">
                  +{teammates.length - 4}
                </div>
              )}
            </div>
            <span className="text-[10px] text-ink-subtle">
              {teammates.length} teammate{teammates.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        {/* Progress bar */}
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-surface-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--brand)] rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[11px] text-ink-muted font-medium">
            {completed}/{total}
          </span>
        </div>
      </div>

      {/* Milestones with vertical line */}
      <div className="px-4 py-3">
        <div className="relative pl-4">
          {/* Vertical line */}
          <div className="absolute left-[5px] top-1 bottom-1 w-0.5 bg-ink-border rounded-full" />

          <div className="flex flex-col gap-2">
            {plan.milestones.map((milestone, idx) => (
              <div
                key={milestone.id}
                className="relative flex items-start gap-2 cursor-pointer group"
                onClick={() => onToggleMilestone(milestone.id)}
              >
                {/* Circle on the line */}
                <div
                  className={`absolute -left-4 top-0.5 w-2.5 h-2.5 rounded-full border-2 transition-colors ${
                    milestone.completed
                      ? "bg-emerald-500 border-emerald-500"
                      : "bg-white border-ink-border group-hover:border-[var(--brand)]"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-[12px] leading-tight ${
                      milestone.completed ? "text-ink-muted line-through" : "text-ink"
                    }`}
                  >
                    {milestone.title}
                  </div>
                  <div className="text-[10px] text-ink-subtle mt-0.5 flex items-center gap-1">
                    <CalendarDotsIcon size={10} />
                    {new Date(milestone.targetDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-ink-border/50 bg-surface-muted/30">
        <div className="flex items-center justify-between text-[10px] text-ink-subtle">
          <span>{plan.planName}</span>
          <span>
            Created {new Date(plan.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        </div>
      </div>
    </div>
  );
}

function TasksView({
  pendingTasks,
  completedTasks,
  onToggle,
}: {
  pendingTasks: Array<{
    id: string;
    title: string;
    targetDate: string;
    completed: boolean;
    planId: string;
    courseCode: string;
    assignmentTitle: string;
  }>;
  completedTasks: typeof pendingTasks;
  onToggle: (planId: string, milestoneId: string) => void;
}) {
  if (pendingTasks.length === 0 && completedTasks.length === 0) {
    return (
      <div className="text-center py-16 text-ink-muted">
        <ListChecksIcon size={40} className="mx-auto mb-3 opacity-40" />
        <p className="text-[14px]">No tasks yet</p>
        <p className="text-[12px] mt-1">
          Tasks will appear here when you create plans with the AI Planner.
        </p>
      </div>
    );
  }

  // Sort by target date
  const sortedPending = [...pendingTasks].sort(
    (a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Pending */}
      {sortedPending.length > 0 && (
        <div>
          <h3 className="text-[13px] font-semibold text-ink-muted mb-3">
            Pending ({sortedPending.length})
          </h3>
          <div className="flex flex-col gap-2">
            {sortedPending.map((task) => (
              <TaskRow key={`${task.planId}-${task.id}`} task={task} onToggle={onToggle} />
            ))}
          </div>
        </div>
      )}

      {/* Completed */}
      {completedTasks.length > 0 && (
        <div>
          <h3 className="text-[13px] font-semibold text-ink-muted mb-3">
            Completed ({completedTasks.length})
          </h3>
          <div className="flex flex-col gap-2">
            {completedTasks.map((task) => (
              <TaskRow key={`${task.planId}-${task.id}`} task={task} onToggle={onToggle} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TaskRow({
  task,
  onToggle,
}: {
  task: {
    id: string;
    title: string;
    targetDate: string;
    completed: boolean;
    planId: string;
    courseCode: string;
    assignmentTitle: string;
  };
  onToggle: (planId: string, milestoneId: string) => void;
}) {
  const isOverdue = !task.completed && new Date(task.targetDate) < new Date();

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 bg-surface border border-ink-border rounded-xl cursor-pointer hover:border-[var(--brand)]/30 transition-colors ${
        task.completed ? "opacity-60" : ""
      }`}
      onClick={() => onToggle(task.planId, task.id)}
    >
      <div className="shrink-0">
        {task.completed ? (
          <CheckCircleIcon size={20} weight="fill" className="text-emerald-500" />
        ) : (
          <CircleIcon size={20} className="text-ink-border" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div
          className={`text-[13px] font-medium ${task.completed ? "line-through text-ink-muted" : ""}`}
        >
          {task.title}
        </div>
        <div className="text-[11px] text-ink-subtle mt-0.5">
          {task.courseCode} · {task.assignmentTitle}
        </div>
      </div>
      <div
        className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
          isOverdue
            ? "bg-red-100 text-red-700"
            : task.completed
              ? "bg-emerald-100 text-emerald-700"
              : "bg-surface-muted text-ink-muted"
        }`}
      >
        {new Date(task.targetDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}
      </div>
    </div>
  );
}
