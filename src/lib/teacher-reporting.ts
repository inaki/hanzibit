import { listAssignmentsForClassroom } from "./assignments";
import { listPrivateLessonHistory } from "./private-lesson-history";
import { getLatestPrivateStudentReview } from "./private-student-reviews";
import { listPrivateStudentGoals } from "./private-student-goals";
import { listPrivateStudentPlaybookApplications } from "./private-student-playbook-applications";
import { listPrivateStudentStrategyApplications } from "./private-student-strategy-applications";
import { listPrivateStudentsForTeacher } from "./private-students";
import { query } from "./db";
import { getPrivateLessonPlan } from "./private-lesson-plans";
import {
  getClassroom,
  listOwnedClassrooms,
  getClassroomRoster,
  type Classroom,
} from "./classrooms";
import {
  listClassroomAssignmentSummaries,
  listClassroomSubmissionStudentRows,
} from "./submissions";

export interface TeacherReportingClassroomSummary {
  classroom: Classroom;
  student_count: number;
  assignment_count: number;
  submitted_count: number;
  reviewed_count: number;
  needs_review_count: number;
  missing_submission_count: number;
}

export interface TeacherReportingAttentionItem {
  classroom_id: string;
  classroom_name: string;
  assignment_id: string;
  assignment_title: string;
  due_at: string | null;
  waiting_review_count: number;
  missing_submission_count: number;
}

export interface TeacherReportingDashboard {
  classroomSummaries: TeacherReportingClassroomSummary[];
  attentionItems: TeacherReportingAttentionItem[];
  studentAttention: TeacherReportingStudentAttention[];
  conversionItems: TeacherReportingConversionItem[];
  privateLearnerItems: TeacherReportingPrivateLearnerItem[];
  strategyItems: TeacherReportingStrategyItem[];
  totalClassrooms: number;
  totalStudents: number;
  totalAssignments: number;
  totalWaitingReview: number;
  totalMissingSubmissions: number;
  totalConvertedInquiries: number;
  totalConvertedActive: number;
  totalConvertedInactive: number;
  privateLearnerCount: number;
  totalPrivateAwaitingTeacher: number;
  totalPrivateAwaitingStudent: number;
  totalPrivateInactive: number;
  totalPrivateStalled: number;
  totalPrivateNoPlan: number;
  totalPrivateOverduePlan: number;
  totalPrivateUnsupportedPlan: number;
  totalPrivateNoActiveGoal: number;
  totalPrivateNoRecentHistory: number;
  totalPrivateWeakContinuity: number;
  totalPrivateBlockedGoals: number;
  totalPrivateNeedsReinforcement: number;
  totalPrivateRecurringIssues: number;
  totalPrivateInterventionNow: number;
  totalPrivateNoRecentReview: number;
  totalPrivateNoRecentAdaptation: number;
  totalPrivateReviewedNotAdapted: number;
  totalPrivateNoStrategy: number;
  totalPrivateStrategyGap: number;
  totalPrivateNoPlaybook: number;
  totalPrivatePlaybookGap: number;
  totalPlaybooksUsed: number;
  totalStrategiesUsed: number;
  totalStrategyHelped: number;
  totalStrategyNeedsReview: number;
  totalStrategyWeak: number;
  totalStrategyNoOutcome: number;
}

export interface TeacherReportingStudentAttention {
  classroom_id: string;
  classroom_name: string;
  student_user_id: string;
  student_name: string;
  student_email: string;
  assignment_count: number;
  submitted_count: number;
  reviewed_count: number;
  missing_count: number;
  awaiting_review_count: number;
  last_submitted_at: string | null;
}

export interface TeacherReportingConversionItem {
  inquiry_id: string;
  classroom_id: string;
  classroom_name: string;
  student_user_id: string;
  student_name: string;
  student_email: string;
  converted_at: string | null;
  onboarding_message: string | null;
  initial_assignment_id: string | null;
  initial_assignment_title: string | null;
  onboarding_started: boolean;
  onboarding_completed: boolean;
  classroom_activity_started: boolean;
  is_inactive: boolean;
  days_since_conversion: number | null;
}

