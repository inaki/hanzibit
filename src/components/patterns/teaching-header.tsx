import type { ReactNode } from "react";

export function TeachingPageHeader({
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
        <div className="mt-2 max-w-3xl text-sm text-muted-foreground">{description}</div>
      </div>
      {badge ? (
        <div className="ui-tone-orange-panel ui-tone-orange-text inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium">
          {badge}
        </div>
      ) : null}
    </div>
  );
}
