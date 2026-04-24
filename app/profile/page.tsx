import {
  EnvelopeSimpleIcon,
  IdentificationBadgeIcon,
  GraduationCapIcon,
} from "@phosphor-icons/react/dist/ssr";
import PageHeader from "@/components/PageHeader";

export default function ProfilePage() {
  return (
    <div className="px-8 py-8 max-w-[1000px] mx-auto">
      <PageHeader title="Profile" subtitle="Your student information and preferences." />

      <section className="mt-8 bg-surface border border-ink-border rounded-2xl shadow-subtle p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-maroon-300 to-maroon-600 grid place-items-center text-white text-xl font-semibold">
          AS
        </div>
        <div>
          <h2 className="text-[18px] font-semibold">Amanda Smith</h2>
          <p className="text-[13px] text-ink-muted">Undergraduate · Computer Science</p>
        </div>
      </section>

      <section className="mt-5 bg-surface border border-ink-border rounded-2xl shadow-subtle p-6 grid sm:grid-cols-2 gap-4">
        <Row icon={<IdentificationBadgeIcon size={16} />} label="Student ID" value="1224508821" />
        <Row icon={<EnvelopeSimpleIcon size={16} />} label="Email" value="asmith12@asu.edu" />
        <Row icon={<GraduationCapIcon size={16} />} label="Program" value="B.S. Computer Science" />
        <Row icon={<GraduationCapIcon size={16} />} label="Year" value="Junior · Class of 2027" />
      </section>
    </div>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-surface-muted grid place-items-center text-ink-muted shrink-0">
        {icon}
      </div>
      <div>
        <div className="text-[11.5px] uppercase tracking-[0.06em] text-ink-subtle font-medium">
          {label}
        </div>
        <div className="text-[14px] font-medium">{value}</div>
      </div>
    </div>
  );
}
