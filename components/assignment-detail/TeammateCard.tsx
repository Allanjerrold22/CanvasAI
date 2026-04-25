import { Teammate } from "@/lib/courses";

type Props = {
  teammate: Teammate;
};

export default function TeammateCard({ teammate }: Props) {
  return (
    <li className="px-5 py-4 flex items-center gap-4">
      {/* Avatar with online indicator */}
      <div className="relative shrink-0">
        <div
          className="w-10 h-10 rounded-full grid place-items-center text-white text-[13px] font-semibold"
          style={{ backgroundColor: teammate.avatarColor }}
        >
          {teammate.initials}
        </div>
        <div
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-surface ${
            teammate.online
              ? "bg-emerald-500"
              : "bg-surface-muted border-ink-border"
          }`}
        />
      </div>

      {/* Name + role */}
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-semibold">{teammate.name}</div>
        <div className="text-[12.5px] text-ink-muted">{teammate.role}</div>
      </div>

      {/* Online status text */}
      <span
        className={`text-[12px] font-medium ${
          teammate.online ? "text-emerald-600" : "text-ink-subtle"
        }`}
      >
        {teammate.online ? "Online" : "Offline"}
      </span>
    </li>
  );
}
