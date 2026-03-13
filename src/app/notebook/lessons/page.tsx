import { getStudyGuideData } from "@/lib/data";
import { getAuthUserId } from "@/lib/auth-utils";
import { StudyGuide } from "@/components/notebook/study-guide";

export const dynamic = "force-dynamic";

export default async function StudyGuidePage() {
  const userId = await getAuthUserId();
  const data = getStudyGuideData(userId, 1);

  return (
    <div data-testid="study-guide-page" className="h-full overflow-auto p-6 pb-20 md:p-10 lg:pb-10">
      <StudyGuide initialData={data} />
    </div>
  );
}
