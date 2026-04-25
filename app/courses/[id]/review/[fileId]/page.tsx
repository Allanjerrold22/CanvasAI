import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { courses } from "@/lib/courses";
import { findFileNode, isEligibleForReview, getSlides } from "@/lib/slides";
import SlideReviewerClient from "@/components/slide-reviewer/SlideReviewerClient";
import UploadedSlideReviewer from "@/components/slide-reviewer/UploadedSlideReviewer";

type Props = {
  params: Promise<{ id: string; fileId: string }>;
};

export default async function SlideReviewerPage({ params }: Props) {
  const { id: courseId, fileId } = await params;

  const course = courses.find((c) => c.id === courseId);

  if (!course) {
    return (
      <div className="px-8 py-16 max-w-[1400px] mx-auto flex flex-col items-center gap-4 text-center">
        <p className="text-[18px] font-semibold">Course not found</p>
        <p className="text-ink-muted text-[14px]">
          We couldn&apos;t find a course with that ID.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[13.5px] font-medium text-[var(--brand)] hover:underline"
        >
          <ArrowLeftIcon size={14} />
          Back to Courses
        </Link>
      </div>
    );
  }

  // Check if this is an uploaded file (fileId starts with "upload-")
  if (fileId.startsWith("upload-")) {
    return (
      <UploadedSlideReviewer
        courseId={courseId}
        courseName={course.name}
        uploadId={fileId}
      />
    );
  }

  // Existing file from course data
  const fileNode = course.files
    ? findFileNode(course.files, fileId)
    : undefined;

  if (!fileNode) {
    return (
      <div className="px-8 py-16 max-w-[1400px] mx-auto flex flex-col items-center gap-4 text-center">
        <p className="text-[18px] font-semibold">File not found</p>
        <p className="text-ink-muted text-[14px]">
          We couldn&apos;t find a file with that ID in this course.
        </p>
        <Link
          href={`/courses/${courseId}`}
          className="inline-flex items-center gap-2 text-[13.5px] font-medium text-[var(--brand)] hover:underline"
        >
          <ArrowLeftIcon size={14} />
          Back to {course.name}
        </Link>
      </div>
    );
  }

  if (!isEligibleForReview(fileNode.name)) {
    return (
      <div className="px-8 py-16 max-w-[1400px] mx-auto flex flex-col items-center gap-4 text-center">
        <p className="text-[18px] font-semibold">
          This file type does not support AI Review
        </p>
        <p className="text-ink-muted text-[14px]">
          AI Review is available for PPT, PPTX, and PDF files.
        </p>
        <Link
          href={`/courses/${courseId}`}
          className="inline-flex items-center gap-2 text-[13.5px] font-medium text-[var(--brand)] hover:underline"
        >
          <ArrowLeftIcon size={14} />
          Back to {course.name}
        </Link>
      </div>
    );
  }

  const slides = getSlides(fileId);

  if (!slides || slides.length === 0) {
    return (
      <div className="px-8 py-16 max-w-[1400px] mx-auto flex flex-col items-center gap-4 text-center">
        <p className="text-[18px] font-semibold">
          No slide data available for this file
        </p>
        <p className="text-ink-muted text-[14px]">
          Slide data has not been generated for this file yet.
        </p>
        <Link
          href={`/courses/${courseId}`}
          className="inline-flex items-center gap-2 text-[13.5px] font-medium text-[var(--brand)] hover:underline"
        >
          <ArrowLeftIcon size={14} />
          Back to {course.name}
        </Link>
      </div>
    );
  }

  return (
    <SlideReviewerClient
      courseName={course.name}
      courseId={courseId}
      fileName={fileNode.name}
      fileId={fileId}
      slides={slides}
    />
  );
}
