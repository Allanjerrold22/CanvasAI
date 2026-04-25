"use client";

import { useState, useRef, useEffect } from "react";
import {
  XIcon,
  SparkleIcon,
  CardsIcon,
  ChatCircleDotsIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowsClockwiseIcon,
  PaperPlaneTiltIcon,
  CircleNotchIcon,
} from "@phosphor-icons/react/dist/ssr";

// ─── Types ────────────────────────────────────────────────────────────────────

type Flashcard = { id: string; front: string; back: string };

type Message = { role: "user" | "sparky"; text: string };

type Mode = "pick" | "flashcards" | "chat";

type Props = {
  /** Title shown in the modal header */
  title: string;
  /** The content context sent to the AI (assignment description, file name, etc.) */
  context: string;
  onClose: () => void;
};

// ─── Main Modal ───────────────────────────────────────────────────────────────

export default function PracticeModal({ title, context, onClose }: Props) {
  const [mode, setMode] = useState<Mode>("pick");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-ink-border/30 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-ink-border shrink-0">
          <div className="w-8 h-8 rounded-xl bg-ink text-white grid place-items-center shrink-0">
            <SparkleIcon size={15} weight="fill" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-[var(--brand)]">
              Practice with Sparky
            </div>
            <div className="text-[12px] text-ink-muted truncate">{title}</div>
          </div>
          {mode !== "pick" && (
            <button
              onClick={() => setMode("pick")}
              className="text-[12px] text-ink-muted hover:text-ink flex items-center gap-1 mr-2"
            >
              <ArrowLeftIcon size={12} />
              Back
            </button>
          )}
          <button
            onClick={onClose}
            className="w-7 h-7 grid place-items-center rounded-full hover:bg-surface-muted text-ink-muted"
          >
            <XIcon size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {mode === "pick" && <ModePicker onPick={setMode} />}
          {mode === "flashcards" && (
            <FlashcardMode context={context} title={title} />
          )}
          {mode === "chat" && <ChatMode context={context} title={title} />}
        </div>
      </div>
    </div>
  );
}

// ─── Mode Picker ──────────────────────────────────────────────────────────────

function ModePicker({ onPick }: { onPick: (m: Mode) => void }) {
  return (
    <div className="p-6 flex flex-col gap-4">
      <p className="text-[14px] text-ink-muted text-center">
        How do you want to study?
      </p>
      <div className="grid grid-cols-2 gap-4 mt-2">
        <button
          onClick={() => onPick("flashcards")}
          className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-ink-border hover:border-[var(--brand)] hover:bg-[var(--brand-tint)] transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-surface-muted group-hover:bg-[var(--brand-tint-strong)] grid place-items-center transition-colors">
            <CardsIcon size={24} className="text-[var(--brand)]" />
          </div>
          <div>
            <div className="text-[14px] font-semibold">Flashcards</div>
            <div className="text-[12px] text-ink-muted mt-0.5">
              Flip through AI-generated cards to test your knowledge
            </div>
          </div>
        </button>

        <button
          onClick={() => onPick("chat")}
          className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-ink-border hover:border-[var(--brand)] hover:bg-[var(--brand-tint)] transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-surface-muted group-hover:bg-[var(--brand-tint-strong)] grid place-items-center transition-colors">
            <ChatCircleDotsIcon size={24} className="text-[var(--brand)]" />
          </div>
          <div>
            <div className="text-[14px] font-semibold">Ask Sparky</div>
            <div className="text-[12px] text-ink-muted mt-0.5">
              Get guided help — Sparky won&apos;t give answers, but will help you think
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

// ─── Flashcard Mode ───────────────────────────────────────────────────────────

function FlashcardMode({
  context,
  title,
}: {
  context: string;
  title: string;
}) {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/practice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode: "flashcards", context }),
        });
        const data = await res.json();
        if (!cancelled) {
          if (data.error) throw new Error(data.error);
          setCards(data.cards);
          setIndex(0);
          setFlipped(false);
        }
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Failed to load cards");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [context]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <CircleNotchIcon size={28} className="text-[var(--brand)] animate-spin" />
        <p className="text-[13px] text-ink-muted">
          Sparky is generating your flashcards…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <p className="text-[13px] text-rose-600">{error}</p>
      </div>
    );
  }

  const card = cards[index];

  return (
    <div className="p-6 flex flex-col items-center gap-6">
      {/* Progress */}
      <div className="w-full flex items-center justify-between text-[12px] text-ink-muted">
        <span>
          Card {index + 1} of {cards.length}
        </span>
        <button
          onClick={() => {
            setFlipped(false);
            setIndex(0);
          }}
          className="inline-flex items-center gap-1 hover:text-ink transition-colors"
        >
          <ArrowsClockwiseIcon size={12} />
          Restart
        </button>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-surface-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-[var(--brand)] rounded-full transition-all duration-300"
          style={{ width: `${((index + 1) / cards.length) * 100}%` }}
        />
      </div>

      {/* Card */}
      <div
        className="w-full cursor-pointer"
        style={{ perspective: "1000px" }}
        onClick={() => setFlipped((f) => !f)}
      >
        <div
          className="relative w-full transition-transform duration-500"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            minHeight: "200px",
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-surface border-2 border-ink-border rounded-2xl text-center"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="text-[11px] uppercase tracking-widest text-ink-muted mb-3 font-medium">
              Question
            </div>
            <div className="text-[17px] font-semibold leading-snug">
              {card?.front}
            </div>
            <div className="mt-4 text-[11.5px] text-ink-subtle">
              Click to reveal answer
            </div>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-[var(--brand-tint)] border-2 border-[var(--brand)]/30 rounded-2xl text-center"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div className="text-[11px] uppercase tracking-widest text-[var(--brand)] mb-3 font-medium">
              Answer
            </div>
            <div className="text-[16px] leading-relaxed text-ink">
              {card?.back}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            setIndex((i) => Math.max(0, i - 1));
            setFlipped(false);
          }}
          disabled={index === 0}
          className="w-10 h-10 rounded-full border border-ink-border grid place-items-center text-ink-muted hover:bg-surface-muted disabled:opacity-30 transition-colors"
        >
          <ArrowLeftIcon size={16} />
        </button>

        <button
          onClick={() => setFlipped((f) => !f)}
          className="px-5 py-2 rounded-full bg-ink text-white text-[13px] font-medium hover:bg-ink/90 transition-colors"
        >
          {flipped ? "Hide answer" : "Show answer"}
        </button>

        <button
          onClick={() => {
            setIndex((i) => Math.min(cards.length - 1, i + 1));
            setFlipped(false);
          }}
          disabled={index === cards.length - 1}
          className="w-10 h-10 rounded-full border border-ink-border grid place-items-center text-ink-muted hover:bg-surface-muted disabled:opacity-30 transition-colors"
        >
          <ArrowRightIcon size={16} />
        </button>
      </div>

      {index === cards.length - 1 && flipped && (
        <div className="text-center text-[13px] text-emerald-600 font-medium">
          🎉 You made it through all the cards!
        </div>
      )}
    </div>
  );
}

