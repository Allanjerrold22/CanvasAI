import { PlusIcon } from "@phosphor-icons/react/dist/ssr";
import PageHeader from "@/components/PageHeader";
import CourseTabs from "@/components/CourseTabs";
import { courses } from "@/lib/courses";

export default function Home() {
  return (
    <div className="px-8 py-8 max-w-[1400px] mx-auto">
      <PageHeader
        title="Courses"
        subtitle="Your enrolled classes for the current and upcoming semesters."
        action={
          <button
            type="button"
            className="inline-flex items-center gap-2 bg-ink text-white text-[13px] font-medium px-4 py-2 rounded-full hover:bg-ink/90 transition-colors"
          >
            <PlusIcon size={14} weight="bold" />
            Enroll in a course
          </button>
        }
      />
      <div className="mt-6">
        <CourseTabs courses={courses} />
      </div>
    </div>
  );
}
