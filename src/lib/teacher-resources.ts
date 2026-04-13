import { randomUUID } from "crypto";
import { execute, query, queryOne } from "./db";

export type TeacherResourceType =
  | "journal_prompt"
  | "study_word_set"
  | "study_level_set"
  | "reading_response"
  | "grammar_note";

export interface TeacherResource {
  id: string;
  teacher_user_id: string;
  resource_type: TeacherResourceType;
  title: string;
  description: string | null;
  hsk_level: number | null;
  source_assignment_id: string | null;
  archived: number;
  created_at: string;
  updated_at: string;
}

export interface TeacherResourceItem {
  id: string;
  resource_id: string;
  item_type: string;
  sort_order: number;
  content_json: unknown;
  created_at: string;
}

export async function getTeacherResource(id: string): Promise<TeacherResource | undefined> {
  return queryOne<TeacherResource>(
    `SELECT *
     FROM teacher_resources
     WHERE id = $1`,
    [id]
  );
}

export async function listTeacherResourcesForUser(
  userId: string,
  options?: {
    resourceType?: TeacherResourceType;
    includeArchived?: boolean;
  }
): Promise<TeacherResource[]> {
  const clauses = [`teacher_user_id = $1`];
  const params: unknown[] = [userId];

  if (!options?.includeArchived) {
    clauses.push("archived = 0");
  }

  if (options?.resourceType) {
    params.push(options.resourceType);
    clauses.push(`resource_type = $${params.length}`);
  }

  return query<TeacherResource>(
    `SELECT *
     FROM teacher_resources
     WHERE ${clauses.join(" AND ")}
     ORDER BY archived ASC, updated_at DESC, created_at DESC`,
    params
  );
}

export async function listTeacherResourceItems(
  resourceId: string
): Promise<TeacherResourceItem[]> {
  return query<TeacherResourceItem>(
    `SELECT *
     FROM teacher_resource_items
     WHERE resource_id = $1
     ORDER BY sort_order ASC, created_at ASC`,
    [resourceId]
  );
}

export async function createTeacherResource(input: {
  teacherUserId: string;
  resourceType: TeacherResourceType;
  title: string;
  description?: string | null;
  hskLevel?: number | null;
  sourceAssignmentId?: string | null;
}): Promise<TeacherResource> {
  const id = randomUUID();
  const rows = await query<TeacherResource>(
    `INSERT INTO teacher_resources (
       id,
       teacher_user_id,
       resource_type,
       title,
       description,
       hsk_level,
       source_assignment_id
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      id,
      input.teacherUserId,
      input.resourceType,
      input.title.trim(),
      input.description?.trim() || null,
      input.hskLevel ?? null,
      input.sourceAssignmentId ?? null,
    ]
  );
  return rows[0];
}

export async function updateTeacherResource(input: {
  id: string;
  teacherUserId: string;
  title: string;
  description?: string | null;
  hskLevel?: number | null;
  archived?: boolean;
}): Promise<void> {
  await execute(
    `UPDATE teacher_resources
     SET title = $3,
         description = $4,
         hsk_level = $5,
         archived = $6,
         updated_at = NOW()
     WHERE id = $1
       AND teacher_user_id = $2`,
    [
      input.id,
      input.teacherUserId,
      input.title.trim(),
      input.description?.trim() || null,
      input.hskLevel ?? null,
      input.archived ? 1 : 0,
    ]
  );
}

export async function replaceTeacherResourceItems(input: {
  resourceId: string;
  items: Array<{
    itemType: string;
    sortOrder?: number;
    contentJson: unknown;
  }>;
}): Promise<void> {
  await execute("DELETE FROM teacher_resource_items WHERE resource_id = $1", [input.resourceId]);

  for (const [index, item] of input.items.entries()) {
    await execute(
      `INSERT INTO teacher_resource_items (id, resource_id, item_type, sort_order, content_json)
       VALUES ($1, $2, $3, $4, $5::jsonb)`,
      [
        randomUUID(),
        input.resourceId,
        item.itemType.trim(),
        item.sortOrder ?? index,
        JSON.stringify(item.contentJson),
      ]
    );
  }
}
