import { getLessons } from "@/lib/data";
import { LessonsList } from "@/components/notebook/lessons-list";

export const dynamic = "force-dynamic";

export default function LessonsPage() {
  const lessons = getLessons();

  return (
    <div data-testid="lessons-page" className="h-full overflow-auto p-6 md:p-10">
      <LessonsList items={lessons} />
    </div>
  );
}
