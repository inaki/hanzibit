import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Users } from "lucide-react";
import { getAuthUserId } from "@/lib/auth-utils";
import { isTeacherUser } from "@/lib/classrooms";
import { listPrivateLessonHistory } from "@/lib/private-lesson-history";
import { getLatestPrivateStudentReview } from "@/lib/private-student-reviews";
import {
  getPrivateLessonPlan,
  getPrivateLessonPlanStatusLabel,
} from "@/lib/private-lesson-plans";
import { listPrivateStudentGoals } from "@/lib/private-student-goals";
import { listPrivateStudentsForTeacher, type PrivateStudentListItem } from "@/lib/private-students";

export const dynamic = "force-dynamic";

const statusOrder = [
  "awaiting_teacher",
  "inactive",
  "awaiting_student",
  "onboarding",
  "active",
] as const;

const statusLabels: Record<(typeof statusOrder)[number], string> = {
  awaiting_teacher: "Awaiting teacher",
  inactive: "Inactive",
  awaiting_student: "Awaiting student",
  onboarding: "Onboarding",
  active: "Active",
};

function StatusPill({ status }: { status: PrivateStudentListItem["status"] }) {
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

  return (
    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${styles}`}>
      {statusLabels[status]}
    </span>
  );
}

function NextStepLabel({ nextStepType }: { nextStepType: PrivateStudentListItem["next_step_type"] }) {
  const label =
    nextStepType === "complete_assignment"
      ? "Complete assignment"
      : nextStepType === "review_feedback"
        ? "Review feedback"
        : nextStepType === "await_teacher_assignment"
          ? "Await teacher assignment"
          : nextStepType === "follow_up"
            ? "Follow up"
            : "No next step";

  return (
    <span className="rounded-full border bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
      {label}
    </span>
  );
}

function formatActivityDate(value: string | null) {
  if (!value) return "No activity yet";
  return new Date(value).toLocaleDateString("en-US");
}

function isPlanOverdue(targetDate: string | null) {
  if (!targetDate) return false;
  return new Date(`${targetDate}T23:59:59.999Z`).getTime() < Date.now();
}

function getDaysSince(value: string | null) {
  if (!value) return null;
  return Math.floor((Date.now() - new Date(value).getTime()) / (1000 * 60 * 60 * 24));
}

function getTeacherFocusCopy(item: PrivateStudentListItem) {
  if (item.status === "awaiting_teacher") {
    return item.next_assignment_title
      ? `Teacher should respond next and guide the learner through ${item.next_assignment_title}.`
      : "Teacher should respond next with a new assignment, follow-up, or review.";
  }

  if (item.status === "awaiting_student") {
    return item.next_assignment_title
      ? `Learner is expected to continue with ${item.next_assignment_title}.`
      : "Learner is waiting to complete the next step you assigned.";
  }

  if (item.status === "inactive") {
    return "This relationship looks inactive and likely needs follow-up from the teacher.";
  }

  if (item.status === "onboarding") {
    return item.next_assignment_title
      ? `Onboarding is still in progress through ${item.next_assignment_title}.`
      : "Onboarding is still in progress and may need a first assignment.";
  }

  return "Private tutoring relationship is currently active.";
}

function getStrategyGuidance(input: {
  strategyTitle: string | null;
  lastAppliedAt: string | null;
  lastOutcomeStatus: string | null;
  needsStrategyAttention: boolean;
  recurringIssueTags: string[];
  blockedGoalCount: number;
  needsReinforcementCount: number;
}) {
  if (input.strategyTitle) {
    if (input.lastOutcomeStatus === "helped") {
      return `${input.strategyTitle} appears to be helping. Keep the next lesson support aligned with it instead of changing direction too fast.`;
    }
    if (input.lastOutcomeStatus === "replace") {
      return `${input.strategyTitle} was the latest strategy, but the latest outcome suggests it should be replaced or reworked before the next lesson.`;
    }
    if (input.lastOutcomeStatus === "no_change") {
      return `${input.strategyTitle} is in use, but the latest outcome showed no clear lift. Tighten the plan or switch to a different reusable response.`;
    }
    if (input.lastOutcomeStatus === "partial") {
      return `${input.strategyTitle} helped only partially. Keep it visible, but refine the next lesson support instead of assuming it is already good enough.`;
    }
    return input.needsStrategyAttention
      ? `${input.strategyTitle} was used before, but this learner is showing fresh pressure. Reapply it deliberately or switch to a better-fit strategy.`
      : `${input.strategyTitle} is the latest reusable strategy shaping this learner's plan. Keep the next lesson and assignment support aligned with it.`;
  }

  if (input.blockedGoalCount > 0) {
    return "Blocked goals are visible and no reusable strategy has been applied yet. This is a strong candidate for a saved strategy instead of another ad hoc response.";
  }

  if (input.needsReinforcementCount > 0 || input.recurringIssueTags.length > 0) {
    return "Reinforcement pressure is visible, but no saved strategy is guiding the response yet. Apply one so the next step is easier to repeat and adapt.";
  }

  return "No strategy has been applied yet. That is acceptable if the learner is still steady, but reusable strategies help keep support consistent over time.";
}

