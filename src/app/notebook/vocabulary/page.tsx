import { getVocabulary } from "@/lib/data";
import { DEV_USER_ID } from "@/lib/constants";
import { VocabularyList } from "@/components/notebook/vocabulary-list";

export const dynamic = "force-dynamic";

export default function VocabularyPage() {
  const vocabulary = getVocabulary(DEV_USER_ID);

  return (
    <div data-testid="vocabulary-page" className="h-full overflow-auto p-6 md:p-10">
      <VocabularyList items={vocabulary} />
    </div>
  );
}
