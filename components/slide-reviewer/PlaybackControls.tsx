"use client";

import {
  SparkleIcon,
  PauseIcon,
  PlayIcon,
  StopIcon,
} from "@phosphor-icons/react/dist/ssr";

type PlaybackControlsProps = {
  status: "idle" | "playing" | "paused" | "stopped";
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
};

export default function PlaybackControls({
  status,
  onStart,
  onPause,
  onResume,
  onStop,
}: PlaybackControlsProps) {
  return (
    <div className="flex items-center gap-3 px-6 py-3 border-t border-ink-border bg-surface">
      {(status === "idle" || status === "stopped") && (
        <button
          onClick={onStart}
          aria-label="Start Review"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--brand)] text-white text-[13px] font-medium hover:bg-[var(--brand)]/90 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/40"
        >
          <SparkleIcon size={14} weight="fill" />
          Start Review
        </button>
      )}

      {status === "playing" && (
        <>
          <button
            onClick={onPause}
            aria-label="Pause"
            className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-ink-border hover:bg-[var(--brand-tint)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/40"
          >
            <PauseIcon size={16} weight="fill" />
          </button>
          <button
            onClick={onStop}
            aria-label="Stop"
            className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-ink-border hover:bg-[var(--brand-tint)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/40"
          >
            <StopIcon size={16} weight="fill" />
          </button>
          {/* Animated waveform */}
          <div className="flex items-center gap-[3px] ml-2" aria-hidden="true">
            <div className="wave-bar" style={{ animationDelay: "0s" }} />
            <div className="wave-bar" style={{ animationDelay: "0.2s" }} />
            <div className="wave-bar" style={{ animationDelay: "0.4s" }} />
          </div>
        </>
      )}

      {status === "paused" && (
        <>
          <button
            onClick={onResume}
            aria-label="Resume"
            className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-ink-border hover:bg-[var(--brand-tint)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/40"
          >
            <PlayIcon size={16} weight="fill" />
          </button>
          <button
            onClick={onStop}
            aria-label="Stop"
            className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-ink-border hover:bg-[var(--brand-tint)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/40"
          >
            <StopIcon size={16} weight="fill" />
          </button>
        </>
      )}
    </div>
  );
}
