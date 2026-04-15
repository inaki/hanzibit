import { randomUUID } from "crypto";
import { execute, query, queryOne } from "./db";

export type PrivateStudentGoalStatus = "active" | "completed" | "paused";
export type PrivateStudentGoalProgressStatus =
  | "improving"
  | "stable"
  | "needs_reinforcement"
  | "blocked";

export interface PrivateStudentGoal {
  id: string;
  private_student_id: string;
  teacher_user_id: string;
  title: string;
  detail: string | null;
  status: PrivateStudentGoalStatus;
  progress_status: PrivateStudentGoalProgressStatus | null;
  progress_note: string | null;
  last_progress_at: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export function getPrivateStudentGoalStatusLabel(status: PrivateStudentGoalStatus) {
  switch (status) {
    case "active":
      return "Active";
    case "completed":
      return "Completed";
    case "paused":
      return "Paused";
    default:
      return status;
  }
}

export function getPrivateStudentGoalProgressStatusLabel(
  status: PrivateStudentGoalProgressStatus | null
) {
  switch (status) {
    case "improving":
      return "Improving";
    case "stable":
      return "Stable";
    case "needs_reinforcement":
      return "Needs reinforcement";
    case "blocked":
      return "Blocked";
    default:
      return "No progress marker";
  }
}

export async function listPrivateStudentGoals(
  privateStudentId: string
): Promise<PrivateStudentGoal[]> {
  return query<PrivateStudentGoal>(
    `SELECT *
     FROM private_student_goals
     WHERE private_student_id = $1
     ORDER BY
       CASE status
         WHEN 'active' THEN 0
         WHEN 'paused' THEN 1
         WHEN 'completed' THEN 2
         ELSE 3
       END,
       sort_order ASC,
       updated_at DESC`,
    [privateStudentId]
  );
}

export async function getPrivateStudentGoal(
  goalId: string
): Promise<PrivateStudentGoal | null> {
  return (
    (await queryOne<PrivateStudentGoal>(
      `SELECT *
       FROM private_student_goals
       WHERE id = $1
       LIMIT 1`,
      [goalId]
    )) ?? null
  );
}

export async function createPrivateStudentGoal(input: {
  privateStudentId: string;
  teacherUserId: string;
  title: string;
  detail: string | null;
  status: PrivateStudentGoalStatus;
  progressStatus: PrivateStudentGoalProgressStatus | null;
  progressNote: string | null;
}): Promise<PrivateStudentGoal> {
  const rows = await query<PrivateStudentGoal>(
    `INSERT INTO private_student_goals (
       id,
       private_student_id,
       teacher_user_id,
       title,
       detail,
       status,
       progress_status,
       progress_note,
       last_progress_at,
       sort_order,
       completed_at
     )
     VALUES (
       $1,
       $2,
       $3,
       $4,
       $5,
       $6,
       $7,
       $8,
       CASE WHEN $7 IS NOT NULL THEN NOW() ELSE NULL END,
       COALESCE(
         (
           SELECT MAX(sort_order) + 1
           FROM private_student_goals
            WHERE private_student_id = $2
         ),
         0
       ),
       CASE WHEN $6 = 'completed' THEN NOW() ELSE NULL END
     )
     RETURNING *`,
    [
      randomUUID(),
      input.privateStudentId,
      input.teacherUserId,
      input.title.trim(),
      input.detail?.trim() || null,
      input.status,
      input.progressStatus,
      input.progressNote?.trim() || null,
    ]
  );
  return rows[0];
}

export async function updatePrivateStudentGoal(input: {
  goalId: string;
  teacherUserId: string;
  title: string;
  detail: string | null;
  status: PrivateStudentGoalStatus;
  progressStatus: PrivateStudentGoalProgressStatus | null;
  progressNote: string | null;
}): Promise<void> {
  await execute(
    `UPDATE private_student_goals
     SET title = $3,
         detail = $4,
         status = $5,
         progress_status = $6,
         progress_note = $7,
         last_progress_at = CASE
           WHEN $6 IS DISTINCT FROM progress_status OR $7 IS DISTINCT FROM progress_note THEN NOW()
           ELSE last_progress_at
         END,
         completed_at = CASE
           WHEN $5 = 'completed' AND completed_at IS NULL THEN NOW()
           WHEN $5 != 'completed' THEN NULL
           ELSE completed_at
         END,
         updated_at = NOW()
     WHERE id = $1
       AND teacher_user_id = $2`,
    [
      input.goalId,
      input.teacherUserId,
      input.title.trim(),
      input.detail?.trim() || null,
      input.status,
      input.progressStatus,
      input.progressNote?.trim() || null,
    ]
  );
}
