import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BarChart3, Users } from "lucide-react";
import { getAuthUserId } from "@/lib/auth-utils";
import { canViewTeacherReporting } from "@/lib/classroom-permissions";
import { isTeacherUser } from "@/lib/classrooms";
import { getTeacherClassroomReporting } from "@/lib/teacher-reporting";
import {
  TeachingCollectionSection,
  TeachingEntityCard,
  TeachingPageHeader,
  TeachingToneMetricCard,
} from "@/components/patterns/teaching";

export const dynamic = "force-dynamic";

export default async function TeacherClassroomReportingPage({
  params,
}: {
  params: Promise<{ classroomId: string }>;
}) {
  const userId = await getAuthUserId();
  const { classroomId } = await params;

  if (!(await isTeacherUser(userId))) {
    redirect("/notebook/classes");
  }

  if (!(await canViewTeacherReporting(userId, classroomId))) {
    notFound();
  }

  const reporting = await getTeacherClassroomReporting(userId, classroomId);
  if (!reporting) {
    notFound();
  }

  return (
    <div data-testid="teacher-classroom-reporting-page" className="h-full overflow-auto p-6 pb-20 md:p-10 lg:pb-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <TeachingPageHeader
          title={reporting.classroom.name}
          description="Drill-down reporting for this classroom."
          badge={
            <Link href="/notebook/teacher/reporting" className="inline-flex items-center text-xs font-medium">
              Back to Reporting
            </Link>
          }
        />

        <div className="grid gap-4 sm:grid-cols-4">
          <TeachingToneMetricCard title="Students" value={reporting.summary.student_count} tone="muted" />
          <TeachingToneMetricCard title="Assignments" value={reporting.summary.assignment_count} tone="muted" />
          <TeachingToneMetricCard title="Waiting review" value={reporting.summary.needs_review_count} tone="sky" />
          <TeachingToneMetricCard title="Missing work" value={reporting.summary.missing_submission_count} tone="rose" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(340px,0.9fr)]">
          <TeachingCollectionSection title="Students" icon={Users}>
            <div className="space-y-3">
              {reporting.students.map((student) => (
                <TeachingEntityCard
                  key={student.student_user_id}
                  href={`/notebook/teacher/reporting/classrooms/${reporting.classroom.id}/students/${student.student_user_id}`}
                  badges={
                    <>
                      {student.missing_count > 0 ? <MetricPill label={`${student.missing_count} missing`} tone="rose" /> : null}
                      {student.awaiting_review_count > 0 ? <MetricPill label={`${student.awaiting_review_count} awaiting review`} tone="sky" /> : null}
                    </>
                  }
                  title={student.student_name}
                  subtitle={student.student_email}
                >
                  <div className="mt-3 text-xs text-muted-foreground">
                    Open this learner for assignment-by-assignment reporting and missing-work detail.
                  </div>
                </TeachingEntityCard>
              ))}
            </div>
          </TeachingCollectionSection>

          <TeachingCollectionSection title="Assignment Attention" icon={BarChart3}>
            <div className="space-y-3">
              {reporting.assignmentAttention.map((assignment) => (
                <TeachingEntityCard
                  key={assignment.assignment_id}
                  href={`/notebook/assignments/${assignment.assignment_id}`}
                  badges={
                    <>
                      {assignment.waiting_review_count > 0 ? <MetricPill label={`${assignment.waiting_review_count} waiting review`} tone="sky" /> : null}
                      {assignment.missing_submission_count > 0 ? <MetricPill label={`${assignment.missing_submission_count} missing`} tone="rose" /> : null}
                    </>
                  }
                  title={assignment.assignment_title}
                  subtitle="Open the assignment detail to work through review or missing-submission follow-through."
                >
                  <div className="mt-3 text-xs text-muted-foreground">
                    Prioritize assignments with both review pressure and missing work.
                  </div>
                </TeachingEntityCard>
              ))}
            </div>
          </TeachingCollectionSection>
        </div>
      </div>
    </div>
  );
}

function MetricPill({
  label,
  tone,
}: {
  label: string;
  tone: "sky" | "rose";
}) {
  const toneClass =
    tone === "sky"
      ? "border-sky-500/20 bg-sky-500/10 text-sky-400"
      : "border-rose-500/20 bg-rose-500/10 text-rose-300";

  return <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${toneClass}`}>{label}</span>;
}
