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
      className="max-h-[140px] overflow-y-auto px-2 py-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
      aria-live="polite"
      role="log"
    >
      {entries.map((entry) => {
        const showHeading = entry.slideIndex !== lastSlideIndex;
        lastSlideIndex = entry.slideIndex;

        return (
          <div key={entry.id}>
            {showHeading && (
              <div className="text-[10px] uppercase tracking-wider text-gray-500 font-medium mt-2 mb-1">
                Slide {entry.slideIndex + 1}
              </div>
            )}
            {entry.speaker === "agent" ? (
              <p className="text-[13px] text-gray-400 leading-relaxed">
                {entry.text}
              </p>
            ) : (
              <p className="text-[13px] text-[#8C1D40] font-medium leading-relaxed">
                You: {entry.text}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