function getPlaybookGuidance(input: {
  playbookTitle: string | null;
  needsPlaybookAttention: boolean;
  recurringIssueTags: string[];
  blockedGoalCount: number;
  needsReinforcementCount: number;
}) {
  if (input.playbookTitle) {
    return input.needsPlaybookAttention
      ? `${input.playbookTitle} is the current structured response, but pressure is still visible. Reapply it with a clearer note or refine the linked strategies instead of drifting back to ad hoc support.`
      : `${input.playbookTitle} is the current structured playbook guiding this learner. Keep the next lesson and assignment support aligned with it.`;
  }

  if (input.blockedGoalCount > 0) {
    return "Blocked goals are visible and no playbook has been applied yet. This learner is a strong candidate for a structured playbook instead of another isolated adjustment.";
  }

  if (input.needsReinforcementCount > 0 || input.recurringIssueTags.length > 0) {
    return "Pressure is repeating, but no playbook is attached yet. A playbook can turn these signals into a clearer long-running support path.";
  }

  return "No playbook has been applied yet. That is fine while support stays simple, but playbooks help once the same tutoring pattern keeps returning.";
}

function getReviewDateLabel(value: string | null) {
  if (!value) return "No review yet";
  return new Date(value).toLocaleDateString("en-US");
}

function getAdaptationDateLabel(value: string | null) {
  if (!value) return "No adaptation yet";
  return new Date(value).toLocaleDateString("en-US");
}

