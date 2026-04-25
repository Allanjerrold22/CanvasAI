import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { courses } from "@/lib/courses";
import HeroBanner from "@/components/course-detail/HeroBanner";
import CourseTabBar from "@/components/course-detail/CourseTabBar";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CourseDetailPage({ params }: Props) {
  const { id } = await params;
  const course = courses.find((c) => c.id === id);

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

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Back link */}
      <div className="px-8 pt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[13px] text-ink-muted hover:text-ink transition-colors"
        >
          <ArrowLeftIcon size={13} />
          All Courses
        </Link>
      </div>

      {/* Hero Banner */}
      <div className="mt-4 mx-8 rounded-2xl overflow-hidden">
        <HeroBanner course={course} />
      </div>

      {/* Tab Bar + Panels */}
      <div className="px-8 py-8">
        <CourseTabBar course={course} />
      </div>
    </div>
  );
}
