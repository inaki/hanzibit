import { ClassroomDetailPageContent } from "@/app/notebook/classes/[classroomId]/page";

export const dynamic = "force-dynamic";

export default async function LearnerTeacherClassroomDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ classroomId: string }>;
  searchParams: Promise<{ success?: string; templateId?: string }>;
}) {
  return (
    <ClassroomDetailPageContent
      params={params}
      searchParams={searchParams}
      variant="hub"
      baseClassroomPath="/notebook/with-teacher/classes"
      baseAssignmentPath="/notebook/with-teacher/assignments"
    />
  );
}
