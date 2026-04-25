"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  SparkleIcon,
  PaperPlaneTiltIcon,
  ArrowLeftIcon,
  BookOpenTextIcon,
  ClockIcon,
  WarningCircleIcon,
  CheckCircleIcon,
} from "@phosphor-icons/react/dist/ssr";

type Message = {
  id: string;
  role: "user" | "sparky";
  text: string;
};

type Suggestion = {
  icon: React.ReactNode;
  title: string;
  body: string;
  prompt: string;
};

type AssignmentContext = {
  assignmentId: string;
  title: string;
  course: string;
  dueDate: string;
  description: string;
};

function buildPracticePrompt(ctx: AssignmentContext): string {
  return `I need help with my assignment: "${ctx.title}" for ${ctx.course}.\n\nAssignment details:\n${ctx.description}\n\nCan you help me understand what's expected and guide me through it?`;
}

function buildSparkyReply(ctx: AssignmentContext): string {
  return `Hey! I've got the details for **${ctx.title}** loaded up. Here's how I can help you tackle it:\n\n📌 **What's being asked:**\n${ctx.description}\n\n✅ **Where to start:**\n1. Re-read the prompt carefully and identify the key deliverables.\n2. Break the assignment into smaller steps — don't try to do it all at once.\n3. Ask me to explain any concept you're unsure about.\n\nWhat part do you want to work on first?`;
}

