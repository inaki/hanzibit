import { randomUUID } from "crypto";
import { execute, query, queryOne } from "./db";

export type AssignmentType =
  | "journal_prompt"
  | "study_guide_word"
  | "study_guide_level"
  | "reading_response";

export interface Assignment {
  id: string;
  classroom_id: string;
  created_by_user_id: string;
  template_id: string | null;
  type: AssignmentType;
  title: string;
  description: string | null;
  prompt: string | null;
  hsk_level: number | null;
  source_ref: string | null;
  allow_resubmission: number;
  due_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AssignmentWithClassroom extends Assignment {
  classroom_name: string;
}

export interface AssignmentInboxItem extends AssignmentWithClassroom {
  submission_id: string | null;
  submission_status: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
}

export function isAssignmentOverdue(
  dueAt: string | null | undefined,
  submissionStatus?: string | null
): boolean {
  if (!dueAt || submissionStatus === "reviewed") {
    return false;
  }

  return new Date(dueAt).getTime() < Date.now();
}

export async function getAssignment(id: string): Promise<Assignment | undefined> {
  return queryOne<Assignment>("SELECT * FROM assignments WHERE id = $1", [id]);
}

export async function listAssignmentsForClassroom(classroomId: string): Promise<Assignment[]> {
  return query<Assignment>(
    `SELECT *
     FROM assignments
     WHERE classroom_id = $1
     ORDER BY due_at NULLS LAST, created_at DESC`,
    [classroomId]
  );
}

export async function listAssignmentsForStudent(userId: string): Promise<Assignment[]> {
  return query<Assignment>(
    `SELECT assignments.*
     FROM assignments
     INNER JOIN classroom_members
       ON classroom_members.classroom_id = assignments.classroom_id
     WHERE classroom_members.user_id = $1
       AND classroom_members.role = 'student'
     ORDER BY assignments.due_at NULLS LAST, assignments.created_at DESC`,
    [userId]
  );
}

export async function listAssignmentsForTeacher(userId: string): Promise<Assignment[]> {
  return query<Assignment>(
    `SELECT assignments.*
     FROM assignments
     WHERE assignments.created_by_user_id = $1
     ORDER BY assignments.due_at NULLS LAST, assignments.created_at DESC`,
    [userId]
  );
}

export async function listAssignmentsForUser(userId: string): Promise<AssignmentWithClassroom[]> {
  return query<AssignmentWithClassroom>(
    `SELECT DISTINCT assignments.*, classrooms.name AS classroom_name
     FROM assignments
     INNER JOIN classrooms
       ON classrooms.id = assignments.classroom_id
     INNER JOIN classroom_members
       ON classroom_members.classroom_id = assignments.classroom_id
     WHERE classroom_members.user_id = $1
     ORDER BY assignments.due_at NULLS LAST, assignments.created_at DESC`,
    [userId]
  );
}

export async function listAssignmentInboxForUser(userId: string): Promise<AssignmentInboxItem[]> {
  return query<AssignmentInboxItem>(
    `SELECT DISTINCT
       assignments.*,
       classrooms.name AS classroom_name,
       assignment_submissions.id AS submission_id,
       assignment_submissions.status AS submission_status,
       assignment_submissions.submitted_at,
       assignment_submissions.reviewed_at
     FROM assignments
     INNER JOIN classrooms
       ON classrooms.id = assignments.classroom_id
     INNER JOIN classroom_members
       ON classroom_members.classroom_id = assignments.classroom_id
     LEFT JOIN assignment_submissions
       ON assignment_submissions.assignment_id = assignments.id
      AND assignment_submissions.student_user_id = $1
     WHERE classroom_members.user_id = $1
     ORDER BY assignments.due_at NULLS LAST, assignments.created_at DESC`,
    [userId]
  );
}

export async function createAssignment(input: {
  classroomId: string;
  createdByUserId: string;
  templateId?: string | null;
  type: AssignmentType;
  title: string;
  description?: string | null;
  prompt?: string | null;
  hskLevel?: number | null;
  sourceRef?: string | null;
  dueAt?: string | null;
  allowResubmission?: boolean;
}): Promise<Assignment> {
  const id = randomUUID();
  const result = await query<Assignment>(
    `INSERT INTO assignments (
       id,
       classroom_id,
       created_by_user_id,
       template_id,
       type,
       title,
       description,
       prompt,
       hsk_level,
       source_ref,
       allow_resubmission,
       due_at
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     RETURNING *`,
    [
      id,
      input.classroomId,
      input.createdByUserId,
      input.templateId ?? null,
      input.type,
      input.title.trim(),
      input.description?.trim() || null,
      input.prompt?.trim() || null,
      input.hskLevel ?? null,
      input.sourceRef ?? null,
      input.allowResubmission === false ? 0 : 1,
      input.dueAt ?? null,
    ]
  );
  return result[0];
}

export async function updateAssignmentTimestamp(id: string): Promise<void> {
  await execute(
    `UPDATE assignments
     SET updated_at = NOW()
     WHERE id = $1`,
    [id]
  );
}