export interface TeacherReportingPrivateLearnerItem {
  id: string;
  classroom_id: string;
  classroom_name: string;
  student_user_id: string;
  student_name: string;
  student_email: string;
  status: string;
  next_step_type: string | null;
  next_assignment_id: string | null;
  next_assignment_title: string | null;
  lesson_plan_status: string | null;
  lesson_plan_target_date: string | null;
  lesson_plan_focus_note: string | null;
  lesson_plan_assignment_id: string | null;
  lesson_plan_assignment_title: string | null;
  lesson_plan_template_id: string | null;
  lesson_plan_template_title: string | null;
  awaiting_review_count: number;
  submission_count: number;
  last_activity_at: string | null;
  days_since_activity: number | null;
  is_stalled: boolean;
  has_lesson_plan: boolean;
  has_supported_plan: boolean;
  plan_is_overdue: boolean;
  active_goal_count: number;
  completed_goal_count: number;
  blocked_goal_count: number;
  reinforcement_goal_count: number;
  recurring_issue_tags: string[];
  latest_issue_tags: string[];
  latest_intervention_note: string | null;
  latest_history_at: string | null;
  latest_history_summary: string | null;
  latest_review_at: string | null;
  latest_review_summary: string | null;
  latest_adaptation_note: string | null;
  latest_adapted_at: string | null;
  latest_strategy_title: string | null;
  latest_strategy_summary: string | null;
  latest_strategy_applied_at: string | null;
  latest_strategy_outcome_status: string | null;
  latest_strategy_outcome_note: string | null;
  latest_strategy_outcome_at: string | null;
  strategy_application_count: number;
  latest_playbook_title: string | null;
  latest_playbook_applied_at: string | null;
  playbook_application_count: number;
  days_since_review: number | null;
  days_since_adaptation: number | null;
  days_since_strategy_application: number | null;
  days_since_playbook_application: number | null;
  has_recent_review: boolean;
  has_recent_adaptation: boolean;
  has_strategy_application: boolean;
  has_playbook_application: boolean;
  needs_review_snapshot: boolean;
  review_without_adaptation: boolean;
  needs_adaptation: boolean;
  days_since_history: number | null;
  has_recent_history: boolean;
  needs_continuity_attention: boolean;
  needs_teacher_attention: boolean;
  needs_student_attention: boolean;
  needs_strategy_attention: boolean;
  needs_playbook_attention: boolean;
}

export interface TeacherReportingStrategyItem {
  id: string;
  title: string;
  summary: string;
  issue_focus: string | null;
  goal_focus: string | null;
  usage_count: number;
  archived: number;
  last_refined_at: string | null;
  helped_count: number;
  partial_count: number;
  no_change_count: number;
  replace_count: number;
  total_outcomes: number;
  latest_outcome_status: string | null;
  latest_outcome_note: string | null;
  latest_outcome_at: string | null;
  needs_refinement: boolean;
  needs_more_outcomes: boolean;
}

export interface TeacherReportingClassroomDetail {
  classroom: Classroom;
  summary: TeacherReportingClassroomSummary;
  assignmentAttention: TeacherReportingAttentionItem[];
  students: TeacherReportingStudentAttention[];
}

export interface TeacherReportingStudentDetail {
  classroom: Classroom;
  student: TeacherReportingStudentAttention;
  assignmentRows: Array<{
    assignment_id: string;
    assignment_title: string;
    due_at: string | null;
    status: string | null;
    submitted_at: string | null;
    reviewed_at: string | null;
  }>;
}

interface TeacherReportingConversionRow {
  inquiry_id: string;
  classroom_id: string;
  classroom_name: string;
  student_user_id: string;
  student_name: string;
  student_email: string;
  converted_at: string | null;
  onboarding_message: string | null;
  initial_assignment_id: string | null;
  initial_assignment_title: string | null;
  onboarding_status: string | null;
  classroom_activity_started: boolean;
}

interface TeacherReportingStrategyRow {
  id: string;
  title: string;
  summary: string;
  issue_focus: string | null;
  goal_focus: string | null;
  usage_count: number;
  archived: number;
  last_refined_at: string | null;
  helped_count: number;
  partial_count: number;
  no_change_count: number;
  replace_count: number;
  total_outcomes: number;
  latest_outcome_status: string | null;
  latest_outcome_note: string | null;
  latest_outcome_at: string | null;
}

function getDaysSince(value: string | null): number | null {
  if (!value) return null;
  return Math.floor((Date.now() - new Date(value).getTime()) / (1000 * 60 * 60 * 24));
}

function isPlanOverdue(targetDate: string | null): boolean {
  if (!targetDate) return false;
  const endOfTargetDay = new Date(`${targetDate}T23:59:59.999Z`).getTime();
  return endOfTargetDay < Date.now();
}

