"use client";

import { useState, useRef, useCallback } from "react";
import { Conversation } from "@elevenlabs/client";
import type { SlideData } from "@/lib/slides";
import type { EnrichedSlide } from "@/lib/enrichment-store";

export type TranscriptionEntry = {
  id: string;
  speaker: "agent" | "student";
  text: string;
  slideIndex: number;
  timestamp: number;
};

type VoiceAgentState = {
  status: "idle" | "connecting" | "playing" | "stopped" | "error";
  transcription: TranscriptionEntry[];
  currentNarratingIndex: number | null;
  error: string | null;
  agentSpeaking: boolean;
};

/**
 * Build a detailed deck map so the agent knows every slide's number, title,
 * and content upfront. This is sent as the very first message so the agent
 * has full awareness of the entire presentation structure.
 */
function buildDeckContext(slides: SlideData[], enriched?: EnrichedSlide[]): string {
  const slideMap = slides
    .map((s, i) => {
      const num = i + 1;
      const e = enriched?.[i];
      const content = e?.teachingScript
        ? `  Content summary: ${e.teachingScript}\n  Key points: ${e.bullets?.join("; ") || s.bullets.join("; ")}`
        : `  Key points: ${s.bullets.join("; ")}`;
      return `[Slide ${num}] "${s.title}"\n${content}`;
    })
    .join("\n\n");

  return (
    `You are SparkyAI, a friendly and knowledgeable teaching assistant. ` +
    `You are reviewing a presentation with a student. ` +
    `The deck has ${slides.length} slides total.\n\n` +
    `=== FULL SLIDE MAP ===\n${slideMap}\n=== END SLIDE MAP ===\n\n` +
    `CRITICAL RULES:\n` +
    `1. You are ALWAYS aware of which slide number you are currently on. When you explain a slide, reference its number naturally (e.g. "On slide 3, we see...").\n` +
    `2. You know the content of EVERY slide. If the student asks "what's on slide 5?" or "go to the slide about sorting", you can identify the correct slide number.\n` +
    `3. Do NOT automatically advance to the next slide. After explaining a slide, WAIT for the student to say "next", "next slide", or ask a question. Only then respond.\n` +
    `4. When the student says "next" or "next slide", say NEXT_SLIDE at the very end of your message to advance.\n` +
    `5. If the student asks to go to a specific slide by number (e.g. "go to slide 3"), say GO_TO_SLIDE_3 at the end.\n` +
    `6. If the student asks to go to a slide by topic (e.g. "go to the slide about binary trees"), find the matching slide number from the slide map and say GO_TO_SLIDE_X.\n` +
    `7. If the student says "previous" or "go back", say PREV_SLIDE at the end.\n` +
    `8. If the student asks a question about the current slide, answer it thoroughly. Do NOT advance.\n` +
    `9. If the student asks about content on a different slide, you can reference it from memory without navigating there, OR navigate if they ask.\n` +
    `10. Do NOT read the navigation commands aloud — they are invisible markers for the app.\n` +
    `11. Keep explanations to 30-60 seconds per slide. Be clear, encouraging, and educational.\n` +
    `12. You can reference previous slides to build connections (e.g. "Remember on slide 2 we talked about...").\n` +
    `13. After explaining a slide, end with a brief prompt like "Ready for the next slide?" or "Any questions about this?" and WAIT for the student's response.`
  );
}

/**
 * Build the prompt for explaining a specific slide.
 * Includes slide number prominently so the agent stays aware.
 */
function slidePrompt(slide: SlideData, index: number, totalSlides: number, enriched?: EnrichedSlide): string {
  const num = index + 1;
  if (enriched?.teachingScript) {
    return (
      `You are now on SLIDE ${num} of ${totalSlides}: "${slide.title}". ` +
      `Use this teaching context as the basis for your explanation — ` +
      `paraphrase it naturally: "${enriched.teachingScript}". ` +
      `Key points: ${slide.bullets.join("; ")}. ` +
      `Explain this slide, then wait for the student to say "next" before advancing.`
    );
  }
  return (
    `You are now on SLIDE ${num} of ${totalSlides}: "${slide.title}". ` +
    `Key points: ${slide.bullets.join(". ")}. ` +
    `Explain this slide clearly, then wait for the student to say "next" before advancing.`
  );
}

/**
 * Parse agent messages for navigation commands.
 */
function parseNavCommand(text: string): {
  command: "next" | "prev" | "goto" | null;
  gotoSlide: number | null;
  cleanText: string;
} {
  let command: "next" | "prev" | "goto" | null = null;
  let gotoSlide: number | null = null;
  let cleanText = text;

  const gotoMatch = text.match(/GO_TO_SLIDE_(\d+)/i);
  if (gotoMatch) {
    command = "goto";
    gotoSlide = parseInt(gotoMatch[1], 10);
    cleanText = text.replace(/GO_TO_SLIDE_\d+/gi, "").trim();
  } else if (/NEXT_SLIDE/i.test(text)) {
    command = "next";
    cleanText = text.replace(/NEXT_SLIDE/gi, "").trim();
  } else if (/PREV_SLIDE/i.test(text)) {
    command = "prev";
    cleanText = text.replace(/PREV_SLIDE/gi, "").trim();
  }

  return { command, gotoSlide, cleanText };
}

