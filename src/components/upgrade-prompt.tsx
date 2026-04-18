import { Lock } from "lucide-react";

interface UpgradePromptProps {
  reason: string;
}

export function UpgradePrompt({ reason }: UpgradePromptProps) {
  return (
    <div className="ui-tone-amber-panel rounded-lg border p-4">
      <div className="flex items-start gap-3">
        <Lock className="ui-tone-amber-text mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <p className="text-sm text-foreground/90">{reason}</p>
          <a
            href="/pricing"
            className="ui-tone-amber-text mt-2 inline-block text-sm font-medium underline underline-offset-2 hover:opacity-80"
          >
            Upgrade to Pro
          </a>
        </div>
      </div>
    </div>
  );
}
