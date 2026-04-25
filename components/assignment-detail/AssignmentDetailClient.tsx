"use client";

import { useState } from "react";
import { CourseAssignment, Course, Milestone } from "@/lib/courses";
import AssignmentHeader from "./AssignmentHeader";
import MilestonePlanSection from "./MilestonePlanSection";
import AssignmentTabBar from "./AssignmentTabBar";
import AIPlannerModal from "./AIPlannerModal";

type Props = {
  assignment: CourseAssignment;
  course: Course;
};

export default function AssignmentDetailClient({ assignment, course }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmedMilestones, setConfirmedMilestones] = useState<Milestone[]>([]);
  const [modalInitialPhase, setModalInitialPhase] = useState<
    "thinking" | "plan-selection"
  >("thinking");

  return (
    <div className="max-w-[1400px] mx-auto">
      <AssignmentHeader
        assignment={assignment}
        course={course}
        onOpenPlanner={() => {
          setModalInitialPhase("thinking");
          setIsModalOpen(true);
        }}
      />

      {confirmedMilestones.length > 0 && (
        <MilestonePlanSection
          milestones={confirmedMilestones}
          onEditPlan={() => {
            setModalInitialPhase("plan-selection");
            setIsModalOpen(true);
          }}
        />
      )}

      <AssignmentTabBar assignment={assignment} course={course} />

      {isModalOpen && (
        <AIPlannerModal
          assignment={assignment}
          onClose={() => setIsModalOpen(false)}
          onPlanConfirmed={(milestones) => {
            setConfirmedMilestones(milestones);
            setIsModalOpen(false);
          }}
          initialPhase={modalInitialPhase}
        />
      )}
    </div>
  );
}
