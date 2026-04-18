import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BookOpenText, ClipboardList, CopyPlus, PenLine } from "lucide-react";
import { getAuthUserId } from "@/lib/auth-utils";
import { saveAssignmentAsTemplateAction } from "@/lib/actions";
import { canManageClassroom, canViewAssignment } from "@/lib/classroom-permissions";
import { getAssignment, isAssignmentOverdue } from "@/lib/assignments";
import { getClassroom } from "@/lib/classrooms";
import { getSubmissionForStudent, listSubmissionsForAssignmentWithStudents } from "@/lib/submissions";

export const dynamic = "force-dynamic";

function buildAssignmentLaunchHref(assignment: NonNullable<Awaited<ReturnType<typeof getAssignment>>>) {
  if (assignment.type === "study_guide_word" && assignment.source_ref) {
    return `/notebook/lessons?wordId=${encodeURIComponent(assignment.source_ref)}&assignmentId=${encodeURIComponent(assignment.id)}`;
  }

  if (assignment.type === "study_guide_level" && assignment.hsk_level) {
    return `/notebook/lessons?level=${assignment.hsk_level}&assignmentId=${encodeURIComponent(assignment.id)}`;
  }

  const level = assignment.hsk_level ?? 1;
  return `/notebook?new=1&draftTitleZh=${encodeURIComponent(`作业：${assignment.title}`)}&draftTitleEn=${encodeURIComponent(`Assignment: ${assignment.title}`)}&draftUnit=${encodeURIComponent("Classroom Assignment")}&draftLevel=${encodeURIComponent(String(level))}&draftPrompt=${encodeURIComponent(assignment.prompt || assignment.description || "Complete this classroom assignment in your own words.")}&draftAssignmentId=${encodeURIComponent(assignment.id)}`;
}

type AssignmentDetailPageProps = {
  params: Promise<{ assignmentId: string }>;
  variant?: "default" | "hub";
  classroomBasePath?: string;
};

