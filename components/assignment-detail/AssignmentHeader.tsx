"use client";

import Link from "next/link";
import {
  ArrowLeftIcon,
  CalendarDotsIcon,
  CheckCircleIcon,
  ClockIcon,
  SparkleIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react/dist/ssr";
import { CourseAssignment, Course } from "@/lib/courses";

type Props = {
  assignment: CourseAssignment;
  course: Course;
  hasPlan?: boolean;
  onOpenPlanner: () => void;
};

type AssignmentStatus = "due" | "submitted" | "overdue";

const statusMeta: Record<
  AssignmentStatus,
  { label: string; className: string; icon: React.ReactNode }
> = {
  due: {
    label: "Due",
    className: "bg-amber-100 text-amber-700",
    icon: <ClockIcon size={14} />,
  },
  submitted: {
    label: "Submitted",
    className: "bg-emerald-100 text-emerald-700",
    icon: <CheckCircleIcon size={14} weight="fill" />,
  },
  overdue: {
    label: "Overdue",
    className: "bg-rose-100 text-rose-700",
    icon: <WarningCircleIcon size={14} weight="fill" />,
  },
};

export default function AssignmentHeader({ assignment, course, hasPlan, onOpenPlanner }: Props) {
  const meta = statusMeta[assignment.status];

  return (
    <div className="px-8 pt-6 pb-0">
      {/* Back link */}
      <Link
        href="/assignments"
        className="inline-flex items-center gap-1.5 text-[13px] text-ink-muted hover:text-ink transition-colors"
      >
        <ArrowLeftIcon size={13} />
        All Assignments
      </Link>

      {/* Header row */}
      <div className="mt-4 flex items-start justify-between gap-6">
        {/* Left: title, course, due date, status */}
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[24px] font-bold tracking-tight">
            {assignment.title}
          </h1>
          <p className="text-[14px] text-ink-muted">
            {course.code} · {course.name}
          </p>
          <div className="flex items-center gap-1.5 text-[13px] text-ink-muted">
            <CalendarDotsIcon size={14} />
            <span>{assignment.dueDate}</span>
          </div>
          <span
            className={`mt-1 text-[11.5px] font-medium px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 self-start ${meta.className}`}
          >
            {meta.icon}
            {meta.label}
          </span>
        </div>

        {/* Right: AI Planner button */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={onOpenPlanner}
            className="bg-[var(--brand)] text-white text-[13px] font-medium px-4 py-2 rounded-full hover:bg-[var(--brand)]/90 transition-colors inline-flex items-center gap-2"
          >
            <SparkleIcon size={16} weight="fill" />
            {hasPlan ? "Update Plan" : "AI Planner"}
          </button>
        </div>
      </div>
    </div>
  );
}
