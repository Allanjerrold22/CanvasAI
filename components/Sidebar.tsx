"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BooksIcon,
  NotePencilIcon,
  CalendarDotsIcon,
  SparkleIcon,
  SignOutIcon,
  CaretRightIcon,
  GraduationCapIcon,
} from "@phosphor-icons/react/dist/ssr";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; weight?: "regular" | "bold" | "fill" | "duotone" }>;
};

const primaryNav: NavItem[] = [
  { label: "Courses", href: "/", icon: BooksIcon },
  { label: "Assignments", href: "/assignments", icon: NotePencilIcon },
  { label: "Calendar", href: "/calendar", icon: CalendarDotsIcon },
  { label: "SparkyAI", href: "/sparky", icon: SparkleIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <aside className="w-[260px] shrink-0 bg-surface border-r border-ink-border flex flex-col h-screen fixed top-0 left-0 overflow-y-auto">
      {/* Logo */}
      <div className="px-5 pt-6 pb-4 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-ink text-white grid place-items-center">
          <GraduationCapIcon size={18} weight="fill" />
        </div>
        <span className="text-[17px] font-semibold tracking-tight">CanvasAI</span>
      </div>

      {/* Profile card */}
      <Link
        href="/profile"
        className="mx-4 mb-5 flex items-center gap-3 rounded-xl border border-ink-border px-3 py-2.5 hover:bg-surface-muted transition-colors"
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-maroon-300 to-maroon-600 grid place-items-center text-white text-sm font-semibold">
          AS
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13.5px] font-semibold leading-tight truncate">
            Amanda Smith
          </div>
          <div className="text-[11.5px] text-ink-muted leading-tight truncate">
            Undergraduate · ASU
          </div>
        </div>
        <CaretRightIcon size={14} className="text-ink-subtle" />
      </Link>

      {/* Primary nav */}
      <nav className="px-3 flex-1">
        <SectionLabel>Workspace</SectionLabel>
        <ul className="flex flex-col gap-0.5">
          {primaryNav.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={[
                    "group flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-colors",
                    active
                      ? "bg-[var(--brand-tint)] text-[var(--brand)]"
                      : "text-ink-muted hover:bg-[var(--brand-tint)] hover:text-[var(--brand)]",
                  ].join(" ")}
                >
                  <Icon size={18} weight={active ? "fill" : "regular"} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom: logout */}
      <div className="px-3 pb-5 pt-3 border-t border-ink-border mt-3">
        <button
          type="button"
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-medium text-ink-muted hover:bg-[var(--brand-tint)] hover:text-[var(--brand)] transition-colors"
        >
          <SignOutIcon size={18} />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 pt-2 pb-2 text-[11px] uppercase tracking-[0.08em] text-ink-subtle font-medium">
      {children}
    </div>
  );
}
