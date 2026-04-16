import { randomUUID } from "crypto";
import { queryOne, withTransaction } from "./db";

export type PrivateStudentPlaybookOutcomeStatus =
  | "helped"
  | "partial"
  | "no_change"
  | "replace";

export interface PrivateStudentPlaybookOutcome {
  id: string;
  playbook_application_id: string;
  private_student_id: string;
  teacher_playbook_id: string;
  teacher_user_id: string;
  outcome_status: PrivateStudentPlaybookOutcomeStatus;
  outcome_note: string | null;
  recorded_at: string;
  created_at: string;
  updated_at: string;
}

export interface PrivateStudentPlaybookOutcomeSummary {
  total: number;
  helped: number;
  partial: number;
  no_change: number;
  replace: number;
  latest_outcome_status: PrivateStudentPlaybookOutcomeStatus | null;
  latest_outcome_note: string | null;
  latest_recorded_at: string | null;
}

export function getPrivateStudentPlaybookOutcomeLabel(
  status: PrivateStudentPlaybookOutcomeStatus
): string {
  switch (status) {
    case "helped":
      return "Helped";
    case "partial":
      return "Partial help";
    case "no_change":
      return "No clear change";
    case "replace":
      return "Replace playbook";
  }
}

export async function getPrivateStudentPlaybookOutcome(
  playbookApplicationId: string
): Promise<PrivateStudentPlaybookOutcome | null> {
  return (
    (await queryOne<PrivateStudentPlaybookOutcome>(
      `SELECT *
       FROM private_student_playbook_outcomes
       WHERE playbook_application_id = $1
       LIMIT 1`,
      [playbookApplicationId]
    )) ?? null
  );
}

export async function upsertPrivateStudentPlaybookOutcome(input: {
  playbookApplicationId: string;
  privateStudentId: string;
  teacherPlaybookId: string;
  teacherUserId: string;
  outcomeStatus: PrivateStudentPlaybookOutcomeStatus;
  outcomeNote?: string | null;
  recordedAt?: string | null;
}): Promise<PrivateStudentPlaybookOutcome> {
  const existing = await getPrivateStudentPlaybookOutcome(
    input.playbookApplicationId
  );
  const id = existing?.id ?? randomUUID();

  await withTransaction(async (client) => {
    await client.query(
      `INSERT INTO private_student_playbook_outcomes (
         id,
         playbook_application_id,
         private_student_id,
         teacher_playbook_id,
         teacher_user_id,
         outcome_status,
         outcome_note,
         recorded_at
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8::timestamptz, NOW()))
       ON CONFLICT (playbook_application_id)
       DO UPDATE SET
         outcome_status = EXCLUDED.outcome_status,
         outcome_note = EXCLUDED.outcome_note,
         recorded_at = EXCLUDED.recorded_at,
         updated_at = NOW()`,
      [
        id,
        input.playbookApplicationId,
        input.privateStudentId,
        input.teacherPlaybookId,
        input.teacherUserId,
        input.outcomeStatus,
        input.outcomeNote?.trim() || null,
        input.recordedAt || null,
      ]
    );
  });

  const saved = await getPrivateStudentPlaybookOutcome(
    input.playbookApplicationId
  );
  if (!saved) {
    throw new Error("Failed to save playbook outcome.");
  }
  return saved;
}

export async function getTeacherPlaybookOutcomeSummary(
  teacherPlaybookId: string
): Promise<PrivateStudentPlaybookOutcomeSummary> {
  const row = await queryOne<{
    total: number;
    helped: number;
    partial: number;
    no_change: number;
    replace: number;
    latest_outcome_status: PrivateStudentPlaybookOutcomeStatus | null;
    latest_outcome_note: string | null;
    latest_recorded_at: string | null;
  }>(
    `SELECT
       COUNT(outcomes.id)::int AS total,
       COUNT(outcomes.id) FILTER (WHERE outcomes.outcome_status = 'helped')::int AS helped,
       COUNT(outcomes.id) FILTER (WHERE outcomes.outcome_status = 'partial')::int AS partial,
       COUNT(outcomes.id) FILTER (WHERE outcomes.outcome_status = 'no_change')::int AS no_change,
       COUNT(outcomes.id) FILTER (WHERE outcomes.outcome_status = 'replace')::int AS replace,
       latest.outcome_status AS latest_outcome_status,
       latest.outcome_note AS latest_outcome_note,
       latest.recorded_at AS latest_recorded_at
     FROM teacher_playbooks
     LEFT JOIN private_student_playbook_outcomes outcomes
       ON outcomes.teacher_playbook_id = teacher_playbooks.id
     LEFT JOIN LATERAL (
       SELECT outcome_status, outcome_note, recorded_at
       FROM private_student_playbook_outcomes
       WHERE teacher_playbook_id = teacher_playbooks.id
       ORDER BY recorded_at DESC, created_at DESC
       LIMIT 1
     ) latest ON TRUE
     WHERE teacher_playbooks.id = $1
     GROUP BY latest.outcome_status, latest.outcome_note, latest.recorded_at`,
    [teacherPlaybookId]
  );

  return (
    row ?? {
      total: 0,
      helped: 0,
      partial: 0,
      no_change: 0,
      replace: 0,
      latest_outcome_status: null,
      latest_outcome_note: null,
      latest_recorded_at: null,
    }
  );
}
