"use client";

import { useEffect, useState } from "react";
import {
  X as XIcon,
  CalendarDots as CalendarDotsIcon,
  Sparkle as SparkleIcon,
  Stop as StopIcon,
  CaretDown as CaretDownIcon,
} from "@phosphor-icons/react/dist/ssr";
import { CourseAssignment, Milestone } from "@/lib/courses";
import { Plan } from "@/lib/types";
import ThinkingPhase from "./ThinkingPhase";
import PlanSelectionPhase from "./PlanSelectionPhase";
import PermissionFlow from "./PermissionFlow";
import ConfirmationStep from "./ConfirmationStep";

type Props = {
  assignment: CourseAssignment;
  course: { id: string; code: string };
  onClose: () => void;
  onPlanConfirmed: (milestones: Milestone[]) => void;
  initialPhase: "thinking" | "plan-selection";
};

type ModalPhase = "confirm" | "thinking" | "plan-selection" | "permission" | "confirmation";

export default function AIPlannerModal({
  assignment,
  course,
  onClose,
  onPlanConfirmed,
  initialPhase,
}: Props) {
  const [phase, setPhase] = useState<ModalPhase>(
    initialPhase === "plan-selection" ? "plan-selection" : "confirm"
  );
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [calendarPermission, setCalendarPermission] = useState<"granted" | "skipped" | null>(null);
  const [googlePermission, setGooglePermission] = useState<"granted" | "skipped" | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [stopFn, setStopFn] = useState<(() => void) | null>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const isThinking = phase === "thinking";
  const showBottomBar = phase === "confirm" || phase === "thinking";

  // Determine modal size per phase
  const sizeClass =
    phase === "confirm" || phase === "thinking"
      ? "w-full max-w-lg max-h-[60vh]"
      : "w-full max-w-2xl max-h-[85vh]";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn"
      style={{
        background: "linear-gradient(135deg, #ffffff 0%, #f7f7f8 50%, rgba(140,29,64,0.04) 100%)",
      }}
    >
      <div className={`relative mx-4 bg-white rounded-3xl shadow-2xl border border-ink-border overflow-hidden animate-slideUp flex flex-col modal-panel-smooth ${sizeClass}`}>
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-20 w-8 h-8 grid place-items-center rounded-full bg-surface-muted hover:bg-ink-border transition-colors text-ink-muted"
        >
          <XIcon size={16} />
        </button>

        {/* ── CONFIRM PHASE ── */}
        {phase === "confirm" && (
          <div className="flex-1 overflow-y-auto p-8 pb-28">
            {/* Assignment summary */}
            <div className="flex flex-col gap-4">
              <h2 className="text-[18px] font-semibold tracking-tight pr-10">
                {assignment.title}
              </h2>

              {/* Quick details row */}
              <div className="flex flex-wrap items-center gap-3 text-[13px] text-ink-muted">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDotsIcon size={14} />
                  {assignment.dueDate}
                </span>
                {assignment.points && (
                  <span className="px-2 py-0.5 rounded-full bg-surface-muted text-[12px] font-medium">
                    {assignment.points} pts
                  </span>
                )}
                {assignment.submissionType && (
                  <span className="px-2 py-0.5 rounded-full bg-surface-muted text-[12px] font-medium">
                    {assignment.submissionType}
                  </span>
                )}
              </div>

              {/* Teammates avatars */}
              {assignment.teammates && assignment.teammates.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {assignment.teammates.slice(0, expanded ? undefined : 3).map((t) => (
                      <div
                        key={t.id}
                        className="w-8 h-8 rounded-full grid place-items-center text-white text-[11px] font-semibold border-2 border-white"
                        style={{ backgroundColor: t.avatarColor }}
                        title={t.name}
                      >
                        {t.initials}
                      </div>
                    ))}
                    {!expanded && assignment.teammates.length > 3 && (
                      <div className="w-8 h-8 rounded-full grid place-items-center text-[11px] font-semibold border-2 border-white bg-surface-muted text-ink-muted">
                        +{assignment.teammates.length - 3}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-[12px] text-ink-muted hover:text-ink transition-colors inline-flex items-center gap-0.5"
                  >
                    {expanded ? "Show less" : "Show all"}
                    <CaretDownIcon
                      size={12}
                      className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                    />
                  </button>
                </div>
              )}

              {/* Expanded teammate names */}
              {expanded && assignment.teammates && (
                <div className="flex flex-col gap-1.5 pl-1 animate-fadeUp">
                  {assignment.teammates.map((t) => (
                    <div key={t.id} className="flex items-center gap-2.5 text-[13px]">
                      <div
                        className="w-6 h-6 rounded-full grid place-items-center text-white text-[9px] font-semibold shrink-0"
                        style={{ backgroundColor: t.avatarColor }}
                      >
                        {t.initials}
                      </div>
                      <span className="font-medium">{t.name}</span>
                      <span className="text-ink-muted text-[12px]">{t.role}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Brief description preview */}
              {assignment.description && (
                <p className="text-[13px] text-ink-muted leading-relaxed line-clamp-3">
                  {assignment.description}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── THINKING PHASE ── */}
        {phase === "thinking" && (
          <div className="flex-1 overflow-y-auto pb-28">
            <ThinkingPhase
              assignment={assignment}
              onComplete={(parsedPlans) => {
                setPlans(parsedPlans);
                setPhase("plan-selection");
              }}
              onRegisterStop={(fn) => setStopFn(() => fn)}
            />
          </div>
        )}

        {/* ── BOTTOM BAR (confirm + thinking phases) ── */}
        {showBottomBar && (
          <div className="absolute bottom-0 left-0 right-0 z-10">
            {/* White gradient fade */}
            <div className="h-12 bg-gradient-to-t from-white to-transparent pointer-events-none" />
            {/* Bar content */}
            <div className="bg-white px-8 pb-6 pt-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl bg-[var(--brand-tint)] grid place-items-center ${isThinking ? "animate-pulse" : ""}`}>
                  <SparkleIcon size={18} weight="fill" className="text-[var(--brand)]" />
                </div>
                <div>
                  <div className="text-[15px] font-semibold tracking-tight">AI Planner</div>
                  <div className="text-[12px] text-ink-muted">
                    {isThinking ? "Thinking…" : "Ready to plan"}
                  </div>
                </div>
              </div>

              {phase === "confirm" && (
                <button
                  onClick={() => setPhase("thinking")}
                  className="bg-[var(--brand)] text-white text-[13px] font-medium px-5 py-2.5 rounded-full hover:bg-[var(--brand)]/90 transition-colors inline-flex items-center gap-2"
                >
                  <SparkleIcon size={14} weight="fill" />
                  Plan
                </button>
              )}

              {isThinking && (
                <button
                  onClick={() => stopFn?.()}
                  className="w-10 h-10 rounded-full bg-[var(--brand)] grid place-items-center hover:bg-[var(--brand)]/80 transition-colors"
                  aria-label="Stop generating"
                >
                  <StopIcon size={16} weight="fill" className="text-white" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── PLAN SELECTION ── */}
        {phase === "plan-selection" && (
          <PlanSelectionPhase
            plans={plans}
            selectedPlan={selectedPlan}
            onSelect={(plan) => setSelectedPlan(plan)}
            onConfirm={() => setPhase("permission")}
          />
        )}

        {/* ── PERMISSION FLOW ── */}
        {phase === "permission" && (
          <PermissionFlow
            plan={selectedPlan!}
            onComplete={(cal, google) => {
              setCalendarPermission(cal);
              setGooglePermission(google);
              setPhase("confirmation");
            }}
          />
        )}

        {/* ── CONFIRMATION ── */}
        {phase === "confirmation" && (
          <ConfirmationStep
            plan={selectedPlan!}
            courseId={course.id}
            courseCode={course.code}
            assignmentId={assignment.id}
            assignmentTitle={assignment.title}
            teammates={assignment.teammates}
            calendarPermission={calendarPermission!}
            googlePermission={googlePermission!}
            onConfirm={(milestones) => onPlanConfirmed(milestones)}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
}
