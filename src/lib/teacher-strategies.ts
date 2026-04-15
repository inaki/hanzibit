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
