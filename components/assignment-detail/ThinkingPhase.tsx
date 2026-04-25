"use client";

import { useEffect, useState, useRef } from "react";
import {
  CheckCircle as CheckCircleIcon,
  CircleNotch as SpinnerIcon,
  Circle as CircleIcon,
} from "@phosphor-icons/react/dist/ssr";
import { CourseAssignment } from "@/lib/courses";
import { Plan } from "@/lib/types";

type Props = {
  assignment: CourseAssignment;
  onComplete: (plans: Plan[]) => void;
  onRegisterStop?: (stopFn: () => void) => void;
};

type StepStatus = "pending" | "active" | "completed";

const STEP_LABELS = [
  "Reading assignment details",
  "Analyzing complexity and scope",
  "Estimating time requirements",
  "Identifying key milestones",
  "Generating plan options",
];

const STEP_THRESHOLDS = [50, 150, 300, 500, 700];

function parsePlans(text: string): Plan[] {
  try {
    const start = text.indexOf("---PLANS_START---");
    const end = text.indexOf("---PLANS_END---");
    if (start === -1 || end === -1) throw new Error("No plans block");
    const json = text.slice(start + "---PLANS_START---".length, end).trim();
    return JSON.parse(json) as Plan[];
  } catch {
    const today = new Date();
    const due = new Date(today.getTime() + 4 * 86400000);
    return [
      {
        id: "plan-fallback-1",
        name: "Steady Pace",
        milestoneCount: 3,
        estimatedCompletion: due.toISOString().split("T")[0],
        milestones: [
          { id: "fb-m1", title: "Plan & research", targetDate: new Date(today.getTime() + 1 * 86400000).toISOString().split("T")[0] },
          { id: "fb-m2", title: "Draft work", targetDate: new Date(today.getTime() + 2 * 86400000).toISOString().split("T")[0] },
          { id: "fb-m3", title: "Review & submit", targetDate: due.toISOString().split("T")[0] },
        ],
      },
      {
        id: "plan-fallback-2",
        name: "Sprint Mode",
        milestoneCount: 2,
        estimatedCompletion: new Date(today.getTime() + 3 * 86400000).toISOString().split("T")[0],
        milestones: [
          { id: "fb-m4", title: "Full draft", targetDate: new Date(today.getTime() + 2 * 86400000).toISOString().split("T")[0] },
          { id: "fb-m5", title: "Polish & submit", targetDate: new Date(today.getTime() + 3 * 86400000).toISOString().split("T")[0] },
        ],
      },
    ];
  }
}

function getSteps(charCount: number, isDone: boolean): { id: string; label: string; status: StepStatus }[] {
  return STEP_LABELS.map((label, i) => {
    let status: StepStatus = "pending";
    if (isDone) {
      status = "completed";
    } else if (charCount >= (STEP_THRESHOLDS[i + 1] ?? Infinity)) {
      status = "completed";
    } else if (charCount >= STEP_THRESHOLDS[i]) {
      status = "active";
    } else if (i === 0 && charCount > 0) {
      status = "active";
    }
    return { id: `step-${i}`, label, status };
  });
}

function StepIcon({ status }: { status: StepStatus }) {
  if (status === "completed") {
    return <CheckCircleIcon size={22} weight="fill" className="text-emerald-500" />;
  }
  if (status === "active") {
    return <SpinnerIcon size={22} weight="bold" className="text-[var(--brand)] animate-spin" />;
  }
  return <CircleIcon size={22} weight="regular" className="text-ink-border" />;
}

export default function ThinkingPhase({ assignment, onComplete, onRegisterStop }: Props) {
  const [charCount, setCharCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);
  const accumulatedRef = useRef("");
  const abortRef = useRef<AbortController | null>(null);

  const steps = getSteps(charCount, isDone);

  useEffect(() => {
    startStream();

    // Register stop function with parent modal
    onRegisterStop?.(() => {
      abortRef.current?.abort();
      setIsDone(true);
      const plans = parsePlans(accumulatedRef.current);
      onComplete(plans);
    });

    return () => { abortRef.current?.abort(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startStream() {
    abortRef.current = new AbortController();
    try {
      const res = await fetch("/api/ai-planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: assignment.title,
          description: assignment.description ?? "",
          dueDate: assignment.dueDate,
        }),
        signal: abortRef.current.signal,
      });
      if (!res.ok) throw new Error("API error");

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulatedRef.current += chunk;
        setCharCount(accumulatedRef.current.length);
      }

      setIsDone(true);
      const plans = parsePlans(accumulatedRef.current);
      setTimeout(() => onComplete(plans), 600);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError("Unable to generate a plan. Please try again.");
    }
  }

  return (
    <div className="p-8 flex flex-col gap-6">
      {/* Error state */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-[13px] text-rose-700">
          {error}
          <button
            onClick={() => {
              setError(null);
              setIsDone(false);
              setCharCount(0);
              accumulatedRef.current = "";
              startStream();
            }}
            className="ml-3 underline font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Timeline steps */}
      {!error && (
        <div className="flex flex-col" role="list" aria-label="Analysis progress">
          {steps.map((step, i) => {
            const isVisible = step.status !== "pending" || i === 0;
            const isLast = i === steps.length - 1;

            return (
              <div
                key={step.id}
                role="listitem"
                className={`flex gap-4 transition-all duration-500 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                }`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="flex flex-col items-center shrink-0">
                  <div className="transition-transform duration-300">
                    <StepIcon status={step.status} />
                  </div>
                  {!isLast && (
                    <div className={`w-[2px] flex-1 min-h-[28px] my-1 rounded-full transition-colors duration-500 ${
                      step.status === "completed" ? "bg-emerald-200" : "bg-ink-border/40"
                    }`} />
                  )}
                </div>

                <div className={`pt-[2px] pb-4 text-[14px] transition-colors duration-300 ${
                  step.status === "completed"
                    ? "text-ink font-medium"
                    : step.status === "active"
                    ? "text-ink font-semibold"
                    : "text-ink-muted"
                }`}>
                  {step.label}
                  {step.status === "active" && (
                    <span className="text-ink-muted font-normal">…</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