// ─── Chat / Socratic Tutor Mode ───────────────────────────────────────────────

function ChatMode({ context, title }: { context: string; title: string }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "sparky",
      text: `Hey! I'm here to help you understand **${title}**. I won't just give you answers — instead I'll guide you to figure things out yourself. What are you confused about or want to explore?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || streaming) return;
    setInput("");

    const userMsg: Message = { role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setStreaming(true);

    // Add empty sparky message to stream into
    setMessages((prev) => [...prev, { role: "sparky", text: "" }]);

    try {
      const res = await fetch("/api/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "chat",
          context,
          message: text,
          history: messages, // send full history for context
        }),
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "sparky", text: accumulated };
          return updated;
        });
      }
    } catch (e) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "sparky",
          text: "Sorry, something went wrong. Try again.",
        };
        return updated;
      });
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div className="flex flex-col h-full" style={{ minHeight: "420px" }}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3 max-h-[380px]">
        {messages.map((msg, i) => (
          <ChatBubble key={i} message={msg} />
        ))}
        {streaming && messages[messages.length - 1]?.text === "" && (
          <div className="flex gap-2 items-center text-ink-muted text-[12px]">
            <CircleNotchIcon size={13} className="animate-spin" />
            Sparky is thinking…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-5 pb-5 pt-3 border-t border-ink-border shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="flex items-center gap-2 bg-surface border border-ink-border rounded-2xl px-3 py-2 focus-within:border-ink/40 focus-within:ring-2 focus-within:ring-[var(--brand-tint)]"
        >
          <SparkleIcon size={15} className="text-[var(--brand)] shrink-0 ml-1" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Sparky anything about this…"
            className="flex-1 bg-transparent py-1.5 text-[13.5px] placeholder:text-ink-subtle focus:outline-none"
            disabled={streaming}
          />
          <button
            type="submit"
            disabled={!input.trim() || streaming}
            className="inline-flex items-center gap-1.5 bg-ink text-white text-[12.5px] font-medium px-3 py-1.5 rounded-xl hover:bg-ink/90 transition-colors disabled:opacity-40"
          >
            Send
            <PaperPlaneTiltIcon size={13} weight="fill" />
          </button>
        </form>
      </div>
    </div>
  );
}

function ChatBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  const parts = message.text.split(/(\*\*[^*]+\*\*)/g);

  return (
    <div className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {!isUser && (
        <div className="w-6 h-6 rounded-lg bg-ink text-white grid place-items-center shrink-0 mt-0.5">
          <SparkleIcon size={11} weight="fill" />
        </div>
      )}
      <div
        className={[
          "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap",
          isUser
            ? "bg-ink text-white rounded-tr-sm"
            : "bg-surface-muted text-ink border border-ink-border rounded-tl-sm",
        ].join(" ")}
      >
        {parts.map((p, i) =>
          p.startsWith("**") && p.endsWith("**") ? (
            <strong key={i}>{p.slice(2, -2)}</strong>
          ) : (
            <span key={i}>{p}</span>
          )
        )}
      </div>
    </div>
  );
}
