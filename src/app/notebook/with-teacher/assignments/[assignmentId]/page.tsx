import { AssignmentDetailPageContent } from "@/app/notebook/assignments/[assignmentId]/page";

export const dynamic = "force-dynamic";

export default async function LearnerTeacherAssignmentDetailPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  return (
    <AssignmentDetailPageContent
      params={params}
      variant="hub"
      classroomBasePath="/notebook/with-teacher/classes"
    />
  );
}
