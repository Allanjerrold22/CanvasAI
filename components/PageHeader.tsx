import { MagnifyingGlassIcon, BellIcon } from "@phosphor-icons/react/dist/ssr";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
};

export default function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Top utility bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative max-w-md">
          <MagnifyingGlassIcon
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle"
          />
          <input
            type="search"
            placeholder="Search courses, assignments, notes…"
            className="w-full bg-surface border border-ink-border rounded-full pl-9 pr-4 py-2 text-[13.5px] placeholder:text-ink-subtle focus:outline-none focus:border-ink/40 focus:ring-2 focus:ring-[var(--brand-tint)]"
          />
        </div>
        <button
          type="button"
          aria-label="Notifications"
          className="relative w-9 h-9 grid place-items-center bg-surface border border-ink-border rounded-full text-ink-muted hover:text-ink transition-colors"
        >
          <BellIcon size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--brand)]" />
        </button>
      </div>

      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight leading-tight">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-[13.5px] text-ink-muted mt-1">{subtitle}</p>
          ) : null}
        </div>
        {action}
      </div>
    </div>
  );
}
