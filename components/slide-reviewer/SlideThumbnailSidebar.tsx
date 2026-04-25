"use client";

import { useEffect, useRef } from "react";
import type { SlideData } from "@/lib/slides";

type SlideThumbnailSidebarProps = {
  slides: SlideData[];
  currentIndex: number;
  narratingIndex: number | null;
  onSelectSlide: (index: number) => void;
};

export default function SlideThumbnailSidebar({
  slides,
  currentIndex,
  narratingIndex,
  onSelectSlide,
}: SlideThumbnailSidebarProps) {
  const activeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [currentIndex]);

  return (
    <nav role="list" className="flex flex-col gap-2 overflow-y-auto h-full pr-2">
      {slides.map((slide, i) => {
        const isActive = i === currentIndex;
        const isNarrating = i === narratingIndex;

        return (
          <button
            key={i}
            role="listitem"
            ref={isActive ? activeRef : undefined}
            onClick={() => onSelectSlide(i)}
            className={[
              "text-left p-3 rounded-xl border transition-all",
              isActive
                ? "border-[var(--brand)] bg-[var(--brand-tint)]"
                : "border-ink-border/60 hover:border-ink-border",
            ].join(" ")}
          >
            <div className="flex items-center gap-2 mb-1">
              {isNarrating && (
                <div className="w-2 h-2 rounded-full bg-[var(--brand)] animate-pulse" />
              )}
              <span className="text-[11px] font-medium text-ink-muted">
                Slide {i + 1}
              </span>
            </div>
            <p className="text-[12px] font-medium truncate">{slide.title}</p>
            {slide.bullets.length > 0 && (
              <p className="text-[11px] text-ink-muted truncate mt-0.5">
                {slide.bullets[0]}
              </p>
            )}
          </button>
        );
      })}
    </nav>
  );
}