export async function getTeacherReportingDashboard(
  teacherUserId: string
): Promise<TeacherReportingDashboard> {
  const classrooms = await listOwnedClassrooms(teacherUserId);
  const privateStudents = await listPrivateStudentsForTeacher(teacherUserId);
  const conversionRows = await query<TeacherReportingConversionRow>(
    `SELECT
       teacher_inquiries.id AS inquiry_id,
       classrooms.id AS classroom_id,
       classrooms.name AS classroom_name,
       student_user.id AS student_user_id,
       student_user.name AS student_name,
       student_user.email AS student_email,
       teacher_inquiries.conversion_completed_at AS converted_at,
       teacher_inquiries.onboarding_message,
       teacher_inquiries.initial_assignment_id,
       initial_assignment.title AS initial_assignment_title,
       onboarding_submission.status AS onboarding_status,
       EXISTS (
         SELECT 1
         FROM assignments classroom_assignments
         INNER JOIN assignment_submissions classroom_submissions
           ON classroom_submissions.assignment_id = classroom_assignments.id
         WHERE classroom_assignments.classroom_id = classrooms.id
           AND classroom_submissions.student_user_id = teacher_inquiries.student_user_id
       ) AS classroom_activity_started
     FROM teacher_inquiries
     INNER JOIN classrooms
       ON classrooms.id = teacher_inquiries.created_classroom_id
     INNER JOIN "user" AS student_user
       ON student_user.id = teacher_inquiries.student_user_id
     LEFT JOIN assignments AS initial_assignment
       ON initial_assignment.id = teacher_inquiries.initial_assignment_id
     LEFT JOIN assignment_submissions AS onboarding_submission
       ON onboarding_submission.assignment_id = teacher_inquiries.initial_assignment_id
      AND onboarding_submission.student_user_id = teacher_inquiries.student_user_id
     WHERE teacher_inquiries.teacher_user_id = $1
       AND teacher_inquiries.status = 'converted'
     ORDER BY teacher_inquiries.conversion_completed_at DESC NULLS LAST, teacher_inquiries.updated_at DESC`,
    [teacherUserId]
  );
  const strategyRows = await query<TeacherReportingStrategyRow>(
    `SELECT
       teacher_strategies.id,
       teacher_strategies.title,
       teacher_strategies.summary,
       teacher_strategies.issue_focus,
       teacher_strategies.goal_focus,
       teacher_strategies.usage_count,
       teacher_strategies.archived,
       teacher_strategies.last_refined_at,
       COUNT(outcomes.id)::int AS total_outcomes,
       COUNT(outcomes.id) FILTER (WHERE outcomes.outcome_status = 'helped')::int AS helped_count,
       COUNT(outcomes.id) FILTER (WHERE outcomes.outcome_status = 'partial')::int AS partial_count,
       COUNT(outcomes.id) FILTER (WHERE outcomes.outcome_status = 'no_change')::int AS no_change_count,
       COUNT(outcomes.id) FILTER (WHERE outcomes.outcome_status = 'replace')::int AS replace_count,
       latest.outcome_status AS latest_outcome_status,
       latest.outcome_note AS latest_outcome_note,
       latest.recorded_at AS latest_outcome_at
     FROM teacher_strategies
     LEFT JOIN private_student_strategy_outcomes outcomes
       ON outcomes.teacher_strategy_id = teacher_strategies.id
     LEFT JOIN LATERAL (
       SELECT outcome_status, outcome_note, recorded_at
       FROM private_student_strategy_outcomes
       WHERE teacher_strategy_id = teacher_strategies.id
       ORDER BY recorded_at DESC, created_at DESC
       LIMIT 1
     ) latest ON TRUE
     WHERE teacher_strategies.teacher_user_id = $1
     GROUP BY
       teacher_strategies.id,
       teacher_strategies.title,
       teacher_strategies.summary,
       teacher_strategies.issue_focus,
       teacher_strategies.goal_focus,
       teacher_strategies.usage_count,
       teacher_strategies.archived,
       teacher_strategies.last_refined_at,
       latest.outcome_status,
       latest.outcome_note,
       latest.recorded_at
     ORDER BY teacher_strategies.archived ASC, teacher_strategies.updated_at DESC, teacher_strategies.created_at DESC`,
    [teacherUserId]
  );

  const perClassroom = await Promise.all(
    classrooms.map(async (classroom) => {
      const [roster, assignments, summaries, submissionRows] = await Promise.all([
        getClassroomRoster(classroom.id),
        listAssignmentsForClassroom(classroom.id),
        listClassroomAssignmentSummaries(classroom.id),
        listClassroomSubmissionStudentRows(classroom.id),
      ]);

      const studentCount = roster.filter((member) => member.role === "student").length;
      const summaryByAssignmentId = new Map(
        summaries.map((summary) => [summary.assignment_id, summary])
      );

      const assignmentCount = assignments.length;
      const submittedCount = summaries.reduce((sum, item) => sum + item.submitted_count, 0);
      const reviewedCount = summaries.reduce((sum, item) => sum + item.reviewed_count, 0);
      const needsReviewCount = summaries.reduce((sum, item) => sum + item.needs_review_count, 0);

      const attentionItems = assignments
        .map((assignment) => {
          const summary = summaryByAssignmentId.get(assignment.id);
          const totalSubmissions = summary?.total_submissions ?? 0;
          const missingSubmissionCount = Math.max(studentCount - totalSubmissions, 0);
          const waitingReviewCount = summary?.needs_review_count ?? 0;

          return {
            classroom_id: classroom.id,
            classroom_name: classroom.name,
            assignment_id: assignment.id,
            assignment_title: assignment.title,
            due_at: assignment.due_at,
            waiting_review_count: waitingReviewCount,
            missing_submission_count: missingSubmissionCount,
          } satisfies TeacherReportingAttentionItem;
        })
        .filter((item) => item.waiting_review_count > 0 || item.missing_submission_count > 0);

      const studentAttention = Array.from(
        submissionRows.reduce((map, row) => {
          const existing = map.get(row.student_user_id) ?? {
            classroom_id: classroom.id,
            classroom_name: classroom.name,
            student_user_id: row.student_user_id,
            student_name: row.student_name,
            student_email: row.student_email,
            assignment_count: assignments.length,
            submitted_count: 0,
            reviewed_count: 0,
            missing_count: 0,
            awaiting_review_count: 0,
            last_submitted_at: null,
          };

          if (!row.status) {
            existing.missing_count += 1;
          } else if (row.status === "reviewed") {
            existing.reviewed_count += 1;
          } else if (row.status === "submitted") {
            existing.submitted_count += 1;
            existing.awaiting_review_count += 1;
          } else {
            existing.submitted_count += 1;
          }

          if (row.submitted_at && (!existing.last_submitted_at || row.submitted_at > existing.last_submitted_at)) {
            existing.last_submitted_at = row.submitted_at;
          }

          map.set(row.student_user_id, existing);
          return map;
        }, new Map<string, TeacherReportingStudentAttention>())
      )
        .map(([, value]) => value)
        .filter((student) => student.missing_count > 0 || student.awaiting_review_count > 0)
        .sort((a, b) => {
          if (b.missing_count !== a.missing_count) return b.missing_count - a.missing_count;
          if (b.awaiting_review_count !== a.awaiting_review_count) return b.awaiting_review_count - a.awaiting_review_count;
          return a.student_name.localeCompare(b.student_name);
        });

      return {
        classroomSummary: {
          classroom,
          student_count: studentCount,
          assignment_count: assignmentCount,
          submitted_count: submittedCount,
          reviewed_count: reviewedCount,
          needs_review_count: needsReviewCount,
          missing_submission_count: attentionItems.reduce(
            (sum, item) => sum + item.missing_submission_count,
            0
          ),
        } satisfies TeacherReportingClassroomSummary,
        attentionItems,
        studentAttention,
      };
    })
  );

  const classroomSummaries = perClassroom.map((item) => item.classroomSummary);
  const attentionItems = perClassroom
    .flatMap((item) => item.attentionItems)
    .sort((a, b) => {
      const aDue = a.due_at ? new Date(a.due_at).getTime() : Number.POSITIVE_INFINITY;
      const bDue = b.due_at ? new Date(b.due_at).getTime() : Number.POSITIVE_INFINITY;
      return aDue - bDue;
    });
  const studentAttention = perClassroom
    .flatMap((item) => item.studentAttention)
    .sort((a, b) => {
      if (b.missing_count !== a.missing_count) return b.missing_count - a.missing_count;
      if (b.awaiting_review_count !== a.awaiting_review_count) return b.awaiting_review_count - a.awaiting_review_count;
      return a.student_name.localeCompare(b.student_name);
    });

  const conversionItems = conversionRows.map((row) => {
    const convertedAtDate = row.converted_at ? new Date(row.converted_at) : null;
    const daysSinceConversion = convertedAtDate
      ? Math.floor((Date.now() - convertedAtDate.getTime()) / (1000 * 60 * 60 * 24))
      : null;
    const onboardingStarted = Boolean(row.onboarding_status);
    const onboardingCompleted = row.onboarding_status === "reviewed";
    const classroomActivityStarted = row.classroom_activity_started || onboardingStarted;
    const isInactive = !classroomActivityStarted && (daysSinceConversion ?? 0) >= 7;

    return {
      inquiry_id: row.inquiry_id,
      classroom_id: row.classroom_id,
      classroom_name: row.classroom_name,
      student_user_id: row.student_user_id,
      student_name: row.student_name,
      student_email: row.student_email,
      converted_at: row.converted_at,
      onboarding_message: row.onboarding_message,
      initial_assignment_id: row.initial_assignment_id,
      initial_assignment_title: row.initial_assignment_title,
      onboarding_started: onboardingStarted,
      onboarding_completed: onboardingCompleted,
      classroom_activity_started: classroomActivityStarted,
      is_inactive: isInactive,
      days_since_conversion: daysSinceConversion,
    } satisfies TeacherReportingConversionItem;
  });

  const privateLearnerItems = (
    await Promise.all(
      privateStudents.map(async (item) => {
        const [lessonPlan, goals, history, latestReview, strategyApplications, playbookApplications] = await Promise.all([
          getPrivateLessonPlan(item.id),
          listPrivateStudentGoals(item.id),
          listPrivateLessonHistory(item.id),
          getLatestPrivateStudentReview(item.id),
          listPrivateStudentStrategyApplications(item.id),
          listPrivateStudentPlaybookApplications(item.id),
        ]);
        const activeGoals = goals.filter((goal) => goal.status === "active");
        const completedGoals = goals.filter((goal) => goal.status === "completed");
        const blockedGoals = goals.filter((goal) => goal.progress_status === "blocked");
        const reinforcementGoals = goals.filter(
          (goal) => goal.progress_status === "needs_reinforcement"
        );
        const issueCounts = new Map<string, number>();
        for (const entry of history) {
          for (const tag of entry.issue_tags) {
            issueCounts.set(tag, (issueCounts.get(tag) ?? 0) + 1);
          }
        }
        const recurringIssueTags = Array.from(issueCounts.entries())
          .filter(([, count]) => count >= 2)
          .map(([tag]) => tag);
        const latestHistory = history[0] ?? null;
        const latestStrategy = strategyApplications[0] ?? null;
        const latestPlaybook = playbookApplications[0] ?? null;
        const daysSinceReview = getDaysSince(latestReview?.reviewed_at ?? item.last_review_snapshot_at);
        const daysSinceAdaptation = getDaysSince(item.last_plan_adapted_at);
        const daysSinceStrategyApplication = getDaysSince(
          latestStrategy?.applied_at ?? item.last_strategy_applied_at
        );
        const daysSincePlaybookApplication = getDaysSince(
          latestPlaybook?.applied_at ?? item.last_playbook_applied_at
        );
        const hasRecentReview =
          item.status === "onboarding" ? true : (daysSinceReview ?? Number.POSITIVE_INFINITY) <= 14;
        const hasRecentAdaptation =
          item.status === "onboarding"
            ? true
            : (daysSinceAdaptation ?? Number.POSITIVE_INFINITY) <= 14;
        const hasStrategyApplication = strategyApplications.length > 0;
        const hasPlaybookApplication = playbookApplications.length > 0;
        const daysSinceHistory = getDaysSince(latestHistory?.recorded_at ?? null);
        const hasRecentHistory =
          item.status === "onboarding" ? true : (daysSinceHistory ?? Number.POSITIVE_INFINITY) <= 14;
        const needsContinuityAttention =
          item.status !== "onboarding" &&
          (activeGoals.length === 0 || !latestHistory || !hasRecentHistory);
        const needsReviewSnapshot =
          item.status !== "onboarding" &&
          (blockedGoals.length > 0 ||
            reinforcementGoals.length > 0 ||
            recurringIssueTags.length > 0 ||
            needsContinuityAttention) &&
          !hasRecentReview;
        const reviewWithoutAdaptation =
          Boolean(latestReview?.reviewed_at) &&
          (!item.last_plan_adapted_at ||
            new Date(latestReview.reviewed_at).getTime() >
              new Date(item.last_plan_adapted_at).getTime());
        const needsAdaptation =
          item.status !== "onboarding" &&
          (blockedGoals.length > 0 ||
            reinforcementGoals.length > 0 ||
            recurringIssueTags.length > 0 ||
            needsContinuityAttention) &&
          !hasRecentAdaptation;
        const needsStrategyAttention =
          item.status !== "onboarding" &&
          (blockedGoals.length > 0 ||
            reinforcementGoals.length > 0 ||
            recurringIssueTags.length > 0 ||
            needsContinuityAttention) &&
          !hasStrategyApplication;
        const needsPlaybookAttention =
          item.status !== "onboarding" &&
          (blockedGoals.length > 0 ||
            reinforcementGoals.length > 0 ||
            recurringIssueTags.length > 0 ||
            needsContinuityAttention ||
            needsAdaptation) &&
          !hasPlaybookApplication;
        const lastActivityAt =
          item.last_submission_activity_at ?? latestHistory?.recorded_at ?? item.updated_at;
        const daysSinceActivity = getDaysSince(lastActivityAt);
        const isStalled =
          (item.status === "awaiting_student" || item.status === "active" || item.status === "onboarding") &&
          (daysSinceActivity ?? 0) >= 7;
        const hasLessonPlan = Boolean(lessonPlan);
        const hasSupportedPlan = Boolean(lessonPlan?.next_assignment_id || lessonPlan?.next_template_id);
        const planIsOverdue = isPlanOverdue(lessonPlan?.target_date ?? null);
        const needsTeacherAttention =
          item.status === "awaiting_teacher" ||
          item.awaiting_review_count > 0 ||
          item.status === "inactive" ||
          !hasLessonPlan ||
          planIsOverdue ||
          (Boolean(lessonPlan) && !hasSupportedPlan) ||
          needsReviewSnapshot ||
          needsAdaptation ||
          needsContinuityAttention ||
          blockedGoals.length > 0 ||
          reinforcementGoals.length > 0 ||
          recurringIssueTags.length > 0;
        const needsStudentAttention =
          item.status === "awaiting_student" ||
          item.status === "onboarding" ||
          lessonPlan?.plan_status === "awaiting_completion";

        return {
          id: item.id,
          classroom_id: item.classroom_id,
          classroom_name: item.classroom_name,
          student_user_id: item.student_user_id,
          student_name: item.student_name,
          student_email: item.student_email,
          status: item.status,
          next_step_type: item.next_step_type,
          next_assignment_id: item.next_assignment_id,
          next_assignment_title: item.next_assignment_title,
          lesson_plan_status: lessonPlan?.plan_status ?? null,
          lesson_plan_target_date: lessonPlan?.target_date ?? null,
          lesson_plan_focus_note: lessonPlan?.focus_note ?? null,
          lesson_plan_assignment_id: lessonPlan?.next_assignment_id ?? null,
          lesson_plan_assignment_title: lessonPlan?.next_assignment_title ?? null,
          lesson_plan_template_id: lessonPlan?.next_template_id ?? null,
          lesson_plan_template_title: lessonPlan?.next_template_title ?? null,
          awaiting_review_count: item.awaiting_review_count,
          submission_count: item.submission_count,
          last_activity_at: lastActivityAt,
          days_since_activity: daysSinceActivity,
          is_stalled: isStalled,
          has_lesson_plan: hasLessonPlan,
          has_supported_plan: hasSupportedPlan,
          plan_is_overdue: planIsOverdue,
          active_goal_count: activeGoals.length,
          completed_goal_count: completedGoals.length,
          blocked_goal_count: blockedGoals.length,
          reinforcement_goal_count: reinforcementGoals.length,
          recurring_issue_tags: recurringIssueTags,
          latest_issue_tags: latestHistory?.issue_tags ?? [],
          latest_intervention_note: latestHistory?.intervention_note ?? null,
          latest_history_at: latestHistory?.recorded_at ?? null,
          latest_history_summary: latestHistory?.summary ?? null,
          latest_review_at: latestReview?.reviewed_at ?? item.last_review_snapshot_at,
          latest_review_summary: latestReview?.summary ?? null,
          latest_adaptation_note: latestReview?.adaptation_note ?? null,
          latest_adapted_at: item.last_plan_adapted_at,
          latest_strategy_title: latestStrategy?.strategy_title ?? item.last_strategy_title ?? null,
          latest_strategy_summary: latestStrategy?.strategy_summary ?? null,
          latest_strategy_applied_at: latestStrategy?.applied_at ?? item.last_strategy_applied_at,
          latest_strategy_outcome_status:
            latestStrategy?.outcome_status ?? item.last_strategy_outcome_status ?? null,
          latest_strategy_outcome_note:
            latestStrategy?.outcome_note ?? item.last_strategy_outcome_note ?? null,
          latest_strategy_outcome_at:
            latestStrategy?.outcome_recorded_at ?? item.last_strategy_outcome_at ?? null,
          strategy_application_count: strategyApplications.length,
          latest_playbook_title: latestPlaybook?.playbook_title ?? item.last_playbook_title ?? null,
          latest_playbook_applied_at:
            latestPlaybook?.applied_at ?? item.last_playbook_applied_at ?? null,
          playbook_application_count: playbookApplications.length,
          days_since_review: daysSinceReview,
          days_since_adaptation: daysSinceAdaptation,
          days_since_strategy_application: daysSinceStrategyApplication,
          days_since_playbook_application: daysSincePlaybookApplication,
          has_recent_review: hasRecentReview,
          has_recent_adaptation: hasRecentAdaptation,
          has_strategy_application: hasStrategyApplication,
          has_playbook_application: hasPlaybookApplication,
          needs_review_snapshot: needsReviewSnapshot,
          review_without_adaptation: reviewWithoutAdaptation,
          needs_adaptation: needsAdaptation,
          days_since_history: daysSinceHistory,
          has_recent_history: hasRecentHistory,
          needs_continuity_attention: needsContinuityAttention,
          needs_teacher_attention: needsTeacherAttention,
          needs_student_attention: needsStudentAttention,
          needs_strategy_attention: needsStrategyAttention,
          needs_playbook_attention: needsPlaybookAttention,
        } satisfies TeacherReportingPrivateLearnerItem;
      })
    )
  )
    .sort((a, b) => {
      const score = (item: TeacherReportingPrivateLearnerItem) =>
        (item.needs_teacher_attention ? 100 : 0) +
        (item.needs_playbook_attention ? 85 : 0) +
        (item.needs_continuity_attention ? 70 : 0) +
        (!item.has_lesson_plan ? 80 : 0) +
        (item.plan_is_overdue ? 60 : 0) +
        (item.has_lesson_plan && !item.has_supported_plan ? 30 : 0) +
        (item.is_stalled ? 50 : 0) +
        (item.needs_student_attention ? 20 : 0) -
        (item.days_since_activity ?? 0);
      return score(b) - score(a);
    });

  const strategyItems = strategyRows
    .map((item) => {
      const needsMoreOutcomes = item.usage_count > 0 && item.total_outcomes === 0;
      const needsRefinement =
        item.replace_count > 0 ||
        (item.total_outcomes > 0 && item.no_change_count >= item.helped_count) ||
        (item.total_outcomes > 0 && item.partial_count > item.helped_count && item.helped_count === 0);

      return {
        ...item,
        needs_refinement: needsRefinement,
        needs_more_outcomes: needsMoreOutcomes,
      } satisfies TeacherReportingStrategyItem;
    })
    .sort((a, b) => {
      const score = (item: TeacherReportingStrategyItem) =>
        (item.needs_refinement ? 100 : 0) +
        (item.needs_more_outcomes ? 70 : 0) +
        item.replace_count * 10 +
        item.no_change_count * 5 -
        item.helped_count * 2;
      return score(b) - score(a);
    });

  return {
    classroomSummaries,
    attentionItems,
    studentAttention,
    conversionItems,
    privateLearnerItems,
    strategyItems,
    totalClassrooms: classroomSummaries.length,
    totalStudents: classroomSummaries.reduce((sum, item) => sum + item.student_count, 0),
    totalAssignments: classroomSummaries.reduce((sum, item) => sum + item.assignment_count, 0),
    totalWaitingReview: classroomSummaries.reduce((sum, item) => sum + item.needs_review_count, 0),
    totalMissingSubmissions: classroomSummaries.reduce(
      (sum, item) => sum + item.missing_submission_count,
      0
    ),
    totalConvertedInquiries: conversionItems.length,
    totalConvertedActive: conversionItems.filter((item) => item.classroom_activity_started).length,
    totalConvertedInactive: conversionItems.filter((item) => item.is_inactive).length,
    privateLearnerCount: privateStudents.length,
    totalPrivateAwaitingTeacher: privateLearnerItems.filter((item) => item.status === "awaiting_teacher").length,
    totalPrivateAwaitingStudent: privateLearnerItems.filter((item) => item.status === "awaiting_student").length,
    totalPrivateInactive: privateLearnerItems.filter((item) => item.status === "inactive").length,
    totalPrivateStalled: privateLearnerItems.filter((item) => item.is_stalled).length,
    totalPrivateNoPlan: privateLearnerItems.filter((item) => !item.has_lesson_plan).length,
    totalPrivateOverduePlan: privateLearnerItems.filter((item) => item.plan_is_overdue).length,
    totalPrivateUnsupportedPlan: privateLearnerItems.filter(
      (item) => item.has_lesson_plan && !item.has_supported_plan
    ).length,
    totalPrivateNoActiveGoal: privateLearnerItems.filter((item) => item.active_goal_count === 0).length,
    totalPrivateNoRecentHistory: privateLearnerItems.filter(
      (item) => item.status !== "onboarding" && !item.has_recent_history
    ).length,
    totalPrivateWeakContinuity: privateLearnerItems.filter(
      (item) => item.needs_continuity_attention
    ).length,
    totalPrivateBlockedGoals: privateLearnerItems.filter((item) => item.blocked_goal_count > 0).length,
    totalPrivateNeedsReinforcement: privateLearnerItems.filter(
      (item) => item.reinforcement_goal_count > 0
    ).length,
    totalPrivateRecurringIssues: privateLearnerItems.filter(
      (item) => item.recurring_issue_tags.length > 0
    ).length,
    totalPrivateInterventionNow: privateLearnerItems.filter(
      (item) =>
        item.blocked_goal_count > 0 ||
        item.reinforcement_goal_count > 0 ||
        item.recurring_issue_tags.length > 0
    ).length,
    totalPrivateNoRecentReview: privateLearnerItems.filter((item) => item.needs_review_snapshot).length,
    totalPrivateNoRecentAdaptation: privateLearnerItems.filter((item) => item.needs_adaptation).length,
    totalPrivateReviewedNotAdapted: privateLearnerItems.filter(
      (item) => item.review_without_adaptation
    ).length,
    totalPrivateNoStrategy: privateLearnerItems.filter((item) => !item.has_strategy_application).length,
    totalPrivateStrategyGap: privateLearnerItems.filter((item) => item.needs_strategy_attention).length,
    totalPrivateNoPlaybook: privateLearnerItems.filter((item) => !item.has_playbook_application).length,
    totalPrivatePlaybookGap: privateLearnerItems.filter((item) => item.needs_playbook_attention).length,
    totalPlaybooksUsed: privateLearnerItems.reduce(
      (sum, item) => sum + item.playbook_application_count,
      0
    ),
    totalStrategiesUsed: privateLearnerItems.reduce(
      (sum, item) => sum + item.strategy_application_count,
      0
    ),
    totalStrategyHelped: privateLearnerItems.filter(
      (item) => item.latest_strategy_outcome_status === "helped"
    ).length,
    totalStrategyNeedsReview: privateLearnerItems.filter(
      (item) =>
        item.has_strategy_application &&
        (!item.latest_strategy_outcome_status ||
          item.latest_strategy_outcome_status === "no_change" ||
          item.latest_strategy_outcome_status === "replace")
    ).length,
    totalStrategyWeak: strategyItems.filter((item) => item.needs_refinement).length,
    totalStrategyNoOutcome: strategyItems.filter((item) => item.needs_more_outcomes).length,
  };
}

