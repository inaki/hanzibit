import { randomUUID } from "crypto";
import { query, queryOne, withTransaction } from "./db";

export interface PrivateStudentPlaybookApplication {
  id: string;
  private_student_id: string;
  playbook_id: string;
  applied_by_user_id: string;
  applied_at: string;
  application_note: string | null;
  linked_review_id: string | null;
  linked_lesson_plan_id: string | null;
  linked_goal_id: string | null;
  created_at: string;
}

export interface PrivateStudentPlaybookApplicationDetail
  extends PrivateStudentPlaybookApplication {
  playbook_title: string;
  playbook_summary: string;
  issue_focus: string | null;
  goal_focus: string | null;
  when_to_use: string | null;
  linked_strategy_count: number;
}

export async function listPrivateStudentPlaybookApplications(
  privateStudentId: string
): Promise<PrivateStudentPlaybookApplicationDetail[]> {
  return query<PrivateStudentPlaybookApplicationDetail>(
    `SELECT
       private_student_playbook_applications.*,
       teacher_playbooks.title AS playbook_title,
       teacher_playbooks.summary AS playbook_summary,
       teacher_playbooks.issue_focus,
       teacher_playbooks.goal_focus,
       teacher_playbooks.when_to_use,
       (
         SELECT COUNT(*)
         FROM teacher_playbook_strategies links
         WHERE links.playbook_id = teacher_playbooks.id
       )::int AS linked_strategy_count
     FROM private_student_playbook_applications
     INNER JOIN teacher_playbooks
       ON teacher_playbooks.id = private_student_playbook_applications.playbook_id
     WHERE private_student_playbook_applications.private_student_id = $1
     ORDER BY private_student_playbook_applications.applied_at DESC, private_student_playbook_applications.created_at DESC`,
    [privateStudentId]
  );
}

export async function applyTeacherPlaybookToPrivateStudent(input: {
  privateStudentId: string;
  playbookId: string;
  appliedByUserId: string;
  applicationNote?: string | null;
  linkedReviewId?: string | null;
  linkedLessonPlanId?: string | null;
  linkedGoalId?: string | null;
}): Promise<PrivateStudentPlaybookApplication> {
  const id = randomUUID();

  await withTransaction(async (client) => {
    await client.query(
      `INSERT INTO private_student_playbook_applications (
         id,
         private_student_id,
         playbook_id,
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
        input.playbookId,
        input.appliedByUserId,
        input.applicationNote?.trim() || null,
        input.linkedReviewId ?? null,
        input.linkedLessonPlanId ?? null,
        input.linkedGoalId ?? null,
      ]
    );

    await client.query(
      `UPDATE teacher_playbooks
       SET usage_count = usage_count + 1,
           updated_at = NOW()
       WHERE id = $1`,
      [input.playbookId]
    );

    await client.query(
      `UPDATE private_students
       SET last_playbook_id = $2,
           last_playbook_applied_at = NOW(),
           last_teacher_action_at = NOW(),
           updated_at = NOW()
       WHERE id = $1`,
      [input.privateStudentId, input.playbookId]
    );
  });

  const created = await queryOne<PrivateStudentPlaybookApplication>(
    `SELECT *
     FROM private_student_playbook_applications
     WHERE id = $1
     LIMIT 1`,
    [id]
  );

  if (!created) {
    throw new Error("Failed to apply teacher playbook.");
  }

  return created;
}
