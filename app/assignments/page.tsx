import {
  CheckCircleIcon,
  ClockIcon,
  WarningCircleIcon,
  UploadSimpleIcon,
} from "@phosphor-icons/react/dist/ssr";
import PageHeader from "@/components/PageHeader";

type AssignmentStatus = "due" | "submitted" | "overdue";

const assignments: {
  id: string;
  title: string;
  course: string;
  dueDate: string;
  status: AssignmentStatus;
}[] = [
  {
    id: "1",
    title: "Binary Trees — Problem Set 4",
    course: "CSE 310 · Data Structures",
    dueDate: "Due Apr 28, 11:59 PM",
    status: "due",
  },
  {
    id: "2",
    title: "Memory Safety Lab Report",
    course: "CSE 365 · Information Assurance",
    dueDate: "Due May 1, 5:00 PM",
    status: "due",
  },
  {
    id: "3",
    title: "Vector Fields Homework",
    course: "MAT 267 · Calculus III",
    dueDate: "Submitted Apr 18",
    status: "submitted",
  },
  {
    id: "4",
    title: "Technical Memo Draft",
    course: "ENG 301 · Writing",
    dueDate: "Overdue — Apr 20",
    status: "overdue",
  },
];

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

export default function AssignmentsPage() {
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
                    {a.course} · {a.dueDate}
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
    </div>
  );
}
