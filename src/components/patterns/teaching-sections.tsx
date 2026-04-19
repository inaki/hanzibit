import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { EmptyStateNotice } from "@/components/patterns/guidance";
import { SectionCard } from "@/components/patterns/surfaces";

export function TeachingExplainerBlock({
  children,
  title,
  body,
  tone = "muted",
}: {
  children?: ReactNode;
  title?: ReactNode;
  body?: ReactNode;
  tone?: "muted" | "sky" | "amber" | "rose" | "emerald" | "violet";
}) {
  const toneClasses = {
    muted: "bg-card card-ring",
    sky: "ui-tone-sky-panel",
    amber: "ui-tone-amber-panel",
    rose: "ui-tone-rose-panel",
    emerald: "ui-tone-emerald-panel",
    violet: "ui-tone-violet-panel",
  } as const;

  const content = body ?? children;

  return (
    <div className={`rounded-2xl p-5 text-sm text-muted-foreground ${toneClasses[tone]}`}>
      {title ? (
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {title}
        </p>
      ) : null}
      {content}
    </div>
  );
}

export function TeachingCollectionSection({
  title,
  icon,
  emptyMessage,
  isEmpty,
  empty,
  children,
}: {
  title: string;
  icon?: LucideIcon;
  emptyMessage?: ReactNode;
  isEmpty?: boolean;
  empty?: boolean;
  children: ReactNode;
}) {
  const resolvedEmpty = empty ?? isEmpty ?? false;

  return (
    <SectionCard title={title} icon={icon} className="rounded-2xl">
      {resolvedEmpty ? <EmptyStateNotice>{emptyMessage}</EmptyStateNotice> : children}
    </SectionCard>
  );
}
