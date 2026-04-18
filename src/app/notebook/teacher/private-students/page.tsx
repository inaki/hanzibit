import { redirect } from "next/navigation";
import { Users } from "lucide-react";
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
import {
  TeachingExplainerBlock,
  TeachingEntityCard,
  TeachingPageHeader,
  TeachingToneMetricCard,
} from "@/components/patterns/teaching";

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
      ? "ui-tone-emerald-panel ui-tone-emerald-text"
      : status === "awaiting_student"
        ? "ui-tone-sky-panel ui-tone-sky-text"
        : status === "awaiting_teacher"
          ? "ui-tone-amber-panel ui-tone-amber-text"
          : status === "inactive"
            ? "ui-tone-rose-panel ui-tone-rose-text"
            : "ui-tone-orange-panel ui-tone-orange-text";

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
  lastOutcomeStatus: string | null;
  needsPlaybookAttention: boolean;
  recurringIssueTags: string[];
  blockedGoalCount: number;
  needsReinforcementCount: number;
}) {
  if (input.playbookTitle) {
    if (input.lastOutcomeStatus === "helped") {
      return `${input.playbookTitle} is not just attached, it is helping. Keep the broader support path stable before changing course.`;
    }
    if (input.lastOutcomeStatus === "partial") {
      return `${input.playbookTitle} is only partly helping. Keep it visible, but refine the supporting strategy mix instead of assuming it is already enough.`;
    }
    if (input.lastOutcomeStatus === "no_change") {
      return `${input.playbookTitle} is attached, but the latest outcome showed no clear lift. Refine or replace the playbook soon.`;
    }
    if (input.lastOutcomeStatus === "replace") {
      return `${input.playbookTitle} now looks like a replacement candidate. Shift this learner to a stronger playbook instead of repeating it blindly.`;
    }
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

function getPriorityScore(input: {
  status: PrivateStudentListItem["status"];
  blockedGoalCount: number;
  needsReinforcementCount: number;
  recurringIssueTags: string[];
  needsReviewSnapshot: boolean;
  needsAdaptation: boolean;
  reviewWithoutAdaptation: boolean;
  hasLessonPlan: boolean;
  planOverdue: boolean;
  hasRecentHistory: boolean;
  hasStrategy: boolean;
  hasPlaybook: boolean;
}) {
  return (
    (input.blockedGoalCount > 0 ? 40 : 0) +
    (!input.hasPlaybook &&
    (input.needsAdaptation ||
      input.blockedGoalCount > 0 ||
      input.needsReinforcementCount > 0 ||
      input.recurringIssueTags.length > 0)
      ? 30
      : 0) +
    (!input.hasStrategy &&
    (input.needsAdaptation ||
      input.blockedGoalCount > 0 ||
      input.needsReinforcementCount > 0 ||
      input.recurringIssueTags.length > 0)
      ? 20
      : 0) +
    (input.needsAdaptation ? 18 : 0) +
    (input.reviewWithoutAdaptation ? 16 : 0) +
    (input.planOverdue ? 15 : 0) +
    (!input.hasLessonPlan ? 15 : 0) +
    (!input.hasRecentHistory && input.status !== "onboarding" ? 12 : 0) +
    (input.recurringIssueTags.length > 0 ? 10 : 0) +
    (input.needsReviewSnapshot ? 10 : 0) +
    (input.status === "awaiting_teacher" ? 12 : 0) +
    (input.status === "inactive" ? 10 : 0)
  );
}

function getPriorityLevel(score: number): "urgent" | "high" | "watch" {
  if (score >= 90) return "urgent";
  if (score >= 50) return "high";
  return "watch";
}

function getPriorityReason(input: {
  blockedGoalCount: number;
  needsAdaptation: boolean;
  reviewWithoutAdaptation: boolean;
  planOverdue: boolean;
  hasLessonPlan: boolean;
  hasRecentHistory: boolean;
  recurringIssueTags: string[];
  hasStrategy: boolean;
  hasPlaybook: boolean;
}) {
  const reasons: string[] = [];
  if (input.blockedGoalCount > 0) reasons.push("blocked goal");
  if (!input.hasPlaybook && (input.blockedGoalCount > 0 || input.recurringIssueTags.length > 0)) {
    reasons.push("no playbook");
  }
  if (!input.hasStrategy && (input.blockedGoalCount > 0 || input.recurringIssueTags.length > 0)) {
    reasons.push("no strategy");
  }
  if (input.needsAdaptation) reasons.push("needs adaptation");
  if (input.reviewWithoutAdaptation) reasons.push("reviewed, not adapted");
  if (input.planOverdue) reasons.push("plan overdue");
  if (!input.hasLessonPlan) reasons.push("no next plan");
  if (!input.hasRecentHistory) reasons.push("no recent history");
  if (input.recurringIssueTags.length > 0) reasons.push("recurring issue pressure");
  return reasons.length > 0 ? reasons.join(" + ") : "steady private learner";
}

function getSupportLoadState(input: {
  blockedGoalCount: number;
  needsReinforcementCount: number;
  recurringIssueTags: string[];
  hasStrategy: boolean;
  hasPlaybook: boolean;
  lastStrategyOutcomeStatus: string | null;
  lastPlaybookOutcomeStatus: string | null;
}) {
  const pressureCount =
    (input.blockedGoalCount > 0 ? 1 : 0) +
    (input.needsReinforcementCount > 0 ? 1 : 0) +
    (input.recurringIssueTags.length > 0 ? 1 : 0);

  const hasNoSupportPath = !input.hasStrategy && !input.hasPlaybook && pressureCount > 0;
  const weakSupportInUse =
    pressureCount > 0 &&
    ((input.hasStrategy &&
      (input.lastStrategyOutcomeStatus === "no_change" ||
        input.lastStrategyOutcomeStatus === "replace")) ||
      (input.hasPlaybook &&
        (input.lastPlaybookOutcomeStatus === "no_change" ||
          input.lastPlaybookOutcomeStatus === "replace")));

  if (hasNoSupportPath && pressureCount >= 2) {
    return {
      level: "high" as const,
      label: "No support path",
      note: "Recurring pressure is visible without any active strategy or playbook.",
    };
  }

  if (weakSupportInUse) {
    return {
      level: pressureCount >= 2 ? ("high" as const) : ("medium" as const),
      label: "Weak support path",
      note: "Support exists, but the latest outcome suggests it is not carrying the learner well enough.",
    };
  }

  if (pressureCount >= 2) {
    return {
      level: "medium" as const,
      label: "Repeated pressure",
      note: "Multiple pressure signals are stacking up for this learner and should be handled deliberately.",
    };
  }

  return {
    level: "watch" as const,
    label: "Contained",
    note: "Pressure is present but not concentrated enough yet to count as a support-load hotspot.",
  };
}

function getStabilizationState(input: {
  status: PrivateStudentListItem["status"];
  hasLessonPlan: boolean;
  hasSupportedPlan: boolean;
  activeGoalCount: number;
  blockedGoalCount: number;
  needsReinforcementCount: number;
  recurringIssueTags: string[];
  hasRecentHistory: boolean;
  hasRecentReview: boolean;
  hasRecentAdaptation: boolean;
  needsReviewSnapshot: boolean;
  needsAdaptation: boolean;
  reviewWithoutAdaptation: boolean;
  planOverdue: boolean;
  hasStrategyApplication: boolean;
  hasPlaybookApplication: boolean;
  latestStrategyOutcomeStatus: string | null;
  latestPlaybookOutcomeStatus: string | null;
}) {
  const hasWeakOutcome =
    input.latestStrategyOutcomeStatus === "no_change" ||
    input.latestStrategyOutcomeStatus === "replace" ||
    input.latestPlaybookOutcomeStatus === "no_change" ||
    input.latestPlaybookOutcomeStatus === "replace";

  const isStable =
    input.status === "active" &&
    input.blockedGoalCount === 0 &&
    input.needsReinforcementCount === 0 &&
    input.recurringIssueTags.length === 0 &&
    !input.needsReviewSnapshot &&
    !input.needsAdaptation &&
    !input.reviewWithoutAdaptation &&
    !input.planOverdue &&
    input.hasRecentHistory &&
    (input.hasRecentReview || input.hasRecentAdaptation) &&
    !hasWeakOutcome;

  if (!isStable) {
    return {
      state: "keep_active" as const,
      label: "Keep active",
      note: "This learner still needs active intervention, follow-through, or closer support.",
    };
  }

  if (
    input.hasLessonPlan &&
    (input.hasStrategyApplication || input.hasPlaybookApplication) &&
    ((input.latestStrategyOutcomeStatus === "helped" && !input.hasPlaybookApplication) ||
      input.latestPlaybookOutcomeStatus === "helped")
  ) {
    if (
      input.hasSupportedPlan &&
      input.activeGoalCount > 0 &&
      input.hasRecentHistory &&
      input.hasRecentReview &&
      input.hasRecentAdaptation
    ) {
      return {
        state: "handoff_ready" as const,
        label: "Handoff-ready",
        note: "Support looks stable enough for lighter-touch monitoring instead of the same active intervention load.",
      };
    }

    return {
      state: "simplify" as const,
      label: "Simplify support",
      note: "The current support path looks steady enough that the teacher may be able to simplify it.",
    };
  }

  return {
    state: "light_touch" as const,
    label: "Light-touch",
    note: "This learner looks relatively stable and may only need lighter monitoring for now.",
  };
}

function getPortfolioMode(stabilizationState: "keep_active" | "simplify" | "light_touch" | "handoff_ready") {
  if (stabilizationState === "keep_active") {
    return {
      mode: "active-heavy" as const,
      note: "This learner still belongs in the active-management side of the portfolio.",
    };
  }
  if (stabilizationState === "simplify") {
    return {
      mode: "simplify support" as const,
      note: "This learner is moving toward a simpler support mode instead of full active management.",
    };
  }
  if (stabilizationState === "light_touch") {
    return {
      mode: "light-touch" as const,
      note: "This learner fits the lighter-touch maintenance side of the portfolio right now.",
    };
  }
  return {
    mode: "handoff-ready" as const,
    note: "This learner looks stable enough to sit at the handoff-ready edge of the portfolio.",
  };
}

function getOperatingReviewState(input: {
  blockedGoalCount: number;
  needsAdaptation: boolean;
  reviewWithoutAdaptation: boolean;
  planOverdue: boolean;
  recurringIssueTags: string[];
  hasStrategy: boolean;
  hasPlaybook: boolean;
  stabilizationState: "keep_active" | "simplify" | "light_touch" | "handoff_ready";
}) {
  const resetNow =
    (input.blockedGoalCount > 0 && (!input.hasPlaybook || !input.hasStrategy)) ||
    (input.reviewWithoutAdaptation &&
      (input.recurringIssueTags.length > 0 || input.needsAdaptation)) ||
    (input.planOverdue &&
      (input.blockedGoalCount > 0 || input.recurringIssueTags.length > 0));

  if (resetNow) {
    return {
      state: "reset_now" as const,
      label: "Reset now",
      note: "This learner is carrying enough unresolved pressure that the support path should be reset before simply continuing as-is.",
    };
  }

  if (
    input.stabilizationState === "keep_active" ||
    input.needsAdaptation ||
    input.reviewWithoutAdaptation
  ) {
    return {
      state: "rebalance" as const,
      label: "Rebalance",
      note: "This learner still belongs in active support, but the current path likely needs rebalancing instead of more of the same.",
    };
  }

  if (input.stabilizationState === "simplify") {
    return {
      state: "simplify_now" as const,
      label: "Simplify now",
      note: "This learner looks ready for a lighter and simpler support path instead of the current heavier mode.",
    };
  }

  return {
    state: "steady" as const,
    label: "Stable to maintain",
    note: "This learner looks steady enough to maintain without a near-term reset or rebalance.",
  };
}

function getCheckpointDueState(daysOpen: number | null): "due_now" | "overdue" | "recently_checked" {
  if (daysOpen === null) return "recently_checked";
  if (daysOpen > 14) return "overdue";
  if (daysOpen >= 7) return "due_now";
  return "recently_checked";
}

function getCheckpointState(input: {
  needsReviewSnapshot: boolean;
  needsAdaptation: boolean;
  reviewWithoutAdaptation: boolean;
  hasStrategyApplication: boolean;
  hasPlaybookApplication: boolean;
  latestStrategyOutcomeStatus: string | null;
  latestPlaybookOutcomeStatus: string | null;
  daysSinceReview: number | null;
  daysSinceAdaptation: number | null;
  daysSinceStrategyApplication: number | null;
  daysSincePlaybookApplication: number | null;
}) {
  if (input.needsReviewSnapshot) {
    return {
      kind: "review_due" as const,
      dueState: getCheckpointDueState(input.daysSinceReview),
      reason: "review checkpoint due",
    };
  }

  if (input.needsAdaptation || input.reviewWithoutAdaptation) {
    return {
      kind: "adaptation_due" as const,
      dueState: getCheckpointDueState(input.daysSinceAdaptation),
      reason: input.reviewWithoutAdaptation ? "reviewed, not adapted" : "adaptation checkpoint due",
    };
  }

  const supportNeedsRecheck =
    (input.hasStrategyApplication &&
      (!input.latestStrategyOutcomeStatus ||
        input.latestStrategyOutcomeStatus === "no_change" ||
        input.latestStrategyOutcomeStatus === "replace")) ||
    (input.hasPlaybookApplication &&
      (!input.latestPlaybookOutcomeStatus ||
        input.latestPlaybookOutcomeStatus === "no_change" ||
        input.latestPlaybookOutcomeStatus === "replace"));

  if (supportNeedsRecheck) {
    const supportDays = Math.min(
      input.daysSinceStrategyApplication ?? Number.POSITIVE_INFINITY,
      input.daysSincePlaybookApplication ?? Number.POSITIVE_INFINITY
    );
    return {
      kind: "support_recheck_due" as const,
      dueState: getCheckpointDueState(Number.isFinite(supportDays) ? supportDays : null),
      reason: "support recheck due",
    };
  }

  return {
    kind: "recently_checked" as const,
    dueState: "recently_checked" as const,
    reason: "reviewed recently",
  };
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
      const checkpoint = getCheckpointState({
        needsReviewSnapshot,
        needsAdaptation,
        reviewWithoutAdaptation,
        hasStrategyApplication: Boolean(item.last_strategy_id),
        hasPlaybookApplication: Boolean(item.last_playbook_id),
        latestStrategyOutcomeStatus: item.last_strategy_outcome_status,
        latestPlaybookOutcomeStatus: item.last_playbook_outcome_status,
        daysSinceReview,
        daysSinceAdaptation,
        daysSinceStrategyApplication: getDaysSince(item.last_strategy_applied_at),
        daysSincePlaybookApplication: getDaysSince(item.last_playbook_applied_at),
      });

      const stabilization = getStabilizationState({
        status: item.status,
        hasLessonPlan: Boolean(lessonPlan),
        hasSupportedPlan: Boolean(
          lessonPlan && (lessonPlan.next_assignment_id || lessonPlan.next_template_id)
        ),
        activeGoalCount,
        blockedGoalCount,
        needsReinforcementCount,
        recurringIssueTags,
        hasRecentHistory,
        hasRecentReview,
        hasRecentAdaptation,
        needsReviewSnapshot,
        needsAdaptation,
        reviewWithoutAdaptation,
        planOverdue: lessonPlan ? isPlanOverdue(lessonPlan.target_date) : false,
        hasStrategyApplication: Boolean(item.last_strategy_id),
        hasPlaybookApplication: Boolean(item.last_playbook_id),
        latestStrategyOutcomeStatus: item.last_strategy_outcome_status,
        latestPlaybookOutcomeStatus: item.last_playbook_outcome_status,
      });

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
        checkpoint,
        priorityScore: getPriorityScore({
          status: item.status,
          blockedGoalCount,
          needsReinforcementCount,
          recurringIssueTags,
          needsReviewSnapshot,
          needsAdaptation,
          reviewWithoutAdaptation,
          hasLessonPlan: Boolean(lessonPlan),
          planOverdue: lessonPlan ? isPlanOverdue(lessonPlan.target_date) : false,
          hasRecentHistory,
          hasStrategy: Boolean(item.last_strategy_id),
          hasPlaybook: Boolean(item.last_playbook_id),
        }),
        priorityLevel: getPriorityLevel(
          getPriorityScore({
            status: item.status,
            blockedGoalCount,
            needsReinforcementCount,
            recurringIssueTags,
            needsReviewSnapshot,
            needsAdaptation,
            reviewWithoutAdaptation,
            hasLessonPlan: Boolean(lessonPlan),
            planOverdue: lessonPlan ? isPlanOverdue(lessonPlan.target_date) : false,
            hasRecentHistory,
            hasStrategy: Boolean(item.last_strategy_id),
            hasPlaybook: Boolean(item.last_playbook_id),
          })
        ),
        priorityReason: getPriorityReason({
          blockedGoalCount,
          needsAdaptation,
          reviewWithoutAdaptation,
          planOverdue: lessonPlan ? isPlanOverdue(lessonPlan.target_date) : false,
          hasLessonPlan: Boolean(lessonPlan),
          hasRecentHistory,
          recurringIssueTags,
          hasStrategy: Boolean(item.last_strategy_id),
          hasPlaybook: Boolean(item.last_playbook_id),
        }),
        supportLoad: getSupportLoadState({
          blockedGoalCount,
          needsReinforcementCount,
          recurringIssueTags,
          hasStrategy: Boolean(item.last_strategy_id),
          hasPlaybook: Boolean(item.last_playbook_id),
          lastStrategyOutcomeStatus: item.last_strategy_outcome_status,
          lastPlaybookOutcomeStatus: item.last_playbook_outcome_status,
        }),
        stabilization,
        portfolioMode: getPortfolioMode(stabilization.state),
        operatingReview: getOperatingReviewState({
          blockedGoalCount,
          needsAdaptation,
          reviewWithoutAdaptation,
          planOverdue: lessonPlan ? isPlanOverdue(lessonPlan.target_date) : false,
          recurringIssueTags,
          hasStrategy: Boolean(item.last_strategy_id),
          hasPlaybook: Boolean(item.last_playbook_id),
          stabilizationState: stabilization.state,
        }),
      };
    })
  );

  const grouped = statusOrder
    .map((status) => ({
      status,
      items: privateStudentsWithPlans
        .filter(({ item }) => item.status === status)
        .sort((a, b) => b.priorityScore - a.priorityScore),
    }))
    .filter((group) => group.items.length > 0);

  const urgentPriorityCount = privateStudentsWithPlans.filter(
    ({ priorityLevel }) => priorityLevel === "urgent"
  ).length;
  const highPriorityCount = privateStudentsWithPlans.filter(
    ({ priorityLevel }) => priorityLevel === "high"
  ).length;
  const watchPriorityCount = privateStudentsWithPlans.filter(
    ({ priorityLevel }) => priorityLevel === "watch"
  ).length;
  const checkpointDueNowCount = privateStudentsWithPlans.filter(
    ({ checkpoint }) => checkpoint.dueState === "due_now"
  ).length;
  const checkpointOverdueCount = privateStudentsWithPlans.filter(
    ({ checkpoint }) => checkpoint.dueState === "overdue"
  ).length;
  const checkpointRecentlyCheckedCount = privateStudentsWithPlans.filter(
    ({ checkpoint }) => checkpoint.dueState === "recently_checked"
  ).length;

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
  const repeatedPressureCount = privateStudentsWithPlans.filter(
    ({ supportLoad }) => supportLoad.label === "Repeated pressure"
  ).length;
  const noSupportPathPressureCount = privateStudentsWithPlans.filter(
    ({ supportLoad }) => supportLoad.label === "No support path"
  ).length;
  const weakSupportLoadCount = privateStudentsWithPlans.filter(
    ({ supportLoad }) => supportLoad.label === "Weak support path"
  ).length;
  const stableLearnerCount = privateStudentsWithPlans.filter(
    ({ stabilization }) => stabilization.state === "light_touch"
  ).length;
  const simplifySupportCount = privateStudentsWithPlans.filter(
    ({ stabilization }) => stabilization.state === "simplify"
  ).length;
  const handoffReadyCount = privateStudentsWithPlans.filter(
    ({ stabilization }) => stabilization.state === "handoff_ready"
  ).length;
  const keepActivePortfolioCount = privateStudentsWithPlans.filter(
    ({ portfolioMode }) => portfolioMode.mode === "active-heavy"
  ).length;
  const simplifyPortfolioCount = privateStudentsWithPlans.filter(
    ({ portfolioMode }) => portfolioMode.mode === "simplify support"
  ).length;
  const lightTouchPortfolioCount = privateStudentsWithPlans.filter(
    ({ portfolioMode }) => portfolioMode.mode === "light-touch"
  ).length;
  const handoffPortfolioCount = privateStudentsWithPlans.filter(
    ({ portfolioMode }) => portfolioMode.mode === "handoff-ready"
  ).length;
  const resetNowCount = privateStudentsWithPlans.filter(
    ({ operatingReview }) => operatingReview.state === "reset_now"
  ).length;
  const rebalanceCount = privateStudentsWithPlans.filter(
    ({ operatingReview }) => operatingReview.state === "rebalance"
  ).length;
  const simplifyNowCount = privateStudentsWithPlans.filter(
    ({ operatingReview }) => operatingReview.state === "simplify_now"
  ).length;
  const stableToMaintainCount = privateStudentsWithPlans.filter(
    ({ operatingReview }) => operatingReview.state === "steady"
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
        <TeachingPageHeader
          title="Private Learners"
          description="Manage the current lifecycle, next step, and follow-through for learners who entered through private teacher inquiries."
          badge="Operational workflow"
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {statusOrder.map((status) => (
            <TeachingToneMetricCard
              key={status}
              label={statusLabels[status]}
              value={privateStudents.filter((item) => item.status === status).length}
              tone={
                status === "active"
                  ? "emerald"
                  : status === "awaiting_student"
                    ? "sky"
                    : status === "awaiting_teacher"
                      ? "amber"
                      : status === "inactive"
                        ? "rose"
                        : "orange"
              }
            />
          ))}
        </div>

        {privateStudents.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-3">
            <TeachingToneMetricCard label="Urgent priority" value={urgentPriorityCount} tone="rose" />
            <TeachingToneMetricCard label="High priority" value={highPriorityCount} tone="amber" />
            <TeachingToneMetricCard label="Watch list" value={watchPriorityCount} tone="sky" />
          </div>
        ) : null}

        {privateStudents.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-3">
            <TeachingToneMetricCard label="Review due now" value={checkpointDueNowCount} tone="amber" />
            <TeachingToneMetricCard label="Review overdue" value={checkpointOverdueCount} tone="rose" />
            <TeachingToneMetricCard label="Recently checked" value={checkpointRecentlyCheckedCount} tone="sky" />
          </div>
        ) : null}

        {privateStudents.length > 0 ? (
          <TeachingExplainerBlock>
            Review rhythm highlights what needs a fresh checkpoint. `Due now` means it should be revisited soon; `overdue` means the teacher has likely gone too long without a meaningful review, adaptation, or support recheck.
          </TeachingExplainerBlock>
        ) : null}

        {privateStudents.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-3">
            <TeachingToneMetricCard label="Light-touch" value={stableLearnerCount} tone="sky" />
            <TeachingToneMetricCard label="Simplify support" value={simplifySupportCount} tone="amber" />
            <TeachingToneMetricCard label="Handoff-ready" value={handoffReadyCount} tone="emerald" />
          </div>
        ) : null}

        {privateStudents.length > 0 ? (
          <TeachingExplainerBlock>
            Stabilization highlights where a learner no longer needs the same level of active intervention. `Keep active` means the current pressure still needs direct teacher follow-through. `Simplify support` means the current path may be heavier than necessary. `Handoff-ready` means the learner looks stable enough for lighter-touch monitoring.
          </TeachingExplainerBlock>
        ) : null}

        {privateStudents.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <TeachingToneMetricCard label="Keep active" value={keepActivePortfolioCount} tone="rose" />
            <TeachingToneMetricCard label="Simplify support" value={simplifyPortfolioCount} tone="amber" />
            <TeachingToneMetricCard label="Light-touch" value={lightTouchPortfolioCount} tone="sky" />
            <TeachingToneMetricCard label="Handoff-ready" value={handoffPortfolioCount} tone="emerald" />
          </div>
        ) : null}

        {privateStudents.length > 0 ? (
          <TeachingExplainerBlock>
            Portfolio mode is the learner-level version of the broader portfolio mix. It shows whether this learner still belongs in active management or is starting to move into lighter-touch support.
          </TeachingExplainerBlock>
        ) : null}

        {privateStudents.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <TeachingToneMetricCard label="Reset now" value={resetNowCount} tone="rose" />
            <TeachingToneMetricCard label="Rebalance" value={rebalanceCount} tone="amber" />
            <TeachingToneMetricCard label="Simplify now" value={simplifyNowCount} tone="sky" />
            <TeachingToneMetricCard label="Stable to maintain" value={stableToMaintainCount} tone="emerald" />
          </div>
        ) : null}

        {privateStudents.length > 0 ? (
          <TeachingExplainerBlock>
            Operating review is stricter than portfolio mode alone. `Reset now` means this learner is carrying enough unresolved pressure that the current support path should be actively reset; `Rebalance` means support should change, but not necessarily restart.
          </TeachingExplainerBlock>
        ) : null}

        {privateStudents.length > 0 ? (
          <TeachingExplainerBlock>
            Use `Reset now` for learners whose current support path is no longer coherent, `Rebalance` for learners who still need active help but on a different path, and `Simplify now` for learners who may be ready for a lighter structure without losing continuity.
          </TeachingExplainerBlock>
        ) : null}

        {privateStudents.length > 0 ? (
          <TeachingExplainerBlock>
            Read these portfolio states operationally: `Keep active` means this learner still belongs in the high-attention side of your portfolio, while `Light-touch` and `Handoff-ready` mean the relationship may be moving toward a more sustainable maintenance mode.
          </TeachingExplainerBlock>
        ) : null}

        {privateStudents.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-3">
            <TeachingToneMetricCard label="Repeated pressure" value={repeatedPressureCount} tone="amber" />
            <TeachingToneMetricCard label="No support path" value={noSupportPathPressureCount} tone="rose" />
            <TeachingToneMetricCard label="Weak support load" value={weakSupportLoadCount} tone="rose" />
          </div>
        ) : null}

        {privateStudents.length > 0 ? (
          <TeachingExplainerBlock>
            Support-load concentration highlights where the same learner is carrying multiple pressure signals at once. `No support path` means the learner is under pressure without a strategy or playbook; `Weak support load` means support exists, but the latest outcome still suggests it is not working well enough.
          </TeachingExplainerBlock>
        ) : null}

        {privateStudents.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-11">
            <TeachingToneMetricCard label="No next plan" value={noPlanCount} tone="rose" />
            <TeachingToneMetricCard label="Overdue plans" value={overduePlanCount} tone="amber" />
            <TeachingToneMetricCard label="Supported plans" value={supportedPlanCount} tone="sky" />
            <TeachingToneMetricCard label="No active goals" value={noActiveGoalCount} tone="rose" />
            <TeachingToneMetricCard label="No recent history" value={noRecentHistoryCount} tone="amber" />
            <TeachingToneMetricCard label="Blocked goals" value={blockedGoalCount} tone="rose" />
            <TeachingToneMetricCard label="Needs reinforcement" value={reinforcementCount} tone="sky" />
            <TeachingToneMetricCard label="Recurring issues" value={recurringIssueCount} tone="amber" />
            <TeachingToneMetricCard label="No strategy yet" value={noStrategyCount} tone="amber" />
            <TeachingToneMetricCard label="Strategy gap" value={strategyGapCount} tone="rose" />
            <TeachingToneMetricCard label="No playbook yet" value={noPlaybookCount} tone="amber" />
            <TeachingToneMetricCard label="Playbook gap" value={playbookGapCount} tone="rose" />
            <TeachingToneMetricCard label="Needs review" value={noRecentReviewCount} tone="rose" />
            <TeachingToneMetricCard label="Needs adaptation" value={noRecentAdaptationCount} tone="rose" />
            <TeachingToneMetricCard label="Reviewed, not adapted" value={reviewedNotAdaptedCount} tone="amber" />
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
                  <Users className="ui-tone-orange-text h-4 w-4" />
                  <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    {statusLabels[group.status]}
                  </h2>
                </div>
                <div className="grid gap-4">
                  {group.items.map(({ item, lessonPlan, activeGoalCount, blockedGoalCount, needsReinforcementCount, recurringIssueTags, latestHistory, latestReview, hasRecentHistory, needsReviewSnapshot, needsAdaptation, reviewWithoutAdaptation, priorityLevel, priorityReason, checkpoint, supportLoad, stabilization, portfolioMode, operatingReview }) => (
                    <TeachingEntityCard
                      key={item.id}
                      href={`/notebook/teacher/private-students/${item.id}`}
                      badges={
                        <>
                          <StatusPill status={item.status} />
                          <NextStepLabel nextStepType={item.next_step_type} />
                          <span
                            className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                              priorityLevel === "urgent"
                                ? "ui-tone-rose-panel ui-tone-rose-text"
                                : priorityLevel === "high"
                                  ? "ui-tone-amber-panel ui-tone-amber-text"
                                  : "ui-tone-sky-panel ui-tone-sky-text"
                            }`}
                          >
                            {priorityLevel}
                          </span>
                          <span
                            className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                              checkpoint.dueState === "overdue"
                                ? "ui-tone-rose-panel ui-tone-rose-text"
                                : checkpoint.dueState === "due_now"
                                  ? "ui-tone-amber-panel ui-tone-amber-text"
                                  : "ui-tone-emerald-panel ui-tone-emerald-text"
                            }`}
                          >
                            {checkpoint.dueState === "overdue"
                              ? "overdue"
                              : checkpoint.dueState === "due_now"
                                ? "due now"
                                : "recently checked"}
                          </span>
                          {lessonPlan ? (
                            <span className="ui-tone-sky-panel ui-tone-sky-text rounded-full border px-2.5 py-1 text-[11px] font-medium">
                              {getPrivateLessonPlanStatusLabel(lessonPlan.plan_status)}
                            </span>
                          ) : (
                            <span className="ui-tone-rose-panel ui-tone-rose-text rounded-full border px-2.5 py-1 text-[11px] font-medium">
                              No next plan
                            </span>
                          )}
                          {lessonPlan && isPlanOverdue(lessonPlan.target_date) ? (
                            <span className="ui-tone-amber-panel ui-tone-amber-text rounded-full border px-2.5 py-1 text-[11px] font-medium">
                              Plan overdue
                            </span>
                          ) : null}
                          {activeGoalCount === 0 ? (
                            <span className="ui-tone-rose-panel ui-tone-rose-text rounded-full border px-2.5 py-1 text-[11px] font-medium">
                              No active goal
                            </span>
                          ) : null}
                          {!hasRecentHistory && item.status !== "onboarding" ? (
                            <span className="ui-tone-amber-panel ui-tone-amber-text rounded-full border px-2.5 py-1 text-[11px] font-medium">
                              No recent history
                            </span>
                          ) : null}
                          {blockedGoalCount > 0 ? (
                            <span className="ui-tone-rose-panel ui-tone-rose-text rounded-full border px-2.5 py-1 text-[11px] font-medium">
                              {blockedGoalCount} blocked
                            </span>
                          ) : null}
                          {needsReinforcementCount > 0 ? (
                            <span className="ui-tone-sky-panel ui-tone-sky-text rounded-full border px-2.5 py-1 text-[11px] font-medium">
                              {needsReinforcementCount} needs reinforcement
                            </span>
                          ) : null}
                          {recurringIssueTags.length > 0 ? (
                            <span className="ui-tone-amber-panel ui-tone-amber-text rounded-full border px-2.5 py-1 text-[11px] font-medium">
                              {recurringIssueTags.length} recurring issue{recurringIssueTags.length === 1 ? "" : "s"}
                            </span>
                          ) : null}
                          {needsReviewSnapshot ? (
                            <span className="ui-tone-rose-panel ui-tone-rose-text rounded-full border px-2.5 py-1 text-[11px] font-medium">
                              Needs review
                            </span>
                          ) : null}
                          {needsAdaptation ? (
                            <span className="ui-tone-rose-panel ui-tone-rose-text rounded-full border px-2.5 py-1 text-[11px] font-medium">
                              Needs adaptation
                            </span>
                          ) : null}
                          {reviewWithoutAdaptation ? (
                            <span className="ui-tone-amber-panel ui-tone-amber-text rounded-full border px-2.5 py-1 text-[11px] font-medium">
                              Reviewed, not adapted
                            </span>
                          ) : null}
                          {supportLoad.level === "high" ? (
                            <span className="ui-tone-rose-panel ui-tone-rose-text rounded-full border px-2.5 py-1 text-[11px] font-medium">
                              {supportLoad.label}
                            </span>
                          ) : supportLoad.level === "medium" ? (
                            <span className="ui-tone-amber-panel ui-tone-amber-text rounded-full border px-2.5 py-1 text-[11px] font-medium">
                              {supportLoad.label}
                            </span>
                          ) : null}
                          {stabilization.state === "handoff_ready" ? (
                            <span className="ui-tone-emerald-panel ui-tone-emerald-text rounded-full border px-2.5 py-1 text-[11px] font-medium">
                              {stabilization.label}
                            </span>
                          ) : stabilization.state === "simplify" ? (
                            <span className="ui-tone-orange-panel ui-tone-orange-text rounded-full border px-2.5 py-1 text-[11px] font-medium">
                              {stabilization.label}
                            </span>
                          ) : stabilization.state === "light_touch" ? (
                            <span className="ui-tone-sky-panel ui-tone-sky-text rounded-full border px-2.5 py-1 text-[11px] font-medium">
                              {stabilization.label}
                            </span>
                          ) : null}
                          <span
                            className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                              portfolioMode.mode === "active-heavy"
                                ? "ui-tone-rose-panel ui-tone-rose-text"
                                : portfolioMode.mode === "simplify support"
                                  ? "ui-tone-amber-panel ui-tone-amber-text"
                                  : portfolioMode.mode === "light-touch"
                                    ? "ui-tone-sky-panel ui-tone-sky-text"
                                    : "ui-tone-emerald-panel ui-tone-emerald-text"
                            }`}
                          >
                            Portfolio · {portfolioMode.mode}
                          </span>
                          <span
                            className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                              operatingReview.state === "reset_now"
                                ? "ui-tone-rose-panel ui-tone-rose-text"
                                : operatingReview.state === "rebalance"
                                  ? "ui-tone-amber-panel ui-tone-amber-text"
                                  : operatingReview.state === "simplify_now"
                                    ? "ui-tone-sky-panel ui-tone-sky-text"
                                    : "ui-tone-emerald-panel ui-tone-emerald-text"
                            }`}
                          >
                            {operatingReview.label}
                          </span>
                          {!item.last_playbook_id ? (
                            <span className="ui-tone-amber-panel ui-tone-amber-text rounded-full border px-2.5 py-1 text-[11px] font-medium">
                              No playbook yet
                            </span>
                          ) : null}
                          {!item.last_playbook_id &&
                          (needsAdaptation ||
                            blockedGoalCount > 0 ||
                            needsReinforcementCount > 0 ||
                            recurringIssueTags.length > 0) ? (
                            <span className="ui-tone-rose-panel ui-tone-rose-text rounded-full border px-2.5 py-1 text-[11px] font-medium">
                              Playbook gap
                            </span>
                          ) : null}
                          {item.last_strategy_title ? (
                            <span className="ui-tone-violet-panel ui-tone-violet-text rounded-full border px-2.5 py-1 text-[11px] font-medium">
                              Strategy · {item.last_strategy_title}
                            </span>
                          ) : null}
                          {item.last_playbook_title ? (
                            <span className="ui-tone-amber-panel ui-tone-amber-text rounded-full border px-2.5 py-1 text-[11px] font-medium">
                              Playbook · {item.last_playbook_title}
                            </span>
                          ) : null}
                          {item.last_playbook_outcome_status ? (
                            <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                              item.last_playbook_outcome_status === "helped"
                                ? "ui-tone-emerald-panel ui-tone-emerald-text"
                                : item.last_playbook_outcome_status === "partial"
                                  ? "ui-tone-sky-panel ui-tone-sky-text"
                                  : item.last_playbook_outcome_status === "no_change"
                                    ? "ui-tone-amber-panel ui-tone-amber-text"
                                    : "ui-tone-rose-panel ui-tone-rose-text"
                            }`}>
                              {item.last_playbook_outcome_status === "helped"
                                ? "Playbook helped"
                                : item.last_playbook_outcome_status === "partial"
                                  ? "Playbook partial"
                                  : item.last_playbook_outcome_status === "no_change"
                                    ? "Playbook unclear"
                                    : "Playbook replace"}
                            </span>
                          ) : null}
                          {item.last_strategy_outcome_status ? (
                            <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                              item.last_strategy_outcome_status === "helped"
                                ? "ui-tone-emerald-panel ui-tone-emerald-text"
                                : item.last_strategy_outcome_status === "partial"
                                  ? "ui-tone-sky-panel ui-tone-sky-text"
                                  : item.last_strategy_outcome_status === "no_change"
                                    ? "ui-tone-amber-panel ui-tone-amber-text"
                                    : "ui-tone-rose-panel ui-tone-rose-text"
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
                        </>
                      }
                      title={item.student_name}
                      subtitle={
                        <>
                          {item.classroom_name}
                          {item.classroom_description ? ` · ${item.classroom_description}` : ""}
                        </>
                      }
                      meta={
                        <>
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
                        </>
                      }
                    >
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
                          lastOutcomeStatus: item.last_playbook_outcome_status ?? null,
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
                      {item.last_playbook_outcome_note ? (
                        <p className="mt-2 text-sm text-muted-foreground">
                          Latest playbook outcome: {item.last_playbook_outcome_note}
                        </p>
                      ) : item.last_playbook_title && !item.last_playbook_outcome_status ? (
                        <p className="mt-2 text-sm text-muted-foreground">
                          No outcome has been recorded yet for the current playbook.
                        </p>
                      ) : null}
                      {item.last_strategy_outcome_note ? (
                        <p className="mt-2 text-sm text-muted-foreground">
                          Latest strategy outcome: {item.last_strategy_outcome_note}
                        </p>
                      ) : null}
                      <p className="mt-4 text-sm text-muted-foreground">
                        {getTeacherFocusCopy(item)}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Priority reason: {priorityReason}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Review rhythm: {checkpoint.reason}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Support load: {supportLoad.note}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Stabilization: {stabilization.note}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Portfolio mode: {portfolioMode.note}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Operating review: {operatingReview.note}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {checkpoint.dueState === "overdue"
                          ? "This learner has slipped past the current review window."
                          : checkpoint.dueState === "due_now"
                            ? "This learner should come back into the current review window soon."
                            : "This learner has been checked recently enough for now."}
                      </p>
                    </TeachingEntityCard>
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
