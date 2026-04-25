"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft as ArrowLeftIcon,
  CaretLeft as CaretLeftIcon,
  CaretRight as CaretRightIcon,
  List as ListIcon,
  X as XIcon,
  Sparkle as SparkleIcon,
  Stop as StopIcon,
  CircleNotch as SpinnerIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { SlideData } from "@/lib/slides";
import {
  EnrichedSlide,
  getEnrichmentForFile,
  saveEnrichmentForFile,
} from "@/lib/enrichment-store";
import { useVoiceAgent } from "@/hooks/useVoiceAgent";
import TranscriptionPanel from "./TranscriptionPanel";
import SlideCanvas from "./SlideCanvas";
import PDFSlideCanvas from "./PDFSlideCanvas";

type SlideReviewerClientProps = {
  courseName: string;
  courseId: string;
  fileName: string;
  fileId: string;
  slides: SlideData[];
  /** @deprecated — no longer used, slides render via SlideCanvas */
  fileBlobUrl?: string;
  /** PDF file URL for PDF presentations */
  pdfFile?: string;
  /** Whether this is a PDF presentation */
  isPDF?: boolean;
};

export default function SlideReviewerClient({
  courseName,
  courseId,
  fileName,
  fileId,
  slides,
  fileBlobUrl,
  pdfFile,
  isPDF = false,
}: SlideReviewerClientProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showTranscript, setShowTranscript] = useState(true);

  // Claude PDF understanding state
  const [enrichedSlides, setEnrichedSlides] = useState<EnrichedSlide[] | null>(null);
  const [enriching, setEnriching] = useState(false);
  const [enrichError, setEnrichError] = useState<string | null>(null);
  const hasEnrichedRef = useRef(false);

  // Check for cached enrichment on mount
  useEffect(() => {
    const cached = getEnrichmentForFile(fileId, courseId);
    if (cached) {
      console.log("[SlideReviewer] Using cached enrichment for", fileId);
      setEnrichedSlides(cached.enrichedSlides);
      hasEnrichedRef.current = true;
    }
  }, [fileId, courseId]);

  // Use enriched slides (with Claude's teaching scripts) when available,
  // otherwise fall back to raw slides
  const activeSlides: SlideData[] = enrichedSlides ?? slides;

  const handleSlideComplete = useCallback((nextIndex: number) => {
    setCurrentSlideIndex(nextIndex);
  }, []);

  const {
    state: voiceState,
    startSession,
    stopSession,
  } = useVoiceAgent(activeSlides, handleSlideComplete, enrichedSlides ?? undefined);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowRight") {
        setCurrentSlideIndex((prev) => Math.min(prev + 1, (enrichedSlides ?? slides).length - 1));
      } else if (e.key === "ArrowLeft") {
        setCurrentSlideIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Escape") {
        setSidebarOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [slides.length, enrichedSlides]);

  /**
   * Sends the PDF (or slide text) to Claude for deep understanding,
   * then starts the ElevenLabs voice session with the enriched knowledge.
   */
  async function handleStart() {
    // If we already have enriched slides (from cache or previous run), just start
    if (hasEnrichedRef.current && enrichedSlides) {
      console.log("[SlideReviewer] Using existing enrichment, starting session");
      startSession(0);
      return;
    }

    // Check cache again (in case it was loaded after initial render)
    const cached = getEnrichmentForFile(fileId, courseId);
    if (cached) {
      console.log("[SlideReviewer] Found cached enrichment, using it");
      setEnrichedSlides(cached.enrichedSlides);
      hasEnrichedRef.current = true;
      startSession(0);
      return;
    }

    setEnriching(true);
    setEnrichError(null);

    try {
      let requestBody: Record<string, unknown>;

      if (isPDF && pdfFile) {
        // Fetch the PDF and convert to base64 for Claude's document understanding
        const pdfResponse = await fetch(pdfFile);
        const pdfBuffer = await pdfResponse.arrayBuffer();
        const pdfBase64 = btoa(
          new Uint8Array(pdfBuffer).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ""
          )
        );
        requestBody = { pdfBase64, pageCount: slides.length };
      } else {
        // Send slide text for PPTX/mock data
        requestBody = {
          slides: slides.map((s) => ({
            title: s.title,
            bullets: s.bullets,
            hasImage: s.hasImage,
          })),
        };
      }

      const res = await fetch("/api/slide-understand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) throw new Error("Claude analysis failed");

      const data = await res.json();
      hasEnrichedRef.current = true;
      setEnrichedSlides(data.enrichedSlides);

      // Save to cache for future use
      saveEnrichmentForFile(fileId, courseId, fileName, data.enrichedSlides);
      console.log("[SlideReviewer] Saved enrichment to cache for", fileId);

      startSession(0);
    } catch (err) {
      console.warn("[SlideReviewer] Claude analysis failed, falling back to raw slides:", err);
      setEnrichError("AI analysis unavailable — using raw slides.");
      hasEnrichedRef.current = true;
      startSession(0);
    } finally {
      setEnriching(false);
    }
  }

  const isEnrichingOrConnecting = enriching || voiceState.status === "connecting";
  const isPlaying = voiceState.status === "playing";
  const isIdle = voiceState.status === "idle" || voiceState.status === "stopped";

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
          {enrichedSlides && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--brand-tint)] text-[var(--brand)] text-[11px] font-medium">
              <SparkleIcon size={11} weight="fill" />
              AI-enhanced
            </span>
          )}
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
            {isPDF ? (
              <PDFSlideCanvas
                slideIndex={currentSlideIndex}
                totalSlides={slides.length}
                pdfFile={pdfFile}
                isPDF={true}
              />
            ) : (
              <SlideCanvas
                slide={slide}
                slideIndex={currentSlideIndex}
                totalSlides={slides.length}
              />
            )}

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

            {/* Enriching overlay */}
            {enriching && (
              <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                <SpinnerIcon size={28} className="text-white animate-spin" />
                <p className="text-white text-[13px] font-medium">
                  SparkyAI is analyzing your slides…
                </p>
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
                    {isPDF ? (
                      <PDFSlideCanvas
                        slideIndex={i}
                        totalSlides={slides.length}
                        pdfFile={pdfFile}
                        isPDF={true}
                      />
                    ) : (
                      <SlideCanvas
                        slide={s}
                        slideIndex={i}
                        totalSlides={slides.length}
                      />
                    )}
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
              ? 300
              : showTranscript && voiceState.transcription.length > 0 && voiceState.status !== "stopped"
                ? 480
                : 200,
            transition: "width 350ms cubic-bezier(0.25, 1, 0.5, 1)",
          }}
          className="relative rounded-[24px] p-[1px] bg-gradient-to-b from-gray-300/60 to-gray-400/30"
        >
          {/* Inner dark container */}
          <div className="bg-[#1a1a1a] rounded-[23px] overflow-hidden backdrop-blur-xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.4)]">
            {/* Transcript area */}
            <div
              style={{
                maxHeight: showTranscript && voiceState.transcription.length > 0 && voiceState.status !== "stopped" ? 160 : 0,
                opacity: showTranscript && voiceState.transcription.length > 0 && voiceState.status !== "stopped" ? 1 : 0,
                transition: "max-height 350ms cubic-bezier(0.25, 1, 0.5, 1), opacity 250ms ease",
              }}
              className="overflow-hidden relative"
            >
              <div className="px-4 pt-3 pb-2">
                <TranscriptionPanel
                  entries={voiceState.transcription}
                  currentSlideIndex={currentSlideIndex}
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#1a1a1a] to-transparent pointer-events-none" />
            </div>

            {/* Controls row */}
            <div className="flex items-center justify-center gap-3 px-4 py-3">
              {isIdle && !isEnrichingOrConnecting && (
                <>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#8C1D40] to-[#5c1229] flex items-center justify-center shadow-lg">
                    <SparkleIcon size={18} weight="fill" className="text-white" />
                  </div>
                  <span className="text-[13px] text-gray-400 whitespace-nowrap">
                    {enrichError ? "Start (raw slides)" : "Ready to review?"}
                  </span>
                  <button
                    onClick={handleStart}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#2a2a2a] hover:bg-[#333] text-white text-[13px] font-medium transition-colors whitespace-nowrap border border-gray-700/50"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                    Start
                  </button>
                </>
              )}

              {isEnrichingOrConnecting && (
                <>
                  <SpinnerIcon size={16} className="text-[#8C1D40] animate-spin shrink-0" />
                  <span className="text-[13px] text-gray-400 whitespace-nowrap">
                    {enriching ? "SparkyAI analyzing…" : "Connecting…"}
                  </span>
                </>
              )}

              {isPlaying && (
                <>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8C1D40] to-[#5c1229] flex items-center justify-center shadow-lg">
                    <SparkleIcon size={14} weight="fill" className="text-white" />
                  </div>
                  <div className="flex items-center gap-[3px]" aria-hidden="true">
                    <div className="wave-bar !bg-gray-400" style={{ animationDelay: "0s" }} />
                    <div className="wave-bar !bg-gray-400" style={{ animationDelay: "0.2s" }} />
                    <div className="wave-bar !bg-gray-400" style={{ animationDelay: "0.4s" }} />
                  </div>
                  <button
                    onClick={stopSession}
                    aria-label="Stop"
                    className="w-9 h-9 rounded-xl bg-[#2a2a2a] hover:bg-[#333] transition-colors grid place-items-center text-white border border-gray-700/50"
                  >
                    <StopIcon size={16} weight="fill" />
                  </button>
                </>
              )}

              {!isIdle && !isEnrichingOrConnecting && (
                <>
                  <div className="w-px h-5 bg-gray-700/50" />
                  <button
                    onClick={() => setShowTranscript(!showTranscript)}
                    aria-label={showTranscript ? "Hide transcript" : "Show transcript"}
                    className={`w-9 h-9 rounded-xl grid place-items-center transition-all duration-200 border ${
                      showTranscript
                        ? "bg-gradient-to-br from-[#8C1D40] to-[#5c1229] text-white border-transparent"
                        : "bg-[#2a2a2a] hover:bg-[#333] text-gray-400 border-gray-700/50"
                    }`}
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    </div>
  );
}
