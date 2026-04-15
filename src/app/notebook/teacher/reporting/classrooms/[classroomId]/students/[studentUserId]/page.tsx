import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { UserRoundSearch } from "lucide-react";
import { getAuthUserId } from "@/lib/auth-utils";
import { canViewTeacherReporting } from "@/lib/classroom-permissions";
import { isTeacherUser } from "@/lib/classrooms";
import { getTeacherStudentReporting } from "@/lib/teacher-reporting";

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
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">Student detail</p>
            <h1 className="mt-2 text-3xl font-bold text-foreground">{reporting.student.student_name}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{reporting.classroom.name}</p>
          </div>
          <Link
            href={`/notebook/teacher/reporting/classrooms/${reporting.classroom.id}`}
            className="inline-flex items-center rounded-lg border px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
          >
            Back to Classroom
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          <SummaryCard label="Assignments" value={reporting.student.assignment_count} />
          <SummaryCard label="Submitted" value={reporting.student.submitted_count} />
          <SummaryCard label="Reviewed" value={reporting.student.reviewed_count} tone="sky" />
          <SummaryCard label="Missing" value={reporting.student.missing_count} tone="rose" />
        </div>

        <section className="rounded-2xl border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <UserRoundSearch className="h-4 w-4 text-[var(--cn-orange)]" />
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Assignment Status</h2>
          </div>
          <div className="space-y-3">
            {reporting.assignmentRows.map((row) => (
              <Link
                key={row.assignment_id}
                href={`/notebook/assignments/${row.assignment_id}`}
                className="block rounded-xl border p-4 transition-colors hover:border-[var(--cn-orange)]/30 hover:bg-muted/20"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-foreground">{row.assignment_title}</h3>
                  <span className="rounded-full border bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                    {(row.status || "not started").replaceAll("_", " ")}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span>{row.due_at ? `Due ${new Date(row.due_at).toLocaleDateString("en-US")}` : "No due date"}</span>
                  {row.submitted_at ? <span>Submitted {new Date(row.submitted_at).toLocaleDateString("en-US")}</span> : null}
                  {row.reviewed_at ? <span>Reviewed {new Date(row.reviewed_at).toLocaleDateString("en-US")}</span> : null}
                </div>
              </Link>
            ))}
          </div>
        </section>
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
