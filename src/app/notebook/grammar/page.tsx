import { getGrammarPoints } from "@/lib/data";
import { getAuthUserId } from "@/lib/auth-utils";
import { GrammarPointsList } from "@/components/notebook/grammar-points-list";

export const dynamic = "force-dynamic";

export default async function GrammarPage() {
  const userId = await getAuthUserId();
  const grammarPoints = await getGrammarPoints(userId);

  return (
    <div data-testid="grammar-page" className="h-full overflow-auto p-6 pb-20 md:p-10 lg:pb-10">
      <GrammarPointsList items={grammarPoints} />
    </div>
  );
}
