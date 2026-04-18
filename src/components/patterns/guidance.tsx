import type { HTMLAttributes, ReactNode } from "react";

type GuidanceTone = "muted" | "emerald" | "amber" | "rose" | "sky" | "violet" | "orange";

function getToneClasses(tone: GuidanceTone) {
  switch (tone) {
    case "emerald":
      return {
        panel: "ui-tone-emerald-panel",
        title: "ui-tone-emerald-text",
        text: "ui-tone-emerald-soft-text",
      };
    case "amber":
      return {
        panel: "ui-tone-amber-panel",
        title: "ui-tone-amber-text",
        text: "ui-tone-amber-soft-text",
      };
    case "rose":
      return {
        panel: "ui-tone-rose-panel",
        title: "ui-tone-rose-text",
        text: "ui-tone-rose-soft-text",
      };
    case "sky":
      return {
        panel: "ui-tone-sky-panel",
        title: "ui-tone-sky-text",
        text: "ui-tone-sky-soft-text",
      };
    case "violet":
      return {
        panel: "ui-tone-violet-panel",
        title: "ui-tone-violet-text",
        text: "ui-tone-violet-soft-text",
      };
    case "orange":
      return {
        panel: "ui-tone-orange-panel",
        title: "ui-tone-orange-text",
        text: "ui-tone-orange-soft-text",
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
