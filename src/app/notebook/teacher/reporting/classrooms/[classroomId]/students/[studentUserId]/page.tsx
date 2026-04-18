import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { UserRoundSearch } from "lucide-react";
import { getAuthUserId } from "@/lib/auth-utils";
import { canViewTeacherReporting } from "@/lib/classroom-permissions";
import { isTeacherUser } from "@/lib/classrooms";
import { getTeacherStudentReporting } from "@/lib/teacher-reporting";
import {
  TeachingCollectionSection,
  TeachingEntityCard,
  TeachingPageHeader,
  TeachingToneMetricCard,
} from "@/components/patterns/teaching";

export const dynamic = "force-dynamic";

export default async function TeacherStudentReportingPage({
  params,
}: {
  params: Promise<{ classroomId: string; studentUserId: string }>;
}) {
  const userId = await getAuthUserId();
  const { classroomId, studentUserId } = await params;

  if (!(await isTeacherUser(userId))) {
    redirect("/notebook/classes");
  }

  if (!(await canViewTeacherReporting(userId, classroomId))) {
    notFound();
  }

  const reporting = await getTeacherStudentReporting(userId, classroomId, studentUserId);
  if (!reporting) {
    notFound();
  }

  return (
    <div data-testid="teacher-student-reporting-page" className="h-full overflow-auto p-6 pb-20 md:p-10 lg:pb-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <TeachingPageHeader
          title={reporting.student.student_name}
          description={reporting.classroom.name}
          badge={
            <Link
              href={`/notebook/teacher/reporting/classrooms/${reporting.classroom.id}`}
              className="inline-flex items-center text-xs font-medium"
            >
              Back to Classroom
            </Link>
          }
        />

        <div className="grid gap-4 sm:grid-cols-4">
          <TeachingToneMetricCard title="Assignments" value={reporting.student.assignment_count} tone="muted" />
          <TeachingToneMetricCard title="Submitted" value={reporting.student.submitted_count} tone="muted" />
          <TeachingToneMetricCard title="Reviewed" value={reporting.student.reviewed_count} tone="sky" />
          <TeachingToneMetricCard title="Missing" value={reporting.student.missing_count} tone="rose" />
        </div>

        <TeachingCollectionSection title="Assignment Status" icon={UserRoundSearch}>
          <div className="space-y-3">
            {reporting.assignmentRows.map((row) => (
              <TeachingEntityCard
                key={row.assignment_id}
                href={`/notebook/assignments/${row.assignment_id}`}
                badges={
                  <span className="rounded-full border bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                    {(row.status || "not started").replaceAll("_", " ")}
                  </span>
                }
                title={row.assignment_title}
                subtitle={
                  row.due_at ? `Due ${new Date(row.due_at).toLocaleDateString("en-US")}` : "No due date"
                }
              >
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {row.submitted_at ? <span>Submitted {new Date(row.submitted_at).toLocaleDateString("en-US")}</span> : null}
                  {row.reviewed_at ? <span>Reviewed {new Date(row.reviewed_at).toLocaleDateString("en-US")}</span> : null}
                </div>
              </TeachingEntityCard>
            ))}
          </div>
        </TeachingCollectionSection>
      </div>
    </div>
  );
}
