import { Suspense } from "react";
import {
  SparkleIcon,
  BookOpenIcon,
  NotePencilIcon,
  LightbulbIcon,
} from "@phosphor-icons/react/dist/ssr";
import PageHeader from "@/components/PageHeader";
import SparkyChat from "@/components/SparkyChat";

const suggestions = [
  {
    icon: <BookOpenIcon size={16} />,
    title: "Summarize today's lecture",
    body: "Get a 10-minute recap of your CSE 310 lecture on red-black trees.",
    prompt: "Can you summarize today's CSE 310 lecture on red-black trees?",
  },
  {
    icon: <NotePencilIcon size={16} />,
    title: "Draft my essay outline",
    body: "Start an outline for the ENG 301 technical memo due next week.",
    prompt:
      "Help me draft an outline for the ENG 301 technical memo due next week.",
  },
  {
    icon: <LightbulbIcon size={16} />,
    title: "Explain this concept",
    body: "Break down divergence and curl from MAT 267 with examples.",
    prompt:
      "Can you explain divergence and curl from MAT 267 with clear examples?",
  },
];

export default function SparkyPage() {
  return (
    <div className="px-8 py-8 max-w-[1100px] mx-auto">
      <PageHeader
        title="SparkyAI"
        subtitle="Your study companion — trained on your courses, notes, and assignments."
      />

      <Suspense fallback={<div className="mt-8 h-64 rounded-2xl bg-surface border border-ink-border animate-pulse" />}>
        <SparkyChat suggestions={suggestions} />
      </Suspense>
    </div>
  );
}
