import { CheckCircle2, Circle } from "lucide-react";

import { cn } from "@/lib/utils";

type PillTone = "muted" | "sky" | "rose" | "emerald" | "amber";

function getPillToneClass(tone: PillTone) {
  if (tone === "sky") return "ui-tone-sky-panel ui-tone-sky-text";
  if (tone === "emerald") return "ui-tone-emerald-panel ui-tone-emerald-text";
  if (tone === "amber") return "ui-tone-amber-panel ui-tone-amber-text";
  if (tone === "rose") return "ui-tone-rose-panel ui-tone-rose-text";
  return "bg-muted text-muted-foreground";
}

export function MetricPill({
  label,
  tone,
  className,
}: {
  label: string;
  tone: PillTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "rounded-full border px-2.5 py-1 text-[11px] font-medium",
        getPillToneClass(tone),
        className
      )}
    >
      {label}
    </span>
  );
}

export function PriorityPill({
  level,
  className,
}: {
  level: "urgent" | "high" | "watch";
  className?: string;
}) {
  return (
    <MetricPill
      label={level}
      tone={level === "urgent" ? "rose" : level === "high" ? "amber" : "sky"}
      className={className}
    />
  );
}

export function PriorityBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "mb-2 inline-flex items-center rounded-full bg-primary px-2 py-0.5 text-[11px] font-medium text-primary-foreground",
        className
      )}
    >
      Priority
    </span>
  );
}

export function FocusWordStepBadge({
  done,
  label,
  className,
}: {
  done: boolean;
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5",
        done
          ? "border ui-tone-emerald-panel ui-tone-emerald-text"
          : "bg-background text-muted-foreground",
        className
      )}
    >
      {done ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
      {label}
    </span>
  );
}
