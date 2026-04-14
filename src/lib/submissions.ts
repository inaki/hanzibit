import { randomUUID } from "crypto";
import { execute, query, queryOne } from "./db";

export type AssignmentSubmissionStatus =
  | "not_started"
  | "draft"
  | "submitted"
  | "reviewed";

export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  student_user_id: string;
  journal_entry_id: string | null;
  status: AssignmentSubmissionStatus;
  submitted_at: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubmissionFeedback {
  id: string;
  submission_id: string;
  teacher_user_id: string;
  content: string;
  created_at: string;
}

export interface AssignmentSubmissionWithStudent extends AssignmentSubmission {
  student_name: string;
  student_email: string;
}

export interface SubmissionFeedbackWithTeacher extends SubmissionFeedback {
  teacher_name: string;
  teacher_email: string;
}

export interface AssignmentSubmissionDetail extends AssignmentSubmission {
  assignment_title: string;
  assignment_description: string | null;
  assignment_prompt: string | null;
  classroom_id: string;
  classroom_name: string;
  student_name: string;
  student_email: string;
  journal_entry_title_zh: string | null;
  journal_entry_title_en: string | null;
}

export interface ClassroomAssignmentSummary {
  assignment_id: string;
  submitted_count: number;
  reviewed_count: number;
  total_submissions: number;
  needs_review_count: number;
}

export interface ClassroomSubmissionStudentRow {
  assignment_id: string;
  student_user_id: string;
  student_name: string;
  student_email: string;
  status: AssignmentSubmissionStatus | null;
  submitted_at: string | null;
  reviewed_at: string | null;
}

export async function getSubmission(id: string): Promise<AssignmentSubmission | undefined> {
  return queryOne<AssignmentSubmission>(
    "SELECT * FROM assignment_submissions WHERE id = $1",
    [id]
  );
}

export async function getSubmissionForStudent(
  assignmentId: string,
  studentUserId: string
): Promise<AssignmentSubmission | undefined> {
  return queryOne<AssignmentSubmission>(
    `SELECT *
     FROM assignment_submissions
     WHERE assignment_id = $1
       AND student_user_id = $2`,
    [assignmentId, studentUserId]
  );
}

export async function listSubmissionsForAssignment(
  assignmentId: string
): Promise<AssignmentSubmission[]> {
  return query<AssignmentSubmission>(
    `SELECT *
     FROM assignment_submissions
     WHERE assignment_id = $1
     ORDER BY submitted_at DESC NULLS LAST, created_at DESC`,
    [assignmentId]
  );
}

export async function listSubmissionsForAssignmentWithStudents(
  assignmentId: string
): Promise<AssignmentSubmissionWithStudent[]> {
  return query<AssignmentSubmissionWithStudent>(
    `SELECT assignment_submissions.*, "user".name AS student_name, "user".email AS student_email
     FROM assignment_submissions
     INNER JOIN "user"
       ON "user".id = assignment_submissions.student_user_id
     WHERE assignment_submissions.assignment_id = $1
     ORDER BY assignment_submissions.submitted_at DESC NULLS LAST, assignment_submissions.created_at DESC`,
    [assignmentId]
  );
}

export async function getSubmissionDetail(
  submissionId: string
): Promise<AssignmentSubmissionDetail | undefined> {
  return queryOne<AssignmentSubmissionDetail>(
    `SELECT
       assignment_submissions.*,
       assignments.title AS assignment_title,
       assignments.description AS assignment_description,
       assignments.prompt AS assignment_prompt,
       classrooms.id AS classroom_id,
       classrooms.name AS classroom_name,
       "user".name AS student_name,
       "user".email AS student_email,
       journal_entries.title_zh AS journal_entry_title_zh,
       journal_entries.title_en AS journal_entry_title_en
     FROM assignment_submissions
     INNER JOIN assignments
       ON assignments.id = assignment_submissions.assignment_id
     INNER JOIN classrooms
       ON classrooms.id = assignments.classroom_id
     INNER JOIN "user"
       ON "user".id = assignment_submissions.student_user_id
     LEFT JOIN journal_entries
       ON journal_entries.id = assignment_submissions.journal_entry_id
     WHERE assignment_submissions.id = $1
     LIMIT 1`,
    [submissionId]
  );
}

