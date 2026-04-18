import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function ActionRailButton({
  label,
  icon: Icon,
  onClick,
  disabled,
  active = false,
  danger = false,
  filled = false,
  children,
  className = "",
  testId,
}: {
  label: string;
  icon?: LucideIcon;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  danger?: boolean;
  filled?: boolean;
  children?: ReactNode;
  className?: string;
  testId?: string;
}) {
  const classes = active
    ? "bg-[var(--cn-orange)] text-white"
    : filled
      ? danger
        ? "bg-red-500 text-white hover:bg-red-600"
        : "bg-[var(--cn-orange)] text-white hover:bg-[var(--cn-orange-dark)]"
      : danger
        ? "text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
        : "text-muted-foreground/70 hover:bg-muted hover:text-foreground";

  return (
    <Tooltip>
      <TooltipTrigger
        data-testid={testId}
        onClick={onClick}
        disabled={disabled}
        className={`rounded-lg p-2.5 transition-colors disabled:opacity-30 ${classes} ${className}`.trim()}
      >
        {children ?? (Icon ? <Icon className="h-[18px] w-[18px]" /> : null)}
      </TooltipTrigger>
      <TooltipContent side="left">{label}</TooltipContent>
    </Tooltip>
  );
}
