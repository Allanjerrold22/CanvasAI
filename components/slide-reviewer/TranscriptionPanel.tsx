"use client";

import { useEffect, useRef } from "react";

export type TranscriptionEntry = {
  id: string;
  speaker: "agent" | "student";
  text: string;
  slideIndex: number;
  timestamp: number;
};

type TranscriptionPanelProps = {
  entries: TranscriptionEntry[];
  currentSlideIndex: number;
};

export default function TranscriptionPanel({
  entries,
}: TranscriptionPanelProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [entries.length]);

  let lastSlideIndex: number | null = null;

  return (
    <div
      ref={scrollRef}
      className="max-h-[140px] overflow-y-auto px-5 py-3"
      aria-live="polite"
      role="log"
    >
      {entries.map((entry) => {
        const showHeading = entry.slideIndex !== lastSlideIndex;
        lastSlideIndex = entry.slideIndex;

        return (
          <div key={entry.id}>
            {showHeading && (
              <div className="text-[10px] uppercase tracking-wider text-ink-subtle font-medium mt-2 mb-1">
                Slide {entry.slideIndex + 1}
              </div>
            )}
            {entry.speaker === "agent" ? (
              <p className="text-[13px] text-ink/80 leading-relaxed">
                {entry.text}
              </p>
            ) : (
              <p className="text-[13px] text-[var(--brand)] font-medium leading-relaxed">
                You: {entry.text}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
