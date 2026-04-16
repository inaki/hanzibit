import { randomUUID } from "crypto";
import { execute, query, queryOne } from "./db";

export type PrivateStudentStatus =
  | "onboarding"
  | "active"
  | "awaiting_teacher"
  | "awaiting_student"
  | "inactive";

export type PrivateStudentNextStepType =
  | "complete_assignment"
  | "review_feedback"
  | "await_teacher_assignment"
  | "follow_up"
  | "none";

export interface PrivateStudent {
  id: string;
  teacher_user_id: string;
  student_user_id: string;
  classroom_id: string;
  inquiry_id: string;
  status: PrivateStudentStatus;
  next_step_type: PrivateStudentNextStepType | null;
  next_assignment_id: string | null;
  follow_up_note: string | null;
  last_strategy_id: string | null;
  last_strategy_title?: string | null;
  last_strategy_applied_at: string | null;
  last_playbook_id: string | null;
  last_playbook_title?: string | null;
  last_playbook_applied_at: string | null;
  last_playbook_outcome_status?: string | null;
  last_playbook_outcome_note?: string | null;
  last_playbook_outcome_at?: string | null;
  last_strategy_outcome_status?: string | null;
  last_strategy_outcome_note?: string | null;
  last_strategy_outcome_at?: string | null;
  last_review_snapshot_at: string | null;
  last_plan_adapted_at: string | null;
  last_teacher_action_at: string | null;
  last_student_activity_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PrivateStudentListItem extends PrivateStudent {
  classroom_name: string;
  classroom_description: string | null;
  student_name: string;
  student_email: string;
  next_assignment_title: string | null;
  last_strategy_title: string | null;
  last_submitted_at: string | null;
  last_reviewed_at: string | null;
  last_submission_activity_at: string | null;
  awaiting_review_count: number;
  submission_count: number;
}

export interface PrivateStudentDetail extends PrivateStudentListItem {
  inquiry_message: string | null;
  onboarding_message: string | null;
  conversion_completed_at: string | null;
}

export async function getPrivateStudentByClassroomId(
  classroomId: string
): Promise<PrivateStudent | null> {
  return (
    (await queryOne<PrivateStudent>(
      `SELECT
         private_students.*,
         teacher_strategies.title AS last_strategy_title,
         teacher_playbooks.title AS last_playbook_title,
         playbook_outcomes.outcome_status AS last_playbook_outcome_status,
         playbook_outcomes.outcome_note AS last_playbook_outcome_note,
         playbook_outcomes.recorded_at AS last_playbook_outcome_at,
         outcomes.outcome_status AS last_strategy_outcome_status,
         outcomes.outcome_note AS last_strategy_outcome_note,
         outcomes.recorded_at AS last_strategy_outcome_at
       FROM private_students
       LEFT JOIN teacher_strategies
         ON teacher_strategies.id = private_students.last_strategy_id
       LEFT JOIN teacher_playbooks
         ON teacher_playbooks.id = private_students.last_playbook_id
       LEFT JOIN private_student_playbook_outcomes playbook_outcomes
         ON playbook_outcomes.playbook_application_id = (
           SELECT apps.id
           FROM private_student_playbook_applications apps
           WHERE apps.private_student_id = private_students.id
           ORDER BY apps.applied_at DESC, apps.created_at DESC
           LIMIT 1
         )
       LEFT JOIN private_student_strategy_outcomes outcomes
         ON outcomes.strategy_application_id = (
           SELECT apps.id
           FROM private_student_strategy_applications apps
           WHERE apps.private_student_id = private_students.id
           ORDER BY apps.applied_at DESC, apps.created_at DESC
           LIMIT 1
         )
       WHERE classroom_id = $1
       LIMIT 1`,
      [classroomId]
    )) ?? null
  );
}

export async function getPrivateStudentByInquiryId(
  inquiryId: string
): Promise<PrivateStudent | null> {
  return (
    (await queryOne<PrivateStudent>(
      `SELECT *
       FROM private_students
       WHERE inquiry_id = $1
       LIMIT 1`,
      [inquiryId]
    )) ?? null
  );
}

export async function listPrivateStudentsForTeacher(
  teacherUserId: string
): Promise<PrivateStudentListItem[]> {
  return query<PrivateStudentListItem>(
    `SELECT
       private_students.*,
       classrooms.name AS classroom_name,
       classrooms.description AS classroom_description,
         "user".name AS student_name,
         "user".email AS student_email,
         assignments.title AS next_assignment_title,
         teacher_strategies.title AS last_strategy_title,
         teacher_playbooks.title AS last_playbook_title,
         playbook_outcomes.outcome_status AS last_playbook_outcome_status,
         playbook_outcomes.outcome_note AS last_playbook_outcome_note,
         playbook_outcomes.recorded_at AS last_playbook_outcome_at,
         outcomes.outcome_status AS last_strategy_outcome_status,
         outcomes.outcome_note AS last_strategy_outcome_note,
         outcomes.recorded_at AS last_strategy_outcome_at,
         activity.last_submitted_at,
       activity.last_reviewed_at,
       activity.last_submission_activity_at,
       COALESCE(activity.awaiting_review_count, 0)::int AS awaiting_review_count,
       COALESCE(activity.submission_count, 0)::int AS submission_count
     FROM private_students
     INNER JOIN classrooms
       ON classrooms.id = private_students.classroom_id
     INNER JOIN "user"
       ON "user".id = private_students.student_user_id
     LEFT JOIN assignments
       ON assignments.id = private_students.next_assignment_id
     LEFT JOIN teacher_strategies
       ON teacher_strategies.id = private_students.last_strategy_id
     LEFT JOIN teacher_playbooks
       ON teacher_playbooks.id = private_students.last_playbook_id
     LEFT JOIN private_student_playbook_outcomes playbook_outcomes
       ON playbook_outcomes.playbook_application_id = (
         SELECT apps.id
         FROM private_student_playbook_applications apps
         WHERE apps.private_student_id = private_students.id
         ORDER BY apps.applied_at DESC, apps.created_at DESC
         LIMIT 1
       )
     LEFT JOIN private_student_strategy_outcomes outcomes
       ON outcomes.strategy_application_id = (
         SELECT apps.id
         FROM private_student_strategy_applications apps
         WHERE apps.private_student_id = private_students.id
         ORDER BY apps.applied_at DESC, apps.created_at DESC
         LIMIT 1
       )
     LEFT JOIN LATERAL (
       SELECT
         MAX(assignment_submissions.submitted_at) AS last_submitted_at,
         MAX(assignment_submissions.reviewed_at) AS last_reviewed_at,
         MAX(
           COALESCE(
             assignment_submissions.reviewed_at,
             assignment_submissions.submitted_at,
             assignment_submissions.updated_at,
             assignment_submissions.created_at
           )
         ) AS last_submission_activity_at,
         COUNT(*) FILTER (WHERE assignment_submissions.status = 'submitted')::int AS awaiting_review_count,
         COUNT(assignment_submissions.id)::int AS submission_count
       FROM assignments classroom_assignments
       LEFT JOIN assignment_submissions
         ON assignment_submissions.assignment_id = classroom_assignments.id
        AND assignment_submissions.student_user_id = private_students.student_user_id
       WHERE classroom_assignments.classroom_id = private_students.classroom_id
     ) AS activity ON TRUE
     WHERE private_students.teacher_user_id = $1
     ORDER BY
       CASE private_students.status
         WHEN 'awaiting_teacher' THEN 0
         WHEN 'inactive' THEN 1
         WHEN 'awaiting_student' THEN 2
         WHEN 'onboarding' THEN 3
         WHEN 'active' THEN 4
         ELSE 5
       END,
       private_students.updated_at DESC`,
    [teacherUserId]
  );
}

export async function getPrivateStudentDetail(
  privateStudentId: string
): Promise<PrivateStudentDetail | null> {
  return (
    (await queryOne<PrivateStudentDetail>(
      `SELECT
         private_students.*,
         classrooms.name AS classroom_name,
         classrooms.description AS classroom_description,
         "user".name AS student_name,
         "user".email AS student_email,
         assignments.title AS next_assignment_title,
         teacher_strategies.title AS last_strategy_title,
         teacher_playbooks.title AS last_playbook_title,
         playbook_outcomes.outcome_status AS last_playbook_outcome_status,
         playbook_outcomes.outcome_note AS last_playbook_outcome_note,
         playbook_outcomes.recorded_at AS last_playbook_outcome_at,
         outcomes.outcome_status AS last_strategy_outcome_status,
         outcomes.outcome_note AS last_strategy_outcome_note,
         outcomes.recorded_at AS last_strategy_outcome_at,
         teacher_inquiries.message AS inquiry_message,
         teacher_inquiries.onboarding_message,
         teacher_inquiries.conversion_completed_at,
         activity.last_submitted_at,
         activity.last_reviewed_at,
         activity.last_submission_activity_at,
         COALESCE(activity.awaiting_review_count, 0)::int AS awaiting_review_count,
         COALESCE(activity.submission_count, 0)::int AS submission_count
       FROM private_students
       INNER JOIN classrooms
         ON classrooms.id = private_students.classroom_id
       INNER JOIN "user"
         ON "user".id = private_students.student_user_id
       INNER JOIN teacher_inquiries
         ON teacher_inquiries.id = private_students.inquiry_id
       LEFT JOIN assignments
         ON assignments.id = private_students.next_assignment_id
       LEFT JOIN teacher_strategies
         ON teacher_strategies.id = private_students.last_strategy_id
       LEFT JOIN teacher_playbooks
         ON teacher_playbooks.id = private_students.last_playbook_id
       LEFT JOIN private_student_playbook_outcomes playbook_outcomes
         ON playbook_outcomes.playbook_application_id = (
           SELECT apps.id
           FROM private_student_playbook_applications apps
           WHERE apps.private_student_id = private_students.id
           ORDER BY apps.applied_at DESC, apps.created_at DESC
           LIMIT 1
         )
       LEFT JOIN private_student_strategy_outcomes outcomes
         ON outcomes.strategy_application_id = (
           SELECT apps.id
           FROM private_student_strategy_applications apps
           WHERE apps.private_student_id = private_students.id
           ORDER BY apps.applied_at DESC, apps.created_at DESC
           LIMIT 1
         )
       LEFT JOIN LATERAL (
         SELECT
           MAX(assignment_submissions.submitted_at) AS last_submitted_at,
           MAX(assignment_submissions.reviewed_at) AS last_reviewed_at,
           MAX(
             COALESCE(
               assignment_submissions.reviewed_at,
               assignment_submissions.submitted_at,
               assignment_submissions.updated_at,
               assignment_submissions.created_at
             )
           ) AS last_submission_activity_at,
           COUNT(*) FILTER (WHERE assignment_submissions.status = 'submitted')::int AS awaiting_review_count,
           COUNT(assignment_submissions.id)::int AS submission_count
         FROM assignments classroom_assignments
         LEFT JOIN assignment_submissions
           ON assignment_submissions.assignment_id = classroom_assignments.id
          AND assignment_submissions.student_user_id = private_students.student_user_id
         WHERE classroom_assignments.classroom_id = private_students.classroom_id
       ) AS activity ON TRUE
       WHERE private_students.id = $1
       LIMIT 1`,
      [privateStudentId]
    )) ?? null
  );
}

export async function ensurePrivateStudent(params: {
  teacherUserId: string;
  studentUserId: string;
  classroomId: string;
  inquiryId: string;
  nextAssignmentId?: string | null;
}): Promise<PrivateStudent> {
  const existing = await getPrivateStudentByInquiryId(params.inquiryId);
  if (existing) return existing;

  const id = randomUUID();
  await execute(
    `INSERT INTO private_students (
       id,
       teacher_user_id,
       student_user_id,
       classroom_id,
       inquiry_id,
       status,
       next_step_type,
       next_assignment_id,
       last_teacher_action_at
     )
     VALUES ($1, $2, $3, $4, $5, 'onboarding', $6, $7, NOW())`,
    [
      id,
      params.teacherUserId,
      params.studentUserId,
      params.classroomId,
      params.inquiryId,
      params.nextAssignmentId ? "complete_assignment" : "await_teacher_assignment",
      params.nextAssignmentId ?? null,
    ]
  );

  const created = await getPrivateStudentByInquiryId(params.inquiryId);
  if (!created) {
    throw new Error("Failed to create private learner lifecycle record.");
  }
  return created;
}

export async function updatePrivateStudentNextAssignment(params: {
  inquiryId: string;
  teacherUserId: string;
  nextAssignmentId: string | null;
}): Promise<void> {
  await execute(
    `UPDATE private_students
     SET next_assignment_id = $3,
         next_step_type = $4,
         last_teacher_action_at = NOW(),
         updated_at = NOW()
     WHERE inquiry_id = $1
       AND teacher_user_id = $2`,
    [
      params.inquiryId,
      params.teacherUserId,
      params.nextAssignmentId,
      params.nextAssignmentId ? "complete_assignment" : "await_teacher_assignment",
    ]
  );
}

export async function updatePrivateStudentState(params: {
  id: string;
  teacherUserId: string;
  status: PrivateStudentStatus;
  nextStepType: PrivateStudentNextStepType | null;
  nextAssignmentId: string | null;
  followUpNote: string | null;
}): Promise<void> {
  await execute(
    `UPDATE private_students
     SET status = $3,
         next_step_type = $4,
         next_assignment_id = $5,
         follow_up_note = $6,
         last_teacher_action_at = NOW(),
         updated_at = NOW()
     WHERE id = $1
       AND teacher_user_id = $2`,
    [
      params.id,
      params.teacherUserId,
      params.status,
      params.nextStepType,
      params.nextAssignmentId,
      params.followUpNote?.trim() || null,
    ]
  );
}
