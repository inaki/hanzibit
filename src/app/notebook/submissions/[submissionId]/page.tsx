import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageSquare, NotebookText, School, UserRound } from "lucide-react";
import { getAuthUserId } from "@/lib/auth-utils";
import { canReviewSubmission, canViewSubmission } from "@/lib/classroom-permissions";
import { addSubmissionFeedbackAction, markSubmissionReviewedAction } from "@/lib/actions";
import { getSubmissionDetail, listSubmissionFeedback } from "@/lib/submissions";

export const dynamic = "force-dynamic";

function StatusBadge({ status }: { status: string }) {
  const palette =
    status === "reviewed"
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
      : status === "submitted"
        ? "border-sky-500/20 bg-sky-500/10 text-sky-400"
        : "border-border bg-muted text-muted-foreground";

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${palette}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
}

export default async function SubmissionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ submissionId: string }>;
  searchParams?: Promise<{ feedback?: string; reviewed?: string }>;
}) {
  const userId = await getAuthUserId();
  const { submissionId } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};

  if (!(await canViewSubmission(userId, submissionId))) {
    notFound();
  }

  const [submission, canReview, feedback] = await Promise.all([
    getSubmissionDetail(submissionId),
    canReviewSubmission(userId, submissionId),
    listSubmissionFeedback(submissionId),
  ]);

  if (!submission) {
    notFound();
  }

  return (
    <div data-testid="submission-detail-page" className="h-full overflow-auto p-6 pb-20 md:p-10 lg:pb-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              Submission
            </p>
            <h1 className="mt-2 text-3xl font-bold text-foreground">{submission.assignment_title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span>
                Classroom:{" "}
                <Link href={`/notebook/classes/${submission.classroom_id}`} className="text-[var(--cn-orange)] hover:underline">
                  {submission.classroom_name}
                </Link>
              </span>
              <span>Student: {submission.student_name}</span>
            </div>
          </div>
          <StatusBadge status={submission.status} />
        </div>

        {(resolvedSearchParams.feedback || resolvedSearchParams.reviewed) && (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
            {resolvedSearchParams.feedback ? "Feedback added." : "Submission marked as reviewed."}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)]">
          <section className="space-y-6">
            <div className="rounded-2xl border bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <School className="h-4 w-4 text-[var(--cn-orange)]" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Assignment Context
                </h2>
              </div>
              {submission.assignment_description ? (
                <p className="text-sm leading-7 text-muted-foreground">{submission.assignment_description}</p>
              ) : (
                <p className="text-sm text-muted-foreground">No extra assignment description.</p>
              )}
              {submission.assignment_prompt ? (
                <div className="mt-4 rounded-xl border border-[var(--cn-orange)]/20 bg-[var(--cn-orange)]/10 p-4">
                  <p className="text-sm font-medium text-[var(--cn-orange)]">Prompt</p>
                  <p className="mt-2 text-sm leading-7 text-foreground/85">{submission.assignment_prompt}</p>
                </div>
              ) : null}
            </div>

            <div className="rounded-2xl border bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <NotebookText className="h-4 w-4 text-[var(--cn-orange)]" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Submitted Work
                </h2>
              </div>
              {submission.journal_entry_id ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    This submission is linked to the learner&apos;s notebook entry.
                  </p>
                  <Link
                    href={`/notebook?entry=${encodeURIComponent(submission.journal_entry_id)}`}
                    className="block rounded-xl border border-border bg-muted/40 p-4 transition-colors hover:bg-muted/70"
                  >
                    <p className="text-sm font-medium text-foreground">
                      {submission.journal_entry_title_zh || "Untitled entry"}
                    </p>
                    {submission.journal_entry_title_en ? (
                      <p className="mt-1 text-sm text-muted-foreground">{submission.journal_entry_title_en}</p>
                    ) : null}
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No notebook entry linked yet.</p>
              )}
            </div>

            <div className="rounded-2xl border bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-[var(--cn-orange)]" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Feedback
                </h2>
              </div>
              {feedback.length > 0 ? (
                <div className="space-y-4">
                  {feedback.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-foreground">{item.teacher_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(item.created_at).toLocaleString("en-US")}
                        </p>
                      </div>
                      <p className="mt-2 text-sm leading-7 text-foreground/85">{item.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {canReview ? "No feedback yet. Add the first review below." : "No teacher feedback yet."}
                </p>
              )}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-2xl border bg-card p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Submission Details
              </h2>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Student</span>
                  <span className="font-medium text-foreground">{submission.student_name}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-medium capitalize text-foreground">{submission.status.replaceAll("_", " ")}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Submitted</span>
                  <span className="font-medium text-foreground">
                    {submission.submitted_at ? new Date(submission.submitted_at).toLocaleString("en-US") : "Not yet"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Reviewed</span>
                  <span className="font-medium text-foreground">
                    {submission.reviewed_at ? new Date(submission.reviewed_at).toLocaleString("en-US") : "Not yet"}
                  </span>
                </div>
              </div>
            </section>

            {canReview ? (
              <>
                <section className="rounded-2xl border bg-card p-5">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Leave Feedback
                  </h2>
                  <form action={addSubmissionFeedbackAction} className="mt-4 space-y-4">
                    <input type="hidden" name="submission_id" value={submission.id} />
                    <textarea
                      name="content"
                      rows={6}
                      required
                      placeholder="Add teacher feedback for this submission..."
                      className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-[var(--cn-orange)]"
                    />
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center rounded-lg bg-[var(--cn-orange)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--cn-orange-dark)]"
                    >
                      Save feedback
                    </button>
                  </form>
                </section>

                <section className="rounded-2xl border bg-card p-5">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Review Status
                  </h2>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Mark this submission as reviewed once the learner has enough feedback to move forward.
                  </p>
                  <form action={markSubmissionReviewedAction} className="mt-4">
                    <input type="hidden" name="submission_id" value={submission.id} />
                    <input type="hidden" name="assignment_id" value={submission.assignment_id} />
                    <button
                      type="submit"
                      disabled={submission.status === "reviewed"}
                      className="inline-flex items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400 transition-colors hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submission.status === "reviewed" ? "Already reviewed" : "Mark as reviewed"}
                    </button>
                  </form>
                </section>
              </>
            ) : (
              <section className="rounded-2xl border bg-card p-5 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <UserRound className="h-4 w-4 text-[var(--cn-orange)]" />
                  <p className="font-medium text-foreground">Student view</p>
                </div>
                <p className="mt-3">
                  This page shows the current submission status and any teacher feedback for this assignment.
                </p>
              </section>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
