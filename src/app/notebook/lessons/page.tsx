import { getStudyGuideData } from "@/lib/data";
import { getAuthUserId } from "@/lib/auth-utils";
import { StudyGuide } from "@/components/notebook/study-guide";

export const dynamic = "force-dynamic";

export default async function StudyGuidePage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string; word?: string; wordId?: string; assignmentId?: string; beginner?: string }>;
}) {
  const { level, assignmentId, beginner } = await searchParams;
  const userId = await getAuthUserId();
  const requestedLevel = Number.parseInt(level ?? "1", 10);
  const safeLevel =
    Number.isInteger(requestedLevel) && requestedLevel >= 1 && requestedLevel <= 6
      ? requestedLevel
      : 1;
  const data = await getStudyGuideData(userId, safeLevel);
  const beginnerMode = beginner === "1";

  return (
    <div data-testid="study-guide-page" className="h-full overflow-hidden">
      <StudyGuide initialData={data} assignmentId={assignmentId} beginnerMode={beginnerMode} />
    </div>
  );
}
