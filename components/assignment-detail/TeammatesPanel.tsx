import { Teammate } from "@/lib/courses";
import TeammateCard from "./TeammateCard";

type Props = {
  teammates: Teammate[];
};

export default function TeammatesPanel({ teammates }: Props) {
  if (teammates.length === 0) {
    return (
      <div className="py-12 text-center text-ink-muted text-[14px]">
        No teammates assigned to this assignment.
      </div>
    );
  }

  return (
    <div className="mt-6 bg-surface border border-ink-border rounded-2xl shadow-subtle overflow-hidden">
      <ul className="divide-y divide-ink-border">
        {teammates.map((t) => (
          <TeammateCard key={t.id} teammate={t} />
        ))}
      </ul>
    </div>
  );
}
