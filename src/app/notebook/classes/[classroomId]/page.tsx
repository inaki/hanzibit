import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BookOpenText, ClipboardList, Users } from "lucide-react";
import { getAuthUserId } from "@/lib/auth-utils";
import { isAssignmentOverdue, listAssignmentsForClassroom } from "@/lib/assignments";
import { createAssignmentAction, createAssignmentFromTemplateAction } from "@/lib/actions";
import { listAssignmentTemplatesForTeacher } from "@/lib/assignment-templates";
import { PendingSubmitButton } from "@/components/notebook/pending-submit-button";
import {
  getClassroom,
  getClassroomMember,
  getClassroomRoster,
} from "@/lib/classrooms";
import { canViewClassroom } from "@/lib/classroom-permissions";
import { getLatestPrivateLessonHistoryByClassroomId } from "@/lib/private-lesson-history";
import { getPrivateLessonIssueTagLabel } from "@/lib/private-lesson-history";
import { getLatestPrivateStudentReview } from "@/lib/private-student-reviews";
import { listClassroomAssignmentSummaries } from "@/lib/submissions";
import { getInquiryForClassroom } from "@/lib/teacher-inquiries";
import { listPrivateStudentGoals } from "@/lib/private-student-goals";
import { getPrivateStudentByClassroomId } from "@/lib/private-students";
import {
  getPrivateLessonPlanByClassroomId,
  getPrivateLessonPlanStatusLabel,
} from "@/lib/private-lesson-plans";

export const dynamic = "force-dynamic";

function getPrivateStudentStatusSummary(input: {
  status: string;
  nextStepType: string | null;
  nextAssignmentId: string | null;
}) {
  if (input.status === "awaiting_teacher") {
    return "Your teacher is expected to respond next with feedback, a new assignment, or follow-up.";
  }
  if (input.status === "awaiting_student") {
    return input.nextAssignmentId
      ? "You are expected to keep moving on the current assignment."
      : "You are expected to complete the next step your teacher assigned.";
  }
  if (input.status === "inactive") {
    return "This private tutoring relationship is currently marked as inactive.";
  }
  if (input.status === "onboarding") {
    return "You are still in the onboarding stage of this private tutoring relationship.";
  }
  if (input.nextStepType === "review_feedback") {
    return "Your next step is to review feedback and continue.";
  }
  return "This private tutoring relationship is active.";
}

function getLessonPlanSummary(input: {
  planStatus: string;
  targetDate: string | null;
  assignmentTitle: string | null;
  templateTitle: string | null;
  beforeLessonExpectation: string | null;
}) {
  const dateLabel = input.targetDate
    ? new Date(input.targetDate).toLocaleDateString("en-US")
    : null;

  if (input.beforeLessonExpectation) {
    return input.beforeLessonExpectation;
  }

  if (input.planStatus === "awaiting_assignment") {
    return "The next lesson rhythm is defined, but no assignment or template is linked yet.";
  }

  if (input.planStatus === "awaiting_completion") {
    return input.assignmentTitle
      ? `Complete ${input.assignmentTitle} before the next check-in${dateLabel ? ` on ${dateLabel}` : ""}.`
      : "Complete the expected prep work before the next check-in.";
  }

  if (input.planStatus === "completed") {
    return "The most recent lesson plan is marked complete. The next checkpoint still needs to be defined.";
  }

  if (input.planStatus === "stale") {
    return "This next lesson plan looks stale and should be refreshed.";
  }

  if (input.templateTitle) {
    return `The next check-in is shaped around ${input.templateTitle}${dateLabel ? ` on ${dateLabel}` : ""}.`;
  }

  return dateLabel
    ? `The next check-in is currently targeted for ${dateLabel}.`
    : "The next check-in is planned, but there is no date yet.";
}

