"use client";

import { useState, useRef, useCallback } from "react";
import { Conversation } from "@elevenlabs/client";
import type { SlideData } from "@/lib/slides";

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
 * Build a full deck outline so the agent knows every slide upfront.
 */
function buildDeckContext(slides: SlideData[]): string {
  const outline = slides
    .map((s, i) => `Slide ${i + 1}: "${s.title}" — ${s.bullets.join("; ")}`)
    .join("\n");
  return (
    `You are a friendly, knowledgeable teaching assistant reviewing a presentation with a student. ` +
    `The deck has ${slides.length} slides. Here is the full outline:\n\n${outline}\n\n` +
    `Rules:\n` +
    `- Explain each slide in 30-60 seconds in a clear, encouraging tone.\n` +
    `- When you finish explaining a slide, say "NEXT_SLIDE" at the very end of your response so the app knows to advance.\n` +
    `- If the student asks to go to a specific slide, say "GO_TO_SLIDE_X" (where X is the slide number) at the end of your response.\n` +
    `- If the student asks a question about the current slide, answer it, then continue explaining.\n` +
    `- If the student says "next" or "next slide", say "NEXT_SLIDE" at the end.\n` +
    `- If the student says "previous" or "go back", say "PREV_SLIDE" at the end.\n` +
    `- Do NOT read the commands out loud — just include them as text markers at the very end.`
  );
}

function slidePrompt(slide: SlideData, index: number): string {
  return `Now explain slide ${index + 1}: "${slide.title}". Key points: ${slide.bullets.join(". ")}`;
}

/**
 * Parse agent messages for navigation commands.
 * Returns the command and the cleaned text (without the command).
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
  onSlideComplete: (nextIndex: number) => void
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
  const slidesRef = useRef(slides);
  const autoAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasSentFirstMessageRef = useRef(false);
  const agentHasSpokenRef = useRef(false);
  slidesRef.current = slides;

  /**
   * Auto-advance to the next slide. Called when the agent finishes speaking
   * and switches to listening mode, with a short delay to allow for student
   * interruption.
   */
  function scheduleAutoAdvance() {
    // Cancel any pending auto-advance
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
    }

    autoAdvanceTimerRef.current = setTimeout(() => {
      const nextIndex = slideIndexRef.current + 1;
      if (nextIndex < slidesRef.current.length && conversationRef.current) {
        console.log("[VoiceAgent] Auto-advancing to slide", nextIndex + 1);
        agentHasSpokenRef.current = false; // Reset for next slide
        slideIndexRef.current = nextIndex;
        onSlideComplete(nextIndex);
        setState((prev) => ({ ...prev, currentNarratingIndex: nextIndex }));

        const slide = slidesRef.current[nextIndex];
        conversationRef.current.sendUserMessage(slidePrompt(slide, nextIndex));
      } else if (nextIndex >= slidesRef.current.length) {
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
      }
    }, 3000); // 3 second delay before auto-advancing
  }

  function handleNavCommand(command: "next" | "prev" | "goto", gotoSlide: number | null) {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
    }

    let targetIndex: number;
    if (command === "goto" && gotoSlide !== null) {
      targetIndex = Math.max(0, Math.min(gotoSlide - 1, slidesRef.current.length - 1));
    } else if (command === "prev") {
      targetIndex = Math.max(0, slideIndexRef.current - 1);
    } else {
      targetIndex = Math.min(slideIndexRef.current + 1, slidesRef.current.length - 1);
    }

    if (targetIndex !== slideIndexRef.current) {
      console.log("[VoiceAgent] Navigating to slide", targetIndex + 1);
      slideIndexRef.current = targetIndex;
      onSlideComplete(targetIndex);
      setState((prev) => ({ ...prev, currentNarratingIndex: targetIndex }));

      if (conversationRef.current) {
        const slide = slidesRef.current[targetIndex];
        conversationRef.current.sendUserMessage(slidePrompt(slide, targetIndex));
      }
    }
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
      agentHasSpokenRef.current = false;

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

            // Wait for connection to fully stabilize, then send the first message
            setTimeout(() => {
              const c = conv ?? conversationRef.current;
              if (c && !hasSentFirstMessageRef.current) {
                hasSentFirstMessageRef.current = true;
                const slide = slidesRef.current[slideIndexRef.current];
                const msg = `Please explain this slide to me. The title is "${slide.title}" and the key points are: ${slide.bullets.join(". ")}`;
                console.log("[VoiceAgent] Sending first user message...");
                c.sendUserMessage(msg);
              }
            }, 1500); // 1.5s delay to let connection stabilize
          },

          onDisconnect: () => {
            console.log("[VoiceAgent] Disconnected, agentHasSpoken:", agentHasSpokenRef.current);
            if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
            // Only set to stopped if we actually had a session going
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

            // Check for navigation commands in agent messages
            if (source !== "user") {
              const { command, gotoSlide, cleanText } = parseNavCommand(rawText);

              // Add transcription entry with cleaned text
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

              // Handle navigation command
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
            console.log("[VoiceAgent] Mode:", modeData.mode, "hasSentFirst:", hasSentFirstMessageRef.current, "agentHasSpoken:", agentHasSpokenRef.current);
            setState((prev) => ({ ...prev, agentSpeaking: isSpeaking }));

            if (isSpeaking) {
              // Mark that the agent has spoken at least once
              agentHasSpokenRef.current = true;
              // Cancel any pending auto-advance when agent starts speaking
              if (autoAdvanceTimerRef.current) {
                clearTimeout(autoAdvanceTimerRef.current);
                autoAdvanceTimerRef.current = null;
              }
            }

            // Only auto-advance after the agent has actually spoken and then stopped
            if (!isSpeaking && agentHasSpokenRef.current) {
              console.log("[VoiceAgent] Agent finished speaking, scheduling auto-advance in 3s");
              scheduleAutoAdvance();
            }
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
    const text = `${slide.title}. ${slide.bullets.join(". ")}.`;

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
    if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
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
    if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    slideIndexRef.current = index;
    setState((prev) => ({ ...prev, currentNarratingIndex: index }));

    if (conversationRef.current) {
      const slide = slidesRef.current[index];
      conversationRef.current.sendUserMessage(
        `The student clicked to go to slide ${index + 1}. ${slidePrompt(slide, index)}`
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
