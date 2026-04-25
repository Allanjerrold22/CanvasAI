import Link from "next/link";
import {
  CalendarBlankIcon,
  ChalkboardTeacherIcon,
  ChatCircleDotsIcon,
  DotsThreeIcon,
  GraduationCapIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { Course } from "@/lib/courses";

const statusStyles: Record<
  Course["status"],
  { label: string; className: string }
> = {
  active: {
    label: "Active",
    className: "bg-emerald-100 text-emerald-700",
  },
  upcoming: {
    label: "Upcoming",
    className: "bg-amber-100 text-amber-700",
  },
  completed: {
    label: "Completed",
    className: "bg-ink-border/70 text-ink-muted",
  },
};

export default function CourseCard({ course }: { course: Course }) {
  const status = statusStyles[course.status];

  return (
    <Link href={`/courses/${course.id}`} className="block group">
    <article className="bg-surface rounded-2xl border border-ink-border shadow-subtle hover:shadow-card transition-shadow overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-9 h-9 rounded-full grid place-items-center text-white shrink-0"
            style={{ backgroundColor: course.accent }}
            aria-hidden
          >
            <GraduationCapIcon size={16} weight="fill" />
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-semibold truncate">
              {course.code}
            </div>
            <div className="text-[11.5px] text-ink-muted truncate">
              {course.semester}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${status.className}`}
          >
            {status.label}
          </span>
          <button
            type="button"
            aria-label="Course options"
            className="w-7 h-7 grid place-items-center rounded-md text-ink-subtle hover:bg-surface-muted"
          >
            <DotsThreeIcon size={18} weight="bold" />
          </button>
        </div>
      </div>

      {/* Cover */}
      <div className="mx-4 mb-4 h-[148px] rounded-xl relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${course.accent} 0%, ${course.accent}CC 45%, #ffffff22 100%)`,
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.25),transparent_50%)]" />
        <div className="absolute inset-0 p-4 flex flex-col justify-end text-white">
          <div className="text-[11px] opacity-80 tracking-[0.08em] uppercase">
            {course.code}
          </div>
          <div className="text-[15px] font-semibold leading-tight line-clamp-2">
            {course.name}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 pb-4 flex flex-col gap-3 flex-1">
        <h3 className="text-[15.5px] font-semibold leading-snug line-clamp-2">
          {course.name}
        </h3>

        <div className="flex flex-wrap gap-1.5">
          {course.tags.map((tag) => (
            <span
              key={tag}
              className="text-[11.5px] px-2 py-0.5 rounded-full border border-ink-border text-ink-muted"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex flex-col gap-1.5 text-[12.5px] text-ink-muted">
          <Meta
            icon={<ChalkboardTeacherIcon size={14} />}
            label={course.professor}
          />
          <Meta
            icon={<CalendarBlankIcon size={14} />}
            label={course.duration}
          />
          {course.unreadMessages ? (
            <Meta
              icon={<ChatCircleDotsIcon size={14} className="text-maroon" />}
              label={`${course.unreadMessages} new ${
                course.unreadMessages === 1 ? "message" : "messages"
              }`}
              accent
            />
          ) : null}
        </div>
      </div>
    </article>
    </Link>
  );
}

function Meta({
  icon,
  label,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 ${
        accent ? "text-maroon font-medium" : ""
      }`}
    >
      <span className="shrink-0 text-ink-subtle">{icon}</span>
      <span className="truncate">{label}</span>
    </div>
  );
}