export async function getTeacherClassroomReporting(
  teacherUserId: string,
  classroomId: string
): Promise<TeacherReportingClassroomDetail | null> {
  const classroom = await getClassroom(classroomId);
  if (!classroom || classroom.teacher_user_id !== teacherUserId) {
    return null;
  }

  const [roster, assignments, summaries, submissionRows] = await Promise.all([
    getClassroomRoster(classroom.id),
    listAssignmentsForClassroom(classroom.id),
    listClassroomAssignmentSummaries(classroom.id),
    listClassroomSubmissionStudentRows(classroom.id),
  ]);

  const studentCount = roster.filter((member) => member.role === "student").length;
  const summaryByAssignmentId = new Map(
    summaries.map((summary) => [summary.assignment_id, summary])
  );

  const assignmentAttention = assignments
    .map((assignment) => {
      const summary = summaryByAssignmentId.get(assignment.id);
      const totalSubmissions = summary?.total_submissions ?? 0;
      const missingSubmissionCount = Math.max(studentCount - totalSubmissions, 0);
      const waitingReviewCount = summary?.needs_review_count ?? 0;

      return {
        classroom_id: classroom.id,
        classroom_name: classroom.name,
        assignment_id: assignment.id,
        assignment_title: assignment.title,
        due_at: assignment.due_at,
        waiting_review_count: waitingReviewCount,
        missing_submission_count: missingSubmissionCount,
      } satisfies TeacherReportingAttentionItem;
    })
    .sort((a, b) => {
      const aDue = a.due_at ? new Date(a.due_at).getTime() : Number.POSITIVE_INFINITY;
      const bDue = b.due_at ? new Date(b.due_at).getTime() : Number.POSITIVE_INFINITY;
      return aDue - bDue;
    });

  const students = Array.from(
    submissionRows.reduce((map, row) => {
      const existing = map.get(row.student_user_id) ?? {
        classroom_id: classroom.id,
        classroom_name: classroom.name,
        student_user_id: row.student_user_id,
        student_name: row.student_name,
        student_email: row.student_email,
        assignment_count: assignments.length,
        submitted_count: 0,
        reviewed_count: 0,
        missing_count: 0,
        awaiting_review_count: 0,
        last_submitted_at: null,
      };

      if (!row.status) {
        existing.missing_count += 1;
      } else if (row.status === "reviewed") {
        existing.reviewed_count += 1;
      } else if (row.status === "submitted") {
        existing.submitted_count += 1;
        existing.awaiting_review_count += 1;
      } else {
        existing.submitted_count += 1;
      }

      if (row.submitted_at && (!existing.last_submitted_at || row.submitted_at > existing.last_submitted_at)) {
        existing.last_submitted_at = row.submitted_at;
      }

      map.set(row.student_user_id, existing);
      return map;
    }, new Map<string, TeacherReportingStudentAttention>())
  )
    .map(([, value]) => value)
    .sort((a, b) => {
      if (b.missing_count !== a.missing_count) return b.missing_count - a.missing_count;
      if (b.awaiting_review_count !== a.awaiting_review_count) return b.awaiting_review_count - a.awaiting_review_count;
      return a.student_name.localeCompare(b.student_name);
    });

  return {
    classroom,
    summary: {
      classroom,
      student_count: studentCount,
      assignment_count: assignments.length,
      submitted_count: summaries.reduce((sum, item) => sum + item.submitted_count, 0),
      reviewed_count: summaries.reduce((sum, item) => sum + item.reviewed_count, 0),
      needs_review_count: summaries.reduce((sum, item) => sum + item.needs_review_count, 0),
      missing_submission_count: assignmentAttention.reduce(
        (sum, item) => sum + item.missing_submission_count,
        0
      ),
    },
    assignmentAttention,
    students,
  };
}

export async function getTeacherStudentReporting(
  teacherUserId: string,
  classroomId: string,
  studentUserId: string
): Promise<TeacherReportingStudentDetail | null> {
  const classroomDetail = await getTeacherClassroomReporting(teacherUserId, classroomId);
  if (!classroomDetail) {
    return null;
  }

  const student = classroomDetail.students.find((item) => item.student_user_id === studentUserId);
  if (!student) {
    return null;
  }

  const [assignments, submissionRows] = await Promise.all([
    listAssignmentsForClassroom(classroomId),
    listClassroomSubmissionStudentRows(classroomId),
  ]);

  const rowByAssignmentId = new Map(
    submissionRows
      .filter((row) => row.student_user_id === studentUserId)
      .map((row) => [row.assignment_id, row])
  );

  const assignmentRows = assignments.map((assignment) => {
    const row = rowByAssignmentId.get(assignment.id);
    return {
      assignment_id: assignment.id,
      assignment_title: assignment.title,
      due_at: assignment.due_at,
      status: row?.status ?? null,
      submitted_at: row?.submitted_at ?? null,
      reviewed_at: row?.reviewed_at ?? null,
    };
  });

  return {
    classroom: classroomDetail.classroom,
    student,
    assignmentRows,
  };
}
