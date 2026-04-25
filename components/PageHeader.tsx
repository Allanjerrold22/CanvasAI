import { BellIcon } from "@phosphor-icons/react/dist/ssr";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
};

export default function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex items-end justify-between gap-4 flex-wrap">
      <div>
        <h1 className="text-[28px] font-semibold tracking-tight leading-tight">
          {title}
        </h1>
        {subtitle ? (
          <p className="text-[13.5px] text-ink-muted mt-1">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
