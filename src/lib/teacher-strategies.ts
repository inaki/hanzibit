import { randomUUID } from "crypto";
import { execute, query, queryOne } from "./db";

export interface TeacherStrategy {
  id: string;
  teacher_user_id: string;
  title: string;
  summary: string;
  issue_focus: string | null;
  goal_focus: string | null;
  guidance: string | null;
  refinement_note: string | null;
  last_refined_at: string | null;
  linked_template_id: string | null;
  linked_resource_id: string | null;
  usage_count: number;
  archived: number;
  created_at: string;
  updated_at: string;
}

export interface TeacherStrategyOutcomeRollup {
  total: number;
  helped: number;
  partial: number;
  no_change: number;
  replace: number;
}

export interface TeacherStrategyPatternSummary {
  learner_count: number;
  active_learner_count: number;
  recurring_issue_learner_count: number;
  latest_applied_at: string | null;
  broad_status: "helping" | "mixed" | "weak" | "insufficient_data";
}

function getBroadEffectivenessStatus(input: {
  learner_count: number;
  total_outcomes: number;
  helped_count: number;
  partial_count: number;
  no_change_count: number;
  replace_count: number;
}): "helping" | "mixed" | "weak" | "insufficient_data" {
  if (input.learner_count < 2 || input.total_outcomes === 0) {
    return "insufficient_data";
  }

  if (
    input.replace_count > 0 ||
    (input.no_change_count >= input.helped_count && input.total_outcomes >= 2)
  ) {
    return "weak";
  }

  if (
    input.helped_count >= 2 &&
    input.helped_count >= input.partial_count + input.no_change_count + input.replace_count
  ) {
    return "helping";
  }

  return "mixed";
}

export async function getTeacherStrategy(
  id: string
): Promise<TeacherStrategy | undefined> {
  return queryOne<TeacherStrategy>(
    `SELECT *
     FROM teacher_strategies
     WHERE id = $1`,
    [id]
  );
}

export async function getTeacherStrategyPatternSummary(
  strategyId: string
): Promise<TeacherStrategyPatternSummary> {
  const row = await queryOne<{
    learner_count: number;
    active_learner_count: number;
    recurring_issue_learner_count: number;
    latest_applied_at: string | null;
    total_outcomes: number;
    helped_count: number;
    partial_count: number;
    no_change_count: number;
    replace_count: number;
  }>(
    `SELECT
       COUNT(DISTINCT applications.private_student_id)::int AS learner_count,
       COUNT(DISTINCT applications.private_student_id) FILTER (
         WHERE private_students.last_strategy_id = teacher_strategies.id
       )::int AS active_learner_count,
       COUNT(DISTINCT applications.private_student_id) FILTER (
         WHERE EXISTS (
           SELECT 1
           FROM private_lesson_history history
           WHERE history.private_student_id = applications.private_student_id
             AND history.issue_tags_json LIKE '%' || teacher_strategies.issue_focus || '%'
         )
       )::int AS recurring_issue_learner_count,
       MAX(applications.applied_at) AS latest_applied_at,
       COUNT(outcomes.id)::int AS total_outcomes,
       COUNT(outcomes.id) FILTER (WHERE outcomes.outcome_status = 'helped')::int AS helped_count,
       COUNT(outcomes.id) FILTER (WHERE outcomes.outcome_status = 'partial')::int AS partial_count,
       COUNT(outcomes.id) FILTER (WHERE outcomes.outcome_status = 'no_change')::int AS no_change_count,
       COUNT(outcomes.id) FILTER (WHERE outcomes.outcome_status = 'replace')::int AS replace_count
     FROM teacher_strategies
     LEFT JOIN private_student_strategy_applications applications
       ON applications.teacher_strategy_id = teacher_strategies.id
     LEFT JOIN private_students
       ON private_students.id = applications.private_student_id
     LEFT JOIN private_student_strategy_outcomes outcomes
       ON outcomes.teacher_strategy_id = teacher_strategies.id
     WHERE teacher_strategies.id = $1
     GROUP BY teacher_strategies.id, teacher_strategies.issue_focus`,
    [strategyId]
  );

  const summary = row ?? {
    learner_count: 0,
    active_learner_count: 0,
    recurring_issue_learner_count: 0,
    latest_applied_at: null,
    total_outcomes: 0,
    helped_count: 0,
    partial_count: 0,
    no_change_count: 0,
    replace_count: 0,
  };

  return {
    learner_count: summary.learner_count,
    active_learner_count: summary.active_learner_count,
    recurring_issue_learner_count: summary.recurring_issue_learner_count,
    latest_applied_at: summary.latest_applied_at,
    broad_status: getBroadEffectivenessStatus(summary),
  };
}

export async function listTeacherStrategiesForTeacher(
  teacherUserId: string,
  options?: { includeArchived?: boolean }
): Promise<TeacherStrategy[]> {
  return query<TeacherStrategy>(
    `SELECT *
     FROM teacher_strategies
     WHERE teacher_user_id = $1
       AND ($2::int = 1 OR archived = 0)
     ORDER BY archived ASC, updated_at DESC, created_at DESC`,
    [teacherUserId, options?.includeArchived ? 1 : 0]
  );
}

export async function createTeacherStrategy(input: {
  teacherUserId: string;
  title: string;
  summary: string;
  issueFocus?: string | null;
  goalFocus?: string | null;
  guidance?: string | null;
  refinementNote?: string | null;
  linkedTemplateId?: string | null;
  linkedResourceId?: string | null;
}): Promise<TeacherStrategy> {
  const rows = await query<TeacherStrategy>(
    `INSERT INTO teacher_strategies (
       id,
       teacher_user_id,
       title,
       summary,
       issue_focus,
       goal_focus,
       guidance,
       refinement_note,
       linked_template_id,
       linked_resource_id
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      randomUUID(),
      input.teacherUserId,
      input.title.trim(),
      input.summary.trim(),
      input.issueFocus?.trim() || null,
      input.goalFocus?.trim() || null,
      input.guidance?.trim() || null,
      input.refinementNote?.trim() || null,
      input.linkedTemplateId ?? null,
      input.linkedResourceId ?? null,
    ]
  );
  return rows[0];
}

export async function updateTeacherStrategy(input: {
  id: string;
  teacherUserId: string;
  title: string;
  summary: string;
  issueFocus?: string | null;
  goalFocus?: string | null;
  guidance?: string | null;
  refinementNote?: string | null;
  linkedTemplateId?: string | null;
  linkedResourceId?: string | null;
  archived?: boolean;
  markRefined?: boolean;
}): Promise<void> {
  await execute(
    `UPDATE teacher_strategies
     SET title = $3,
         summary = $4,
         issue_focus = $5,
         goal_focus = $6,
         guidance = $7,
         refinement_note = $8,
         linked_template_id = $9,
         linked_resource_id = $10,
         archived = $11,
         last_refined_at = CASE WHEN $12::int = 1 THEN NOW() ELSE last_refined_at END,
         updated_at = NOW()
     WHERE id = $1
       AND teacher_user_id = $2`,
    [
      input.id,
      input.teacherUserId,
      input.title.trim(),
      input.summary.trim(),
      input.issueFocus?.trim() || null,
      input.goalFocus?.trim() || null,
      input.guidance?.trim() || null,
      input.refinementNote?.trim() || null,
      input.linkedTemplateId ?? null,
      input.linkedResourceId ?? null,
      input.archived ? 1 : 0,
      input.markRefined ? 1 : 0,
    ]
  );
}
