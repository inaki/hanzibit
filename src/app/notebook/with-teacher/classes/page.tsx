import { ClassesPageContent } from "@/app/notebook/classes/page";

export const dynamic = "force-dynamic";

export default async function LearnerTeacherClassesPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
}) {
  return (
    <ClassesPageContent
      searchParams={searchParams}
      variant="hub"
      basePath="/notebook/with-teacher/classes"
    />
  );
}
