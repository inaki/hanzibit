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
  orange: "ui-tone-orange-panel",
  rose: "ui-tone-rose-panel",
  amber: "ui-tone-amber-panel",
  sky: "ui-tone-sky-panel",
  violet: "ui-tone-violet-panel",
  emerald: "ui-tone-emerald-panel",
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
        {Icon ? <Icon className="ui-tone-orange-text h-4 w-4" /> : null}
        <p className="text-xs font-semibold uppercase tracking-[0.18em]">{resolvedLabel}</p>
      </div>
      <p className="mt-2 text-xl font-bold text-foreground">{value}</p>
      {note ? <p className="mt-2 text-xs text-muted-foreground">{note}</p> : null}
    </div>
  );
}
