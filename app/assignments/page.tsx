"use client";

import {
  CheckCircleIcon,
  ClockIcon,
  WarningCircleIcon,
  UploadSimpleIcon,
  SparkleIcon,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import { courses, type CourseAssignment } from "@/lib/courses";

type FlatAssignment = CourseAssignment & { courseLabel: string };

const assignments: FlatAssignment[] = courses.flatMap((course) =>
  (course.assignments ?? []).map((a) => ({
    ...a,
    courseLabel: `${course.code} · ${course.name}`,
  }))
);

const statusMeta: Record<
  CourseAssignment["status"],
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

export default function AssignmentsPage() {
  const router = useRouter();

  function handlePractice(
    e: React.MouseEvent,
    assignment: FlatAssignment
  ) {
    e.preventDefault(); // prevent the Link from navigating
    const params = new URLSearchParams({
      assignmentId: assignment.id,
      title: assignment.title,
      course: assignment.courseLabel,
      dueDate: assignment.dueDate,
      description: assignment.description ?? "",
    });
    router.push(`/sparky?${params.toString()}`);
  }

  return (
    <div className="px-8 py-8 max-w-[1400px] mx-auto">
      <PageHeader
        title="Assignments"
        subtitle="Submit work, track feedback, and stay ahead of deadlines."
        action={
          <button
            type="button"
            className="inline-flex items-center gap-2 bg-ink text-white text-[13px] font-medium px-4 py-2 rounded-full hover:bg-ink/90 transition-colors"
          >
            <UploadSimpleIcon size={14} weight="bold" />
            Submit assignment
          </button>
        }
      />

      <div className="mt-8 bg-surface border border-ink-border rounded-2xl shadow-subtle overflow-hidden">
        <ul className="divide-y divide-ink-border">
          {assignments.map((a) => {
            const meta = statusMeta[a.status];
            return (
              <li key={a.id}>
                <Link
                  href={`/assignments/${a.id}`}
                  className="px-5 py-4 flex items-center gap-4 hover:bg-[var(--brand-tint)]/60 transition-colors cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-lg bg-surface-muted grid place-items-center text-ink-muted shrink-0">
                    {meta.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-semibold truncate">
                      {a.title}
                    </div>
                    <div className="text-[12.5px] text-ink-muted truncate">
                      {a.courseLabel} · {a.dueDate}
                    </div>
                  </div>
                  <span
                    className={`text-[11.5px] font-medium px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 shrink-0 ${meta.className}`}
                  >
                    {meta.icon}
                    {meta.label}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handlePractice(e, a)}
                    className="shrink-0 inline-flex items-center gap-1.5 bg-[var(--brand-tint)] text-[var(--brand)] border border-[var(--brand)]/20 text-[12.5px] font-medium px-3 py-1.5 rounded-full hover:bg-[var(--brand)] hover:text-white transition-colors"
                  >
                    <SparkleIcon size={13} weight="fill" />
                    Practice with Sparky
                  </button>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
