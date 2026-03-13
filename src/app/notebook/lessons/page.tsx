import { getStudyGuideData } from "@/lib/data";
import { DEV_USER_ID } from "@/lib/constants";
import { StudyGuide } from "@/components/notebook/study-guide";

export const dynamic = "force-dynamic";

export default function StudyGuidePage() {
  const data = getStudyGuideData(DEV_USER_ID, 1);

  return (
    <div data-testid="study-guide-page" className="h-full overflow-auto p-6 md:p-10">
      <StudyGuide initialData={data} />
    </div>
  );
}
