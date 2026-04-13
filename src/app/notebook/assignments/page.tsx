import Link from "next/link";
import { ArrowRight, ClipboardList } from "lucide-react";
import { getAuthUserId } from "@/lib/auth-utils";
import { isAssignmentOverdue, listAssignmentInboxForUser } from "@/lib/assignments";
import { isTeacherUser } from "@/lib/classrooms";

export const dynamic = "force-dynamic";

export default async function AssignmentsPage() {
  const userId = await getAuthUserId();
  const [assignments, teacher] = await Promise.all([
    listAssignmentInboxForUser(userId),
    isTeacherUser(userId),
  ]);
  const filteredAssignments = assignments;

  const pendingCount = assignments.filter(
    (assignment) =>
      !assignment.submission_status ||
      assignment.submission_status === "not_started" ||
      assignment.submission_status === "draft" ||
      assignment.submission_status === "submitted"
  ).length;
  const reviewedCount = assignments.filter((assignment) => assignment.submission_status === "reviewed").length;

  function getAssignmentStatus(assignment: (typeof assignments)[number]) {
    if (teacher && !assignment.submission_status) {
      return { label: "Open assignment", tone: "border-border bg-muted text-muted-foreground" };
    }

    switch (assignment.submission_status) {
      case "reviewed":
        return { label: "Reviewed", tone: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" };
      case "submitted":
        return { label: "Awaiting review", tone: "border-sky-500/20 bg-sky-500/10 text-sky-400" };
      case "draft":
        return { label: "Draft started", tone: "border-amber-500/20 bg-amber-500/10 text-amber-400" };
      default:
        return { label: "Not started", tone: "border-border bg-muted text-muted-foreground" };
    }
  }

  const groupedAssignments = {
    needsReview: filteredAssignments.filter((assignment) => assignment.submission_status === "submitted"),
    reviewed: filteredAssignments.filter((assignment) => assignment.submission_status === "reviewed"),
    notStarted: filteredAssignments.filter(
      (assignment) => !assignment.submission_status || assignment.submission_status === "not_started" || assignment.submission_status === "draft"
    ),
  };

  return (
    <div data-testid="assignments-page" className="h-full overflow-auto p-6 pb-20 md:p-10 lg:pb-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              Phase 2
            </p>
            <h1 className="mt-2 text-3xl font-bold text-foreground">Assignments</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Track classroom work without leaving the notebook system.
            </p>
          </div>
          <div className="inline-flex items-center rounded-full border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
            {teacher ? "Teacher and student views share this inbox" : "Student assignment inbox"}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Total</p>
            <p className="mt-3 text-3xl font-bold text-foreground">{assignments.length}</p>
          </div>
          <div className="rounded-2xl border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Needs action</p>
            <p className="mt-3 text-3xl font-bold text-foreground">{pendingCount}</p>
          </div>
          <div className="rounded-2xl border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Reviewed</p>
            <p className="mt-3 text-3xl font-bold text-foreground">{reviewedCount}</p>
          </div>
        </div>

        {assignments.length === 0 ? (
          <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
            No assignments yet. Once a teacher creates one, it will appear here.
          </div>
        ) : (
          <div className="space-y-8">
            {teacher && groupedAssignments.needsReview.length > 0 ? (
              <section className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Needs Review</p>
                  <p className="mt-1 text-sm text-muted-foreground">Submissions waiting for teacher review.</p>
                </div>
                <div className="space-y-4">
                  {groupedAssignments.needsReview.map((assignment) => (
                    <AssignmentInboxCard key={assignment.id} assignment={assignment} status={getAssignmentStatus(assignment)} />
                  ))}
                </div>
              </section>
            ) : null}

            {groupedAssignments.notStarted.length > 0 ? (
              <section className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {teacher ? "Open Assignments" : "To Do"}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {teacher ? "Assignments without a reviewed submission yet." : "Assignments you still need to complete."}
                  </p>
                </div>
                <div className="space-y-4">
                  {groupedAssignments.notStarted.map((assignment) => (
                    <AssignmentInboxCard key={assignment.id} assignment={assignment} status={getAssignmentStatus(assignment)} />
                  ))}
                </div>
              </section>
            ) : null}

            {groupedAssignments.reviewed.length > 0 ? (
              <section className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Reviewed</p>
                  <p className="mt-1 text-sm text-muted-foreground">Assignments that already completed the teacher review loop.</p>
                </div>
                <div className="space-y-4">
                  {groupedAssignments.reviewed.map((assignment) => (
                    <AssignmentInboxCard key={assignment.id} assignment={assignment} status={getAssignmentStatus(assignment)} />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

function AssignmentInboxCard({
  assignment,
  status,
}: {
  assignment: Awaited<ReturnType<typeof listAssignmentInboxForUser>>[number];
  status: { label: string; tone: string };
}) {
  const isOverdue = isAssignmentOverdue(assignment.due_at, assignment.submission_status);

  return (
    <Link
      href={`/notebook/assignments/${assignment.id}`}
      className="block rounded-2xl border bg-card p-5 transition-colors hover:border-[var(--cn-orange)]/30 hover:bg-muted/20"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-[var(--cn-orange)]" />
            <h2 className="truncate text-lg font-semibold text-foreground">{assignment.title}</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{assignment.classroom_name}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            {assignment.type.replaceAll("_", " ")}
          </span>
          {isOverdue ? (
            <span className="rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-[11px] font-medium text-rose-300">
              Overdue
            </span>
          ) : null}
          <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${status.tone}`}>
            {status.label}
          </span>
        </div>
      </div>

      {assignment.description ? (
        <p className="mt-3 text-sm text-muted-foreground">{assignment.description}</p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
        {assignment.hsk_level ? <span>HSK {assignment.hsk_level}</span> : null}
        {assignment.due_at ? (
          <span className={isOverdue ? "text-rose-300" : undefined}>
            Due {new Date(assignment.due_at).toLocaleDateString("en-US")}
          </span>
        ) : (
          <span>No due date</span>
        )}
        {assignment.submitted_at ? (
          <span>Submitted {new Date(assignment.submitted_at).toLocaleDateString("en-US")}</span>
        ) : null}
      </div>
      <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--cn-orange)]">
        Open assignment
        <ArrowRight className="h-4 w-4" />
      </div>
    </Link>
  );
}
