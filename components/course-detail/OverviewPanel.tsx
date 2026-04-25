import type { Course } from "@/lib/courses";
import {
  CalendarBlankIcon,
  ChalkboardTeacherIcon,
  ClockIcon,
  TagIcon,
  IdentificationCardIcon,
} from "@phosphor-icons/react/dist/ssr";

export default function OverviewPanel({ course }: { course: Course }) {
  return (
    <div className="lg:grid lg:grid-cols-[1fr_320px] gap-8">
      {/* Left: Professor Overview */}
      <div className="bg-surface border border-ink-border rounded-2xl p-6 mb-6 lg:mb-0">
        <h2 className="text-[16px] font-semibold mb-1">Course Overview</h2>
        <p className="text-[13px] text-ink-muted mb-4">
          by {course.professor}
        </p>
        {course.overview ? (
          <p className="text-[14px] text-ink leading-relaxed">
            {course.overview}
          </p>
        ) : (
          <p className="text-[14px] text-ink-muted italic">
            No overview has been provided for this course yet.
          </p>
        )}
      </div>

      {/* Right: Metadata card */}
      <div className="bg-surface border border-ink-border rounded-2xl p-6 self-start">
        <h2 className="text-[15px] font-semibold mb-4">Course Details</h2>
        <dl className="flex flex-col gap-3 text-[13px]">
          <MetaRow
            icon={<IdentificationCardIcon size={15} />}
            label="Course Code"
            value={course.code}
          />
          <MetaRow
            icon={<CalendarBlankIcon size={15} />}
            label="Semester"
            value={course.semester}
          />
          <MetaRow
            icon={<ClockIcon size={15} />}
            label="Duration"
            value={course.duration}
          />
          <MetaRow
            icon={<ChalkboardTeacherIcon size={15} />}
            label="Professor"
            value={course.professor}
          />
          {course.tags.length > 0 && (
            <div className="flex gap-2 items-start">
              <span className="text-ink-subtle mt-0.5 shrink-0">
                <TagIcon size={15} />
              </span>
              <div>
                <dt className="text-ink-muted text-[11.5px] mb-1.5">Tags</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {course.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11.5px] px-2 py-0.5 rounded-full border border-ink-border text-ink-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </dd>
              </div>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}

function MetaRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-2 items-start">
      <span className="text-ink-subtle mt-0.5 shrink-0">{icon}</span>
      <div>
        <dt className="text-ink-muted text-[11.5px]">{label}</dt>
        <dd className="text-ink font-medium">{value}</dd>
      </div>
    </div>
  );
}
