import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { MessageSquareMore, Users } from "lucide-react";
import { getAuthUserId } from "@/lib/auth-utils";
import { canManagePrivateLearnerState } from "@/lib/classroom-permissions";
import { isTeacherUser } from "@/lib/classrooms";
import { listAssignmentTemplatesForTeacher } from "@/lib/assignment-templates";
import { listAssignmentsForClassroom } from "@/lib/assignments";
import { listPrivateLessonHistory } from "@/lib/private-lesson-history";
import { listPrivateStudentReviews } from "@/lib/private-student-reviews";
import {
  PRIVATE_LESSON_ISSUE_TAGS,
  getPrivateLessonIssueTagLabel,
} from "@/lib/private-lesson-history";
import {
  getPrivateStudentGoalStatusLabel,
  getPrivateStudentGoalProgressStatusLabel,
  listPrivateStudentGoals,
} from "@/lib/private-student-goals";
import { getPrivateStudentDetail } from "@/lib/private-students";
import {
  ensurePrivateLessonPlan,
  getPrivateLessonPlanStatusLabel,
} from "@/lib/private-lesson-plans";
import {
  adaptPrivateLearnerPlanAction,
  applyTeacherPlaybookAction,
  applyTeacherStrategyAction,
  createPrivateStudentReviewAction,
  createPrivateLessonHistoryAction,
  createPrivateStudentGoalAction,
  updatePrivateStudentGoalAction,
  updatePrivateStudentStateAction,
  recordTeacherStrategyOutcomeAction,
} from "@/lib/actions";
import { listTeacherPlaybooksForTeacher } from "@/lib/teacher-playbooks";
import { listTeacherStrategiesForTeacher } from "@/lib/teacher-strategies";
import { listPrivateStudentPlaybookApplications } from "@/lib/private-student-playbook-applications";
import { listPrivateStudentStrategyApplications } from "@/lib/private-student-strategy-applications";
import {
  getPrivateStudentStrategyOutcomeLabel,
} from "@/lib/private-student-strategy-outcomes";
import { PendingSubmitButton } from "@/components/notebook/pending-submit-button";

export const dynamic = "force-dynamic";

const statusOptions = [
  { value: "onboarding", label: "Onboarding" },
  { value: "active", label: "Active" },
  { value: "awaiting_teacher", label: "Awaiting teacher" },
  { value: "awaiting_student", label: "Awaiting student" },
  { value: "inactive", label: "Inactive" },
] as const;

const nextStepOptions = [
  { value: "complete_assignment", label: "Complete assignment" },
  { value: "review_feedback", label: "Review feedback" },
  { value: "await_teacher_assignment", label: "Await teacher assignment" },
  { value: "follow_up", label: "Follow up" },
  { value: "none", label: "No next step" },
] as const;

const planStatusOptions = [
  { value: "awaiting_assignment", label: "Awaiting assignment" },
  { value: "planned", label: "Planned" },
  { value: "awaiting_completion", label: "Awaiting completion" },
  { value: "completed", label: "Completed" },
  { value: "stale", label: "Stale" },
] as const;

const goalStatusOptions = [
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "completed", label: "Completed" },
] as const;

const goalProgressOptions = [
  { value: "", label: "No progress marker" },
  { value: "improving", label: "Improving" },
  { value: "stable", label: "Stable" },
  { value: "needs_reinforcement", label: "Needs reinforcement" },
  { value: "blocked", label: "Blocked" },
] as const;

function StatusPill({ status }: { status: string }) {
  const styles =
    status === "active"
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
      : status === "awaiting_student"
        ? "border-sky-500/20 bg-sky-500/10 text-sky-400"
        : status === "awaiting_teacher"
          ? "border-amber-500/20 bg-amber-500/10 text-amber-300"
          : status === "inactive"
            ? "border-rose-500/20 bg-rose-500/10 text-rose-300"
            : "border-[var(--cn-orange)]/20 bg-[var(--cn-orange)]/10 text-[var(--cn-orange)]";

  const label = statusOptions.find((option) => option.value === status)?.label ?? status;

  return (
    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${styles}`}>
      {label}
    </span>
  );
}

function formatDateTime(value: string | null) {
  if (!value) return "No activity yet";
  return new Date(value).toLocaleString("en-US");
}

function getWorkflowGuidance(status: string, nextStepType: string | null, assignmentTitle: string | null) {
  if (status === "awaiting_teacher") {
    return assignmentTitle
      ? `You are up next. Review progress and decide whether to adjust or reinforce ${assignmentTitle}.`
      : "You are up next. Add a new assignment, feedback, or follow-up note so the learner is not blocked.";
  }

  if (status === "awaiting_student") {
    return assignmentTitle
      ? `The learner is expected to keep moving on ${assignmentTitle}.`
      : "The learner is expected to complete the next step you assigned.";
  }

  if (status === "inactive") {
    return "This relationship appears inactive. A follow-up note or a fresh assignment is likely the right next move.";
  }

  if (status === "onboarding") {
    return assignmentTitle
      ? `Onboarding is still underway through ${assignmentTitle}.`
      : "Onboarding is underway, but there is no linked assignment yet.";
  }

  if (nextStepType === "review_feedback") {
    return "The current next step is to have the learner review feedback and continue.";
  }

  return "This learner looks active. Keep the next step clear so momentum stays visible.";
}

function getPlanGuidance(
  planStatus: string,
  targetDate: string | null,
  assignmentTitle: string | null,
  templateTitle: string | null
) {
  const dateLabel = targetDate
    ? new Date(targetDate).toLocaleDateString("en-US")
    : "No target date set yet";

  if (planStatus === "awaiting_assignment") {
    return "This learner needs the next lesson/check-in to be grounded in a real assignment or template before the cadence can stay visible.";
  }

  if (planStatus === "awaiting_completion") {
    return assignmentTitle
      ? `The next lesson is tied to ${assignmentTitle}. The learner should complete that work before the planned check-in.`
      : "The next lesson expects learner work, but no linked assignment is set yet.";
  }

  if (planStatus === "completed") {
    return `The current lesson plan is marked complete. Set the next checkpoint so the relationship does not drift after ${dateLabel}.`;
  }

  if (planStatus === "stale") {
    return "This next-lesson plan looks stale. Refresh the date, focus, and expected work so momentum becomes clear again.";
  }

  return templateTitle
    ? `The next check-in is structured around ${templateTitle} and is currently targeted for ${dateLabel}.`
    : `The next check-in is currently targeted for ${dateLabel}.`;
}

function getContinuityGuidance(input: {
  activeGoalCount: number;
  latestHistoryAt: string | null;
  status: string;
}) {
  if (input.status === "onboarding") {
    return "Continuity is still forming during onboarding. Set one or two active goals and record the first check-in after the learner completes the initial work.";
  }
  if (input.activeGoalCount === 0 && !input.latestHistoryAt) {
    return "This learner has no active goals and no lesson history yet. Define a goal and leave a short check-in note after the next interaction.";
  }
  if (input.activeGoalCount === 0) {
    return "This learner has lesson history, but no active goals. Add at least one active goal so the relationship has a visible medium-term direction.";
  }
  if (!input.latestHistoryAt) {
    return "This learner has active goals, but no lesson/check-in history yet. Record a short outcome note after the next lesson so continuity becomes visible.";
  }
  return "Goals, next lesson planning, and lesson history are all present. Keep them updated so continuity stays visible over time.";
}

function getInterventionGuidance(input: {
  blockedGoalCount: number;
  reinforcementGoalCount: number;
  recurringIssueTags: string[];
  latestInterventionNote: string | null;
}) {
  if (input.blockedGoalCount > 0) {
    return input.latestInterventionNote
      ? `One or more goals are blocked. Use the intervention note and recurring issues below to adjust the learner's next step.`
      : `One or more goals are blocked. The teacher should simplify the next step or change the assignment focus.`;
  }
  if (input.reinforcementGoalCount > 0) {
    return `The learner needs reinforcement on at least one active goal. Keep the next lesson focused and avoid adding too many new targets.`;
  }
  if (input.recurringIssueTags.length > 0) {
    return `Recurring issues are starting to show up: ${input.recurringIssueTags
      .join(", ")
      .replaceAll("_", " ")}. Reinforce those areas in the next lesson plan.`;
  }
  return "No urgent intervention markers right now. Keep watching goal momentum and lesson history for early signs of drift.";
}

