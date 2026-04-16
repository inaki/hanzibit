import { AssignmentsPageContent } from "@/app/notebook/assignments/page";

export const dynamic = "force-dynamic";

export default async function LearnerTeacherAssignmentsPage() {
  return <AssignmentsPageContent variant="hub" />;
}
