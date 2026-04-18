import type { LucideIcon } from "lucide-react";

type TeachingMetricTone =
  | "orange"
  | "rose"
  | "amber"
  | "sky"
  | "violet"
  | "emerald"
  | "muted";

const toneClasses: Record<TeachingMetricTone, string> = {
  orange: "border-[var(--cn-orange)]/20 bg-[var(--cn-orange)]/10",
  rose: "border-rose-500/20 bg-rose-500/10",
  amber: "border-amber-500/20 bg-amber-500/10",
  sky: "border-sky-500/20 bg-sky-500/10",
  violet: "border-violet-500/20 bg-violet-500/10",
  emerald: "border-emerald-500/20 bg-emerald-500/10",
  muted: "border-border bg-card",
};

export function TeachingToneMetricCard({
  label,
  title,
  value,
  tone,
  icon: Icon,
  note,
}: {
  label?: string;
  title?: string;
  value: string | number;
  tone: TeachingMetricTone;
  icon?: LucideIcon;
  note?: string;
}) {
  const resolvedLabel = title ?? label ?? "";

  return (
    <div className={`rounded-xl border p-4 ${toneClasses[tone]}`}>
      <div className="flex items-center gap-2 text-muted-foreground">
        {Icon ? <Icon className="h-4 w-4 text-[var(--cn-orange)]" /> : null}
        <p className="text-xs font-semibold uppercase tracking-[0.18em]">{resolvedLabel}</p>
      </div>
      <p className="mt-2 text-xl font-bold text-foreground">{value}</p>
      {note ? <p className="mt-2 text-xs text-muted-foreground">{note}</p> : null}
    </div>
  );
}
