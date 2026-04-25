import {
  CheckCircleIcon,
  ClockIcon,
  WarningCircleIcon,
  UploadSimpleIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { CourseAssignment } from "@/lib/courses";

type AssignmentStatus = CourseAssignment["status"];

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

export default function AssignmentsPanel({
  assignments,
}: {
  assignments: CourseAssignment[] | undefined;
}) {
  return (
    <div>
      {/* Panel header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[16px] font-semibold">Assignments</h2>
        <button
          type="button"
          className="inline-flex items-center gap-2 bg-ink text-white text-[13px] font-medium px-4 py-2 rounded-full hover:bg-ink/90 transition-colors"
        >
          <UploadSimpleIcon size={14} weight="bold" />
          Submit assignment
        </button>
      </div>

      {/* List */}
      {!assignments || assignments.length === 0 ? (
        <div className="bg-surface border border-ink-border rounded-2xl shadow-subtle py-16 text-center text-ink-muted text-sm">
          No assignments for this course yet.
        </div>
      ) : (
        <div className="bg-surface border border-ink-border rounded-2xl shadow-subtle overflow-hidden">
          <ul className="divide-y divide-ink-border">
            {assignments.map((a) => {
              const meta = statusMeta[a.status];
              return (
                <li
                  key={a.id}
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
                      {a.dueDate}
                    </div>
                  </div>
                  <span
                    className={`text-[11.5px] font-medium px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 ${meta.className}`}
                  >
                    {meta.icon}
                    {meta.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
