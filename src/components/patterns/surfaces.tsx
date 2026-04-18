import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function SectionCard({
  title,
  description,
  icon: Icon,
  action,
  children,
  className = "",
}: {
  title?: ReactNode;
  description?: ReactNode;
  icon?: LucideIcon;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border bg-card p-5 ${className}`.trim()}>
      {(title || description || action) && (
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            {title ? (
              <div className="flex items-center gap-2">
                {Icon ? <Icon className="ui-tone-orange-text h-4 w-4" /> : null}
                <h3 className="text-sm font-semibold text-foreground/80">{title}</h3>
              </div>
            ) : null}
            {description ? <div className="mt-1 text-xs text-muted-foreground">{description}</div> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      )}
      {children}
    </div>
  );
}

export function InfoPanel({
  title,
  icon: Icon,
  children,
  className = "",
  titleClassName = "text-muted-foreground/70",
}: {
  title: ReactNode;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
  titleClassName?: string;
}) {
  return (
    <div className={`rounded-lg border border-border/80 bg-card/90 p-4 shadow-sm ${className}`.trim()}>
      <p className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider ${titleClassName}`.trim()}>
        {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
        {title}
      </p>
      <div className="mt-2">{children}</div>
    </div>
  );
}
