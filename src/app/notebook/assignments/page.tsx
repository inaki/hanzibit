import Link from "next/link";
import { ArrowRight, ClipboardList } from "lucide-react";
import { getAuthUserId } from "@/lib/auth-utils";
import { isAssignmentOverdue, listAssignmentInboxForUser } from "@/lib/assignments";
import { isTeacherUser } from "@/lib/classrooms";
import { HubFocusSection, HubPageHeader } from "@/components/patterns/hub";
import { SummaryStatCard } from "@/components/patterns/metrics";
import { MetricPill } from "@/components/patterns/status";

export const dynamic = "force-dynamic";

type AssignmentsPageProps = {
  variant?: "default" | "hub";
};

export async function AssignmentsPageContent({
  variant = "default",
}: AssignmentsPageProps) {
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
  const showStandaloneHeader = variant === "default";
  const isLearnerHub = variant === "hub" && !teacher;
  const title = teacher ? "Assignments" : "Your Assignments";
  const description = teacher
    ? "Track classroom work without leaving the notebook system."
    : "See the work your teachers assigned without leaving the notebook.";
  const learnerHubMode =
    isLearnerHub && pendingCount === 0 && assignments.length <= 1
      ? {
          badge: "New guided work",
          tone: "sky" as const,
          title: "Your first teacher assignment is ready",
          body: "Start with the open assignment, then use classes only when you need broader context from your teacher space.",
        }
      : isLearnerHub && assignments.some((assignment) => isAssignmentOverdue(assignment.due_at, assignment.submission_status))
        ? {
            badge: "Needs attention",
            tone: "violet" as const,
            title: "You have overdue guided work",
            body: "Do not try to catch up everywhere at once. Start with the most overdue assignment, then return to the rest in order.",
          }
        : isLearnerHub
          ? {
              badge: "Guided work in progress",
              tone: "amber" as const,
              title: "Focus on the next assignments first",
              body: "Your teacher-guided work is already active. Finish pending assignments before digging into reviewed ones again.",
            }
          : null;

  return (
    <div data-testid="assignments-page" className="h-full overflow-auto p-6 pb-20 md:p-10 lg:pb-10">
      <div className="mx-auto max-w-5xl space-y-8">
        {showStandaloneHeader ? (
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                Phase 2
              </p>
              <h1 className="mt-2 text-3xl font-bold text-foreground">{title}</h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>
            </div>
            <div className="inline-flex items-center rounded-full border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
              {teacher ? "Teacher and student views share this inbox" : "Student assignment inbox"}
            </div>
          </div>
        ) : (
          <HubPageHeader title={title} description={description} badge={learnerHubMode?.badge} />
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <SummaryStatCard label="Total" value={assignments.length} tone="sky" />
          <SummaryStatCard label="Needs action" value={pendingCount} tone="amber" />
          <SummaryStatCard label="Reviewed" value={reviewedCount} tone="emerald" />
        </div>

        {learnerHubMode ? (
          <HubFocusSection
            title="Assignment Focus"
            icon={ClipboardList}
            pills={
              <>
              <MetricPill label={`${pendingCount} needs action`} tone="amber" />
              <MetricPill label={`${reviewedCount} reviewed`} tone="emerald" />
              </>
            }
            tone={learnerHubMode.tone}
            guidanceTitle={learnerHubMode.title}
            guidanceBody={learnerHubMode.body}
          />
        ) : null}

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

export default async function AssignmentsPage(props: AssignmentsPageProps) {
  return <AssignmentsPageContent {...props} />;
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