export async function upsertSubmission(input: {
  assignmentId: string;
  studentUserId: string;
  journalEntryId?: string | null;
  status: AssignmentSubmissionStatus;
}): Promise<void> {
  await execute(
    `INSERT INTO assignment_submissions (
       id,
       assignment_id,
       student_user_id,
       journal_entry_id,
       status,
       submitted_at,
       updated_at
     )
     VALUES (
       $1,
       $2,
       $3,
       $4,
       $5,
       CASE WHEN $5 = 'submitted' THEN NOW() ELSE NULL END,
       NOW()
     )
     ON CONFLICT (assignment_id, student_user_id)
     DO UPDATE SET
       journal_entry_id = EXCLUDED.journal_entry_id,
       status = EXCLUDED.status,
       submitted_at = CASE
         WHEN EXCLUDED.status = 'submitted' THEN NOW()
         ELSE assignment_submissions.submitted_at
       END,
       updated_at = NOW()`,
    [
      randomUUID(),
      input.assignmentId,
      input.studentUserId,
      input.journalEntryId ?? null,
      input.status,
    ]
  );
}

export async function addSubmissionFeedback(input: {
  submissionId: string;
  teacherUserId: string;
  content: string;
}): Promise<void> {
  await execute(
    `INSERT INTO submission_feedback (id, submission_id, teacher_user_id, content)
     VALUES ($1, $2, $3, $4)`,
    [randomUUID(), input.submissionId, input.teacherUserId, input.content.trim()]
  );
}

export async function listSubmissionFeedback(
  submissionId: string
): Promise<SubmissionFeedbackWithTeacher[]> {
  return query<SubmissionFeedbackWithTeacher>(
    `SELECT submission_feedback.*, "user".name AS teacher_name, "user".email AS teacher_email
     FROM submission_feedback
     INNER JOIN "user"
       ON "user".id = submission_feedback.teacher_user_id
     WHERE submission_id = $1
     ORDER BY created_at DESC`,
    [submissionId]
  );
}

export async function markSubmissionReviewed(submissionId: string): Promise<void> {
  await execute(
    `UPDATE assignment_submissions
     SET status = 'reviewed',
         reviewed_at = NOW(),
         updated_at = NOW()
     WHERE id = $1`,
    [submissionId]
  );
}

export async function listClassroomAssignmentSummaries(
  classroomId: string
): Promise<ClassroomAssignmentSummary[]> {
  return query<ClassroomAssignmentSummary>(
    `SELECT
       assignments.id AS assignment_id,
       COUNT(assignment_submissions.id)::int AS total_submissions,
       COUNT(*) FILTER (WHERE assignment_submissions.status = 'submitted')::int AS submitted_count,
       COUNT(*) FILTER (WHERE assignment_submissions.status = 'reviewed')::int AS reviewed_count,
       COUNT(*) FILTER (WHERE assignment_submissions.status = 'submitted')::int AS needs_review_count
     FROM assignments
     LEFT JOIN assignment_submissions
       ON assignment_submissions.assignment_id = assignments.id
     WHERE assignments.classroom_id = $1
     GROUP BY assignments.id`,
    [classroomId]
  );
}

export async function listClassroomSubmissionStudentRows(
  classroomId: string
): Promise<ClassroomSubmissionStudentRow[]> {
  return query<ClassroomSubmissionStudentRow>(
    `SELECT
       assignments.id AS assignment_id,
       classroom_members.user_id AS student_user_id,
       "user".name AS student_name,
       "user".email AS student_email,
       assignment_submissions.status,
       assignment_submissions.submitted_at,
       assignment_submissions.reviewed_at
     FROM assignments
     INNER JOIN classroom_members
       ON classroom_members.classroom_id = assignments.classroom_id
      AND classroom_members.role = 'student'
     INNER JOIN "user"
       ON "user".id = classroom_members.user_id
     LEFT JOIN assignment_submissions
       ON assignment_submissions.assignment_id = assignments.id
      AND assignment_submissions.student_user_id = classroom_members.user_id
     WHERE assignments.classroom_id = $1
     ORDER BY "user".name ASC, assignments.created_at DESC`,
    [classroomId]
  );
}
