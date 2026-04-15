import { randomUUID } from "crypto";
import { query, queryOne } from "./db";

export const PRIVATE_LESSON_ISSUE_TAGS = [
  "tone_accuracy",
  "word_order",
  "vocabulary_recall",
  "reading_confidence",
  "speaking_confidence",
  "homework_follow_through",
  "consistency",
] as const;

export type PrivateLessonIssueTag = (typeof PRIVATE_LESSON_ISSUE_TAGS)[number];

export interface PrivateLessonHistoryItem {
  id: string;
  private_student_id: string;
  teacher_user_id: string;
  classroom_id: string;
  lesson_plan_id: string | null;
  assignment_id: string | null;
  summary: string;
  practice_focus: string | null;
  issue_tags_json: string;
  issue_tags: PrivateLessonIssueTag[];
  intervention_note: string | null;
  recorded_at: string;
  created_at: string;
  assignment_title: string | null;
}

function parseIssueTags(value: string | null | undefined): PrivateLessonIssueTag[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((tag): tag is PrivateLessonIssueTag =>
      typeof tag === "string" &&
      (PRIVATE_LESSON_ISSUE_TAGS as readonly string[]).includes(tag)
    );
  } catch {
    return [];
  }
}

function mapHistoryRow(row: Omit<PrivateLessonHistoryItem, "issue_tags">): PrivateLessonHistoryItem {
  return {
    ...row,
    issue_tags: parseIssueTags(row.issue_tags_json),
  };
}

export function getPrivateLessonIssueTagLabel(tag: PrivateLessonIssueTag) {
  switch (tag) {
    case "tone_accuracy":
      return "Tone accuracy";
    case "word_order":
      return "Word order";
    case "vocabulary_recall":
      return "Vocabulary recall";
    case "reading_confidence":
      return "Reading confidence";
    case "speaking_confidence":
      return "Speaking confidence";
    case "homework_follow_through":
      return "Homework follow-through";
    case "consistency":
      return "Consistency";
    default:
      return tag;
  }
}

export async function listPrivateLessonHistory(
  privateStudentId: string
): Promise<PrivateLessonHistoryItem[]> {
  const rows = await query<Omit<PrivateLessonHistoryItem, "issue_tags">>(
    `SELECT
       private_lesson_history.*,
       assignments.title AS assignment_title
     FROM private_lesson_history
     LEFT JOIN assignments
       ON assignments.id = private_lesson_history.assignment_id
     WHERE private_lesson_history.private_student_id = $1
     ORDER BY private_lesson_history.recorded_at DESC, private_lesson_history.created_at DESC`,
    [privateStudentId]
  );
  return rows.map(mapHistoryRow);
}

export async function getLatestPrivateLessonHistoryByClassroomId(
  classroomId: string
): Promise<PrivateLessonHistoryItem | null> {
  const row =
    (await queryOne<Omit<PrivateLessonHistoryItem, "issue_tags">>(
      `SELECT
         private_lesson_history.*,
         assignments.title AS assignment_title
       FROM private_lesson_history
       LEFT JOIN assignments
         ON assignments.id = private_lesson_history.assignment_id
       WHERE private_lesson_history.classroom_id = $1
       ORDER BY private_lesson_history.recorded_at DESC, private_lesson_history.created_at DESC
       LIMIT 1`,
      [classroomId]
    )) ?? null;
  return row ? mapHistoryRow(row) : null;
}

export async function createPrivateLessonHistory(input: {
  privateStudentId: string;
  teacherUserId: string;
  classroomId: string;
  lessonPlanId: string | null;
  assignmentId: string | null;
  summary: string;
  practiceFocus: string | null;
  issueTags: PrivateLessonIssueTag[];
  interventionNote: string | null;
  recordedAt: string | null;
}): Promise<PrivateLessonHistoryItem> {
  const rows = await query<Omit<PrivateLessonHistoryItem, "issue_tags">>(
    `INSERT INTO private_lesson_history (
       id,
       private_student_id,
       teacher_user_id,
       classroom_id,
       lesson_plan_id,
       assignment_id,
       summary,
       practice_focus,
       issue_tags_json,
       intervention_note,
       recorded_at
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, COALESCE($11::timestamptz, NOW()))
     RETURNING
       private_lesson_history.*,
       NULL::text AS assignment_title`,
    [
      randomUUID(),
      input.privateStudentId,
      input.teacherUserId,
      input.classroomId,
      input.lessonPlanId,
      input.assignmentId,
      input.summary.trim(),
      input.practiceFocus?.trim() || null,
      JSON.stringify(input.issueTags),
      input.interventionNote?.trim() || null,
      input.recordedAt,
    ]
  );
  return mapHistoryRow(rows[0]);
}