function getContinuitySummary(input: {
  isTeacher: boolean;
  activeGoalCount: number;
  latestHistoryAt: string | null;
}) {
  if (input.activeGoalCount === 0 && !input.latestHistoryAt) {
    return input.isTeacher
      ? "There are no active goals or recent check-ins yet. Add a goal and record a short lesson outcome after the next interaction."
      : "Your teacher has not added active goals or a recent check-in summary yet.";
  }
  if (input.activeGoalCount === 0) {
    return input.isTeacher
      ? "Recent tutoring history exists, but there is no active goal right now. Add one so the learner has a clear medium-term focus."
      : "You have recent tutoring history, but no active goal is currently visible.";
  }
  if (!input.latestHistoryAt) {
    return input.isTeacher
      ? "Active goals are set, but there is no recent check-in summary yet. Record the next lesson outcome to make continuity visible."
      : "Your teacher has set goals, but there is no recent check-in summary yet.";
  }
  return input.isTeacher
    ? "Goals and recent check-in history are both visible here, so continuity is in good shape."
    : "Your current goals and latest check-in summary are both available here.";
}

function getSupportSummary(input: {
  isTeacher: boolean;
  activeGoals: Array<{
    progress_status: string | null;
  }>;
  latestIssueTags: string[];
  latestInterventionNote: string | null;
}) {
  const blockedCount = input.activeGoals.filter((goal) => goal.progress_status === "blocked").length;
  const reinforcementCount = input.activeGoals.filter(
    (goal) => goal.progress_status === "needs_reinforcement"
  ).length;

  if (input.isTeacher) {
    if (blockedCount > 0) {
      return "Some active goals are blocked. Use the latest issue tags and intervention note to simplify or redirect the next step.";
    }
    if (reinforcementCount > 0) {
      return "This learner needs reinforcement on one or more active goals. Keep the next step narrow and explicit.";
    }
    if (input.latestIssueTags.length > 0) {
      return `Recent issue tags point to: ${input.latestIssueTags.join(", ").replaceAll("_", " ")}. Keep those areas visible in the next check-in.`;
    }
    return "No urgent intervention signal is visible in this private tutoring relationship right now.";
  }

  if (blockedCount > 0 || reinforcementCount > 0) {
    return input.latestInterventionNote
      ? `Teacher guidance: ${input.latestInterventionNote}`
      : "Your teacher is narrowing the current focus so you can reinforce the right skill next.";
  }
  if (input.latestIssueTags.length > 0) {
    return `Recent focus areas: ${input.latestIssueTags.join(", ").replaceAll("_", " ")}.`;
  }
  return "Your current tutoring focus looks steady right now.";
}

function getStrategySummary(input: {
  isTeacher: boolean;
  latestStrategyTitle: string | null;
  latestStrategyAppliedAt: string | null;
  latestStrategyOutcomeStatus: string | null;
  activeGoals: Array<{ progress_status: string | null }>;
  latestIssueTags: string[];
}) {
  const blockedCount = input.activeGoals.filter((goal) => goal.progress_status === "blocked").length;
  const reinforcementCount = input.activeGoals.filter(
    (goal) => goal.progress_status === "needs_reinforcement"
  ).length;

  if (input.latestStrategyTitle) {
    if (input.latestStrategyOutcomeStatus === "helped") {
      return input.isTeacher
        ? `${input.latestStrategyTitle} is not just attached here, it is actually helping. Keep the current lesson plan aligned with it before changing course.`
        : "Your teacher has attached a reusable support strategy that is currently helping.";
    }
    if (input.latestStrategyOutcomeStatus === "partial") {
      return input.isTeacher
        ? `${input.latestStrategyTitle} is helping only partially. Keep it visible, but tighten the next lesson support instead of assuming it is already enough.`
        : "Your teacher is still refining the current reusable support strategy.";
    }
    if (input.latestStrategyOutcomeStatus === "no_change") {
      return input.isTeacher
        ? `${input.latestStrategyTitle} is attached, but the latest outcome showed no clear lift. Consider refining or replacing it soon.`
        : "The current reusable support strategy is being reevaluated by your teacher.";
    }
    if (input.latestStrategyOutcomeStatus === "replace") {
      return input.isTeacher
        ? `${input.latestStrategyTitle} now looks like a replacement candidate. Shift the next lesson plan toward a stronger response instead of repeating it blindly.`
        : "Your teacher is likely to replace the current reusable support strategy soon.";
    }
    return input.isTeacher
      ? `${input.latestStrategyTitle} is currently shaping this learner's reusable support path. Keep the lesson plan and assignment support aligned with it.`
      : "Your teacher has attached a reusable support strategy to this tutoring plan.";
  }

  if (input.isTeacher) {
    if (blockedCount > 0 || reinforcementCount > 0 || input.latestIssueTags.length > 0) {
      return "Pressure is visible, but no reusable strategy is attached yet. Apply one from the private learner workflow if this support pattern is likely to repeat.";
    }
    return "No strategy is attached yet. That is fine if the learner is still steady, but reusable strategies become valuable once patterns repeat.";
  }

  return "No reusable support strategy is visible yet for this tutoring relationship.";
}