function getReviewGuidance(input: {
  latestReviewAt: string | null;
  lastAdaptedAt: string | null;
  blockedGoalCount: number;
  reinforcementGoalCount: number;
  recurringIssueTags: string[];
}) {
  if (!input.latestReviewAt) {
    return "No review snapshot yet. Add one when you want to summarize the learner’s recent state and decide what should change next.";
  }
  if (
    input.lastAdaptedAt &&
    new Date(input.lastAdaptedAt).getTime() >= new Date(input.latestReviewAt).getTime()
  ) {
    return "Recent review context is already reflected in the live plan. Keep the next lesson focus and assignment support aligned with that adaptation.";
  }
  if (
    input.blockedGoalCount > 0 ||
    input.reinforcementGoalCount > 0 ||
    input.recurringIssueTags.length > 0
  ) {
    return "Intervention pressure exists. A fresh review snapshot helps translate those signals into the next plan update.";
  }
  return "Recent review context is available. Use it to keep adaptation decisions visible without rewriting long notes.";
}

function getStrategyGuidance(input: {
  latestStrategyTitle: string | null;
  latestStrategyAppliedAt: string | null;
  blockedGoalCount: number;
  reinforcementGoalCount: number;
  recurringIssueTags: string[];
  hasLatestReview: boolean;
}) {
  if (input.latestStrategyTitle) {
    return input.blockedGoalCount > 0 ||
      input.reinforcementGoalCount > 0 ||
      input.recurringIssueTags.length > 0
      ? `${input.latestStrategyTitle} is the active reusable strategy, but pressure is still visible. Reapply it with a clearer note or switch to a different strategy if the learner has outgrown the current response.`
      : `${input.latestStrategyTitle} is the current reusable strategy for this learner. Keep the next lesson plan, linked assignment, and goal focus aligned with it.`;
  }

  if (input.blockedGoalCount > 0) {
    return "Blocked goals are visible and no reusable strategy has been applied yet. This is the clearest moment to apply one instead of managing the learner ad hoc.";
  }

  if (input.reinforcementGoalCount > 0 || input.recurringIssueTags.length > 0) {
    return "Reinforcement pressure or recurring issues are visible. A saved strategy can turn that pattern into a more repeatable plan response.";
  }

  return input.hasLatestReview
    ? "A review snapshot exists, but no reusable strategy has been applied yet. Apply one if the same type of support is likely to come up again."
    : "No strategy has been applied yet. That is fine if the learner is still straightforward, but a saved strategy helps once patterns start repeating.";
}

function getPlaybookGuidance(input: {
  latestPlaybookTitle: string | null;
  blockedGoalCount: number;
  reinforcementGoalCount: number;
  recurringIssueTags: string[];
}) {
  if (input.latestPlaybookTitle) {
    return input.blockedGoalCount > 0 ||
      input.reinforcementGoalCount > 0 ||
      input.recurringIssueTags.length > 0
      ? `${input.latestPlaybookTitle} is the active structured support path, but pressure is still visible. Reapply it with a clearer note or refine the supporting strategy mix.`
      : `${input.latestPlaybookTitle} is the active structured playbook for this learner. Keep the lesson plan and goal focus aligned with that broader support path.`;
  }

  if (input.blockedGoalCount > 0) {
    return "Blocked goals are visible and no playbook is attached yet. This is a strong signal that support is becoming too ad hoc and should be structured.";
  }

  if (input.reinforcementGoalCount > 0 || input.recurringIssueTags.length > 0) {
    return "Pressure is repeating. A playbook can group multiple strategies into a more stable response instead of relying on one-off adjustments.";
  }

  return "No playbook is attached yet. That is fine if support is still simple, but playbooks help once the same pattern keeps coming back.";
}

