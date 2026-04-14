import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle, BarChart3, UserRoundSearch, Users } from "lucide-react";
import { getAuthUserId } from "@/lib/auth-utils";
import { isTeacherUser } from "@/lib/classrooms";
import { getTeacherReportingDashboard } from "@/lib/teacher-reporting";

export const dynamic = "force-dynamic";

export default async function TeacherReportingPage() {
  const userId = await getAuthUserId();

  if (!(await isTeacherUser(userId))) {
    redirect("/notebook/classes");
  }

  const reporting = await getTeacherReportingDashboard(userId);

  return (
    <div data-testid="teacher-reporting-page" className="h-full overflow-auto p-6 pb-20 md:p-10 lg:pb-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              Phase 3
            </p>
            <h1 className="mt-2 text-3xl font-bold text-foreground">Teacher Reporting</h1>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              Track classroom health, missing work, and submissions that still need review without opening each assignment one by one.
            </p>
          </div>
          <div className="inline-flex items-center rounded-full border border-[var(--cn-orange)]/20 bg-[var(--cn-orange)]/10 px-3 py-1.5 text-xs font-medium text-[var(--cn-orange)]">
            Lightweight intervention layer
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <SummaryCard label="Classrooms" value={reporting.totalClassrooms} />
          <SummaryCard label="Students" value={reporting.totalStudents} />
          <SummaryCard label="Assignments" value={reporting.totalAssignments} />
          <SummaryCard label="Waiting review" value={reporting.totalWaitingReview} tone="sky" />
          <SummaryCard label="Missing work" value={reporting.totalMissingSubmissions} tone="rose" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]">
          <section className="space-y-6">
            <div className="rounded-2xl border bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-[var(--cn-orange)]" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Classroom Health
                </h2>
              </div>

              {reporting.classroomSummaries.length === 0 ? (
                <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                  No classrooms yet. Reporting will appear as soon as you create at least one class.
                </div>
              ) : (
                <div className="space-y-3">
                  {reporting.classroomSummaries.map((summary) => (
                    <Link
                      key={summary.classroom.id}
                      href={`/notebook/teacher/reporting/classrooms/${summary.classroom.id}`}
                      className="block rounded-xl border p-4 transition-colors hover:border-[var(--cn-orange)]/30 hover:bg-muted/20"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-foreground">{summary.classroom.name}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {summary.classroom.description || "No classroom description"}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <MetricPill label={`${summary.student_count} students`} tone="muted" />
                          <MetricPill label={`${summary.assignment_count} assignments`} tone="muted" />
                          {summary.needs_review_count > 0 ? (
                            <MetricPill label={`${summary.needs_review_count} waiting review`} tone="sky" />
                          ) : null}
                          {summary.missing_submission_count > 0 ? (
                            <MetricPill label={`${summary.missing_submission_count} missing`} tone="rose" />
                          ) : null}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <UserRoundSearch className="h-4 w-4 text-[var(--cn-orange)]" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Student Intervention List
                </h2>
              </div>

              {reporting.studentAttention.length === 0 ? (
                <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                  No student-level intervention signals right now.
                </div>
              ) : (
                <div className="space-y-3">
                  {reporting.studentAttention.map((student) => (
                    <Link
                      key={`${student.classroom_id}:${student.student_user_id}`}
                      href={`/notebook/teacher/reporting/classrooms/${student.classroom_id}/students/${student.student_user_id}`}
                      className="block rounded-xl border p-4 transition-colors hover:border-[var(--cn-orange)]/30 hover:bg-muted/20"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-foreground">{student.student_name}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">{student.classroom_name}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs">
                          {student.missing_count > 0 ? (
                            <MetricPill label={`${student.missing_count} missing`} tone="rose" />
                          ) : null}
                          {student.awaiting_review_count > 0 ? (
                            <MetricPill label={`${student.awaiting_review_count} awaiting review`} tone="sky" />
                          ) : null}
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span>{student.submitted_count} submitted</span>
                        <span>{student.reviewed_count} reviewed</span>
                        <span>{student.assignment_count} assignments</span>
                        <span>
                          {student.last_submitted_at
                            ? `Last submitted ${new Date(student.last_submitted_at).toLocaleDateString("en-US")}`
                            : "No submissions yet"}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-2xl border bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-[var(--cn-orange)]" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Needs Attention
                </h2>
              </div>

              {reporting.attentionItems.length === 0 ? (
                <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                  Nothing urgent right now. Your classrooms do not currently have missing work or pending review items.
                </div>
              ) : (
                <div className="space-y-3">
                  {reporting.attentionItems.map((item) => (
                    <Link
                      key={`${item.classroom_id}:${item.assignment_id}`}
                      href={`/notebook/assignments/${item.assignment_id}`}
                      className="block rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 transition-colors hover:bg-amber-500/15"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        {item.classroom_name}
                      </p>
                      <h3 className="mt-1 font-semibold text-foreground">{item.assignment_title}</h3>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        {item.waiting_review_count > 0 ? (
                          <MetricPill label={`${item.waiting_review_count} waiting review`} tone="sky" />
                        ) : null}
                        {item.missing_submission_count > 0 ? (
                          <MetricPill label={`${item.missing_submission_count} missing`} tone="rose" />
                        ) : null}
                      </div>
                      <div className="mt-3 text-xs text-muted-foreground">
                        {item.due_at
                          ? `Due ${new Date(item.due_at).toLocaleDateString("en-US")}`
                          : "No due date"}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-2xl border bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <Users className="h-4 w-4 text-[var(--cn-orange)]" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Reporting Notes
                </h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>This first reporting slice is intentionally lightweight and action-oriented.</p>
                <p>It is built from live classroom, assignment, roster, and submission data rather than a separate analytics system.</p>
                <p>The next reporting step is student-level intervention lists and clearer class-by-class progress summaries.</p>
              </div>
            </section>
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
  tone: "muted" | "sky" | "rose";
}) {
  const toneClass =
    tone === "sky"
      ? "border-sky-500/20 bg-sky-500/10 text-sky-400"
      : tone === "rose"
        ? "border-rose-500/20 bg-rose-500/10 text-rose-300"
        : "bg-muted text-muted-foreground";

  return <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${toneClass}`}>{label}</span>;
}
