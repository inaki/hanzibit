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
  refinement_note: string | null;
  last_refined_at: string | null;
  replacement_playbook_id: string | null;
  replacement_playbook_title?: string | null;
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

export interface TeacherPlaybookPatternSummary {
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

export async function getTeacherPlaybook(id: string): Promise<TeacherPlaybook | undefined> {
  return queryOne<TeacherPlaybook>(
    `SELECT playbooks.*,
            replacement.title AS replacement_playbook_title,
            (
              SELECT COUNT(*)
              FROM teacher_playbook_strategies links
              WHERE links.playbook_id = playbooks.id
            )::int AS linked_strategy_count
     FROM teacher_playbooks playbooks
     LEFT JOIN teacher_playbooks replacement
       ON replacement.id = playbooks.replacement_playbook_id
     WHERE playbooks.id = $1`,
    [id]
  );
}

export async function getTeacherPlaybookPatternSummary(
  playbookId: string
): Promise<TeacherPlaybookPatternSummary> {
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
         WHERE private_students.last_playbook_id = teacher_playbooks.id
       )::int AS active_learner_count,
       COUNT(DISTINCT applications.private_student_id) FILTER (
         WHERE EXISTS (
           SELECT 1
           FROM private_lesson_history history
           WHERE history.private_student_id = applications.private_student_id
             AND history.issue_tags_json LIKE '%' || teacher_playbooks.issue_focus || '%'
         )
       )::int AS recurring_issue_learner_count,
       MAX(applications.applied_at) AS latest_applied_at,
       COUNT(outcomes.id)::int AS total_outcomes,
       COUNT(outcomes.id) FILTER (WHERE outcomes.outcome_status = 'helped')::int AS helped_count,
       COUNT(outcomes.id) FILTER (WHERE outcomes.outcome_status = 'partial')::int AS partial_count,
       COUNT(outcomes.id) FILTER (WHERE outcomes.outcome_status = 'no_change')::int AS no_change_count,
       COUNT(outcomes.id) FILTER (WHERE outcomes.outcome_status = 'replace')::int AS replace_count
     FROM teacher_playbooks
     LEFT JOIN private_student_playbook_applications applications
       ON applications.playbook_id = teacher_playbooks.id
     LEFT JOIN private_students
       ON private_students.id = applications.private_student_id
     LEFT JOIN private_student_playbook_outcomes outcomes
       ON outcomes.teacher_playbook_id = teacher_playbooks.id
     WHERE teacher_playbooks.id = $1
     GROUP BY teacher_playbooks.id, teacher_playbooks.issue_focus`,
    [playbookId]
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

export async function listTeacherPlaybooksForTeacher(
  teacherUserId: string,
  options?: { includeArchived?: boolean }
): Promise<TeacherPlaybook[]> {
  return query<TeacherPlaybook>(
    `SELECT playbooks.*,
            replacement.title AS replacement_playbook_title,
            (
              SELECT COUNT(*)
              FROM teacher_playbook_strategies links
              WHERE links.playbook_id = playbooks.id
            )::int AS linked_strategy_count
     FROM teacher_playbooks playbooks
     LEFT JOIN teacher_playbooks replacement
       ON replacement.id = playbooks.replacement_playbook_id
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
  refinementNote?: string | null;
  linkedTemplateId?: string | null;
  linkedResourceId?: string | null;
  replacementPlaybookId?: string | null;
  archived?: boolean;
  markRefined?: boolean;
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
         refinement_note = $9,
         linked_template_id = $10,
         linked_resource_id = $11,
         replacement_playbook_id = $12,
         archived = $13,
         last_refined_at = CASE
           WHEN $14::int = 1 THEN NOW()
           ELSE last_refined_at
         END,
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
      input.refinementNote?.trim() || null,
      input.linkedTemplateId ?? null,
      input.linkedResourceId ?? null,
      input.replacementPlaybookId ?? null,
      input.archived ? 1 : 0,
      input.markRefined ? 1 : 0,
    ]
  );

  await syncPlaybookStrategies(input.id, input.strategyIds ?? []);
}