export default async function TeacherPrivateStudentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ privateStudentId: string }>;
  searchParams: Promise<{ success?: string }>;
}) {
  const userId = await getAuthUserId();
  const [{ privateStudentId }, query] = await Promise.all([params, searchParams]);

  if (!(await isTeacherUser(userId))) {
    redirect("/notebook/classes");
  }

  if (!(await canManagePrivateLearnerState(userId, privateStudentId))) {
    notFound();
  }

  const detail = await getPrivateStudentDetail(privateStudentId);
  if (!detail) {
    notFound();
  }

  const [assignments, templates, lessonPlan, goals, lessonHistory, reviews, strategies, playbooks, strategyApplications, playbookApplications] = await Promise.all([
    listAssignmentsForClassroom(detail.classroom_id),
    listAssignmentTemplatesForTeacher(userId),
    ensurePrivateLessonPlan({
      privateStudentId,
      teacherUserId: userId,
      classroomId: detail.classroom_id,
    }),
    listPrivateStudentGoals(privateStudentId),
    listPrivateLessonHistory(privateStudentId),
    listPrivateStudentReviews(privateStudentId),
    listTeacherStrategiesForTeacher(userId),
    listTeacherPlaybooksForTeacher(userId),
    listPrivateStudentStrategyApplications(privateStudentId),
    listPrivateStudentPlaybookApplications(privateStudentId),
  ]);
  const activeGoals = goals.filter((goal) => goal.status === "active");
  const completedGoals = goals.filter((goal) => goal.status === "completed");
  const blockedGoals = goals.filter((goal) => goal.progress_status === "blocked");
  const reinforcementGoals = goals.filter(
    (goal) => goal.progress_status === "needs_reinforcement"
  );
  const latestHistory = lessonHistory[0] ?? null;
  const issueCounts = new Map<string, number>();
  for (const entry of lessonHistory) {
    for (const tag of entry.issue_tags) {
      issueCounts.set(tag, (issueCounts.get(tag) ?? 0) + 1);
    }
  }
  const recurringIssueTags = Array.from(issueCounts.entries())
    .filter(([, count]) => count >= 2)
    .map(([tag]) => tag);
  const latestReview = reviews[0] ?? null;

  async function updateStateFormAction(formData: FormData) {
    "use server";
    const result = await updatePrivateStudentStateAction(formData);
    if ("error" in result) {
      redirect(
        `/notebook/teacher/private-students/${privateStudentId}?success=${encodeURIComponent(`error:${result.error}`)}`
      );
    }
    redirect(`/notebook/teacher/private-students/${privateStudentId}?success=updated`);
  }

  async function createGoalFormAction(formData: FormData) {
    "use server";
    const result = await createPrivateStudentGoalAction(formData);
    if ("error" in result) {
      redirect(
        `/notebook/teacher/private-students/${privateStudentId}?success=${encodeURIComponent(`error:${result.error}`)}`
      );
    }
    redirect(`/notebook/teacher/private-students/${privateStudentId}?success=goal-created`);
  }

  async function updateGoalFormAction(formData: FormData) {
    "use server";
    const result = await updatePrivateStudentGoalAction(formData);
    if ("error" in result) {
      redirect(
        `/notebook/teacher/private-students/${privateStudentId}?success=${encodeURIComponent(`error:${result.error}`)}`
      );
    }
    redirect(`/notebook/teacher/private-students/${privateStudentId}?success=goal-updated`);
  }

  async function createHistoryFormAction(formData: FormData) {
    "use server";
    const result = await createPrivateLessonHistoryAction(formData);
    if ("error" in result) {
      redirect(
        `/notebook/teacher/private-students/${privateStudentId}?success=${encodeURIComponent(`error:${result.error}`)}`
      );
    }
    redirect(`/notebook/teacher/private-students/${privateStudentId}?success=history-created`);
  }

  async function createReviewFormAction(formData: FormData) {
    "use server";
    const result = await createPrivateStudentReviewAction(formData);
    if ("error" in result) {
      redirect(
        `/notebook/teacher/private-students/${privateStudentId}?success=${encodeURIComponent(`error:${result.error}`)}`
      );
    }
    redirect(`/notebook/teacher/private-students/${privateStudentId}?success=review-created`);
  }

  async function adaptPlanFormAction(formData: FormData) {
    "use server";
    const result = await adaptPrivateLearnerPlanAction(formData);
    if ("error" in result) {
      redirect(
        `/notebook/teacher/private-students/${privateStudentId}?success=${encodeURIComponent(`error:${result.error}`)}`
      );
    }
    redirect(`/notebook/teacher/private-students/${privateStudentId}?success=plan-adapted`);
  }

  async function applyStrategyFormAction(formData: FormData) {
    "use server";
    const result = await applyTeacherStrategyAction(formData);
    if ("error" in result) {
      redirect(
        `/notebook/teacher/private-students/${privateStudentId}?success=${encodeURIComponent(`error:${result.error}`)}`
      );
    }
    redirect(`/notebook/teacher/private-students/${privateStudentId}?success=strategy-applied`);
  }

  async function applyPlaybookFormAction(formData: FormData) {
    "use server";
    const result = await applyTeacherPlaybookAction(formData);
    if ("error" in result) {
      redirect(
        `/notebook/teacher/private-students/${privateStudentId}?success=${encodeURIComponent(`error:${result.error}`)}`
      );
    }
    redirect(`/notebook/teacher/private-students/${privateStudentId}?success=playbook-applied`);
  }

  async function recordStrategyOutcomeFormAction(formData: FormData) {
    "use server";
    const result = await recordTeacherStrategyOutcomeAction(formData);
    if ("error" in result) {
      redirect(
        `/notebook/teacher/private-students/${privateStudentId}?success=${encodeURIComponent(`error:${result.error}`)}`
      );
    }
    redirect(`/notebook/teacher/private-students/${privateStudentId}?success=strategy-outcome-saved`);
  }

  return (
    <div data-testid="teacher-private-student-detail-page" className="h-full overflow-auto p-6 pb-20 md:p-10 lg:pb-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">Private learner</p>
            <h1 className="mt-2 text-3xl font-bold text-foreground">{detail.student_name}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {detail.classroom_name} · {detail.student_email}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <StatusPill status={detail.status} />
            <Link
              href="/notebook/teacher/private-students"
              className="inline-flex items-center rounded-lg border px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
            >
              Back to Private Learners
            </Link>
          </div>
        </div>

        {query.success ? (
          <div
            className={`rounded-xl px-4 py-3 text-sm ${
              query.success.startsWith("error:")
                ? "border border-rose-500/20 bg-rose-500/10 text-rose-300"
                : "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
            }`}
          >
            {query.success.startsWith("error:")
              ? decodeURIComponent(query.success.slice(6))
              : query.success === "plan-updated"
                ? "Next lesson plan updated."
                : query.success === "goal-created"
                  ? "Goal created."
                  : query.success === "goal-updated"
                    ? "Goal updated."
                    : query.success === "history-created"
                      ? "Lesson history added."
                    : query.success === "review-created"
                        ? "Review snapshot added."
                        : query.success === "plan-adapted"
                          ? "Plan adapted."
                        : query.success === "strategy-applied"
                          ? "Strategy applied."
                          : query.success === "playbook-applied"
                            ? "Playbook applied."
                          : query.success === "strategy-outcome-saved"
                            ? "Strategy outcome saved."
                    : "Private learner workflow updated."}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-4">
          <SummaryCard label="Submissions" value={detail.submission_count} />
          <SummaryCard label="Awaiting review" value={detail.awaiting_review_count} tone="sky" />
          <SummaryCard label="Last submission" value={formatDateTime(detail.last_submitted_at)} />
          <SummaryCard label="Last activity" value={formatDateTime(detail.last_submission_activity_at || detail.updated_at)} />
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          <SummaryCard label="Active goals" value={activeGoals.length} tone="emerald" />
          <SummaryCard label="Completed goals" value={completedGoals.length} />
          <SummaryCard label="History records" value={lessonHistory.length} tone="sky" />
          <SummaryCard
            label="Latest check-in"
            value={latestHistory ? formatDateTime(latestHistory.recorded_at) : "No history yet"}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <SummaryCard label="Blocked goals" value={blockedGoals.length} tone="rose" />
          <SummaryCard label="Needs reinforcement" value={reinforcementGoals.length} tone="amber" />
          <SummaryCard label="Recurring issues" value={recurringIssueTags.length} tone="sky" />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <SummaryCard label="Review snapshots" value={reviews.length} tone="sky" />
          <SummaryCard
            label="Last review"
            value={latestReview ? formatDateTime(latestReview.reviewed_at) : "No review yet"}
          />
          <SummaryCard
            label="Last adapted"
            value={detail.last_plan_adapted_at ? formatDateTime(detail.last_plan_adapted_at) : "Not adapted yet"}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <SummaryCard label="Strategies applied" value={strategyApplications.length} tone="sky" />
          <SummaryCard
            label="Last strategy"
            value={detail.last_strategy_title ?? "No strategy yet"}
          />
          <SummaryCard
            label="Last applied"
            value={detail.last_strategy_applied_at ? formatDateTime(detail.last_strategy_applied_at) : "Not applied yet"}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <SummaryCard label="Playbooks applied" value={playbookApplications.length} tone="sky" />
          <SummaryCard
            label="Last playbook"
            value={detail.last_playbook_title ?? "No playbook yet"}
          />
          <SummaryCard
            label="Last playbook applied"
            value={
              detail.last_playbook_applied_at
                ? formatDateTime(detail.last_playbook_applied_at)
                : "Not applied yet"
            }
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <SummaryCard
            label="Last outcome"
            value={
              detail.last_strategy_outcome_status
                ? getPrivateStudentStrategyOutcomeLabel(
                    detail.last_strategy_outcome_status as
                      | "helped"
                      | "partial"
                      | "no_change"
                      | "replace"
                  )
                : "No outcome yet"
            }
            tone="sky"
          />
          <SummaryCard
            label="Outcome recorded"
            value={detail.last_strategy_outcome_at ? formatDateTime(detail.last_strategy_outcome_at) : "Not recorded yet"}
          />
          <SummaryCard
            label="Strategy follow-through"
            value={
              detail.last_strategy_title
                ? detail.last_strategy_outcome_status
                  ? "Tracked"
                  : "Needs outcome"
                : "No strategy yet"
            }
            tone={
              detail.last_strategy_title
                ? detail.last_strategy_outcome_status
                  ? "emerald"
                  : "amber"
                : undefined
            }
          />
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-foreground/90">
          {getWorkflowGuidance(detail.status, detail.next_step_type, detail.next_assignment_title)}
        </div>

        <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-4 text-sm text-foreground/90">
          {getPlanGuidance(
            lessonPlan.plan_status,
            lessonPlan.target_date,
            lessonPlan.next_assignment_title,
            lessonPlan.next_template_title
          )}
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-foreground/90">
          {getContinuityGuidance({
            activeGoalCount: activeGoals.length,
            latestHistoryAt: latestHistory?.recorded_at ?? null,
            status: detail.status,
          })}
        </div>

        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-foreground/90">
          {getInterventionGuidance({
            blockedGoalCount: blockedGoals.length,
            reinforcementGoalCount: reinforcementGoals.length,
            recurringIssueTags,
            latestInterventionNote: latestHistory?.intervention_note ?? null,
          })}
        </div>

        <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4 text-sm text-foreground/90">
          {getReviewGuidance({
            latestReviewAt: latestReview?.reviewed_at ?? detail.last_review_snapshot_at,
            lastAdaptedAt: detail.last_plan_adapted_at,
            blockedGoalCount: blockedGoals.length,
            reinforcementGoalCount: reinforcementGoals.length,
            recurringIssueTags,
          })}
        </div>

        <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-4 text-sm text-foreground/90">
          {getStrategyGuidance({
            latestStrategyTitle: detail.last_strategy_title,
            latestStrategyAppliedAt: detail.last_strategy_applied_at,
            blockedGoalCount: blockedGoals.length,
            reinforcementGoalCount: reinforcementGoals.length,
            recurringIssueTags,
            hasLatestReview: Boolean(latestReview?.reviewed_at),
          })}
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-foreground/90">
          {getPlaybookGuidance({
            latestPlaybookTitle: detail.last_playbook_title ?? null,
            blockedGoalCount: blockedGoals.length,
            reinforcementGoalCount: reinforcementGoals.length,
            recurringIssueTags,
          })}
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
          <div className="space-y-6">
            <section className="rounded-2xl border bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <MessageSquareMore className="h-4 w-4 text-violet-400" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Review Snapshot
                </h2>
              </div>

              <div className="space-y-4">
                <form action={createReviewFormAction} className="rounded-xl border border-dashed p-4 space-y-3">
                  <input type="hidden" name="private_student_id" value={detail.id} />
                  <div className="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)]">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-foreground/80">Reviewed date</label>
                      <input
                        type="date"
                        name="reviewed_at"
                        defaultValue={new Date().toISOString().slice(0, 10)}
                        className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-foreground/80">Summary</label>
                      <input
                        type="text"
                        name="summary"
                        placeholder="Short summary of the learner's current state"
                        className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground/80">What improved</label>
                    <textarea
                      name="what_improved"
                      rows={2}
                      placeholder="Optional note about what is improving."
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground/80">What needs change</label>
                    <textarea
                      name="what_needs_change"
                      rows={2}
                      placeholder="Optional note about what should change next."
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground/80">Adaptation note</label>
                    <textarea
                      name="adaptation_note"
                      rows={2}
                      placeholder="Optional note about how you plan to adapt the learner's current plan."
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <PendingSubmitButton idleLabel="Save review snapshot" pendingLabel="Saving review..." />
                </form>

                {reviews.length === 0 ? (
                  <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                    No review snapshots yet. Add one when you want a compact checkpoint before adapting goals or the next lesson plan.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reviews.map((review) => (
                      <div key={review.id} className="rounded-xl border p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="font-semibold text-foreground">{review.summary}</p>
                          <span className="text-xs text-muted-foreground">
                            {formatDateTime(review.reviewed_at)}
                          </span>
                        </div>
                        {review.what_improved ? (
                          <p className="mt-3 text-sm text-muted-foreground">
                            Improved: {review.what_improved}
                          </p>
                        ) : null}
                        {review.what_needs_change ? (
                          <p className="mt-2 text-sm text-muted-foreground">
                            Needs change: {review.what_needs_change}
                          </p>
                        ) : null}
                        {review.adaptation_note ? (
                          <p className="mt-2 text-sm text-muted-foreground">
                            Adaptation note: {review.adaptation_note}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-2xl border bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <Users className="h-4 w-4 text-[var(--cn-orange)]" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Workflow State
                </h2>
              </div>

              <form action={updateStateFormAction} className="space-y-4">
                <input type="hidden" name="private_student_id" value={detail.id} />

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground/80">Lifecycle status</label>
                    <select
                      name="status"
                      defaultValue={detail.status}
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground/80">Next step</label>
                    <select
                      name="next_step_type"
                      defaultValue={detail.next_step_type ?? "none"}
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                    >
                      {nextStepOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground/80">Current assignment</label>
                  <select
                    name="next_assignment_id"
                    defaultValue={detail.next_assignment_id ?? ""}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  >
                    <option value="">No linked assignment</option>
                    {assignments.map((assignment) => (
                      <option key={assignment.id} value={assignment.id}>
                        {assignment.title}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Link the current next step to a classroom assignment when possible.
                  </p>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground/80">Follow-up note</label>
                  <textarea
                    name="follow_up_note"
                    rows={4}
                    defaultValue={detail.follow_up_note ?? ""}
                    placeholder="Short note about what should happen next, or what you are waiting on."
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  />
                </div>

                <PendingSubmitButton idleLabel="Save workflow state" pendingLabel="Saving state..." />
              </form>
            </section>

            <section className="rounded-2xl border bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <Users className="h-4 w-4 text-amber-300" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Apply Playbook
                </h2>
              </div>

              <form action={applyPlaybookFormAction} className="space-y-4">
                <input type="hidden" name="private_student_id" value={detail.id} />
                <input type="hidden" name="review_id" value={latestReview?.id ?? ""} />

                <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-foreground/90">
                  {detail.last_playbook_title
                    ? `Latest playbook: ${detail.last_playbook_title}. Apply a new playbook when this learner needs a broader structured response than a single strategy.`
                    : "Apply a playbook when this learner needs a broader structured support path across multiple repeating issues."}
                </div>
                {detail.last_playbook_title || recurringIssueTags.length > 0 || blockedGoals.length > 0 ? (
                  <div className="rounded-xl border border-dashed p-3 text-sm text-muted-foreground">
                    {detail.last_playbook_title ? (
                      <>
                        Current playbook context: <span className="font-medium text-foreground">{detail.last_playbook_title}</span>
                        {detail.last_playbook_applied_at
                          ? ` · last applied ${new Date(detail.last_playbook_applied_at).toLocaleDateString("en-US")}`
                          : ""}
                      </>
                    ) : blockedGoals.length > 0 ? (
                      "Blocked goals are visible without a playbook. Apply one here so the next plan update follows a clearer structured path."
                    ) : (
                      `Recurring issues are visible (${recurringIssueTags.join(", ").replaceAll("_", " ")}). A playbook would help turn that pressure into a repeatable support path.`
                    )}
                  </div>
                ) : null}

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground/80">Playbook</label>
                    <select
                      name="playbook_id"
                      defaultValue=""
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Select a playbook</option>
                      {playbooks.map((playbook) => (
                        <option key={playbook.id} value={playbook.id}>
                          {playbook.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground/80">Goal to connect</label>
                    <select
                      name="goal_id"
                      defaultValue={activeGoals[0]?.id ?? goals[0]?.id ?? ""}
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Do not link a goal</option>
                      {goals.map((goal) => (
                        <option key={goal.id} value={goal.id}>
                          {goal.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground/80">Plan status</label>
                    <select
                      name="plan_status"
                      defaultValue={lessonPlan.plan_status}
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                    >
                      {planStatusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground/80">Target date</label>
                    <input
                      type="date"
                      name="target_date"
                      defaultValue={lessonPlan.target_date ?? ""}
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground/80">Application note</label>
                  <textarea
                    name="application_note"
                    rows={3}
                    placeholder="Optional note about why this playbook is the right structured response now."
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  />
                </div>

                <PendingSubmitButton idleLabel="Apply playbook" pendingLabel="Applying playbook..." />
              </form>

              {playbookApplications.length > 0 ? (
                <div className="mt-5 space-y-3">
                  {playbookApplications.slice(0, 3).map((application) => (
                    <div key={application.id} className="rounded-xl border p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="font-semibold text-foreground">{application.playbook_title}</p>
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(application.applied_at)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{application.playbook_summary}</p>
                      {application.linked_strategy_count > 0 ? (
                        <p className="mt-2 text-sm text-muted-foreground">
                          Linked strategies: {application.linked_strategy_count}
                        </p>
                      ) : null}
                      {application.application_note ? (
                        <p className="mt-2 text-sm text-muted-foreground">
                          Note: {application.application_note}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : null}
            </section>

            <section className="rounded-2xl border bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <Users className="h-4 w-4 text-sky-400" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Apply Strategy
                </h2>
              </div>

              <form action={applyStrategyFormAction} className="space-y-4">
                <input type="hidden" name="private_student_id" value={detail.id} />
                <input type="hidden" name="review_id" value={latestReview?.id ?? ""} />

                <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 p-3 text-sm text-foreground/90">
                  {detail.last_strategy_title
                    ? `Latest strategy: ${detail.last_strategy_title}. Apply a new strategy when the learner needs a clearer reusable response pattern.`
                    : "Apply a tutoring strategy to reuse a known response pattern in this learner's live plan."}
                </div>
                {detail.last_strategy_title || recurringIssueTags.length > 0 || blockedGoals.length > 0 ? (
                  <div className="rounded-xl border border-dashed p-3 text-sm text-muted-foreground">
                    {detail.last_strategy_title ? (
                      <>
                        Current strategy context: <span className="font-medium text-foreground">{detail.last_strategy_title}</span>
                        {detail.last_strategy_applied_at
                          ? ` · last applied ${new Date(detail.last_strategy_applied_at).toLocaleDateString("en-US")}`
                          : ""}
                      </>
                    ) : blockedGoals.length > 0 ? (
                      "Blocked goals are visible without a reusable strategy. Apply one here so the next plan update is easier to repeat."
                    ) : recurringIssueTags.length > 0 ? (
                      `Recurring issues are visible (${recurringIssueTags.join(", ").replaceAll("_", " ")}). A reusable strategy would help keep the next response consistent.`
                    ) : null}
                  </div>
                ) : null}

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground/80">Strategy</label>
                    <select
                      name="strategy_id"
                      defaultValue=""
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Select a strategy</option>
                      {strategies.map((strategy) => (
                        <option key={strategy.id} value={strategy.id}>
                          {strategy.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground/80">Goal to connect</label>
                    <select
                      name="goal_id"
                      defaultValue={activeGoals[0]?.id ?? goals[0]?.id ?? ""}
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Do not link a goal</option>
                      {goals.map((goal) => (
                        <option key={goal.id} value={goal.id}>
                          {goal.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground/80">Plan status</label>
                    <select
                      name="plan_status"
                      defaultValue={lessonPlan.plan_status}
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                    >
                      {planStatusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground/80">Target date</label>
                    <input
                      type="date"
                      name="target_date"
                      defaultValue={lessonPlan.target_date ?? ""}
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground/80">Application note</label>
                  <textarea
                    name="application_note"
                    rows={3}
                    placeholder="Optional note about why this strategy is being used for this learner now."
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  />
                </div>

                <PendingSubmitButton idleLabel="Apply strategy" pendingLabel="Applying strategy..." />
              </form>

              {strategyApplications.length > 0 ? (
                <div className="mt-5 space-y-3">
                  {strategyApplications.slice(0, 3).map((application) => (
                    <div key={application.id} className="rounded-xl border p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="font-semibold text-foreground">{application.strategy_title}</p>
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(application.applied_at)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{application.strategy_summary}</p>
                      {application.application_note ? (
                        <p className="mt-2 text-sm text-muted-foreground">
                          Note: {application.application_note}
                        </p>
                      ) : null}
                      {application.outcome_status ? (
                        <p className="mt-2 text-sm text-muted-foreground">
                          Outcome:{" "}
                          {getPrivateStudentStrategyOutcomeLabel(
                            application.outcome_status as
                              | "helped"
                              | "partial"
                              | "no_change"
                              | "replace"
                          )}
                          {application.outcome_recorded_at
                            ? ` · ${formatDateTime(application.outcome_recorded_at)}`
                            : ""}
                        </p>
                      ) : null}
                      {application.outcome_note ? (
                        <p className="mt-2 text-sm text-muted-foreground">
                          Outcome note: {application.outcome_note}
                        </p>
                      ) : null}
                      <form action={recordStrategyOutcomeFormAction} className="mt-3 space-y-3 rounded-xl border border-dashed p-3">
                        <input type="hidden" name="strategy_application_id" value={application.id} />
                        <div className="grid gap-3 md:grid-cols-[180px_minmax(0,1fr)]">
                          <div>
                            <label className="mb-1 block text-sm font-medium text-foreground/80">Outcome</label>
                            <select
                              name="outcome_status"
                              defaultValue={application.outcome_status ?? ""}
                              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                            >
                              <option value="">Select outcome</option>
                              <option value="helped">Helped</option>
                              <option value="partial">Partial help</option>
                              <option value="no_change">No clear change</option>
                              <option value="replace">Replace strategy</option>
                            </select>
                          </div>
                          <div>
                            <label className="mb-1 block text-sm font-medium text-foreground/80">Recorded date</label>
                            <input
                              type="date"
                              name="recorded_at"
                              defaultValue={(application.outcome_recorded_at ?? application.applied_at).slice(0, 10)}
                              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-medium text-foreground/80">Outcome note</label>
                          <textarea
                            name="outcome_note"
                            rows={2}
                            defaultValue={application.outcome_note ?? ""}
                            placeholder="Optional note about what changed after using this strategy."
                            className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                          />
                        </div>
                        <PendingSubmitButton
                          idleLabel={application.outcome_status ? "Update outcome" : "Save outcome"}
                          pendingLabel="Saving outcome..."
                        />
                      </form>
                    </div>
                  ))}
                </div>
              ) : null}
            </section>

            <section className="rounded-2xl border bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <Users className="h-4 w-4 text-sky-400" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Plan Adaptation
                </h2>
              </div>

              <form action={adaptPlanFormAction} className="space-y-4">
                <input type="hidden" name="private_student_id" value={detail.id} />
                <input type="hidden" name="review_id" value={latestReview?.id ?? ""} />

                <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-3 text-sm text-foreground/90">
                  {latestReview?.summary
                    ? `Adapting from latest review: ${latestReview.summary}`
                    : "No review snapshot selected yet. You can still adapt the plan, but the adaptation note will not be tied to a review snapshot."}
                </div>
                {latestReview?.reviewed_at ? (
                  <div className="rounded-xl border bg-muted/40 p-3 text-xs text-muted-foreground">
                    Latest review was recorded {formatDateTime(latestReview.reviewed_at)}.
                    {detail.last_plan_adapted_at
                      ? ` Last adaptation was ${formatDateTime(detail.last_plan_adapted_at)}.`
                      : " No plan adaptation has been recorded yet."}
                  </div>
                ) : null}

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground/80">Plan status</label>
                    <select
                      name="plan_status"
                      defaultValue={lessonPlan.plan_status}
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                    >
                      {planStatusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground/80">Target date</label>
                    <input
                      type="date"
                      name="target_date"
                      defaultValue={lessonPlan.target_date ?? ""}
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground/80">Linked assignment</label>
                    <select
                      name="next_assignment_id"
                      defaultValue={lessonPlan.next_assignment_id ?? ""}
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                    >
                      <option value="">No assignment selected</option>
                      {assignments.map((assignment) => (
                        <option key={assignment.id} value={assignment.id}>
                          {assignment.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground/80">Linked template</label>
                    <select
                      name="next_template_id"
                      defaultValue={lessonPlan.next_template_id ?? ""}
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                    >
                      <option value="">No template selected</option>
                      {templates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground/80">Goal to adapt</label>
                    <select
                      name="goal_id"
                      defaultValue={activeGoals[0]?.id ?? goals[0]?.id ?? ""}
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Do not update a goal</option>
                      {goals.map((goal) => (
                        <option key={goal.id} value={goal.id}>
                          {goal.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground/80">New goal progress</label>
                    <select
                      name="goal_progress_status"
                      defaultValue=""
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                    >
                      {goalProgressOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground/80">Progress note</label>
                    <input
                      type="text"
                      name="goal_progress_note"
                      placeholder="Optional short goal update"
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground/80">Lesson focus</label>
                  <textarea
                    name="focus_note"
                    rows={3}
                    defaultValue={lessonPlan.focus_note ?? ""}
                    placeholder="What should the next lesson or check-in focus on?"
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground/80">
                    Before lesson expectation
                  </label>
                  <textarea
                    name="before_lesson_expectation"
                    rows={3}
                    defaultValue={lessonPlan.before_lesson_expectation ?? ""}
                    placeholder="What should the learner do before the next lesson?"
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground/80">Adaptation note</label>
                  <textarea
                    name="adaptation_note"
                    rows={3}
                    defaultValue={latestReview?.adaptation_note ?? ""}
                    placeholder="Short note about what changed in the learner plan and why."
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  />
                </div>

                <PendingSubmitButton idleLabel="Apply plan adaptation" pendingLabel="Applying adaptation..." />
              </form>
            </section>

            <section className="rounded-2xl border bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-400" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Learner Goals
                </h2>
              </div>

              <div className="space-y-4">
                {goals.length === 0 ? (
                  <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                    No goals yet. Add a small active focus so this tutoring relationship has visible medium-term direction.
                  </div>
                ) : (
                  goals.map((goal) => (
                    <form key={goal.id} action={updateGoalFormAction} className="rounded-xl border p-4 space-y-3">
                      <input type="hidden" name="goal_id" value={goal.id} />
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 font-medium text-emerald-400">
                          {getPrivateStudentGoalStatusLabel(goal.status)}
                        </span>
                        {goal.progress_status ? (
                          <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-1 font-medium text-sky-400">
                            {getPrivateStudentGoalProgressStatusLabel(goal.progress_status)}
                          </span>
                        ) : null}
                        {goal.completed_at ? (
                          <span className="text-muted-foreground">
                            completed {new Date(goal.completed_at).toLocaleDateString("en-US")}
                          </span>
                        ) : null}
                      </div>
                      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_180px_220px]">
                        <div>
                          <label className="mb-1 block text-sm font-medium text-foreground/80">Goal title</label>
                          <input
                            type="text"
                            name="title"
                            defaultValue={goal.title}
                            className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-medium text-foreground/80">Status</label>
                          <select
                            name="status"
                            defaultValue={goal.status}
                            className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                          >
                            {goalStatusOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-medium text-foreground/80">Progress</label>
                          <select
                            name="progress_status"
                            defaultValue={goal.progress_status ?? ""}
                            className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                          >
                            {goalProgressOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-foreground/80">Detail</label>
                        <textarea
                          name="detail"
                          rows={3}
                          defaultValue={goal.detail ?? ""}
                          placeholder="Short note about what this learner is trying to improve."
                          className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-foreground/80">Progress note</label>
                        <textarea
                          name="progress_note"
                          rows={2}
                          defaultValue={goal.progress_note ?? ""}
                          placeholder="Short note about whether this goal is improving, stable, or blocked."
                          className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                        />
                      </div>
                      <PendingSubmitButton idleLabel="Save goal" pendingLabel="Saving goal..." />
                    </form>
                  ))
                )}

                <form action={createGoalFormAction} className="rounded-xl border border-dashed p-4 space-y-3">
                  <input type="hidden" name="private_student_id" value={detail.id} />
                  <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_180px_220px]">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-foreground/80">New goal</label>
                      <input
                        type="text"
                        name="title"
                        placeholder="e.g. Build confidence in journal writing"
                        className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-foreground/80">Status</label>
                      <select
                        name="status"
                        defaultValue="active"
                        className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                      >
                        {goalStatusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-foreground/80">Progress</label>
                      <select
                        name="progress_status"
                        defaultValue=""
                        className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                      >
                        {goalProgressOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground/80">Goal detail</label>
                    <textarea
                      name="detail"
                      rows={3}
                      placeholder="Optional note about what success looks like or what should improve next."
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground/80">Progress note</label>
                    <textarea
                      name="progress_note"
                      rows={2}
                      placeholder="Optional short note about the learner's current momentum on this goal."
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <PendingSubmitButton idleLabel="Add goal" pendingLabel="Adding goal..." />
                </form>
              </div>
            </section>

            <section className="rounded-2xl border bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <MessageSquareMore className="h-4 w-4 text-[var(--cn-orange)]" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Lesson History
                </h2>
              </div>

              <div className="space-y-4">
                <form action={createHistoryFormAction} className="rounded-xl border border-dashed p-4 space-y-3">
                  <input type="hidden" name="private_student_id" value={detail.id} />
                  <input type="hidden" name="lesson_plan_id" value={lessonPlan.id} />
                  <div className="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)]">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-foreground/80">Recorded date</label>
                      <input
                        type="date"
                        name="recorded_at"
                        defaultValue={new Date().toISOString().slice(0, 10)}
                        className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-foreground/80">Linked assignment</label>
                      <select
                        name="assignment_id"
                        defaultValue={lessonPlan.next_assignment_id ?? ""}
                        className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                      >
                        <option value="">No linked assignment</option>
                        {assignments.map((assignment) => (
                          <option key={assignment.id} value={assignment.id}>
                            {assignment.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground/80">Lesson summary</label>
                    <textarea
                      name="summary"
                      rows={3}
                      placeholder="What did you cover in this lesson or check-in?"
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground/80">Practice focus</label>
                    <textarea
                      name="practice_focus"
                      rows={3}
                      placeholder="What should the learner keep practicing after this check-in?"
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground/80">Repeated issues</label>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {PRIVATE_LESSON_ISSUE_TAGS.map((tag) => (
                        <label
                          key={tag}
                          className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm"
                        >
                          <input type="checkbox" name="issue_tags" value={tag} className="h-4 w-4" />
                          <span>{getPrivateLessonIssueTagLabel(tag)}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground/80">Intervention note</label>
                    <textarea
                      name="intervention_note"
                      rows={2}
                      placeholder="Optional short note about what needs reinforcement or follow-up next."
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                    />
                  </div>

                  <PendingSubmitButton idleLabel="Add lesson history" pendingLabel="Saving history..." />
                </form>

                {lessonHistory.length === 0 ? (
                  <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                    No lesson history yet. Add a short outcome after each check-in so this relationship has visible continuity.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {lessonHistory.map((entry) => (
                      <div key={entry.id} className="rounded-xl border p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-foreground">
                            {new Date(entry.recorded_at).toLocaleDateString("en-US")}
                          </p>
                          {entry.assignment_title ? (
                            <span className="rounded-full border bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                              {entry.assignment_title}
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-3 text-sm text-foreground">{entry.summary}</p>
                        {entry.practice_focus ? (
                          <p className="mt-2 text-sm text-muted-foreground">
                            Practice focus: {entry.practice_focus}
                          </p>
                        ) : null}
                        {entry.issue_tags.length > 0 ? (
                          <div className="mt-3 flex flex-wrap gap-2 text-xs">
                            {entry.issue_tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-amber-300"
                              >
                                {getPrivateLessonIssueTagLabel(tag)}
                              </span>
                            ))}
                          </div>
                        ) : null}
                        {entry.intervention_note ? (
                          <p className="mt-2 text-sm text-muted-foreground">
                            Intervention: {entry.intervention_note}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-2xl border bg-card p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Context
              </h2>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <p>
                  <span className="font-medium text-foreground">Classroom:</span>{" "}
                  <Link href={`/notebook/classes/${detail.classroom_id}`} className="text-[var(--cn-orange)] hover:underline">
                    {detail.classroom_name}
                  </Link>
                </p>
                <p>
                  <span className="font-medium text-foreground">Current assignment:</span>{" "}
                  {detail.next_assignment_id ? (
                    <Link href={`/notebook/assignments/${detail.next_assignment_id}`} className="text-[var(--cn-orange)] hover:underline">
                      {detail.next_assignment_title}
                    </Link>
                  ) : (
                    "No assignment selected"
                  )}
                </p>
                <p>
                  <span className="font-medium text-foreground">Conversion:</span>{" "}
                  {detail.conversion_completed_at
                    ? new Date(detail.conversion_completed_at).toLocaleDateString("en-US")
                    : "Recently converted"}
                </p>
                <p>
                  <span className="font-medium text-foreground">Last reviewed:</span>{" "}
                  {formatDateTime(detail.last_reviewed_at)}
                </p>
                <p>
                  <span className="font-medium text-foreground">Next lesson plan:</span>{" "}
                  {getPrivateLessonPlanStatusLabel(lessonPlan.plan_status)}
                  {lessonPlan.target_date ? ` · ${new Date(lessonPlan.target_date).toLocaleDateString("en-US")}` : ""}
                </p>
              </div>
            </section>

            <section className="rounded-2xl border bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <MessageSquareMore className="h-4 w-4 text-[var(--cn-orange)]" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Inquiry Context
                </h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="rounded-xl border bg-muted/20 p-4">
                  {detail.inquiry_message || "No original inquiry message."}
                </div>
                <div className="rounded-xl border bg-muted/20 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Onboarding message
                  </p>
                  <p className="mt-2">{detail.onboarding_message || "No onboarding message saved."}</p>
                </div>
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
  value: string | number;
  tone?: "default" | "sky";
}) {
  const toneClass = tone === "sky" ? "border-sky-500/20 bg-sky-500/10" : "border-border bg-card";

  return (
    <div className={`rounded-2xl border p-5 ${toneClass}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-3 text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}
