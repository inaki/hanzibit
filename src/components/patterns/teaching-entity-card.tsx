import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function TeachingEntityCard({
  href,
  badges,
  title,
  subtitle,
  meta,
  children,
}: {
  href: string;
  badges?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  meta?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="block rounded-2xl border bg-card p-5 transition-colors hover:border-[var(--ui-tone-orange-border)] hover:bg-muted/20"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          {badges ? <div className="flex flex-wrap items-center gap-3">{badges}</div> : null}
          <div>
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
          </div>
        </div>
        <div className="ui-tone-orange-text flex items-center">
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>

      {meta ? (
        <div className="mt-4 grid gap-3 text-xs text-muted-foreground md:grid-cols-4">{meta}</div>
      ) : null}
      {children}
    </Link>
  );
}
