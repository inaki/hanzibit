import { getFlashcards, getDueFlashcardCount } from "@/lib/data";
import { DEV_USER_ID } from "@/lib/constants";
import { FlashcardPractice } from "@/components/notebook/flashcard-practice";

export const dynamic = "force-dynamic";

export default function FlashcardsPage() {
  const flashcards = getFlashcards(DEV_USER_ID);
  const dueCount = getDueFlashcardCount(DEV_USER_ID);

  return (
    <div data-testid="flashcards-page" className="h-full overflow-auto p-6 md:p-10">
      <FlashcardPractice cards={flashcards} dueCount={dueCount} />
    </div>
  );
}
