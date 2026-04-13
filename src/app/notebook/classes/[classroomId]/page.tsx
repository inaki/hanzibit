import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BookOpenText, ClipboardList, Users } from "lucide-react";
import { getAuthUserId } from "@/lib/auth-utils";
import { isAssignmentOverdue, listAssignmentsForClassroom } from "@/lib/assignments";
import { createAssignmentAction } from "@/lib/actions";
import { PendingSubmitButton } from "@/components/notebook/pending-submit-button";
import {
  getClassroom,
  getClassroomMember,
  getClassroomRoster,
} from "@/lib/classrooms";
import { canViewClassroom } from "@/lib/classroom-permissions";
import { listClassroomAssignmentSummaries } from "@/lib/submissions";

export const dynamic = "force-dynamic";

export default async function ClassroomDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ classroomId: string }>;
  searchParams: Promise<{ success?: string }>;
}) {
  const userId = await getAuthUserId();
  const [{ classroomId }, query] = await Promise.all([params, searchParams]);

  if (!(await canViewClassroom(userId, classroomId))) {
    notFound();
  }

  const [classroom, member, roster, assignments, assignmentSummaries] = await Promise.all([
    getClassroom(classroomId),
    getClassroomMember(classroomId, userId),
    getClassroomRoster(classroomId),
    listAssignmentsForClassroom(classroomId),
    listClassroomAssignmentSummaries(classroomId),
  ]);

  if (!classroom || !member) {
    notFound();
  }

  const isTeacher = member.role === "teacher";
  const summaryByAssignmentId = new Map(
    assignmentSummaries.map((summary) => [summary.assignment_id, summary])
  );
  const totalStudents = roster.filter((person) => person.role === "student").length;
  const totalSubmitted = assignmentSummaries.reduce((sum, item) => sum + item.submitted_count, 0);
  const totalNeedsReview = assignmentSummaries.reduce((sum, item) => sum + item.needs_review_count, 0);
  const assignmentsNeedingAttention = assignments
    .map((assignment) => {
      const summary = summaryByAssignmentId.get(assignment.id);
      const submitted = summary?.submitted_count ?? 0;
      const reviewed = summary?.reviewed_count ?? 0;
      const missing = Math.max(totalStudents - (summary?.total_submissions ?? 0), 0);
      const overdue = isAssignmentOverdue(assignment.due_at);

      return {
        assignment,
        submitted,
        reviewed,
        missing,
        overdue,
        needsAttention: submitted > reviewed || missing > 0 || overdue,
      };
    })
    .filter((item) => item.needsAttention);

  async function createAssignmentFormAction(formData: FormData) {
    "use server";
    const result = await createAssignmentAction(formData);
    if ("error" in result) {
      redirect(`/notebook/classes/${classroomId}?success=${encodeURIComponent(`error:${result.error}`)}`);
    }
    redirect(`/notebook/assignments/${result.id}`);
  }

  return (
    <div data-testid="classroom-detail-page" className="h-full overflow-auto p-6 pb-20 md:p-10 lg:pb-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              Classroom
            </p>
            <h1 className="mt-2 text-3xl font-bold text-foreground">{classroom.name}</h1>
            {classroom.description && (
              <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                {classroom.description}
              </p>
            )}
          </div>
          <div className="space-y-2 text-right">
            <div
              className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                isTeacher
                  ? "border border-[var(--cn-orange)]/20 bg-[var(--cn-orange)]/10 text-[var(--cn-orange)]"
                  : "border border-sky-500/20 bg-sky-500/10 text-sky-400"
              }`}
            >
              {isTeacher ? "Teacher view" : "Student view"}
            </div>
            <p className="text-xs text-muted-foreground">Join code: {classroom.join_code}</p>
          </div>
        </div>

        {query.success && (
          <div className={`rounded-xl px-4 py-3 text-sm ${
            query.success.startsWith("error:")
              ? "border border-rose-500/20 bg-rose-500/10 text-rose-300"
              : "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
          }`}>
            {query.success === "created"
              ? "Classroom created and ready for students to join."
              : query.success.startsWith("error:")
                ? decodeURIComponent(query.success.slice(6))
                : "Updated."}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <section className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border bg-card p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Students
                </p>
                <p className="mt-3 text-3xl font-bold text-foreground">{totalStudents}</p>
              </div>
              <div className="rounded-2xl border bg-card p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Submitted
                </p>
                <p className="mt-3 text-3xl font-bold text-foreground">{totalSubmitted}</p>
              </div>
              <div className="rounded-2xl border bg-card p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Needs Review
                </p>
                <p className="mt-3 text-3xl font-bold text-foreground">{totalNeedsReview}</p>
              </div>
            </div>

            {isTeacher && assignmentsNeedingAttention.length > 0 ? (
              <div className="rounded-2xl border bg-card p-5">
                <div className="mb-4 flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-[var(--cn-orange)]" />
                  <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Needs Attention
                  </h2>
                </div>
                <div className="space-y-3">
                  {assignmentsNeedingAttention.map(({ assignment, submitted, reviewed, missing, overdue }) => (
                    <Link
                      key={assignment.id}
                      href={`/notebook/assignments/${assignment.id}`}
                      className="block rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 transition-colors hover:bg-amber-500/15"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-semibold text-foreground">{assignment.title}</h3>
                        <span className="text-xs text-muted-foreground">
                          {assignment.due_at ? `Due ${new Date(assignment.due_at).toLocaleDateString("en-US")}` : "No due date"}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        {overdue ? (
                          <span className="rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-rose-300">
                            overdue
                          </span>
                        ) : null}
                        {submitted > reviewed ? (
                          <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-1 text-sky-400">
                            {submitted - reviewed} waiting for review
                          </span>
                        ) : null}
                        {missing > 0 ? (
                          <span className="rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-rose-300">
                            {missing} missing submission
                          </span>
                        ) : null}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="rounded-2xl border bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-[var(--cn-orange)]" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Assignments
                </h2>
              </div>

              {assignments.length === 0 ? (
                <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                  {isTeacher
                    ? "No assignments yet. Assignment creation is the next Phase 2 milestone."
                    : "No assignments yet. Your teacher has not posted work for this classroom."}
                </div>
              ) : (
                <div className="space-y-3">
                  {assignments.map((assignment) => (
                    <Link key={assignment.id} href={`/notebook/assignments/${assignment.id}`} className="block rounded-xl border p-4 transition-colors hover:border-[var(--cn-orange)]/30 hover:bg-muted/20">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-semibold text-foreground">{assignment.title}</h3>
                        <div className="flex items-center gap-2">
                          {isAssignmentOverdue(assignment.due_at) ? (
                            <span className="rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-[11px] font-medium text-rose-300">
                              overdue
                            </span>
                          ) : null}
                          <span className="rounded-full border bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                            {assignment.type.replaceAll("_", " ")}
                          </span>
                        </div>
                      </div>
                      {assignment.description && (
                        <p className="mt-2 text-sm text-muted-foreground">{assignment.description}</p>
                      )}
                      {(() => {
                        const summary = summaryByAssignmentId.get(assignment.id);
                        if (!summary) return null;

                        return (
                          <div className="mt-3 flex flex-wrap gap-2 text-xs">
                            <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-1 text-sky-400">
                              {summary.submitted_count} submitted
                            </span>
                            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-emerald-400">
                              {summary.reviewed_count} reviewed
                            </span>
                            {totalStudents > 0 ? (
                              <span className="rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-rose-300">
                                {Math.max(totalStudents - summary.total_submissions, 0)} missing
                              </span>
                            ) : null}
                          </div>
                        );
                      })()}
                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        {assignment.hsk_level ? <span>HSK {assignment.hsk_level}</span> : null}
                        {assignment.due_at ? (
                          <span className={isAssignmentOverdue(assignment.due_at) ? "text-rose-300" : undefined}>
                            Due {new Date(assignment.due_at).toLocaleDateString("en-US")}
                          </span>
                        ) : (
                          <span>No due date</span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <BookOpenText className="h-4 w-4 text-[var(--cn-orange)]" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Classroom Flow
                </h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>Phase 2 keeps the notebook primary. Assignments should resolve into guided journal drafts or Study Guide detail, not separate classroom-only learning surfaces.</p>
                <p>Submissions and teacher feedback now attach directly to assignment context through notebook work.</p>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            {isTeacher && (
              <section className="rounded-2xl border bg-card p-5">
                <div className="mb-4 flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-[var(--cn-orange)]" />
                  <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Create Assignment
                  </h2>
                </div>
                <form action={createAssignmentFormAction} className="space-y-3">
                  <input type="hidden" name="classroom_id" value={classroom.id} />
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground/80">Type</label>
                    <select
                      name="type"
                      defaultValue="journal_prompt"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--cn-orange)]"
                    >
                      <option value="journal_prompt">Journal prompt</option>
                      <option value="study_guide_word">Study guide word</option>
                      <option value="study_guide_level">Study guide level</option>
                      <option value="reading_response">Reading response</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground/80">Title</label>
                    <input
                      name="title"
                      required
                      placeholder="e.g. Use 爱 in 3 sentences"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--cn-orange)]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground/80">Description</label>
                    <textarea
                      name="description"
                      rows={3}
                      placeholder="Optional context for students"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--cn-orange)]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground/80">Prompt</label>
                    <textarea
                      name="prompt"
                      rows={3}
                      placeholder="What should students do?"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--cn-orange)]"
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-foreground/80">HSK level</label>
                      <input
                        name="hsk_level"
                        type="number"
                        min={1}
                        max={6}
                        placeholder="1"
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--cn-orange)]"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-foreground/80">Source ref</label>
                      <input
                        name="source_ref"
                        placeholder="Optional word id"
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--cn-orange)]"
                      />
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-foreground/80">Due date</label>
                      <input
                        name="due_date"
                        type="date"
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--cn-orange)]"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-foreground/80">Due time</label>
                      <input
                        name="due_time"
                        type="time"
                        step={60}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--cn-orange)]"
                      />
                    </div>
                  </div>
                  <PendingSubmitButton
                    idleLabel="Create assignment"
                    pendingLabel="Creating assignment..."
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--cn-orange)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--cn-orange-dark)] disabled:cursor-not-allowed disabled:opacity-70"
                  />
                </form>
              </section>
            )}

            <section className="rounded-2xl border bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <Users className="h-4 w-4 text-[var(--cn-orange)]" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Roster
                </h2>
              </div>
              <div className="space-y-3">
                {roster.map((person) => (
                  <div key={person.id} className="rounded-xl border px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{person.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{person.email}</p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          person.role === "teacher"
                            ? "border border-[var(--cn-orange)]/20 bg-[var(--cn-orange)]/10 text-[var(--cn-orange)]"
                            : "border border-sky-500/20 bg-sky-500/10 text-sky-400"
                        }`}
                      >
                        {person.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border bg-card p-5 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Next classroom milestone</p>
              <p className="mt-2">
                Classroom activity is now visible here. Next up is stronger resubmission and deeper teacher review tools.
              </p>
              <Link href="/notebook/classes" className="mt-4 inline-flex text-[var(--cn-orange)] hover:underline">
                Back to classes
              </Link>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
