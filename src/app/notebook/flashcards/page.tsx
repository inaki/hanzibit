import { getFlashcards, getDueFlashcardCount } from "@/lib/data";
import { getAuthUserId } from "@/lib/auth-utils";
import { FlashcardPractice } from "@/components/notebook/flashcard-practice";

export const dynamic = "force-dynamic";

export default async function FlashcardsPage() {
  const userId = await getAuthUserId();
  const flashcards = getFlashcards(userId);
  const dueCount = getDueFlashcardCount(userId);

  return (
    <div data-testid="flashcards-page" className="h-full overflow-auto p-6 pb-20 md:p-10 lg:pb-10">
      <FlashcardPractice cards={flashcards} dueCount={dueCount} />
    </div>
  );
}
