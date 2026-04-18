import { getFlashcards, getDueFlashcardCount } from "@/lib/data";
import { getAuthUserId } from "@/lib/auth-utils";
import { FlashcardPractice } from "@/components/notebook/flashcard-practice";

export const dynamic = "force-dynamic";

export default async function FlashcardsPage({
  searchParams,
}: {
  searchParams?: Promise<{ mode?: string; focus?: string; wordId?: string; level?: string; beginner?: string }>;
}) {
  const params = searchParams ? await searchParams : undefined;
  const userId = await getAuthUserId();
  const flashcards = await getFlashcards(userId);
  const dueCount = await getDueFlashcardCount(userId);
  const initialFilter = params?.mode === "due" ? "due" : "all";
  const initialFocusFront = params?.focus ?? "";
  const initialFocusWordId = params?.wordId ?? "";
  const initialFocusLevel = params?.level ?? "";
  const beginnerMode = params?.beginner === "1";

  return (
    <div data-testid="flashcards-page" className="h-full overflow-auto p-6 pb-20 md:p-10 lg:pb-10">
      <FlashcardPractice
        cards={flashcards}
        dueCount={dueCount}
        initialFilter={initialFilter}
        initialFocusFront={initialFocusFront}
        initialFocusWordId={initialFocusWordId}
        initialFocusLevel={initialFocusLevel}
        beginnerMode={beginnerMode}
      />
    </div>
  );
}