function getPlaybookSummary(input: {
  isTeacher: boolean;
  latestPlaybookTitle: string | null;
  latestPlaybookAppliedAt: string | null;
  latestPlaybookOutcomeStatus: string | null;
  activeGoals: Array<{ progress_status: string | null }>;
  latestIssueTags: string[];
}) {
  const blockedCount = input.activeGoals.filter((goal) => goal.progress_status === "blocked").length;
  const reinforcementCount = input.activeGoals.filter(
    (goal) => goal.progress_status === "needs_reinforcement"
  ).length;

  if (input.latestPlaybookTitle) {
    if (input.latestPlaybookOutcomeStatus === "helped") {
      return input.isTeacher
        ? `${input.latestPlaybookTitle} is not just attached, it is helping. Keep the broader support path stable before changing course.`
        : "Your teacher’s current playbook is helping and should stay stable while this support pattern is working.";
    }
    if (input.latestPlaybookOutcomeStatus === "partial") {
      return input.isTeacher
        ? `${input.latestPlaybookTitle} is helping only partially. Refine the supporting strategy mix before assuming the playbook is already strong enough.`
        : "Your teacher is refining the current support playbook because it is only partly helping so far.";
    }
    if (input.latestPlaybookOutcomeStatus === "no_change") {
      return input.isTeacher
        ? `${input.latestPlaybookTitle} is attached, but the latest outcome showed no clear lift. Refine or replace it soon.`
        : "The current support playbook is being reevaluated because it has not shown a clear lift yet.";
    }
    if (input.latestPlaybookOutcomeStatus === "replace") {
      return input.isTeacher
        ? `${input.latestPlaybookTitle} now looks like a replacement candidate. Move this learner to a stronger structured response soon.`
        : "Your teacher is likely to replace the current broader support playbook soon.";
    }
    return input.isTeacher
      ? `${input.latestPlaybookTitle} is the current structured playbook guiding this learner. Keep the next lesson and assignment support aligned with it.`
      : "Your teacher has attached a broader support playbook to this private tutoring plan.";
  }

  if (input.isTeacher) {
    if (blockedCount > 0 || reinforcementCount > 0 || input.latestIssueTags.length > 0) {
      return "Support pressure is visible, but no playbook is attached yet. This learner is still being handled more ad hoc than structured.";
    }
    return "No playbook is attached yet. That is fine while the learner is stable, but a playbook helps once support patterns repeat.";
  }

  return "No broader tutoring playbook is visible yet for this relationship.";
}

type ClassroomDetailPageProps = {
  params: Promise<{ classroomId: string }>;
  searchParams: Promise<{ success?: string; templateId?: string }>;
  variant?: "default" | "hub";
  baseClassroomPath?: string;
  baseAssignmentPath?: string;
};

