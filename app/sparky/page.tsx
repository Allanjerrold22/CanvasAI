import {
  SparkleIcon,
  PaperPlaneTiltIcon,
  BookOpenIcon,
  NotePencilIcon,
  LightbulbIcon,
} from "@phosphor-icons/react/dist/ssr";
import PageHeader from "@/components/PageHeader";

const suggestions = [
  {
    icon: <BookOpenIcon size={16} />,
    title: "Summarize today's lecture",
    body: "Get a 10-minute recap of your CSE 310 lecture on red-black trees.",
  },
  {
    icon: <NotePencilIcon size={16} />,
    title: "Draft my essay outline",
    body: "Start an outline for the ENG 301 technical memo due next week.",
  },
  {
    icon: <LightbulbIcon size={16} />,
    title: "Explain this concept",
    body: "Break down divergence and curl from MAT 267 with examples.",
  },
];

export default function SparkyPage() {
  return (
    <div className="px-8 py-8 max-w-[1100px] mx-auto">
      <PageHeader
        title="SparkyAI"
        subtitle="Your study companion — trained on your courses, notes, and assignments."
      />

      <section className="mt-8 bg-surface border border-ink-border rounded-2xl shadow-subtle overflow-hidden">
        <div className="px-6 py-10 text-center border-b border-ink-border bg-gradient-to-b from-[var(--brand-tint)]/60 to-transparent">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-ink text-white grid place-items-center mb-4">
            <SparkleIcon size={24} weight="fill" />
          </div>
          <h2 className="text-[22px] font-semibold tracking-tight">
            How can Sparky help you study today?
          </h2>
          <p className="text-[13.5px] text-ink-muted mt-1.5 max-w-md mx-auto">
            Ask anything about your courses, upload a lecture, or generate a
            practice quiz.
          </p>
        </div>

        <div className="p-6 grid sm:grid-cols-3 gap-3">
          {suggestions.map((s) => (
            <button
              key={s.title}
              type="button"
              className="text-left bg-surface-muted hover:bg-[var(--brand-tint)] hover:text-[var(--brand)] border border-transparent hover:border-[var(--brand)]/20 rounded-xl p-4 transition-colors"
            >
              <div className="flex items-center gap-2 text-ink mb-1.5">
                <span className="text-[var(--brand)]">{s.icon}</span>
                <span className="text-[13px] font-semibold">{s.title}</span>
              </div>
              <p className="text-[12.5px] text-ink-muted leading-snug">
                {s.body}
              </p>
            </button>
          ))}
        </div>

        <div className="px-6 pb-6">
          <form
            className="flex items-center gap-2 bg-surface border border-ink-border rounded-2xl px-3 py-2 focus-within:border-ink/40 focus-within:ring-2 focus-within:ring-[var(--brand-tint)]"
            action="#"
          >
            <SparkleIcon size={16} className="text-[var(--brand)] ml-1" />
            <input
              type="text"
              placeholder="Ask SparkyAI anything about your courses…"
              className="flex-1 bg-transparent py-2 text-[14px] placeholder:text-ink-subtle focus:outline-none"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 bg-ink text-white text-[13px] font-medium px-3.5 py-2 rounded-xl hover:bg-ink/90 transition-colors"
            >
              Send
              <PaperPlaneTiltIcon size={14} weight="fill" />
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
