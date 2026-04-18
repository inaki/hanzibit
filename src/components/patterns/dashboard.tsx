import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type DashboardTone = "default" | "sky" | "emerald" | "orange";

function getDashboardPanelTone(tone: DashboardTone) {
  if (tone === "sky") return "ui-tone-sky-panel";
  if (tone === "emerald") return "ui-tone-emerald-panel";
  if (tone === "orange") return "ui-tone-orange-panel";
  return "border-border bg-card";
}

export function DashboardSection({
  title,
  icon: Icon,
  action,
  children,
  className = "",
}: {
  title?: ReactNode;
  icon?: LucideIcon;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border bg-card p-6 ${className}`.trim()}>
      {title || action ? (
        <div className="mb-4 flex items-center gap-2">
          {Icon ? <Icon className="ui-tone-orange-text h-4 w-4" /> : null}
          {title ? <h2 className="text-sm font-semibold text-foreground/80">{title}</h2> : null}
          {action ? <div className="ml-auto">{action}</div> : null}
        </div>
      ) : null}
      {children}
    </div>
  );
}

export function DashboardPanel({
  children,
  tone = "default",
  className = "",
}: {
  children: ReactNode;
  tone?: DashboardTone;
  className?: string;
}) {
  return <div className={`rounded-xl border p-5 ${getDashboardPanelTone(tone)} ${className}`.trim()}>{children}</div>;
}

export function DashboardStatCard({
  icon: Icon,
  label,
  children,
  className = "",
}: {
  icon?: LucideIcon;
  label: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <DashboardPanel className={className}>
      <div className="mb-3 flex items-center gap-2">
        {Icon ? <Icon className="h-4 w-4" /> : null}
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">{label}</span>
      </div>
      {children}
    </DashboardPanel>
  );
}
