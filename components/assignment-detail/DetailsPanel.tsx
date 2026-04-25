import { CourseAssignment } from "@/lib/courses";
import SubmissionArea from "./SubmissionArea";

type Props = {
  assignment: CourseAssignment;
};

export default function DetailsPanel({ assignment }: Props) {
  return (
    <div className="mt-6">
      {/* Instructions card */}
      <div className="bg-surface border border-ink-border rounded-2xl p-6 mb-6">
        <h2 className="text-[15px] font-semibold mb-3">Instructions</h2>
        {assignment.description ? (
          <div className="text-[14px] text-ink leading-relaxed whitespace-pre-wrap">
            {assignment.description}
          </div>
        ) : (
          <p className="text-[14px] text-ink-muted italic">
            No instructions provided for this assignment.
          </p>
        )}
      </div>

      {/* Metadata card */}
      {(assignment.points !== undefined || assignment.submissionType !== undefined) && (
        <div className="bg-surface border border-ink-border rounded-2xl p-6 mb-6">
          <h2 className="text-[15px] font-semibold mb-3">Details</h2>
          <div>
            {assignment.points !== undefined && (
              <div className="flex items-center justify-between py-2 border-b border-ink-border last:border-0">
                <span className="text-[13px] text-ink-muted">Points</span>
                <span className="text-[13px] font-medium">{assignment.points}</span>
              </div>
            )}
            {assignment.submissionType !== undefined && (
              <div className="flex items-center justify-between py-2 border-b border-ink-border last:border-0">
                <span className="text-[13px] text-ink-muted">Submission Type</span>
                <span className="text-[13px] font-medium">{assignment.submissionType}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <SubmissionArea assignment={assignment} />
    </div>
  );
}
