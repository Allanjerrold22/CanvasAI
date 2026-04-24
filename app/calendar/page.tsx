import {
  CaretLeftIcon,
  CaretRightIcon,
  PlusIcon,
} from "@phosphor-icons/react/dist/ssr";
import PageHeader from "@/components/PageHeader";

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Render a static April 2026 month grid for now.
const monthLabel = "April 2026";
const daysInMonth = 30;
const startWeekday = 3; // Wed

const events: Record<number, { title: string; color: string }[]> = {
  14: [{ title: "CSE 310 Lecture", color: "#8C1D40" }],
  16: [{ title: "MAT 267 Quiz", color: "#0F766E" }],
  21: [{ title: "ENG 301 Draft due", color: "#6B21A8" }],
  24: [{ title: "Study group", color: "#334155" }],
  28: [{ title: "Problem Set 4 due", color: "#8C1D40" }],
};

export default function CalendarPage() {
  const cells: (number | null)[] = [
    ...Array(startWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="px-8 py-8 max-w-[1400px] mx-auto">
      <PageHeader
        title="Calendar"
        subtitle="Lectures, deadlines, and study sessions — all in one place."
        action={
          <button
            type="button"
            className="inline-flex items-center gap-2 bg-ink text-white text-[13px] font-medium px-4 py-2 rounded-full hover:bg-ink/90 transition-colors"
          >
            <PlusIcon size={14} weight="bold" />
            New event
          </button>
        }
      />

      <div className="mt-8 bg-surface border border-ink-border rounded-2xl shadow-subtle overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-border">
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 grid place-items-center rounded-md text-ink-muted hover:bg-surface-muted">
              <CaretLeftIcon size={16} />
            </button>
            <div className="text-[14px] font-semibold">{monthLabel}</div>
            <button className="w-8 h-8 grid place-items-center rounded-md text-ink-muted hover:bg-surface-muted">
              <CaretRightIcon size={16} />
            </button>
          </div>
          <div className="inline-flex items-center gap-1 p-1 bg-surface-muted rounded-full text-[12.5px]">
            {["Month", "Week", "Day"].map((v, i) => (
              <button
                key={v}
                className={
                  i === 0
                    ? "px-3 py-1 rounded-full bg-[var(--brand-tint)] text-[var(--brand)] font-medium"
                    : "px-3 py-1 rounded-full text-ink-muted hover:text-ink"
                }
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-7 border-b border-ink-border bg-surface-muted/60">
          {weekDays.map((d) => (
            <div
              key={d}
              className="px-3 py-2 text-[11px] uppercase tracking-[0.06em] text-ink-subtle font-medium"
            >
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {cells.map((day, idx) => (
            <div
              key={idx}
              className="min-h-[108px] border-r border-b border-ink-border last:border-r-0 p-2 hover:bg-[var(--brand-tint)]/40 transition-colors"
            >
              {day ? (
                <>
                  <div className="text-[12px] font-medium text-ink-muted">
                    {day}
                  </div>
                  <div className="mt-1 flex flex-col gap-1">
                    {(events[day] ?? []).map((e, i) => (
                      <div
                        key={i}
                        className="text-[11px] px-1.5 py-0.5 rounded-md text-white truncate"
                        style={{ backgroundColor: e.color }}
                      >
                        {e.title}
                      </div>
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
