import type { HTMLAttributes, ReactNode } from "react";

type GuidanceTone = "muted" | "emerald" | "amber" | "rose" | "sky" | "violet" | "orange";

function getToneClasses(tone: GuidanceTone) {
  switch (tone) {
    case "emerald":
      return {
        panel: "border-emerald-500/20 bg-emerald-500/10",
        title: "text-emerald-400",
        text: "text-emerald-100",
      };
    case "amber":
      return {
        panel: "border-amber-500/20 bg-amber-500/10",
        title: "text-amber-300",
        text: "text-amber-100",
      };
    case "rose":
      return {
        panel: "border-rose-500/20 bg-rose-500/10",
        title: "text-rose-300",
        text: "text-rose-100",
      };
    case "sky":
      return {
        panel: "border-sky-500/20 bg-sky-500/10",
        title: "text-sky-400",
        text: "text-foreground",
      };
    case "violet":
      return {
        panel: "border-violet-500/20 bg-violet-500/10",
        title: "text-violet-300",
        text: "text-violet-100",
      };
    case "orange":
      return {
        panel: "border-[var(--cn-orange)]/20 bg-[var(--cn-orange)]/10",
        title: "text-[var(--cn-orange)]",
        text: "text-foreground",
      };
    case "muted":
    default:
      return {
        panel: "border-border bg-card/80",
        title: "text-muted-foreground",
        text: "text-muted-foreground",
      };
  }
}

export function GuidanceBanner({
  title,
  children,
  tone = "muted",
  className = "",
  ...props
}: {
  title?: string;
  children: ReactNode;
  tone?: GuidanceTone;
  className?: string;
} & HTMLAttributes<HTMLDivElement>) {
  const tones = getToneClasses(tone);
  return (
    <div
      {...props}
      className={`rounded-lg border px-4 py-4 ${tones.panel} ${className}`.trim()}
    >
      {title ? (
        <p className={`text-xs font-semibold uppercase tracking-wider ${tones.title}`}>{title}</p>
      ) : null}
      <div className={`${title ? "mt-2" : ""} ${tones.text}`.trim()}>{children}</div>
    </div>
  );
}

export function EmptyStateNotice({
  children,
  className = "",
  ...props
}: {
  children: ReactNode;
  className?: string;
} & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={`rounded-xl border border-dashed p-4 text-sm text-muted-foreground ${className}`.trim()}
    >
      {children}
    </div>
  );
}
