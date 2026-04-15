import { randomUUID } from "crypto";
import { query, queryOne, withTransaction } from "./db";

export interface PrivateStudentStrategyApplication {
  id: string;
  private_student_id: string;
  teacher_strategy_id: string;
  applied_by_user_id: string;
  applied_at: string;
  application_note: string | null;
  linked_review_id: string | null;
  linked_lesson_plan_id: string | null;
  linked_goal_id: string | null;
  created_at: string;
}

export interface PrivateStudentStrategyApplicationDetail
  extends PrivateStudentStrategyApplication {
  strategy_title: string;
  strategy_summary: string;
  issue_focus: string | null;
  goal_focus: string | null;
  outcome_status: "helped" | "partial" | "no_change" | "replace" | null;
  outcome_note: string | null;
  outcome_recorded_at: string | null;
}

export async function listPrivateStudentStrategyApplications(
  privateStudentId: string
): Promise<PrivateStudentStrategyApplicationDetail[]> {
  return query<PrivateStudentStrategyApplicationDetail>(
    `SELECT
       private_student_strategy_applications.*,
       teacher_strategies.title AS strategy_title,
       teacher_strategies.summary AS strategy_summary,
       teacher_strategies.issue_focus,
       teacher_strategies.goal_focus,
       outcomes.outcome_status,
       outcomes.outcome_note,
       outcomes.recorded_at AS outcome_recorded_at
     FROM private_student_strategy_applications
     INNER JOIN teacher_strategies
       ON teacher_strategies.id = private_student_strategy_applications.teacher_strategy_id
     LEFT JOIN private_student_strategy_outcomes outcomes
       ON outcomes.strategy_application_id = private_student_strategy_applications.id
     WHERE private_student_strategy_applications.private_student_id = $1
     ORDER BY private_student_strategy_applications.applied_at DESC, private_student_strategy_applications.created_at DESC`,
    [privateStudentId]
  );
}

export async function getLatestPrivateStudentStrategyApplication(
  privateStudentId: string
): Promise<PrivateStudentStrategyApplicationDetail | null> {
  return (
    (await queryOne<PrivateStudentStrategyApplicationDetail>(
      `SELECT
         private_student_strategy_applications.*,
         teacher_strategies.title AS strategy_title,
         teacher_strategies.summary AS strategy_summary,
         teacher_strategies.issue_focus,
         teacher_strategies.goal_focus,
         outcomes.outcome_status,
         outcomes.outcome_note,
         outcomes.recorded_at AS outcome_recorded_at
       FROM private_student_strategy_applications
       INNER JOIN teacher_strategies
         ON teacher_strategies.id = private_student_strategy_applications.teacher_strategy_id
       LEFT JOIN private_student_strategy_outcomes outcomes
         ON outcomes.strategy_application_id = private_student_strategy_applications.id
       WHERE private_student_strategy_applications.private_student_id = $1
       ORDER BY private_student_strategy_applications.applied_at DESC, private_student_strategy_applications.created_at DESC
       LIMIT 1`,
      [privateStudentId]
    )) ?? null
  );
}

export async function applyTeacherStrategyToPrivateStudent(input: {
  privateStudentId: string;
  teacherStrategyId: string;
  appliedByUserId: string;
  applicationNote?: string | null;
  linkedReviewId?: string | null;
  linkedLessonPlanId?: string | null;
  linkedGoalId?: string | null;
}): Promise<PrivateStudentStrategyApplication> {
  const id = randomUUID();

  await withTransaction(async (client) => {
    await client.query(
      `INSERT INTO private_student_strategy_applications (
         id,
         private_student_id,
         teacher_strategy_id,
         applied_by_user_id,
         application_note,
         linked_review_id,
         linked_lesson_plan_id,
         linked_goal_id
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        id,
        input.privateStudentId,
        input.teacherStrategyId,
        input.appliedByUserId,
        input.applicationNote?.trim() || null,
        input.linkedReviewId ?? null,
        input.linkedLessonPlanId ?? null,
        input.linkedGoalId ?? null,
      ]
    );

    await client.query(
      `UPDATE teacher_strategies
       SET usage_count = usage_count + 1,
           updated_at = NOW()
       WHERE id = $1`,
      [input.teacherStrategyId]
    );

    await client.query(
      `UPDATE private_students
       SET last_strategy_id = $2,
           last_strategy_applied_at = NOW(),
           last_teacher_action_at = NOW(),
           updated_at = NOW()
       WHERE id = $1`,
      [input.privateStudentId, input.teacherStrategyId]
    );
  });

  const created = await queryOne<PrivateStudentStrategyApplication>(
    `SELECT *
     FROM private_student_strategy_applications
     WHERE id = $1
     LIMIT 1`,
    [id]
  );

  if (!created) {
    throw new Error("Failed to apply teacher strategy.");
  }

  return created;
}
