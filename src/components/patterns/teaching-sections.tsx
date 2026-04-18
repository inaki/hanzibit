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
    muted: "border bg-card",
    sky: "border-sky-500/20 bg-sky-500/10",
    amber: "border-amber-500/20 bg-amber-500/10",
    rose: "border-rose-500/20 bg-rose-500/10",
    emerald: "border-emerald-500/20 bg-emerald-500/10",
    violet: "border-violet-500/20 bg-violet-500/10",
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
