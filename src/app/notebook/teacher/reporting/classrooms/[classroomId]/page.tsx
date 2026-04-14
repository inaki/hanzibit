import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BarChart3, Users } from "lucide-react";
import { getAuthUserId } from "@/lib/auth-utils";
import { canViewTeacherReporting } from "@/lib/classroom-permissions";
import { isTeacherUser } from "@/lib/classrooms";
import { getTeacherClassroomReporting } from "@/lib/teacher-reporting";

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
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">Teacher reporting</p>
            <h1 className="mt-2 text-3xl font-bold text-foreground">{reporting.classroom.name}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Drill-down reporting for one classroom.
            </p>
          </div>
          <Link
            href="/notebook/teacher/reporting"
            className="inline-flex items-center rounded-lg border px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
          >
            Back to reporting
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          <SummaryCard label="Students" value={reporting.summary.student_count} />
          <SummaryCard label="Assignments" value={reporting.summary.assignment_count} />
          <SummaryCard label="Waiting review" value={reporting.summary.needs_review_count} tone="sky" />
          <SummaryCard label="Missing work" value={reporting.summary.missing_submission_count} tone="rose" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(340px,0.9fr)]">
          <section className="rounded-2xl border bg-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <Users className="h-4 w-4 text-[var(--cn-orange)]" />
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Students</h2>
            </div>
            <div className="space-y-3">
              {reporting.students.map((student) => (
                <Link
                  key={student.student_user_id}
                  href={`/notebook/teacher/reporting/classrooms/${reporting.classroom.id}/students/${student.student_user_id}`}
                  className="block rounded-xl border p-4 transition-colors hover:border-[var(--cn-orange)]/30 hover:bg-muted/20"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-foreground">{student.student_name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{student.student_email}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {student.missing_count > 0 ? <MetricPill label={`${student.missing_count} missing`} tone="rose" /> : null}
                      {student.awaiting_review_count > 0 ? <MetricPill label={`${student.awaiting_review_count} awaiting review`} tone="sky" /> : null}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <aside className="rounded-2xl border bg-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[var(--cn-orange)]" />
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Assignment Attention</h2>
            </div>
            <div className="space-y-3">
              {reporting.assignmentAttention.map((assignment) => (
                <Link
                  key={assignment.assignment_id}
                  href={`/notebook/assignments/${assignment.assignment_id}`}
                  className="block rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 transition-colors hover:bg-amber-500/15"
                >
                  <h3 className="font-semibold text-foreground">{assignment.assignment_title}</h3>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    {assignment.waiting_review_count > 0 ? <MetricPill label={`${assignment.waiting_review_count} waiting review`} tone="sky" /> : null}
                    {assignment.missing_submission_count > 0 ? <MetricPill label={`${assignment.missing_submission_count} missing`} tone="rose" /> : null}
                  </div>
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "sky" | "rose";
}) {
  const toneClass =
    tone === "sky"
      ? "border-sky-500/20 bg-sky-500/10"
      : tone === "rose"
        ? "border-rose-500/20 bg-rose-500/10"
        : "border-border bg-card";

  return (
    <div className={`rounded-2xl border p-5 ${toneClass}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-3 text-3xl font-bold text-foreground">{value}</p>
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
