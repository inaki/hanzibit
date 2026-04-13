import { randomUUID } from "crypto";
import { execute, query, queryOne } from "./db";
import type { AssignmentType } from "./assignments";

export interface AssignmentTemplate {
  id: string;
  teacher_user_id: string;
  resource_id: string | null;
  template_type: AssignmentType;
  title: string;
  description: string | null;
  prompt: string | null;
  hsk_level: number | null;
  source_ref: string | null;
  allow_resubmission: number;
  archived: number;
  created_at: string;
  updated_at: string;
}

export async function getAssignmentTemplate(
  id: string
): Promise<AssignmentTemplate | undefined> {
  return queryOne<AssignmentTemplate>(
    `SELECT *
     FROM assignment_templates
     WHERE id = $1`,
    [id]
  );
}

export async function listAssignmentTemplatesForTeacher(
  teacherUserId: string,
  options?: { includeArchived?: boolean }
): Promise<AssignmentTemplate[]> {
  return query<AssignmentTemplate>(
    `SELECT *
     FROM assignment_templates
     WHERE teacher_user_id = $1
       AND ($2::int = 1 OR archived = 0)
     ORDER BY archived ASC, updated_at DESC, created_at DESC`,
    [teacherUserId, options?.includeArchived ? 1 : 0]
  );
}

export async function createAssignmentTemplate(input: {
  teacherUserId: string;
  resourceId?: string | null;
  templateType: AssignmentType;
  title: string;
  description?: string | null;
  prompt?: string | null;
  hskLevel?: number | null;
  sourceRef?: string | null;
  allowResubmission?: boolean;
}): Promise<AssignmentTemplate> {
  const id = randomUUID();
  const rows = await query<AssignmentTemplate>(
    `INSERT INTO assignment_templates (
       id,
       teacher_user_id,
       resource_id,
       template_type,
       title,
       description,
       prompt,
       hsk_level,
       source_ref,
       allow_resubmission
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      id,
      input.teacherUserId,
      input.resourceId ?? null,
      input.templateType,
      input.title.trim(),
      input.description?.trim() || null,
      input.prompt?.trim() || null,
      input.hskLevel ?? null,
      input.sourceRef ?? null,
      input.allowResubmission === false ? 0 : 1,
    ]
  );
  return rows[0];
}

export async function updateAssignmentTemplate(input: {
  id: string;
  teacherUserId: string;
  title: string;
  description?: string | null;
  prompt?: string | null;
  hskLevel?: number | null;
  sourceRef?: string | null;
  allowResubmission?: boolean;
  archived?: boolean;
}): Promise<void> {
  await execute(
    `UPDATE assignment_templates
     SET title = $3,
         description = $4,
         prompt = $5,
         hsk_level = $6,
         source_ref = $7,
         allow_resubmission = $8,
         archived = $9,
         updated_at = NOW()
     WHERE id = $1
       AND teacher_user_id = $2`,
    [
      input.id,
      input.teacherUserId,
      input.title.trim(),
      input.description?.trim() || null,
      input.prompt?.trim() || null,
      input.hskLevel ?? null,
      input.sourceRef ?? null,
      input.allowResubmission === false ? 0 : 1,
      input.archived ? 1 : 0,
    ]
  );
}

export async function markAssignmentCreatedFromTemplate(input: {
  assignmentId: string;
  templateId: string;
}): Promise<void> {
  await execute(
    `UPDATE assignments
     SET template_id = $2,
         updated_at = NOW()
     WHERE id = $1`,
    [input.assignmentId, input.templateId]
  );
}