export async function ClassroomDetailPageContent({
  params,
  searchParams,
  variant = "default",
  baseClassroomPath = "/notebook/classes",
  baseAssignmentPath = "/notebook/assignments",
}: ClassroomDetailPageProps) {
  const userId = await getAuthUserId();
  const [{ classroomId }, query] = await Promise.all([params, searchParams]);

  if (!(await canViewClassroom(userId, classroomId))) {
    notFound();
  }

  const [classroom, member, roster, assignments, assignmentSummaries, inquiry, privateStudent, lessonPlan, latestLessonHistory] = await Promise.all([
    getClassroom(classroomId),
    getClassroomMember(classroomId, userId),
    getClassroomRoster(classroomId),
    listAssignmentsForClassroom(classroomId),
    listClassroomAssignmentSummaries(classroomId),
    getInquiryForClassroom(classroomId),
    getPrivateStudentByClassroomId(classroomId),
    getPrivateLessonPlanByClassroomId(classroomId),
    getLatestPrivateLessonHistoryByClassroomId(classroomId),
  ]);

  if (!classroom || !member) {
    notFound();
  }

  const isTeacher = member.role === "teacher";
  const templates = isTeacher ? await listAssignmentTemplatesForTeacher(userId) : [];
  const goals = privateStudent ? await listPrivateStudentGoals(privateStudent.id) : [];
  const latestReview = privateStudent ? await getLatestPrivateStudentReview(privateStudent.id) : null;
  const activeGoals = goals.filter((goal) => goal.status === "active");
  const selectedTemplate = query.templateId
    ? templates.find((template) => template.id === query.templateId)
    : undefined;
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
      redirect(`${baseClassroomPath}/${classroomId}?success=${encodeURIComponent(`error:${result.error}`)}`);
    }
    redirect(`${baseAssignmentPath}/${result.id}`);
  }

  async function createAssignmentFromTemplateFormAction(formData: FormData) {
    "use server";
    const result = await createAssignmentFromTemplateAction(formData);
    if ("error" in result) {
      redirect(`${baseClassroomPath}/${classroomId}?success=${encodeURIComponent(`error:${result.error}`)}`);
    }
    redirect(`${baseAssignmentPath}/${result.id}`);
  }

  const showStandaloneHeader = variant === "default";

  return (
    <div data-testid="classroom-detail-page" className="h-full overflow-auto p-6 pb-20 md:p-10 lg:pb-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            {showStandaloneHeader ? (
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                Classroom
              </p>
            ) : null}
            <h1 className={`${showStandaloneHeader ? "mt-2" : ""} text-3xl font-bold text-foreground`}>{classroom.name}</h1>
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
            {classroom.is_private_tutoring === 1 ? (
              <div className="inline-flex rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-400">
                Private tutoring
              </div>
            ) : null}
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
                      href={`${baseAssignmentPath}/${assignment.id}`}
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

            {classroom.is_private_tutoring === 1 && privateStudent ? (
              <div className="rounded-2xl border bg-card p-5">
                <div className="mb-4 flex items-center gap-2">
                  <BookOpenText className="h-4 w-4 text-[var(--cn-orange)]" />
                  <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    {isTeacher ? "Private Learner Workflow" : "Private Tutoring Status"}
                  </h2>
                </div>
                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-1 text-sky-400">
                        {privateStudent.status.replaceAll("_", " ")}
                      </span>
                      {privateStudent.next_step_type ? (
                        <span className="rounded-full border bg-muted px-2.5 py-1 text-muted-foreground">
                          {privateStudent.next_step_type.replaceAll("_", " ")}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {isTeacher
                        ? "Keep the private tutoring relationship moving by updating the next step, assignment, or follow-up note from the teacher workflow."
                        : getPrivateStudentStatusSummary({
                            status: privateStudent.status,
                            nextStepType: privateStudent.next_step_type,
                            nextAssignmentId: privateStudent.next_assignment_id,
                          })}
                    </p>
                    {lessonPlan ? (
                      <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 p-3 text-sm text-foreground/90">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-1 text-sky-400">
                            Next lesson · {getPrivateLessonPlanStatusLabel(lessonPlan.plan_status)}
                          </span>
                          {lessonPlan.target_date ? (
                            <span className="rounded-full border bg-muted px-2.5 py-1 text-muted-foreground">
                              {new Date(lessonPlan.target_date).toLocaleDateString("en-US")}
                            </span>
                          ) : null}
                        </div>
                        {lessonPlan.focus_note ? (
                          <p className="mt-3 text-sm font-medium text-foreground">{lessonPlan.focus_note}</p>
                        ) : null}
                        <p className="mt-2 text-sm text-muted-foreground">
                          {getLessonPlanSummary({
                            planStatus: lessonPlan.plan_status,
                            targetDate: lessonPlan.target_date,
                            assignmentTitle: lessonPlan.next_assignment_title,
                            templateTitle: lessonPlan.next_template_title,
                            beforeLessonExpectation: lessonPlan.before_lesson_expectation,
                          })}
                        </p>
                      </div>
                    ) : null}
                    {activeGoals.length > 0 ? (
                      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-foreground/90">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-emerald-400">
                            Current goals
                          </span>
                        </div>
                        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                          {activeGoals.slice(0, 3).map((goal) => (
                            <li key={goal.id}>
                              <span className="font-medium text-foreground">{goal.title}</span>
                              {goal.progress_status ? (
                                <span className="ml-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-2 py-0.5 text-[11px] text-sky-400">
                                  {goal.progress_status.replaceAll("_", " ")}
                                </span>
                              ) : null}
                              {goal.detail ? ` · ${goal.detail}` : ""}
                              {goal.progress_note ? ` · ${goal.progress_note}` : ""}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-foreground/90">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-emerald-400">
                          Continuity
                        </span>
                        <span className="rounded-full border bg-muted px-2.5 py-1 text-muted-foreground">
                          {activeGoals.length} active goal{activeGoals.length === 1 ? "" : "s"}
                        </span>
                        {latestLessonHistory ? (
                          <span className="rounded-full border bg-muted px-2.5 py-1 text-muted-foreground">
                            Last check-in {new Date(latestLessonHistory.recorded_at).toLocaleDateString("en-US")}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">
                        {getContinuitySummary({
                          isTeacher,
                          activeGoalCount: activeGoals.length,
                          latestHistoryAt: latestLessonHistory?.recorded_at ?? null,
                        })}
                      </p>
                    </div>
                    <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-foreground/90">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-rose-300">
                          Support
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">
                        {getSupportSummary({
                          isTeacher,
                          activeGoals,
                          latestIssueTags: latestLessonHistory?.issue_tags ?? [],
                          latestInterventionNote: latestLessonHistory?.intervention_note ?? null,
                        })}
                      </p>
                    </div>
                    <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-3 text-sm text-foreground/90">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 text-violet-300">
                          Adaptation
                        </span>
                        {latestReview?.reviewed_at ? (
                          <span className="rounded-full border bg-muted px-2.5 py-1 text-muted-foreground">
                            Last review {new Date(latestReview.reviewed_at).toLocaleDateString("en-US")}
                          </span>
                        ) : null}
                        {privateStudent.last_plan_adapted_at ? (
                          <span className="rounded-full border bg-muted px-2.5 py-1 text-muted-foreground">
                            Last adapted {new Date(privateStudent.last_plan_adapted_at).toLocaleDateString("en-US")}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">
                        {latestReview?.adaptation_note
                          ? latestReview.adaptation_note
                          : latestReview?.reviewed_at && !privateStudent.last_plan_adapted_at
                            ? "A review exists, but the live plan has not been adapted yet. The teacher should update the next lesson direction soon."
                          : privateStudent.last_plan_adapted_at
                            ? "The tutoring plan has been adapted recently. Keep the current lesson focus and assignment context aligned with that direction."
                            : "No adapted plan is visible yet. The teacher should translate recent review and intervention signals into the next lesson direction."}
                      </p>
                    </div>
                    <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 p-3 text-sm text-foreground/90">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-1 text-sky-400">
                          Strategy
                        </span>
                        {privateStudent.last_strategy_title ? (
                          <span className="rounded-full border bg-muted px-2.5 py-1 text-muted-foreground">
                            {privateStudent.last_strategy_title}
                          </span>
                        ) : null}
                        {privateStudent.last_strategy_applied_at ? (
                          <span className="rounded-full border bg-muted px-2.5 py-1 text-muted-foreground">
                            Applied {new Date(privateStudent.last_strategy_applied_at).toLocaleDateString("en-US")}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">
                        {getStrategySummary({
                          isTeacher,
                          latestStrategyTitle: privateStudent.last_strategy_title,
                          latestStrategyAppliedAt: privateStudent.last_strategy_applied_at,
                          latestStrategyOutcomeStatus: privateStudent.last_strategy_outcome_status,
                          activeGoals,
                          latestIssueTags: latestLessonHistory?.issue_tags ?? [],
                        })}
                      </p>
                      {privateStudent.last_strategy_outcome_status ? (
                        <p className="mt-2 text-sm text-muted-foreground">
                          Latest strategy outcome: {privateStudent.last_strategy_outcome_status.replaceAll("_", " ")}
                          {privateStudent.last_strategy_outcome_at
                            ? ` · ${new Date(privateStudent.last_strategy_outcome_at).toLocaleDateString("en-US")}`
                            : ""}
                          {privateStudent.last_strategy_outcome_note
                            ? ` · ${privateStudent.last_strategy_outcome_note}`
                            : ""}
                        </p>
                      ) : privateStudent.last_strategy_title ? (
                        <p className="mt-2 text-sm text-muted-foreground">
                          No outcome has been recorded yet for the current strategy.
                        </p>
                      ) : null}
                    </div>
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-foreground/90">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-amber-300">
                          Playbook
                        </span>
                        {privateStudent.last_playbook_title ? (
                          <span className="rounded-full border bg-muted px-2.5 py-1 text-muted-foreground">
                            {privateStudent.last_playbook_title}
                          </span>
                        ) : null}
                        {privateStudent.last_playbook_applied_at ? (
                          <span className="rounded-full border bg-muted px-2.5 py-1 text-muted-foreground">
                            Applied {new Date(privateStudent.last_playbook_applied_at).toLocaleDateString("en-US")}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">
                        {getPlaybookSummary({
                          isTeacher,
                          latestPlaybookTitle: privateStudent.last_playbook_title,
                          latestPlaybookAppliedAt: privateStudent.last_playbook_applied_at,
                          latestPlaybookOutcomeStatus: privateStudent.last_playbook_outcome_status ?? null,
                          activeGoals,
                          latestIssueTags: latestLessonHistory?.issue_tags ?? [],
                        })}
                      </p>
                      {privateStudent.last_playbook_outcome_status ? (
                        <p className="mt-2 text-sm text-muted-foreground">
                          Latest playbook outcome: {privateStudent.last_playbook_outcome_status.replaceAll("_", " ")}
                          {privateStudent.last_playbook_outcome_at
                            ? ` · ${new Date(privateStudent.last_playbook_outcome_at).toLocaleDateString("en-US")}`
                            : ""}
                          {privateStudent.last_playbook_outcome_note
                            ? ` · ${privateStudent.last_playbook_outcome_note}`
                            : ""}
                        </p>
                      ) : privateStudent.last_playbook_title ? (
                        <p className="mt-2 text-sm text-muted-foreground">
                          No outcome has been recorded yet for the current playbook.
                        </p>
                      ) : null}
                    </div>
                    {latestLessonHistory ? (
                      <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-foreground/90">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-amber-300">
                            Latest check-in
                          </span>
                          <span className="text-muted-foreground">
                            {new Date(latestLessonHistory.recorded_at).toLocaleDateString("en-US")}
                          </span>
                        </div>
                        <p className="mt-3 text-sm font-medium text-foreground">{latestLessonHistory.summary}</p>
                        {latestLessonHistory.practice_focus ? (
                          <p className="mt-2 text-sm text-muted-foreground">
                            Practice focus: {latestLessonHistory.practice_focus}
                          </p>
                        ) : null}
                        {latestLessonHistory.issue_tags.length > 0 ? (
                          <div className="mt-3 flex flex-wrap gap-2 text-xs">
                            {latestLessonHistory.issue_tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-amber-300"
                              >
                                {getPrivateLessonIssueTagLabel(tag)}
                              </span>
                            ))}
                          </div>
                        ) : null}
                        {latestLessonHistory.intervention_note ? (
                          <p className="mt-2 text-sm text-muted-foreground">
                            Intervention: {latestLessonHistory.intervention_note}
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                  {isTeacher ? (
                    <Link
                      href={`/notebook/teacher/private-students/${privateStudent.id}`}
                      className="inline-flex items-center rounded-lg border px-3 py-2 text-sm font-medium text-[var(--cn-orange)] transition-colors hover:border-[var(--cn-orange)]/30 hover:bg-[var(--cn-orange)]/10"
                    >
                      {lessonPlan ? "Manage learner plan" : "Open workflow"}
                    </Link>
                  ) : lessonPlan?.next_assignment_id ? (
                    <Link
                      href={`${baseAssignmentPath}/${lessonPlan.next_assignment_id}`}
                      className="inline-flex items-center rounded-lg border px-3 py-2 text-sm font-medium text-[var(--cn-orange)] transition-colors hover:border-[var(--cn-orange)]/30 hover:bg-[var(--cn-orange)]/10"
                    >
                      Open next lesson work
                    </Link>
                  ) : privateStudent.next_assignment_id ? (
                    <Link
                      href={`${baseAssignmentPath}/${privateStudent.next_assignment_id}`}
                      className="inline-flex items-center rounded-lg border px-3 py-2 text-sm font-medium text-[var(--cn-orange)] transition-colors hover:border-[var(--cn-orange)]/30 hover:bg-[var(--cn-orange)]/10"
                    >
                      Open current assignment
                    </Link>
                  ) : null}
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
                    <Link key={assignment.id} href={`${baseAssignmentPath}/${assignment.id}`} className="block rounded-xl border p-4 transition-colors hover:border-[var(--cn-orange)]/30 hover:bg-muted/20">
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

            {classroom.is_private_tutoring === 1 && inquiry ? (
              <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-5">
                <div className="mb-4 flex items-center gap-2">
                  <BookOpenText className="h-4 w-4 text-sky-400" />
                  <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-300">
                    Private Classroom Onboarding
                  </h2>
                </div>
                <div className="space-y-3 text-sm">
                  <p className="text-foreground/90">
                    {inquiry.onboarding_message ||
                      "This private classroom was created from a teacher inquiry. Start with the first assignment or continue working inside the notebook together."}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {inquiry.initial_assignment_id ? (
                      <Link
                        href={`${baseAssignmentPath}/${inquiry.initial_assignment_id}`}
                        className="font-medium text-[var(--cn-orange)] hover:underline"
                      >
                        {isTeacher ? "Open onboarding assignment" : "Start first assignment"}
                        {inquiry.assignment_title ? `: ${inquiry.assignment_title}` : ""}
                      </Link>
                    ) : null}
                    {isTeacher ? (
                      <Link
                        href="/notebook/teacher/setup"
                        className="font-medium text-[var(--cn-orange)] hover:underline"
                      >
                        Edit tutoring setup
                      </Link>
                    ) : null}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isTeacher
                      ? `This private classroom was created from ${inquiry.student_name}'s inquiry.`
                      : `This classroom was created after your inquiry to ${inquiry.teacher_name}.`}
                  </p>
                </div>
              </div>
            ) : null}

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

            {isTeacher && templates.length > 0 ? (
              <section className="rounded-2xl border bg-card p-5">
                <div className="mb-4 flex items-center gap-2">
                  <BookOpenText className="h-4 w-4 text-[var(--cn-orange)]" />
                  <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Create From Template
                  </h2>
                </div>
                <form action={createAssignmentFromTemplateFormAction} className="space-y-3">
                  <input type="hidden" name="classroom_id" value={classroom.id} />
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground/80">Template</label>
                    <select
                      name="template_id"
                      defaultValue={selectedTemplate?.id || templates[0]?.id || ""}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--cn-orange)]"
                    >
                      {templates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground/80">Assignment title</label>
                    <input
                      name="title"
                      defaultValue={selectedTemplate?.title || ""}
                      placeholder="Optional override"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--cn-orange)]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground/80">Description</label>
                    <textarea
                      name="description"
                      rows={2}
                      defaultValue={selectedTemplate?.description || ""}
                      placeholder="Optional override"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--cn-orange)]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground/80">Prompt</label>
                    <textarea
                      name="prompt"
                      rows={3}
                      defaultValue={selectedTemplate?.prompt || ""}
                      placeholder="Optional override"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--cn-orange)]"
                    />
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
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--cn-orange)]"
                      />
                    </div>
                  </div>
                  <PendingSubmitButton pendingLabel="Creating from template..." className="w-full justify-center rounded-lg border border-[var(--cn-orange)]/20 bg-[var(--cn-orange)]/10 px-4 py-2 text-sm font-medium text-[var(--cn-orange)] transition-colors hover:bg-[var(--cn-orange)]/15">
                    Create From Template
                  </PendingSubmitButton>
                </form>
              </section>
            ) : null}

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
              <Link href={baseClassroomPath} className="mt-4 inline-flex text-[var(--cn-orange)] hover:underline">
                Back to classes
              </Link>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default async function ClassroomDetailPage(props: ClassroomDetailPageProps) {
  return <ClassroomDetailPageContent {...props} />;
}
