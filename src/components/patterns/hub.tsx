import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { GuidanceBanner } from "@/components/patterns/guidance";
import { SectionCard } from "@/components/patterns/surfaces";

export function HubPageHeader({
  title,
  description,
  badge,
}: {
  title: string;
  description: ReactNode;
  badge?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{description}</p>
      </div>
      {badge ? (
        <div className="inline-flex items-center rounded-full border border-[var(--cn-orange)]/20 bg-[var(--cn-orange)]/10 px-3 py-1.5 text-xs font-medium text-[var(--cn-orange)]">
          {badge}
        </div>
      ) : null}
    </div>
  );
}

export function HubFocusSection({
  title,
  icon,
  pills,
  tone,
  guidanceTitle,
  guidanceBody,
}: {
  title: string;
  icon: LucideIcon;
  pills: ReactNode;
  tone: "sky" | "amber" | "violet" | "emerald";
  guidanceTitle: string;
  guidanceBody: ReactNode;
}) {
  return (
    <SectionCard title={title} icon={icon}>
      <div className="flex flex-wrap gap-2">{pills}</div>

      <GuidanceBanner tone={tone} className="mt-4">
        <p className="text-sm font-medium text-foreground">{guidanceTitle}</p>
        <div className="mt-2 text-sm">{guidanceBody}</div>
      </GuidanceBanner>
    </SectionCard>
  );
}
