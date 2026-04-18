import { cn } from "@/lib/utils";

type Tone = "default" | "muted" | "sky" | "rose" | "emerald" | "amber";

function getSurfaceToneClass(tone: Tone) {
  if (tone === "sky") return "border-sky-500/20 bg-sky-500/10";
  if (tone === "emerald") return "border-emerald-500/20 bg-emerald-500/10";
  if (tone === "amber") return "border-amber-500/20 bg-amber-500/10";
  if (tone === "rose") return "border-rose-500/20 bg-rose-500/10";
  if (tone === "muted") return "border-border bg-muted/40";
  return "border-border bg-card";
}

function getTextToneClass(tone: Exclude<Tone, "default">) {
  if (tone === "sky") return "text-sky-400";
  if (tone === "emerald") return "text-emerald-400";
  if (tone === "amber") return "text-amber-300";
  if (tone === "rose") return "text-rose-300";
  return "text-muted-foreground";
}

export function SummaryMetric({
  label,
  value,
  className,
}: {
  label: string;
  value: number | string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-3xl font-bold text-foreground">{value}</p>
      <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

export function SummaryStatCard({
  label,
  value,
  tone = "default",
  className,
}: {
  label: string;
  value: number | string;
  tone?: Tone;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border p-5", getSurfaceToneClass(tone), className)}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-3 text-3xl font-bold text-foreground">{value}</p>
    </div>
  );
}

export function CompactStatCard({
  label,
  value,
  tone,
  className,
}: {
  label: string;
  value: number | string;
  tone: "sky" | "rose" | "emerald" | "amber";
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border p-4", getSurfaceToneClass(tone), className)}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-3 text-3xl font-bold text-foreground">{value}</p>
    </div>
  );
}

export function ActionRow({
  label,
  value,
  tone,
  suffix = "pending",
  className,
}: {
  label: string;
  value: number | string;
  tone: "sky" | "rose" | "emerald" | "amber";
  suffix?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-2xl border border-border/70 bg-card/70 px-4 py-3",
        className
      )}
    >
      <span
        className={cn(
          "rounded-full border px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
          getSurfaceToneClass(tone),
          getTextToneClass(tone)
        )}
      >
        {label}
      </span>
      <span className="text-sm font-semibold text-foreground">
        {value} {suffix}
      </span>
    </div>
  );
}

export function HealthRow({
  label,
  value,
  tone,
  className,
}: {
  label: string;
  value: number | string;
  tone: "sky" | "rose" | "amber";
  className?: string;
}) {
  const dotClass =
    tone === "sky" ? "bg-sky-400" : tone === "amber" ? "bg-amber-300" : "bg-rose-300";

  return (
    <div className={cn("flex items-center justify-between gap-4 text-sm", className)}>
      <span className="text-foreground">{label}</span>
      <span className="flex items-center gap-2 font-medium text-foreground">
        <span className={cn("h-2 w-2 rounded-full", dotClass)} />
        {value}
      </span>
    </div>
  );
}

export function CompactBadgeRow({
  label,
  value,
  tone,
  className,
}: {
  label: string;
  value: number | string;
  tone: "muted" | "sky" | "rose" | "amber";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-2xl border px-4 py-3 text-sm",
        getSurfaceToneClass(tone),
        tone === "muted" ? "text-muted-foreground" : getTextToneClass(tone),
        className
      )}
    >
      <span className="font-medium">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
