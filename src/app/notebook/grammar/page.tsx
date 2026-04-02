import { getGrammarPoints } from "@/lib/data";
import { getAuthUserId } from "@/lib/auth-utils";
import { isProUser } from "@/lib/subscription";
import { GrammarPointsList } from "@/components/notebook/grammar-points-list";
import { UpgradePrompt } from "@/components/upgrade-prompt";

export const dynamic = "force-dynamic";

export default async function GrammarPage() {
  const userId = await getAuthUserId();
  const isPro = await isProUser(userId);

  if (!isPro) {
    return (
      <div data-testid="grammar-page" className="flex h-full items-center justify-center p-10">
        <div className="w-full max-w-md text-center">
          <h2 className="mb-2 text-xl font-bold text-gray-900">Grammar Points</h2>
          <p className="mb-6 text-sm text-gray-500">
            In-depth grammar notes are available on the Pro plan.
          </p>
          <UpgradePrompt reason="Upgrade to Pro to access grammar deep-dives for all HSK levels." />
        </div>
      </div>
    );
  }

  const grammarPoints = await getGrammarPoints(userId);

  return (
    <div data-testid="grammar-page" className="h-full overflow-auto p-6 pb-20 md:p-10 lg:pb-10">
      <GrammarPointsList items={grammarPoints} />
    </div>
  );
}
