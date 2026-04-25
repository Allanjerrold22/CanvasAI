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

export default function HeroBanner({ course }: { course: Course }) {
  const status = statusStyles[course.status];

  return (
    <div
      className="relative w-full min-h-[220px] flex flex-col justify-end px-8 py-8"
      style={{
        background: `linear-gradient(135deg, ${course.accent} 0%, ${course.accent}CC 45%, #ffffff22 100%)`,
      }}
    >
      {/* Radial highlight overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_55%)]" />

      {/* Status badge — top right */}
      <div className="absolute top-6 right-6">
        <span
          className={`text-[11.5px] font-medium px-2.5 py-1 rounded-full ${status.className}`}
        >
          {status.label}
        </span>
      </div>

      {/* Content */}
      <div className="relative z-10 text-white">
        <div className="text-[11px] uppercase tracking-[0.1em] opacity-70 mb-1">
          {course.code}
        </div>
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight">
          {course.name}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] opacity-80">
          <span>{course.professor}</span>
          <span className="opacity-50">·</span>
          <span>{course.semester}</span>
        </div>
      </div>
    </div>
  );
}
