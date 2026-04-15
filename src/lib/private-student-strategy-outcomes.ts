import { randomUUID } from "crypto";
import { queryOne, withTransaction } from "./db";

export type PrivateStudentStrategyOutcomeStatus =
  | "helped"
  | "partial"
  | "no_change"
  | "replace";

export interface PrivateStudentStrategyOutcome {
  id: string;
  strategy_application_id: string;
  private_student_id: string;
  teacher_strategy_id: string;
  teacher_user_id: string;
  outcome_status: PrivateStudentStrategyOutcomeStatus;
  outcome_note: string | null;
  recorded_at: string;
  created_at: string;
  updated_at: string;
}

export interface PrivateStudentStrategyOutcomeSummary {
  total: number;
  helped: number;
  partial: number;
  no_change: number;
  replace: number;
  latest_outcome_status: PrivateStudentStrategyOutcomeStatus | null;
  latest_outcome_note: string | null;
  latest_recorded_at: string | null;
}

export function getPrivateStudentStrategyOutcomeLabel(
  status: PrivateStudentStrategyOutcomeStatus
): string {
  switch (status) {
    case "helped":
      return "Helped";
    case "partial":
      return "Partial help";
    case "no_change":
      return "No clear change";
    case "replace":
      return "Replace strategy";
  }
}

export async function getPrivateStudentStrategyOutcome(
  strategyApplicationId: string
): Promise<PrivateStudentStrategyOutcome | null> {
  return (
    (await queryOne<PrivateStudentStrategyOutcome>(
      `SELECT *
       FROM private_student_strategy_outcomes
       WHERE strategy_application_id = $1
       LIMIT 1`,
      [strategyApplicationId]
    )) ?? null
  );
}

export async function upsertPrivateStudentStrategyOutcome(input: {
  strategyApplicationId: string;
  privateStudentId: string;
  teacherStrategyId: string;
  teacherUserId: string;
  outcomeStatus: PrivateStudentStrategyOutcomeStatus;
  outcomeNote?: string | null;
  recordedAt?: string | null;
}): Promise<PrivateStudentStrategyOutcome> {
  const existing = await getPrivateStudentStrategyOutcome(input.strategyApplicationId);
  const id = existing?.id ?? randomUUID();

  await withTransaction(async (client) => {
    await client.query(
      `INSERT INTO private_student_strategy_outcomes (
         id,
         strategy_application_id,
         private_student_id,
         teacher_strategy_id,
         teacher_user_id,
         outcome_status,
         outcome_note,
         recorded_at
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8::timestamptz, NOW()))
       ON CONFLICT (strategy_application_id)
       DO UPDATE SET
         outcome_status = EXCLUDED.outcome_status,
         outcome_note = EXCLUDED.outcome_note,
         recorded_at = EXCLUDED.recorded_at,
         updated_at = NOW()`,
      [
        id,
        input.strategyApplicationId,
        input.privateStudentId,
        input.teacherStrategyId,
        input.teacherUserId,
        input.outcomeStatus,
        input.outcomeNote?.trim() || null,
        input.recordedAt || null,
      ]
    );
  });

  const saved = await getPrivateStudentStrategyOutcome(input.strategyApplicationId);
  if (!saved) {
    throw new Error("Failed to save strategy outcome.");
  }
  return saved;
}

export async function getTeacherStrategyOutcomeSummary(
  teacherStrategyId: string
): Promise<PrivateStudentStrategyOutcomeSummary> {
  const row = await queryOne<{
    total: number;
    helped: number;
    partial: number;
    no_change: number;
    replace: number;
    latest_outcome_status: PrivateStudentStrategyOutcomeStatus | null;
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
     FROM teacher_strategies
     LEFT JOIN private_student_strategy_outcomes outcomes
       ON outcomes.teacher_strategy_id = teacher_strategies.id
     LEFT JOIN LATERAL (
       SELECT outcome_status, outcome_note, recorded_at
       FROM private_student_strategy_outcomes
       WHERE teacher_strategy_id = teacher_strategies.id
       ORDER BY recorded_at DESC, created_at DESC
       LIMIT 1
     ) latest ON TRUE
     WHERE teacher_strategies.id = $1
     GROUP BY latest.outcome_status, latest.outcome_note, latest.recorded_at`,
    [teacherStrategyId]
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
