import { getHskWords, getHskLevelSummaries } from "@/lib/data";
import { HskVocabularyList } from "@/components/notebook/vocabulary-list";

export const dynamic = "force-dynamic";

export default function VocabularyPage() {
  const summaries = getHskLevelSummaries();
  const words = getHskWords();

  return (
    <div data-testid="vocabulary-page" className="h-full overflow-auto p-6 pb-20 md:p-10 lg:pb-10">
      <HskVocabularyList words={words} summaries={summaries} />
    </div>
  );
}