export default function SparkyChat({
  suggestions,
}: {
  suggestions: Suggestion[];
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [assignmentCtx, setAssignmentCtx] =
    useState<AssignmentContext | null>(null);

  // On mount, check if we arrived from an assignment
  useEffect(() => {
    const assignmentId = searchParams.get("assignmentId");
    if (!assignmentId) return;

    const ctx: AssignmentContext = {
      assignmentId,
      title: searchParams.get("title") ?? "",
      course: searchParams.get("course") ?? "",
      dueDate: searchParams.get("dueDate") ?? "",
      description: searchParams.get("description") ?? "",
    };

    setAssignmentCtx(ctx);

    // Seed the conversation with the user's context message + Sparky's reply
    const userMsg: Message = {
      id: "seed-user",
      role: "user",
      text: buildPracticePrompt(ctx),
    };
    const sparkyMsg: Message = {
      id: "seed-sparky",
      role: "sparky",
      text: buildSparkyReply(ctx),
    };
    setMessages([userMsg, sparkyMsg]);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendMessage(text: string) {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}-user`,
      role: "user",
      text: text.trim(),
    };

    // Simulate a Sparky reply
    const sparkyReply: Message = {
      id: `msg-${Date.now()}-sparky`,
      role: "sparky",
      text: `Great question! In a real session I'd give you a detailed answer about "${text.trim()}". For now, try breaking the problem into smaller pieces and tackle one part at a time. What specific part is tripping you up?`,
    };

    setMessages((prev) => [...prev, userMsg, sparkyReply]);
    setInput("");
  }

  function handleSuggestion(prompt: string) {
    sendMessage(prompt);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  const isAssignmentMode = !!assignmentCtx;

  return (
    <section className="mt-8 bg-surface border border-ink-border rounded-2xl shadow-subtle overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-6 py-6 border-b border-ink-border bg-gradient-to-b from-[var(--brand-tint)]/60 to-transparent">
        {isAssignmentMode ? (
          <div className="flex items-start gap-4">
            <button
              type="button"
              onClick={() => router.push("/assignments")}
              aria-label="Back to assignments"
              className="mt-0.5 w-8 h-8 rounded-lg grid place-items-center text-ink-muted hover:bg-surface-muted transition-colors shrink-0"
            >
              <ArrowLeftIcon size={16} weight="bold" />
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-xl bg-ink text-white grid place-items-center shrink-0">
                  <SparkleIcon size={16} weight="fill" />
                </div>
                <span className="text-[13px] font-semibold text-[var(--brand)]">
                  Sparky is ready to help
                </span>
              </div>
              <h2 className="text-[18px] font-semibold tracking-tight truncate">
                {assignmentCtx.title}
              </h2>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                <span className="text-[12.5px] text-ink-muted">
                  {assignmentCtx.course}
                </span>
                <DueBadge dueDate={assignmentCtx.dueDate} />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-ink text-white grid place-items-center mb-4">
              <SparkleIcon size={24} weight="fill" />
            </div>
            <h2 className="text-[22px] font-semibold tracking-tight">
              How can Sparky help you study today?
            </h2>
            <p className="text-[13.5px] text-ink-muted mt-1.5 max-w-md mx-auto">
              Ask anything about your courses, upload a lecture, or generate a
              practice quiz.
            </p>
          </div>
        )}
      </div>

      {/* Assignment context card (assignment mode only) */}
      {isAssignmentMode && (
        <div className="mx-6 mt-5 mb-1 rounded-xl border border-ink-border bg-surface-muted p-4 flex gap-3">
          <BookOpenTextIcon
            size={18}
            className="text-[var(--brand)] shrink-0 mt-0.5"
          />
          <div>
            <div className="text-[12px] font-semibold uppercase tracking-wide text-ink-muted mb-1">
              Assignment Brief
            </div>
            <p className="text-[13px] text-ink leading-relaxed">
              {assignmentCtx.description}
            </p>
          </div>
        </div>
      )}

      {/* Suggestion chips (only when no messages) */}
      {messages.length === 0 && (
        <div className="p-6 grid sm:grid-cols-3 gap-3">
          {suggestions.map((s) => (
            <button
              key={s.title}
              type="button"
              onClick={() => handleSuggestion(s.prompt)}
              className="text-left bg-surface-muted hover:bg-[var(--brand-tint)] hover:text-[var(--brand)] border border-transparent hover:border-[var(--brand)]/20 rounded-xl p-4 transition-colors"
            >
              <div className="flex items-center gap-2 text-ink mb-1.5">
                <span className="text-[var(--brand)]">{s.icon}</span>
                <span className="text-[13px] font-semibold">{s.title}</span>
              </div>
              <p className="text-[12.5px] text-ink-muted leading-snug">
                {s.body}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* Chat messages */}
      {messages.length > 0 && (
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4 max-h-[420px]">
          {messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} />
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Input */}
      <div className="px-6 pb-6 pt-4">
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 bg-surface border border-ink-border rounded-2xl px-3 py-2 focus-within:border-ink/40 focus-within:ring-2 focus-within:ring-[var(--brand-tint)]"
        >
          <SparkleIcon size={16} className="text-[var(--brand)] ml-1 shrink-0" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isAssignmentMode
                ? `Ask Sparky about "${assignmentCtx?.title}"…`
                : "Ask SparkyAI anything about your courses…"
            }
            className="flex-1 bg-transparent py-2 text-[14px] placeholder:text-ink-subtle focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="inline-flex items-center gap-1.5 bg-ink text-white text-[13px] font-medium px-3.5 py-2 rounded-xl hover:bg-ink/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Send
            <PaperPlaneTiltIcon size={14} weight="fill" />
          </button>
        </form>
      </div>
    </section>
  );
}

function ChatBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      {!isUser && (
        <div className="w-7 h-7 rounded-lg bg-ink text-white grid place-items-center shrink-0 mt-0.5">
          <SparkleIcon size={14} weight="fill" />
        </div>
      )}

      <div
        className={[
          "max-w-[78%] rounded-2xl px-4 py-3 text-[13.5px] leading-relaxed whitespace-pre-wrap",
          isUser
            ? "bg-ink text-white rounded-tr-sm"
            : "bg-surface-muted text-ink border border-ink-border rounded-tl-sm",
        ].join(" ")}
      >
        {/* Render basic markdown-style bold */}
        <FormattedText text={message.text} />
      </div>
    </div>
  );
}

function FormattedText({ text }: { text: string }) {
  // Split on **bold** markers and render accordingly
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function DueBadge({ dueDate }: { dueDate: string }) {
  const lower = dueDate.toLowerCase();
  const isOverdue = lower.includes("overdue");
  const isSubmitted = lower.includes("submitted");

  if (isOverdue) {
    return (
      <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
        <WarningCircleIcon size={12} weight="fill" />
        {dueDate}
      </span>
    );
  }
  if (isSubmitted) {
    return (
      <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
        <CheckCircleIcon size={12} weight="fill" />
        {dueDate}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
      <ClockIcon size={12} />
      {dueDate}
    </span>
  );
}
