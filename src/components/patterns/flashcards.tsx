import * as React from "react";
import { cn } from "@/lib/utils";

export function FlashcardPanel({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rounded-xl bg-card card-ring", className)} {...props}>
      {children}
    </div>
  );
}

export function FlashcardActionPanel({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <FlashcardPanel className={cn("p-4", className)} {...props}>
      {children}
    </FlashcardPanel>
  );
}

export function FlashcardBrowseCard({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <FlashcardPanel
      className={cn(
        "p-5 transition-colors hover:bg-[var(--ui-tone-orange-surface)]",
        className
      )}
      {...props}
    >
      {children}
    </FlashcardPanel>
  );
}

export function FlashcardNoticePanel({
  className,
  children,
  tone = "default",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  tone?: "default" | "orange";
}) {
  return (
    <FlashcardPanel
      className={cn(
        "px-4 py-3",
        tone === "orange" ? "ui-tone-orange-panel" : "bg-muted/30",
        className
      )}
      {...props}
    >
      {children}
    </FlashcardPanel>
  );
}

export function FlashcardControlButton({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "press-down rounded-[10px] border bg-card px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 disabled:opacity-30",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function FlashcardProgressBar({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  return (
    <div className={cn("mt-6 h-[10px] rounded-full bg-muted", className)}>
      <div
        className="ui-tone-orange-dot h-full rounded-full transition-all"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}