export default async function TeacherPrivateStudentsPage() {
  const userId = await getAuthUserId();

  if (!(await isTeacherUser(userId))) {
    redirect("/notebook/classes");
  }

  const privateStudents = await listPrivateStudentsForTeacher(userId);
  const privateStudentsWithPlans = await Promise.all(
    privateStudents.map(async (item) => {
      const [lessonPlan, goals, history, latestReview] = await Promise.all([
        getPrivateLessonPlan(item.id),
        listPrivateStudentGoals(item.id),
        listPrivateLessonHistory(item.id),
        getLatestPrivateStudentReview(item.id),
      ]);
      const activeGoalCount = goals.filter((goal) => goal.status === "active").length;
      const blockedGoalCount = goals.filter((goal) => goal.progress_status === "blocked").length;
      const needsReinforcementCount = goals.filter(
        (goal) => goal.progress_status === "needs_reinforcement"
      ).length;
      const latestHistory = history[0] ?? null;
      const issueCounts = new Map<string, number>();
      for (const entry of history) {
        for (const tag of entry.issue_tags) {
          issueCounts.set(tag, (issueCounts.get(tag) ?? 0) + 1);
        }
      }
      const recurringIssueTags = Array.from(issueCounts.entries())
        .filter(([, count]) => count >= 2)
        .map(([tag]) => tag);
      const daysSinceHistory = getDaysSince(latestHistory?.recorded_at ?? null);
      const hasRecentHistory =
        item.status === "onboarding" ? true : (daysSinceHistory ?? Number.POSITIVE_INFINITY) <= 14;
      const daysSinceReview = getDaysSince(latestReview?.reviewed_at ?? item.last_review_snapshot_at);
      const daysSinceAdaptation = getDaysSince(item.last_plan_adapted_at);
      const hasRecentReview =
        item.status === "onboarding" ? true : (daysSinceReview ?? Number.POSITIVE_INFINITY) <= 14;
      const needsReviewSnapshot =
        item.status !== "onboarding" &&
        (blockedGoalCount > 0 ||
          needsReinforcementCount > 0 ||
          recurringIssueTags.length > 0 ||
          !hasRecentHistory) &&
        !hasRecentReview;
      const hasRecentAdaptation =
        item.status === "onboarding" ? true : (daysSinceAdaptation ?? Number.POSITIVE_INFINITY) <= 14;
      const reviewWithoutAdaptation =
        Boolean(latestReview?.reviewed_at) &&
        (!item.last_plan_adapted_at ||
          new Date(latestReview.reviewed_at).getTime() >
            new Date(item.last_plan_adapted_at).getTime());
      const needsAdaptation =
        item.status !== "onboarding" &&
        (blockedGoalCount > 0 ||
          needsReinforcementCount > 0 ||
          recurringIssueTags.length > 0 ||
          !hasRecentHistory) &&
        !hasRecentAdaptation;

      return {
        item,
        lessonPlan,
        activeGoalCount,
        blockedGoalCount,
        needsReinforcementCount,
        recurringIssueTags,
        latestHistory,
        hasRecentHistory,
        latestReview,
        hasRecentReview,
        needsReviewSnapshot,
        hasRecentAdaptation,
        reviewWithoutAdaptation,
        needsAdaptation,
      };
    })
  );

  const grouped = statusOrder
    .map((status) => ({
      status,
      items: privateStudentsWithPlans.filter(({ item }) => item.status === status),
    }))
    .filter((group) => group.items.length > 0);

  const noPlanCount = privateStudentsWithPlans.filter(({ lessonPlan }) => !lessonPlan).length;
  const overduePlanCount = privateStudentsWithPlans.filter(({ lessonPlan }) =>
    lessonPlan ? isPlanOverdue(lessonPlan.target_date) : false
  ).length;
  const supportedPlanCount = privateStudentsWithPlans.filter(
    ({ lessonPlan }) => lessonPlan && (lessonPlan.next_assignment_id || lessonPlan.next_template_id)
  ).length;
  const noActiveGoalCount = privateStudentsWithPlans.filter(({ activeGoalCount }) => activeGoalCount === 0).length;
  const noRecentHistoryCount = privateStudentsWithPlans.filter(
    ({ item, hasRecentHistory }) => item.status !== "onboarding" && !hasRecentHistory
  ).length;
  const blockedGoalCount = privateStudentsWithPlans.filter(
    ({ blockedGoalCount }) => blockedGoalCount > 0
  ).length;
  const reinforcementCount = privateStudentsWithPlans.filter(
    ({ needsReinforcementCount }) => needsReinforcementCount > 0
  ).length;
  const recurringIssueCount = privateStudentsWithPlans.filter(
    ({ recurringIssueTags }) => recurringIssueTags.length > 0
  ).length;
  const noStrategyCount = privateStudentsWithPlans.filter(
    ({ item }) => !item.last_strategy_id
  ).length;
  const noPlaybookCount = privateStudentsWithPlans.filter(
    ({ item }) => !item.last_playbook_id
  ).length;
  const strategyGapCount = privateStudentsWithPlans.filter(
    ({ needsAdaptation, recurringIssueTags, blockedGoalCount, needsReinforcementCount, item }) =>
      !item.last_strategy_id &&
      (needsAdaptation ||
        recurringIssueTags.length > 0 ||
        blockedGoalCount > 0 ||
        needsReinforcementCount > 0)
  ).length;
  const playbookGapCount = privateStudentsWithPlans.filter(
    ({ needsAdaptation, recurringIssueTags, blockedGoalCount, needsReinforcementCount, item }) =>
      !item.last_playbook_id &&
      (needsAdaptation ||
        recurringIssueTags.length > 0 ||
        blockedGoalCount > 0 ||
        needsReinforcementCount > 0)
  ).length;
  const noRecentReviewCount = privateStudentsWithPlans.filter(
    ({ needsReviewSnapshot }) => needsReviewSnapshot
  ).length;
  const noRecentAdaptationCount = privateStudentsWithPlans.filter(
    ({ needsAdaptation }) => needsAdaptation
  ).length;
  const reviewedNotAdaptedCount = privateStudentsWithPlans.filter(
    ({ reviewWithoutAdaptation }) => reviewWithoutAdaptation
  ).length;

  return (
    <div data-testid="teacher-private-students-page" className="h-full overflow-auto p-6 pb-20 md:p-10 lg:pb-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Private Learners</h1>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              Manage the current lifecycle, next step, and follow-through for learners who entered through private teacher inquiries.
            </p>
          </div>
          <div className="inline-flex items-center rounded-full border border-[var(--cn-orange)]/20 bg-[var(--cn-orange)]/10 px-3 py-1.5 text-xs font-medium text-[var(--cn-orange)]">
            Operational workflow
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {statusOrder.map((status) => (
            <SummaryCard
              key={status}
              label={statusLabels[status]}
              value={privateStudents.filter((item) => item.status === status).length}
              tone={status}
            />
          ))}
        </div>

        {privateStudents.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-11">
            <InfoCard label="No next plan" value={noPlanCount} tone="rose" />
            <InfoCard label="Overdue plans" value={overduePlanCount} tone="amber" />
            <InfoCard label="Supported plans" value={supportedPlanCount} tone="sky" />
            <InfoCard label="No active goals" value={noActiveGoalCount} tone="rose" />
            <InfoCard label="No recent history" value={noRecentHistoryCount} tone="amber" />
            <InfoCard label="Blocked goals" value={blockedGoalCount} tone="rose" />
            <InfoCard label="Needs reinforcement" value={reinforcementCount} tone="sky" />
            <InfoCard label="Recurring issues" value={recurringIssueCount} tone="amber" />
            <InfoCard label="No strategy yet" value={noStrategyCount} tone="amber" />
            <InfoCard label="Strategy gap" value={strategyGapCount} tone="rose" />
            <InfoCard label="No playbook yet" value={noPlaybookCount} tone="amber" />
            <InfoCard label="Playbook gap" value={playbookGapCount} tone="rose" />
            <InfoCard label="Needs review" value={noRecentReviewCount} tone="rose" />
            <InfoCard label="Needs adaptation" value={noRecentAdaptationCount} tone="rose" />
            <InfoCard label="Reviewed, not adapted" value={reviewedNotAdaptedCount} tone="amber" />
          </div>
        ) : null}

        {privateStudents.length === 0 ? (
          <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
            No private learners yet. Converted tutoring inquiries will appear here after they become private classrooms.
          </div>
        ) : (
          <div className="space-y-6">
            {grouped.map((group) => (
              <section key={group.status} className="space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-[var(--cn-orange)]" />
                  <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    {statusLabels[group.status]}
                  </h2>
                </div>
                <div className="grid gap-4">
                  {group.items.map(({ item, lessonPlan, activeGoalCount, blockedGoalCount, needsReinforcementCount, recurringIssueTags, latestHistory, latestReview, hasRecentHistory, needsReviewSnapshot, needsAdaptation, reviewWithoutAdaptation }) => (
                    <Link
                      key={item.id}
                      href={`/notebook/teacher/private-students/${item.id}`}
                      className="block rounded-2xl border bg-card p-5 transition-colors hover:border-[var(--cn-orange)]/30 hover:bg-muted/20"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-3">
                            <StatusPill status={item.status} />
                            <NextStepLabel nextStepType={item.next_step_type} />
                            {lessonPlan ? (
                              <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-1 text-[11px] font-medium text-sky-400">
                                {getPrivateLessonPlanStatusLabel(lessonPlan.plan_status)}
                              </span>
                            ) : (
                              <span className="rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-[11px] font-medium text-rose-300">
                                No next plan
                              </span>
                            )}
                            {lessonPlan && isPlanOverdue(lessonPlan.target_date) ? (
                              <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-300">
                                Plan overdue
                              </span>
                            ) : null}
                            {activeGoalCount === 0 ? (
                              <span className="rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-[11px] font-medium text-rose-300">
                                No active goal
                              </span>
                            ) : null}
                            {!hasRecentHistory && item.status !== "onboarding" ? (
                              <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-300">
                                No recent history
                              </span>
                            ) : null}
                            {blockedGoalCount > 0 ? (
                              <span className="rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-[11px] font-medium text-rose-300">
                                {blockedGoalCount} blocked
                              </span>
                            ) : null}
                            {needsReinforcementCount > 0 ? (
                              <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-1 text-[11px] font-medium text-sky-400">
                                {needsReinforcementCount} needs reinforcement
                              </span>
                            ) : null}
                            {recurringIssueTags.length > 0 ? (
                              <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-300">
                                {recurringIssueTags.length} recurring issue{recurringIssueTags.length === 1 ? "" : "s"}
                              </span>
                            ) : null}
                            {needsReviewSnapshot ? (
                              <span className="rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-[11px] font-medium text-rose-300">
                                Needs review
                              </span>
                            ) : null}
                            {needsAdaptation ? (
                              <span className="rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-[11px] font-medium text-rose-300">
                                Needs adaptation
                              </span>
                            ) : null}
                            {reviewWithoutAdaptation ? (
                              <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-300">
                                Reviewed, not adapted
                              </span>
                            ) : null}
                            {!item.last_playbook_id ? (
                              <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-300">
                                No playbook yet
                              </span>
                            ) : null}
                            {!item.last_playbook_id &&
                            (needsAdaptation ||
                              blockedGoalCount > 0 ||
                              needsReinforcementCount > 0 ||
                              recurringIssueTags.length > 0) ? (
                              <span className="rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-[11px] font-medium text-rose-300">
                                Playbook gap
                              </span>
                            ) : null}
                            {item.last_strategy_title ? (
                              <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 text-[11px] font-medium text-violet-300">
                                Strategy · {item.last_strategy_title}
                              </span>
                            ) : null}
                            {item.last_playbook_title ? (
                              <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-300">
                                Playbook · {item.last_playbook_title}
                              </span>
                            ) : null}
                            {item.last_strategy_outcome_status ? (
                              <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                                item.last_strategy_outcome_status === "helped"
                                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                                  : item.last_strategy_outcome_status === "partial"
                                    ? "border-sky-500/20 bg-sky-500/10 text-sky-400"
                                    : item.last_strategy_outcome_status === "no_change"
                                      ? "border-amber-500/20 bg-amber-500/10 text-amber-300"
                                      : "border-rose-500/20 bg-rose-500/10 text-rose-300"
                              }`}>
                                {item.last_strategy_outcome_status === "helped"
                                  ? "Strategy helped"
                                  : item.last_strategy_outcome_status === "partial"
                                    ? "Strategy partial"
                                    : item.last_strategy_outcome_status === "no_change"
                                      ? "Strategy unclear"
                                      : "Strategy replace"}
                              </span>
                            ) : null}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">{item.student_name}</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {item.classroom_name}
                              {item.classroom_description ? ` · ${item.classroom_description}` : ""}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center text-[var(--cn-orange)]">
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 text-xs text-muted-foreground md:grid-cols-4">
                        <div>
                          <p className="font-semibold uppercase tracking-[0.16em]">Next assignment</p>
                          <p className="mt-1 text-sm text-foreground/85">
                            {lessonPlan?.next_assignment_title || item.next_assignment_title || "No assignment selected"}
                          </p>
                        </div>
                        <div>
                          <p className="font-semibold uppercase tracking-[0.16em]">Submissions</p>
                          <p className="mt-1 text-sm text-foreground/85">{item.submission_count}</p>
                        </div>
                        <div>
                          <p className="font-semibold uppercase tracking-[0.16em]">Awaiting review</p>
                          <p className="mt-1 text-sm text-foreground/85">{item.awaiting_review_count}</p>
                        </div>
                        <div>
                          <p className="font-semibold uppercase tracking-[0.16em]">Last activity</p>
                          <p className="mt-1 text-sm text-foreground/85">
                            {formatActivityDate(item.last_submission_activity_at || item.updated_at)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 grid gap-3 text-xs text-muted-foreground md:grid-cols-2">
                        <div>
                          <p className="font-semibold uppercase tracking-[0.16em]">Next lesson</p>
                          <p className="mt-1 text-sm text-foreground/85">
                            {lessonPlan?.target_date
                              ? new Date(lessonPlan.target_date).toLocaleDateString("en-US")
                              : "No date set"}
                          </p>
                        </div>
                        <div>
                          <p className="font-semibold uppercase tracking-[0.16em]">Lesson focus</p>
                          <p className="mt-1 text-sm text-foreground/85">
                            {lessonPlan?.focus_note || "No focus note yet"}
                          </p>
                        </div>
                        <div>
                          <p className="font-semibold uppercase tracking-[0.16em]">Active goals</p>
                          <p className="mt-1 text-sm text-foreground/85">{activeGoalCount}</p>
                        </div>
                        <div>
                          <p className="font-semibold uppercase tracking-[0.16em]">Goal pressure</p>
                          <p className="mt-1 text-sm text-foreground/85">
                            {blockedGoalCount > 0
                              ? `${blockedGoalCount} blocked`
                              : needsReinforcementCount > 0
                                ? `${needsReinforcementCount} needs reinforcement`
                                : "No acute pressure"}
                          </p>
                        </div>
                        <div>
                          <p className="font-semibold uppercase tracking-[0.16em]">Recurring issues</p>
                          <p className="mt-1 text-sm text-foreground/85">
                            {recurringIssueTags.length > 0
                              ? recurringIssueTags.join(", ").replaceAll("_", " ")
                              : "No recurring issues"}
                          </p>
                        </div>
                        <div>
                          <p className="font-semibold uppercase tracking-[0.16em]">Latest check-in</p>
                          <p className="mt-1 text-sm text-foreground/85">
                            {latestHistory ? formatActivityDate(latestHistory.recorded_at) : "No history yet"}
                          </p>
                        </div>
                        <div>
                          <p className="font-semibold uppercase tracking-[0.16em]">Last review</p>
                          <p className="mt-1 text-sm text-foreground/85">
                            {getReviewDateLabel(latestReview?.reviewed_at ?? item.last_review_snapshot_at)}
                          </p>
                        </div>
                        <div>
                          <p className="font-semibold uppercase tracking-[0.16em]">Last adapted</p>
                          <p className="mt-1 text-sm text-foreground/85">
                            {getAdaptationDateLabel(item.last_plan_adapted_at)}
                          </p>
                        </div>
                        <div>
                          <p className="font-semibold uppercase tracking-[0.16em]">Last strategy</p>
                          <p className="mt-1 text-sm text-foreground/85">
                            {item.last_strategy_title || "No strategy yet"}
                          </p>
                        </div>
                        <div>
                          <p className="font-semibold uppercase tracking-[0.16em]">Last applied</p>
                          <p className="mt-1 text-sm text-foreground/85">
                            {item.last_strategy_applied_at
                              ? new Date(item.last_strategy_applied_at).toLocaleDateString("en-US")
                              : "Not applied yet"}
                          </p>
                        </div>
                        <div>
                          <p className="font-semibold uppercase tracking-[0.16em]">Last playbook</p>
                          <p className="mt-1 text-sm text-foreground/85">
                            {item.last_playbook_title || "No playbook yet"}
                          </p>
                        </div>
                        <div>
                          <p className="font-semibold uppercase tracking-[0.16em]">Playbook applied</p>
                          <p className="mt-1 text-sm text-foreground/85">
                            {item.last_playbook_applied_at
                              ? new Date(item.last_playbook_applied_at).toLocaleDateString("en-US")
                              : "Not applied yet"}
                          </p>
                        </div>
                      </div>
                      {latestReview?.summary ? (
                        <p className="mt-3 text-sm text-muted-foreground">
                          Latest review: {latestReview.summary}
                        </p>
                      ) : null}
                      {latestHistory?.summary ? (
                        <p className="mt-3 text-sm text-muted-foreground">
                          Latest check-in: {latestHistory.summary}
                        </p>
                      ) : null}
                      {latestHistory?.intervention_note ? (
                        <p className="mt-2 text-sm text-muted-foreground">
                          Latest intervention: {latestHistory.intervention_note}
                        </p>
                      ) : null}
                      <p className="mt-2 text-sm text-muted-foreground">
                        Strategy:{" "}
                        {getStrategyGuidance({
                          strategyTitle: item.last_strategy_title,
                          lastAppliedAt: item.last_strategy_applied_at,
                          lastOutcomeStatus: item.last_strategy_outcome_status,
                          needsStrategyAttention:
                            !item.last_strategy_id &&
                            (needsAdaptation ||
                              blockedGoalCount > 0 ||
                              needsReinforcementCount > 0 ||
                              recurringIssueTags.length > 0),
                          recurringIssueTags,
                          blockedGoalCount,
                          needsReinforcementCount,
                        })}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Playbook:{" "}
                        {getPlaybookGuidance({
                          playbookTitle: item.last_playbook_title ?? null,
                          needsPlaybookAttention:
                            !item.last_playbook_id &&
                            (needsAdaptation ||
                              blockedGoalCount > 0 ||
                              needsReinforcementCount > 0 ||
                              recurringIssueTags.length > 0),
                          recurringIssueTags,
                          blockedGoalCount,
                          needsReinforcementCount,
                        })}
                      </p>
                      {item.last_strategy_outcome_note ? (
                        <p className="mt-2 text-sm text-muted-foreground">
                          Latest strategy outcome: {item.last_strategy_outcome_note}
                        </p>
                      ) : null}
                      <p className="mt-4 text-sm text-muted-foreground">
                        {getTeacherFocusCopy(item)}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "sky" | "rose" | "amber";
}) {
  const toneClass =
    tone === "sky"
      ? "border-sky-500/20 bg-sky-500/10"
      : tone === "amber"
        ? "border-amber-500/20 bg-amber-500/10"
        : "border-rose-500/20 bg-rose-500/10";

  return (
    <div className={`rounded-2xl border p-5 ${toneClass}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-3 text-3xl font-bold text-foreground">{value}</p>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: (typeof statusOrder)[number];
}) {
  const toneClass =
    tone === "active"
      ? "border-emerald-500/20 bg-emerald-500/10"
      : tone === "awaiting_student"
        ? "border-sky-500/20 bg-sky-500/10"
        : tone === "awaiting_teacher"
          ? "border-amber-500/20 bg-amber-500/10"
          : tone === "inactive"
            ? "border-rose-500/20 bg-rose-500/10"
            : "border-[var(--cn-orange)]/20 bg-[var(--cn-orange)]/10";

  return (
    <div className={`rounded-2xl border p-5 ${toneClass}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-3 text-3xl font-bold text-foreground">{value}</p>
    </div>
  );
}
