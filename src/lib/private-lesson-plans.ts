import { randomUUID } from "crypto";
import { execute, queryOne } from "./db";

export type PrivateLessonPlanStatus =
  | "planned"
  | "awaiting_assignment"
  | "awaiting_completion"
  | "completed"
  | "stale";

export interface PrivateLessonPlan {
  id: string;
  private_student_id: string;
  teacher_user_id: string;
  classroom_id: string;
  next_assignment_id: string | null;
  next_template_id: string | null;
  plan_status: PrivateLessonPlanStatus;
  target_date: string | null;
  focus_note: string | null;
  before_lesson_expectation: string | null;
  created_at: string;
  updated_at: string;
}

export interface PrivateLessonPlanDetail extends PrivateLessonPlan {
  classroom_name: string;
  student_name: string;
  next_assignment_title: string | null;
  next_template_title: string | null;
}

export function getPrivateLessonPlanStatusLabel(status: PrivateLessonPlanStatus) {
  switch (status) {
    case "planned":
      return "Planned";
    case "awaiting_assignment":
      return "Awaiting assignment";
    case "awaiting_completion":
      return "Awaiting completion";
    case "completed":
      return "Completed";
    case "stale":
      return "Stale";
    default:
      return status;
  }
}

export async function getPrivateLessonPlan(
  privateStudentId: string
): Promise<PrivateLessonPlanDetail | null> {
  return (
    (await queryOne<PrivateLessonPlanDetail>(
      `SELECT
         private_lesson_plans.*,
         classrooms.name AS classroom_name,
         "user".name AS student_name,
         assignments.title AS next_assignment_title,
         assignment_templates.title AS next_template_title
       FROM private_lesson_plans
       INNER JOIN private_students
         ON private_students.id = private_lesson_plans.private_student_id
       INNER JOIN classrooms
         ON classrooms.id = private_lesson_plans.classroom_id
       INNER JOIN "user"
         ON "user".id = private_students.student_user_id
       LEFT JOIN assignments
         ON assignments.id = private_lesson_plans.next_assignment_id
       LEFT JOIN assignment_templates
         ON assignment_templates.id = private_lesson_plans.next_template_id
       WHERE private_lesson_plans.private_student_id = $1
       LIMIT 1`,
      [privateStudentId]
    )) ?? null
  );
}

export async function getPrivateLessonPlanByClassroomId(
  classroomId: string
): Promise<PrivateLessonPlanDetail | null> {
  return (
    (await queryOne<PrivateLessonPlanDetail>(
      `SELECT
         private_lesson_plans.*,
         classrooms.name AS classroom_name,
         "user".name AS student_name,
         assignments.title AS next_assignment_title,
         assignment_templates.title AS next_template_title
       FROM private_lesson_plans
       INNER JOIN private_students
         ON private_students.id = private_lesson_plans.private_student_id
       INNER JOIN classrooms
         ON classrooms.id = private_lesson_plans.classroom_id
       INNER JOIN "user"
         ON "user".id = private_students.student_user_id
       LEFT JOIN assignments
         ON assignments.id = private_lesson_plans.next_assignment_id
       LEFT JOIN assignment_templates
         ON assignment_templates.id = private_lesson_plans.next_template_id
       WHERE private_lesson_plans.classroom_id = $1
       LIMIT 1`,
      [classroomId]
    )) ?? null
  );
}

export async function ensurePrivateLessonPlan(params: {
  privateStudentId: string;
  teacherUserId: string;
  classroomId: string;
}): Promise<PrivateLessonPlanDetail> {
  const existing = await getPrivateLessonPlan(params.privateStudentId);
  if (existing) return existing;

  const id = randomUUID();
  await execute(
    `INSERT INTO private_lesson_plans (
       id,
       private_student_id,
       teacher_user_id,
       classroom_id,
       plan_status
     )
     VALUES ($1, $2, $3, $4, 'awaiting_assignment')`,
    [id, params.privateStudentId, params.teacherUserId, params.classroomId]
  );

  const created = await getPrivateLessonPlan(params.privateStudentId);
  if (!created) {
    throw new Error("Failed to create private lesson plan.");
  }
  return created;
}

export async function updatePrivateLessonPlan(params: {
  privateStudentId: string;
  teacherUserId: string;
  planStatus: PrivateLessonPlanStatus;
  targetDate: string | null;
  focusNote: string | null;
  beforeLessonExpectation: string | null;
  nextAssignmentId: string | null;
  nextTemplateId: string | null;
}): Promise<void> {
  await execute(
    `UPDATE private_lesson_plans
     SET plan_status = $3,
         target_date = $4,
         focus_note = $5,
         before_lesson_expectation = $6,
         next_assignment_id = $7,
         next_template_id = $8,
         updated_at = NOW()
     WHERE private_student_id = $1
       AND teacher_user_id = $2`,
    [
      params.privateStudentId,
      params.teacherUserId,
      params.planStatus,
      params.targetDate,
      params.focusNote?.trim() || null,
      params.beforeLessonExpectation?.trim() || null,
      params.nextAssignmentId,
      params.nextTemplateId,
    ]
  );
}
