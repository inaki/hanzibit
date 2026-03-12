import { getGrammarPoints } from "@/lib/data";
import { DEV_USER_ID } from "@/lib/constants";
import { GrammarPointsList } from "@/components/notebook/grammar-points-list";

export const dynamic = "force-dynamic";

export default function GrammarPage() {
  const grammarPoints = getGrammarPoints(DEV_USER_ID);

  return (
    <div data-testid="grammar-page" className="h-full overflow-auto p-6 md:p-10">
      <GrammarPointsList items={grammarPoints} />
    </div>
  );
}
