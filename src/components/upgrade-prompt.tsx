import { Lock } from "lucide-react";

interface UpgradePromptProps {
  reason: string;
}

export function UpgradePrompt({ reason }: UpgradePromptProps) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-start gap-3">
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <div>
          <p className="text-sm text-amber-800">{reason}</p>
          <a
            href="/pricing"
            className="mt-2 inline-block text-sm font-medium text-amber-700 underline underline-offset-2 hover:text-amber-900"
          >
            Upgrade to Pro
          </a>
        </div>
      </div>
    </div>
  );
}
