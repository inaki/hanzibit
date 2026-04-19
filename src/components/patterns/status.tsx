import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type StatusPillVariant =
  | "priority"
  | "focus"
  | "done"
  | "pending"
  | "watch"
  | "caution"
  | "urgent";

const pillVariantClasses: Record<StatusPillVariant, string> = {
  priority: "bg-[var(--cn-orange)] text-white",
  focus:
    "bg-[var(--cn-orange-light)] text-[var(--cn-orange-dark)] border border-[var(--cn-orange)]/25",
  done: "border ui-tone-emerald-panel ui-tone-emerald-text",
  pending: "bg-muted text-muted-foreground",
  watch: "border ui-tone-sky-panel ui-tone-sky-text",
  caution: "border ui-tone-amber-panel ui-tone-amber-text",
  urgent: "border ui-tone-rose-panel ui-tone-rose-text",
};

export function StatusPill({
  variant,
  children,
  className,
}: {
  variant: StatusPillVariant;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium",
        pillVariantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function MetricPill({
  label,
  tone,
  className,
}: {
  label: string;
  tone: "muted" | "sky" | "rose" | "emerald" | "amber" | "violet";
  className?: string;
}) {
  const variantMap: Record<typeof tone, StatusPillVariant> = {
    muted: "pending",
    sky: "watch",
    rose: "urgent",
    emerald: "done",
    amber: "caution",
    violet: "watch",
  };
  return (
    <StatusPill variant={variantMap[tone]} className={className}>
      {label}
    </StatusPill>
  );
}

export function PriorityPill({
  level,
  className,
}: {
  level: "urgent" | "high" | "watch";
  className?: string;
}) {
  const variantMap = { urgent: "urgent", high: "caution", watch: "watch" } as const;
  return (
    <StatusPill variant={variantMap[level]} className={className}>
      {level}
    </StatusPill>
  );
}

export function PriorityBadge({ className }: { className?: string }) {
  return (
    <StatusPill variant="priority" className={cn("mb-2", className)}>
      Priority
    </StatusPill>
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
    <StatusPill variant={done ? "done" : "pending"} className={className}>
      {label}
    </StatusPill>
  );
}
