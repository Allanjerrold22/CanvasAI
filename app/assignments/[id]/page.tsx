import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { courses } from "@/lib/courses";
import AssignmentDetailClient from "@/components/assignment-detail/AssignmentDetailClient";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AssignmentDetailPage({ params }: Props) {
  const { id } = await params;

  // Flatten all assignments across all courses to find the matching one
  let assignment = null;
  let course = null;

  for (const c of courses) {
    const found = c.assignments?.find((a) => a.id === id);
    if (found) {
      assignment = found;
      course = c;
      break;
    }
  }

  if (!assignment || !course) {
    return (
      <div className="px-8 py-16 max-w-[1400px] mx-auto flex flex-col items-center gap-4 text-center">
        <p className="text-[18px] font-semibold">Assignment not found</p>
        <p className="text-ink-muted text-[14px]">
          We couldn&apos;t find an assignment with that ID.
        </p>
        <Link
          href="/assignments"
          className="inline-flex items-center gap-2 text-[13.5px] font-medium text-[var(--brand)] hover:underline"
        >
          <ArrowLeftIcon size={14} />
          Back to Assignments
        </Link>
      </div>
    );
  }

  return <AssignmentDetailClient assignment={assignment} course={course} />;
}