export function useVoiceAgent(
  slides: SlideData[],
  onSlideComplete: (nextIndex: number) => void,
  enrichedSlides?: EnrichedSlide[]
) {
  const [state, setState] = useState<VoiceAgentState>({
    status: "idle",
    transcription: [],
    currentNarratingIndex: null,
    error: null,
    agentSpeaking: false,
  });

  const conversationRef = useRef<Awaited<ReturnType<typeof Conversation.startSession>> | null>(null);
  const slideIndexRef = useRef(0);
  const slidesRef = useRef<SlideData[]>(slides);
  const enrichedRef = useRef<EnrichedSlide[] | undefined>(enrichedSlides);
  const hasSentFirstMessageRef = useRef(false);
  slidesRef.current = slides;
  enrichedRef.current = enrichedSlides;

  /**
   * Navigate to a specific slide and tell the agent.
   */
  function navigateToSlideInternal(targetIndex: number) {
    if (targetIndex < 0 || targetIndex >= slidesRef.current.length) return;
    if (targetIndex === slideIndexRef.current) return;

    console.log("[VoiceAgent] Navigating to slide", targetIndex + 1);
    slideIndexRef.current = targetIndex;
    onSlideComplete(targetIndex);
    setState((prev) => ({ ...prev, currentNarratingIndex: targetIndex }));

    if (conversationRef.current) {
      const slide = slidesRef.current[targetIndex];
      const total = slidesRef.current.length;
      conversationRef.current.sendUserMessage(
        slidePrompt(slide, targetIndex, total, enrichedRef.current?.[targetIndex])
      );
    }
  }

  function handleNavCommand(command: "next" | "prev" | "goto", gotoSlide: number | null) {
    let targetIndex: number;
    if (command === "goto" && gotoSlide !== null) {
      targetIndex = Math.max(0, Math.min(gotoSlide - 1, slidesRef.current.length - 1));
    } else if (command === "prev") {
      targetIndex = Math.max(0, slideIndexRef.current - 1);
    } else {
      // next
      const nextIndex = slideIndexRef.current + 1;
      if (nextIndex >= slidesRef.current.length) {
        // Last slide — end session
        console.log("[VoiceAgent] Last slide done, stopping");
        if (conversationRef.current) {
          conversationRef.current.endSession();
          conversationRef.current = null;
        }
        setState((prev) => ({
          ...prev,
          status: "stopped",
          currentNarratingIndex: null,
          agentSpeaking: false,
        }));
        return;
      }
      targetIndex = nextIndex;
    }

    navigateToSlideInternal(targetIndex);
  }

  const startSession = useCallback(
    async (slideIndex: number) => {
      setState((prev) => ({
        ...prev,
        status: "connecting",
        transcription: [],
        error: null,
        currentNarratingIndex: slideIndex,
      }));
      slideIndexRef.current = slideIndex;
      hasSentFirstMessageRef.current = false;

      try {
        const res = await fetch("/api/slide-review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });

        if (!res.ok) throw new Error("Failed to get signed URL");

        const data = await res.json();
        if (!data.signedUrl) throw new Error("No signed URL returned");

        console.log("[VoiceAgent] Starting ElevenLabs session...");

        let conv: Awaited<ReturnType<typeof Conversation.startSession>> | null = null;

        const session = await Conversation.startSession({
          signedUrl: data.signedUrl,

          onConnect: () => {
            console.log("[VoiceAgent] Connected");
            setState((prev) => ({ ...prev, status: "playing" }));

            // Send the full deck context + first slide prompt after connection stabilizes
            setTimeout(() => {
              const c = conv ?? conversationRef.current;
              if (c && !hasSentFirstMessageRef.current) {
                hasSentFirstMessageRef.current = true;
                const idx = slideIndexRef.current;
                const slide = slidesRef.current[idx];
                const total = slidesRef.current.length;
                const enriched = enrichedRef.current;

                // First message: full deck context so the agent knows everything
                const deckContext = buildDeckContext(slidesRef.current, enriched);

                // Second part: start explaining the current slide
                const firstSlidePrompt = slidePrompt(slide, idx, total, enriched?.[idx]);

                const fullMessage = `${deckContext}\n\n--- START ---\n\n${firstSlidePrompt}`;

                console.log("[VoiceAgent] Sending deck context + first slide prompt");
                c.sendUserMessage(fullMessage);
              }
            }, 1500);
          },

          onDisconnect: () => {
            console.log("[VoiceAgent] Disconnected");
            setState((prev) => ({
              ...prev,
              status: "stopped",
              currentNarratingIndex: null,
              agentSpeaking: false,
            }));
          },

          onMessage: (message) => {
            const msg = message as Record<string, unknown>;
            const source = (msg.source as string) ?? "";
            const rawText = (msg.message as string) ?? (msg.text as string) ?? "";

            if (!rawText || rawText.trim().length === 0) return;

            if (source !== "user") {
              // Agent message — check for navigation commands
              const { command, gotoSlide, cleanText } = parseNavCommand(rawText);

              if (cleanText.length > 0) {
                const entry: TranscriptionEntry = {
                  id: `agent-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                  speaker: "agent",
                  text: cleanText,
                  slideIndex: slideIndexRef.current,
                  timestamp: Date.now(),
                };
                setState((prev) => ({
                  ...prev,
                  transcription: [...prev.transcription, entry],
                }));
              }

              // Only navigate when the agent explicitly says so
              if (command) {
                handleNavCommand(command, gotoSlide);
              }
            } else {
              // Student message
              const entry: TranscriptionEntry = {
                id: `student-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                speaker: "student",
                text: rawText.trim(),
                slideIndex: slideIndexRef.current,
                timestamp: Date.now(),
              };
              setState((prev) => ({
                ...prev,
                transcription: [...prev.transcription, entry],
              }));
            }
          },

          onError: (error) => {
            console.error("[VoiceAgent] Error:", error);
            setState((prev) => ({
              ...prev,
              status: "error",
              error: "Voice agent encountered an error",
            }));
          },

          onModeChange: (mode) => {
            const modeData = mode as { mode?: string };
            const isSpeaking = modeData.mode === "speaking";
            setState((prev) => ({ ...prev, agentSpeaking: isSpeaking }));
            // No auto-advance here — the agent controls navigation via NEXT_SLIDE commands
          },

          onStatusChange: (status) => {
            console.log("[VoiceAgent] Status:", status);
          },
        });

        conv = session;
        conversationRef.current = session;
        console.log("[VoiceAgent] Session ID:", session.getId());
      } catch (err) {
        console.error("[VoiceAgent] Failed:", err);
        startFallbackSession(slideIndex);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // ── SpeechSynthesis fallback ──
  function startFallbackSession(slideIndex: number) {
    slideIndexRef.current = slideIndex;
    narrateSlideFallback(slideIndex);
  }

  function narrateSlideFallback(index: number) {
    if (index >= slidesRef.current.length) {
      setState((prev) => ({
        ...prev,
        status: "stopped",
        currentNarratingIndex: null,
        agentSpeaking: false,
      }));
      return;
    }

    slideIndexRef.current = index;
    const slide = slidesRef.current[index];
    const enriched = enrichedRef.current?.[index];
    const text = enriched?.teachingScript
      ? `Slide ${index + 1}: ${slide.title}. ${enriched.teachingScript}`
      : `Slide ${index + 1}: ${slide.title}. ${slide.bullets.join(". ")}.`;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;

    const entry: TranscriptionEntry = {
      id: `agent-${index}-${Date.now()}`,
      speaker: "agent",
      text,
      slideIndex: index,
      timestamp: Date.now(),
    };

    setState((prev) => ({
      ...prev,
      status: "playing",
      currentNarratingIndex: index,
      agentSpeaking: true,
      transcription: [...prev.transcription, entry],
    }));

    utterance.onend = () => {
      setState((prev) => ({ ...prev, agentSpeaking: false }));
      const nextIndex = slideIndexRef.current + 1;
      if (nextIndex < slidesRef.current.length) {
        onSlideComplete(nextIndex);
        setTimeout(() => narrateSlideFallback(nextIndex), 500);
      } else {
        setState((prev) => ({
          ...prev,
          status: "stopped",
          currentNarratingIndex: null,
        }));
      }
    };

    utterance.onerror = () => {
      setState((prev) => ({
        ...prev,
        status: "error",
        error: "Speech synthesis failed",
        agentSpeaking: false,
      }));
    };

    window.speechSynthesis.speak(utterance);
  }

  // ── Public API ──

  const stopSession = useCallback(() => {
    if (conversationRef.current) {
      conversationRef.current.endSession();
      conversationRef.current = null;
    } else {
      window.speechSynthesis.cancel();
    }
    setState((prev) => ({
      ...prev,
      status: "stopped",
      currentNarratingIndex: null,
      agentSpeaking: false,
    }));
  }, []);

  const navigateToSlide = useCallback((index: number) => {
    slideIndexRef.current = index;
    setState((prev) => ({ ...prev, currentNarratingIndex: index }));

    if (conversationRef.current) {
      const slide = slidesRef.current[index];
      const total = slidesRef.current.length;
      conversationRef.current.sendUserMessage(
        `The student clicked to go to slide ${index + 1}. ${slidePrompt(slide, index, total, enrichedRef.current?.[index])}`
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    state,
    startSession,
    stopSession,
    navigateToSlide,
  };
}