export async function AssignmentDetailPageContent({
  params,
  variant = "default",
  classroomBasePath = "/notebook/classes",
}: AssignmentDetailPageProps) {
  const userId = await getAuthUserId();
  const { assignmentId } = await params;

  if (!(await canViewAssignment(userId, assignmentId))) {
    notFound();
  }

  const assignment = await getAssignment(assignmentId);
  if (!assignment) {
    notFound();
  }

  const [classroom, canManage, studentSubmission, assignmentSubmissions] = await Promise.all([
    getClassroom(assignment.classroom_id),
    canManageClassroom(userId, assignment.classroom_id),
    getSubmissionForStudent(assignment.id, userId),
    listSubmissionsForAssignmentWithStudents(assignment.id),
  ]);

  if (!classroom) {
    notFound();
  }

  const launchHref = buildAssignmentLaunchHref(assignment);
  const reviewedCount = assignmentSubmissions.filter((submission) => submission.status === "reviewed").length;
  const submittedCount = assignmentSubmissions.filter((submission) => submission.status === "submitted").length;
  const assignmentIsOverdue = isAssignmentOverdue(assignment.due_at, studentSubmission?.status);
  const studentCanResubmit = Boolean(
    !canManage &&
    studentSubmission &&
    assignment.allow_resubmission &&
    (studentSubmission.status === "reviewed" || studentSubmission.status === "submitted")
  );
  const launchHeading = studentCanResubmit ? "Revise Work" : "Launch Work";
  const launchDescription = studentCanResubmit
    ? "Open the learner flow again to revise and resubmit this assignment inside the notebook or Study Guide."
    : "This assignment is designed to reuse the existing notebook and Study Guide flow instead of creating a separate classroom-only workflow.";
  const launchLabel = studentCanResubmit ? "Revise and resubmit" : "Open assignment flow";
  const showStandaloneHeader = variant === "default";

  async function saveAsTemplateFormAction(formData: FormData) {
    "use server";
    await saveAssignmentAsTemplateAction(formData);
  }

  return (
    <div data-testid="assignment-detail-page" className="h-full overflow-auto p-6 pb-20 md:p-10 lg:pb-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            {showStandaloneHeader ? (
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                Assignment
              </p>
            ) : null}
            <h1 className={`${showStandaloneHeader ? "mt-2" : ""} text-3xl font-bold text-foreground`}>
              {canManage ? assignment.title : `Assignment: ${assignment.title}`}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Classroom:{" "}
              <Link href={`${classroomBasePath}/${classroom.id}`} className="ui-tone-orange-text hover:underline">
                {classroom.name}
              </Link>
            </p>
          </div>
          <div className="flex items-center gap-2">
            {assignmentIsOverdue ? (
              <span className="ui-tone-rose-panel ui-tone-rose-text rounded-full border px-3 py-1.5 text-xs font-medium">
                Overdue
              </span>
            ) : null}
            <span className="rounded-full border bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
              {assignment.type.replaceAll("_", " ")}
            </span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.8fr)]">
          <section className="space-y-6">
            <div className="rounded-2xl border bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <ClipboardList className="ui-tone-orange-text h-4 w-4" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Instructions
                </h2>
              </div>
              {assignment.description ? (
                <p className="text-sm leading-7 text-muted-foreground">{assignment.description}</p>
              ) : (
                <p className="text-sm text-muted-foreground">No extra description provided.</p>
              )}
              {assignment.prompt && (
                <div className="ui-tone-orange-panel mt-4 rounded-xl border p-4">
                  <p className="ui-tone-orange-text text-sm font-medium">Prompt</p>
                  <p className="mt-2 text-sm leading-7 text-foreground/85">{assignment.prompt}</p>
                </div>
              )}
            </div>

            <div className="rounded-2xl border bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                {assignment.type.startsWith("study_guide") ? (
                  <BookOpenText className="ui-tone-orange-text h-4 w-4" />
                ) : (
                  <PenLine className="ui-tone-orange-text h-4 w-4" />
                )}
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {launchHeading}
                </h2>
              </div>
              <p className="text-sm text-muted-foreground">{launchDescription}</p>
              {studentCanResubmit ? (
                <div className="ui-tone-amber-panel ui-tone-amber-text mt-4 rounded-xl border p-4 text-sm">
                  Teacher feedback is already available on your submission. Update your response and save again to resubmit.
                </div>
              ) : null}
              <Link
                href={launchHref}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
              >
                {launchLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {canManage ? (
              <div className="rounded-2xl border bg-card p-5">
                <div className="mb-4 flex items-center gap-2">
                  <CopyPlus className="ui-tone-orange-text h-4 w-4" />
                  <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Reuse This Assignment
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  Save this assignment as a reusable template so you can launch similar work in future classrooms.
                </p>
                <form action={saveAsTemplateFormAction} className="mt-4 space-y-3">
                  <input type="hidden" name="assignment_id" value={assignment.id} />
                  <input type="hidden" name="classroom_id" value={classroom.id} />
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground/80">Template title</label>
                    <input
                      name="title"
                      defaultValue={assignment.title}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--ui-tone-orange-border)]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="ui-tone-orange-panel ui-tone-orange-text inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:opacity-85"
                  >
                    Save as template
                  </button>
                </form>
              </div>
            ) : null}
          </section>

          <aside className="space-y-6">
            <section className="rounded-2xl border bg-card p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Details
              </h2>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">HSK</span>
                  <span className="font-medium text-foreground">{assignment.hsk_level ?? "Not set"}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Due</span>
                  <span className={`font-medium ${assignmentIsOverdue ? "ui-tone-rose-text" : "text-foreground"}`}>
                    {assignment.due_at ? new Date(assignment.due_at).toLocaleDateString("en-US") : "No due date"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Resubmission</span>
                  <span className="font-medium text-foreground">{assignment.allow_resubmission ? "Allowed" : "Locked"}</span>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border bg-card p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Submission Status
              </h2>
              {canManage ? (
                <div className="mt-4 space-y-4 text-sm">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">Submitted</span>
                      <span className="font-medium text-foreground">{submittedCount}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">Reviewed</span>
                      <span className="font-medium text-foreground">{reviewedCount}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">Total submissions</span>
                      <span className="font-medium text-foreground">{assignmentSubmissions.length}</span>
                    </div>
                  </div>

                  {assignmentSubmissions.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Review Queue
                      </p>
                      {assignmentSubmissions.map((submission) => (
                        <Link
                          key={submission.id}
                          href={`/notebook/submissions/${submission.id}`}
                          className="block rounded-xl border border-border bg-muted/40 p-3 transition-colors hover:bg-muted/70"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-medium text-foreground">{submission.student_name}</span>
                            <span className="text-xs capitalize text-muted-foreground">
                              {submission.status.replaceAll("_", " ")}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">{submission.student_email}</p>
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="mt-4 space-y-2 text-sm">
                  <p className="text-muted-foreground">Current status</p>
                  <p className="font-medium capitalize text-foreground">
                    {studentSubmission ? studentSubmission.status.replaceAll("_", " ") : "not started"}
                  </p>
                  {studentSubmission?.submitted_at ? (
                    <p className="text-xs text-muted-foreground">
                      Submitted {new Date(studentSubmission.submitted_at).toLocaleString("en-US")}
                    </p>
                  ) : null}
                  {studentSubmission?.reviewed_at ? (
                    <p className="text-xs text-muted-foreground">
                      Reviewed {new Date(studentSubmission.reviewed_at).toLocaleString("en-US")}
                    </p>
                  ) : null}
                  {studentSubmission ? (
                    <div className="flex flex-wrap gap-3 pt-1">
                      <Link
                        href={`/notebook/submissions/${studentSubmission.id}`}
                        className="ui-tone-orange-text inline-flex items-center gap-2 text-sm font-medium hover:underline"
                      >
                        Open submission
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                      {studentCanResubmit ? (
                        <Link
                          href={launchHref}
                          className="ui-tone-amber-text inline-flex items-center gap-2 text-sm font-medium hover:underline"
                        >
                          Revise now
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              )}
            </section>

            <section className="rounded-2xl border bg-card p-5 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Phase 2 status</p>
              <p className="mt-2">
                Assignment submissions now support teacher review, feedback, and reviewed status tracking.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default async function AssignmentDetailPage(props: AssignmentDetailPageProps) {
  return <AssignmentDetailPageContent {...props} />;
}
