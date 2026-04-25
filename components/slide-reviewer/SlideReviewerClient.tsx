"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft as ArrowLeftIcon,
  CaretLeft as CaretLeftIcon,
  CaretRight as CaretRightIcon,
  List as ListIcon,
  X as XIcon,
  Sparkle as SparkleIcon,
  Stop as StopIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { SlideData } from "@/lib/slides";
import { useVoiceAgent } from "@/hooks/useVoiceAgent";
import TranscriptionPanel from "./TranscriptionPanel";
import SlideCanvas from "./SlideCanvas";

type SlideReviewerClientProps = {
  courseName: string;
  courseId: string;
  fileName: string;
  fileId: string;
  slides: SlideData[];
  /** @deprecated — no longer used, slides render via SlideCanvas */
  fileBlobUrl?: string;
};

export default function SlideReviewerClient({
  courseName,
  courseId,
  fileName,
  slides,
  fileBlobUrl,
}: SlideReviewerClientProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showTranscript, setShowTranscript] = useState(true);

  const handleSlideComplete = useCallback((nextIndex: number) => {
    setCurrentSlideIndex(nextIndex);
  }, []);

  const {
    state: voiceState,
    startSession,
    stopSession,
  } = useVoiceAgent(slides, handleSlideComplete);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowRight") {
        setCurrentSlideIndex((prev) => Math.min(prev + 1, slides.length - 1));
      } else if (e.key === "ArrowLeft") {
        setCurrentSlideIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Escape") {
        setSidebarOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [slides.length]);

  const isPlaying = voiceState.status === "playing";
  const isIdle =
    voiceState.status === "idle" || voiceState.status === "stopped";

  const slide = slides[currentSlideIndex];

  return (
    <div className="h-screen flex flex-col bg-[#fafafa] overflow-hidden">
      {/* ── Top bar ── */}
      <header className="flex items-center justify-between px-6 py-3 bg-white/80 backdrop-blur-sm border-b border-ink-border/40 shrink-0 z-10">
        <div className="flex items-center gap-4">
          <Link
            href={`/courses/${courseId}`}
            className="inline-flex items-center gap-1.5 text-[13px] text-ink-muted hover:text-ink transition-colors"
          >
            <ArrowLeftIcon size={14} />
            Exit
          </Link>
          <div className="h-4 w-px bg-ink-border/60" />
          <div>
            <h1 className="text-[14px] font-semibold leading-tight">{fileName}</h1>
            <p className="text-[11px] text-ink-muted">{courseName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[12px] text-ink-muted font-medium tabular-nums">
            {currentSlideIndex + 1} / {slides.length}
          </span>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? "Close slide panel" : "Open slide panel"}
            className="w-8 h-8 grid place-items-center rounded-lg hover:bg-surface-muted transition-colors text-ink-muted"
          >
            <ListIcon size={18} />
          </button>
        </div>
      </header>

      {/* ── Main content area ── */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Main slide view */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
          {/* Slide display area */}
          <div className="w-full max-w-5xl aspect-[16/10] rounded-2xl shadow-lg border border-ink-border/20 overflow-hidden relative">
            <SlideCanvas
              slide={slide}
              slideIndex={currentSlideIndex}
              totalSlides={slides.length}
            />

            {/* Narrating indicator */}
            {isPlaying && (
              <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-sm border border-ink-border/30">
                <div className="flex items-center gap-[3px]" aria-hidden="true">
                  <div className="wave-bar" style={{ animationDelay: "0s" }} />
                  <div className="wave-bar" style={{ animationDelay: "0.2s" }} />
                  <div className="wave-bar" style={{ animationDelay: "0.4s" }} />
                </div>
                <span className="text-[11px] font-medium text-ink-muted">Narrating</span>
              </div>
            )}
          </div>

          {/* Navigation arrows */}
          <div className="absolute inset-y-0 left-3 flex items-center">
            <button
              onClick={() => setCurrentSlideIndex((prev) => Math.max(prev - 1, 0))}
              disabled={currentSlideIndex === 0}
              aria-label="Previous slide"
              className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-sm border border-ink-border/30 grid place-items-center text-ink-muted hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <CaretLeftIcon size={18} weight="bold" />
            </button>
          </div>
          <div className="absolute inset-y-0 right-3 flex items-center">
            <button
              onClick={() => setCurrentSlideIndex((prev) => Math.min(prev + 1, slides.length - 1))}
              disabled={currentSlideIndex === slides.length - 1}
              aria-label="Next slide"
              className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-sm border border-ink-border/30 grid place-items-center text-ink-muted hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <CaretRightIcon size={18} weight="bold" />
            </button>
          </div>

          {/* Remove old transcription overlay — now inside floating module */}
        </div>

        {/* ── Collapsible right sidebar ── */}
        <div
          className={`shrink-0 bg-white border-l border-ink-border/40 transition-all duration-300 overflow-hidden ${
            sidebarOpen ? "w-[240px]" : "w-0"
          }`}
        >
          <div className="w-[240px] h-full flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-ink-border/40">
              <span className="text-[13px] font-semibold">Slides</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="w-6 h-6 grid place-items-center rounded-md hover:bg-surface-muted text-ink-muted"
              >
                <XIcon size={14} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
              {slides.map((s, i) => {
                const isCurrent = i === currentSlideIndex;
                const isNarrating = i === voiceState.currentNarratingIndex;
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentSlideIndex(i)}
                    className={`relative rounded-lg overflow-hidden border-2 transition-all aspect-[16/10] ${
                      isCurrent
                        ? "border-[var(--brand)] ring-2 ring-[var(--brand)]/20"
                        : "border-transparent hover:border-ink-border/60"
                    }`}
                  >
                    {/* Mini slide preview */}
                    <SlideCanvas
                      slide={s}
                      slideIndex={i}
                      totalSlides={slides.length}
                    />
                    {/* Slide number overlay */}
                    <div className="absolute bottom-1 left-1.5 flex items-center gap-1">
                      {isNarrating && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      )}
                      <span className="text-[9px] font-medium text-white/80 drop-shadow-sm">
                        {i + 1}
                      </span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* ── Floating voice module ── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
        <div
          style={{
            width: isIdle
              ? 240
              : showTranscript && voiceState.transcription.length > 0
                ? 440
                : 180,
            transition: "width 350ms cubic-bezier(0.25, 1, 0.5, 1)",
          }}
          className="bg-white rounded-[18px] shadow-[0_4px_32px_-8px_rgba(0,0,0,0.12)] border border-ink-border/15 overflow-hidden"
        >
          {/* Transcript area — animated height */}
          <div
            style={{
              maxHeight: showTranscript && voiceState.transcription.length > 0 ? 150 : 0,
              opacity: showTranscript && voiceState.transcription.length > 0 ? 1 : 0,
              transition: "max-height 350ms cubic-bezier(0.25, 1, 0.5, 1), opacity 250ms ease",
            }}
            className="overflow-hidden"
          >
            <div className="px-3 pt-2.5 pb-1.5 border-b border-ink-border/10">
              <TranscriptionPanel
                entries={voiceState.transcription}
                currentSlideIndex={currentSlideIndex}
              />
            </div>
          </div>

          {/* Controls row — tight padding */}
          <div className="flex items-center justify-center gap-2 px-3 py-2">
            {isIdle && (
              <>
                <span className="text-[12px] text-ink-muted whitespace-nowrap">Ready to revise?</span>
                <button
                  onClick={() => startSession(0)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-ink text-white text-[12px] font-medium hover:bg-ink/80 transition-colors whitespace-nowrap"
                >
                  <SparkleIcon size={12} weight="fill" />
                  Start
                </button>
              </>
            )}

            {isPlaying && (
              <>
                <div className="flex items-center gap-[2px]" aria-hidden="true">
                  <div className="wave-bar !bg-ink" style={{ animationDelay: "0s" }} />
                  <div className="wave-bar !bg-ink" style={{ animationDelay: "0.2s" }} />
                  <div className="wave-bar !bg-ink" style={{ animationDelay: "0.4s" }} />
                </div>
                <button onClick={stopSession} aria-label="Stop" className="w-7 h-7 rounded-full hover:bg-surface-muted transition-colors grid place-items-center text-ink">
                  <StopIcon size={14} weight="fill" />
                </button>
              </>
            )}

            {!isIdle && (
              <>
                <div className="w-px h-4 bg-ink-border/20" />
                <button
                  onClick={() => setShowTranscript(!showTranscript)}
                  aria-label={showTranscript ? "Hide transcript" : "Show transcript"}
                  className={`w-7 h-7 rounded-full grid place-items-center transition-all duration-200 ${
                    showTranscript ? "bg-ink text-white" : "hover:bg-surface-muted text-ink-muted"
                  }`}
                >
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M4 7h8M4 10h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
