"use client";

import { useState, useEffect } from "react";
import { CourseAssignment, Course, Milestone } from "@/lib/courses";
import AssignmentHeader from "./AssignmentHeader";
import MilestonePlanSection from "./MilestonePlanSection";
import AssignmentTabBar from "./AssignmentTabBar";
import AIPlannerModal from "./AIPlannerModal";
import { getPlanByAssignment, deletePlan, SavedPlan } from "@/lib/plans-store";

type Props = {
  assignment: CourseAssignment;
  course: Course;
};

export default function AssignmentDetailClient({ assignment, course }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmedMilestones, setConfirmedMilestones] = useState<Milestone[]>([]);
  const [savedPlan, setSavedPlan] = useState<SavedPlan | null>(null);
  const [modalInitialPhase, setModalInitialPhase] = useState<
    "thinking" | "plan-selection"
  >("thinking");

  // Load existing plan on mount
  useEffect(() => {
    const existingPlan = getPlanByAssignment(assignment.id);
    if (existingPlan) {
      setSavedPlan(existingPlan);
      // Convert saved plan milestones to the format expected by MilestonePlanSection
      setConfirmedMilestones(
        existingPlan.milestones.map((m) => ({
          id: m.id,
          title: m.title,
          targetDate: m.targetDate,
          completed: m.completed,
          reminderSet: true,
          meetingScheduled: false,
        }))
      );
    }
  }, [assignment.id]);

  function handleDeletePlan() {
    if (savedPlan) {
      deletePlan(savedPlan.id);
      setSavedPlan(null);
      setConfirmedMilestones([]);
    }
  }

  return (
    <div className="max-w-[1400px] mx-auto">
      <AssignmentHeader
        assignment={assignment}
        course={course}
        hasPlan={!!savedPlan}
        onOpenPlanner={() => {
          setModalInitialPhase("thinking");
          setIsModalOpen(true);
        }}
      />

      {confirmedMilestones.length > 0 && (
        <MilestonePlanSection
          milestones={confirmedMilestones}
          planName={savedPlan?.planName}
          onEditPlan={() => {
            setModalInitialPhase("thinking");
            setIsModalOpen(true);
          }}
          onDeletePlan={handleDeletePlan}
        />
      )}

      <AssignmentTabBar assignment={assignment} />

      {isModalOpen && (
        <AIPlannerModal
          assignment={assignment}
          course={{ id: course.id, code: course.code }}
          onClose={() => setIsModalOpen(false)}
          onPlanConfirmed={(milestones) => {
            setConfirmedMilestones(milestones);
            // Reload the saved plan
            const newPlan = getPlanByAssignment(assignment.id);
            setSavedPlan(newPlan);
            setIsModalOpen(false);
          }}
          initialPhase={modalInitialPhase}
        />
      )}
    </div>
  );
}
