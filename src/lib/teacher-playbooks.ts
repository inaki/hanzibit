import { randomUUID } from "crypto";
import { execute, query, queryOne } from "./db";

export interface TeacherPlaybook {
  id: string;
  teacher_user_id: string;
  title: string;
  summary: string;
  issue_focus: string | null;
  goal_focus: string | null;
  when_to_use: string | null;
  guidance: string | null;
  linked_template_id: string | null;
  linked_resource_id: string | null;
  usage_count: number;
  archived: number;
  created_at: string;
  updated_at: string;
  linked_strategy_count?: number;
}

export interface TeacherPlaybookStrategyLink {
  id: string;
  playbook_id: string;
  strategy_id: string;
  sort_order: number;
  created_at: string;
  strategy_title: string;
  strategy_summary: string;
  strategy_issue_focus: string | null;
  strategy_goal_focus: string | null;
}

export async function getTeacherPlaybook(id: string): Promise<TeacherPlaybook | undefined> {
  return queryOne<TeacherPlaybook>(
    `SELECT playbooks.*,
            (
              SELECT COUNT(*)
              FROM teacher_playbook_strategies links
              WHERE links.playbook_id = playbooks.id
            )::int AS linked_strategy_count
     FROM teacher_playbooks playbooks
     WHERE playbooks.id = $1`,
    [id]
  );
}

export async function listTeacherPlaybooksForTeacher(
  teacherUserId: string,
  options?: { includeArchived?: boolean }
): Promise<TeacherPlaybook[]> {
  return query<TeacherPlaybook>(
    `SELECT playbooks.*,
            (
              SELECT COUNT(*)
              FROM teacher_playbook_strategies links
              WHERE links.playbook_id = playbooks.id
            )::int AS linked_strategy_count
     FROM teacher_playbooks playbooks
     WHERE playbooks.teacher_user_id = $1
       AND ($2::int = 1 OR playbooks.archived = 0)
     ORDER BY playbooks.archived ASC, playbooks.updated_at DESC, playbooks.created_at DESC`,
    [teacherUserId, options?.includeArchived ? 1 : 0]
  );
}

export async function listTeacherPlaybookStrategies(
  playbookId: string
): Promise<TeacherPlaybookStrategyLink[]> {
  return query<TeacherPlaybookStrategyLink>(
    `SELECT links.*,
            strategies.title AS strategy_title,
            strategies.summary AS strategy_summary,
            strategies.issue_focus AS strategy_issue_focus,
            strategies.goal_focus AS strategy_goal_focus
     FROM teacher_playbook_strategies links
     INNER JOIN teacher_strategies strategies
       ON strategies.id = links.strategy_id
     WHERE links.playbook_id = $1
     ORDER BY links.sort_order ASC, links.created_at ASC`,
    [playbookId]
  );
}

async function syncPlaybookStrategies(playbookId: string, strategyIds: string[]) {
  await execute(`DELETE FROM teacher_playbook_strategies WHERE playbook_id = $1`, [playbookId]);

  let sortOrder = 0;
  for (const strategyId of strategyIds) {
    await execute(
      `INSERT INTO teacher_playbook_strategies (id, playbook_id, strategy_id, sort_order)
       VALUES ($1, $2, $3, $4)`,
      [randomUUID(), playbookId, strategyId, sortOrder]
    );
    sortOrder += 1;
  }
}

export async function createTeacherPlaybook(input: {
  teacherUserId: string;
  title: string;
  summary: string;
  issueFocus?: string | null;
  goalFocus?: string | null;
  whenToUse?: string | null;
  guidance?: string | null;
  linkedTemplateId?: string | null;
  linkedResourceId?: string | null;
  strategyIds?: string[];
}): Promise<TeacherPlaybook> {
  const rows = await query<TeacherPlaybook>(
    `INSERT INTO teacher_playbooks (
       id,
       teacher_user_id,
       title,
       summary,
       issue_focus,
       goal_focus,
       when_to_use,
       guidance,
       linked_template_id,
       linked_resource_id
     )
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING *`,
    [
      randomUUID(),
      input.teacherUserId,
      input.title.trim(),
      input.summary.trim(),
      input.issueFocus?.trim() || null,
      input.goalFocus?.trim() || null,
      input.whenToUse?.trim() || null,
      input.guidance?.trim() || null,
      input.linkedTemplateId ?? null,
      input.linkedResourceId ?? null,
    ]
  );

  const playbook = rows[0];
  await syncPlaybookStrategies(playbook.id, input.strategyIds ?? []);
  return (await getTeacherPlaybook(playbook.id)) ?? playbook;
}

export async function updateTeacherPlaybook(input: {
  id: string;
  teacherUserId: string;
  title: string;
  summary: string;
  issueFocus?: string | null;
  goalFocus?: string | null;
  whenToUse?: string | null;
  guidance?: string | null;
  linkedTemplateId?: string | null;
  linkedResourceId?: string | null;
  archived?: boolean;
  strategyIds?: string[];
}): Promise<void> {
  await execute(
    `UPDATE teacher_playbooks
     SET title = $3,
         summary = $4,
         issue_focus = $5,
         goal_focus = $6,
         when_to_use = $7,
         guidance = $8,
         linked_template_id = $9,
         linked_resource_id = $10,
         archived = $11,
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
      input.whenToUse?.trim() || null,
      input.guidance?.trim() || null,
      input.linkedTemplateId ?? null,
      input.linkedResourceId ?? null,
      input.archived ? 1 : 0,
    ]
  );

  await syncPlaybookStrategies(input.id, input.strategyIds ?? []);
}
