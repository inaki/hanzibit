import { queryOne } from "./db";

export async function canManageClassroom(
  userId: string,
  classroomId: string
): Promise<boolean> {
  const row = await queryOne<{ id: string }>(
    `SELECT id
     FROM classrooms
     WHERE id = $1
       AND teacher_user_id = $2
     LIMIT 1`,
    [classroomId, userId]
  );
  return Boolean(row);
}

export async function canViewClassroom(
  userId: string,
  classroomId: string
): Promise<boolean> {
  const row = await queryOne<{ id: string }>(
    `SELECT id
     FROM classroom_members
     WHERE classroom_id = $1
       AND user_id = $2
     LIMIT 1`,
    [classroomId, userId]
  );
  return Boolean(row);
}

export async function canViewAssignment(
  userId: string,
  assignmentId: string
): Promise<boolean> {
  const row = await queryOne<{ id: string }>(
    `SELECT assignments.id
     FROM assignments
     INNER JOIN classroom_members
       ON classroom_members.classroom_id = assignments.classroom_id
     WHERE assignments.id = $1
       AND classroom_members.user_id = $2
     LIMIT 1`,
    [assignmentId, userId]
  );
  return Boolean(row);
}

export async function canSubmitAssignment(
  userId: string,
  assignmentId: string
): Promise<boolean> {
  const row = await queryOne<{ id: string }>(
    `SELECT assignments.id
     FROM assignments
     INNER JOIN classroom_members
       ON classroom_members.classroom_id = assignments.classroom_id
     WHERE assignments.id = $1
       AND classroom_members.user_id = $2
       AND classroom_members.role = 'student'
     LIMIT 1`,
    [assignmentId, userId]
  );
  return Boolean(row);
}

export async function canReviewSubmission(
  userId: string,
  submissionId: string
): Promise<boolean> {
  const row = await queryOne<{ id: string }>(
    `SELECT assignment_submissions.id
     FROM assignment_submissions
     INNER JOIN assignments
       ON assignments.id = assignment_submissions.assignment_id
     INNER JOIN classroom_members
       ON classroom_members.classroom_id = assignments.classroom_id
     WHERE assignment_submissions.id = $1
       AND classroom_members.user_id = $2
       AND classroom_members.role = 'teacher'
     LIMIT 1`,
    [submissionId, userId]
  );
  return Boolean(row);
}

export async function canViewSubmission(
  userId: string,
  submissionId: string
): Promise<boolean> {
  const row = await queryOne<{ id: string }>(
    `SELECT assignment_submissions.id
     FROM assignment_submissions
     INNER JOIN assignments
       ON assignments.id = assignment_submissions.assignment_id
     INNER JOIN classroom_members
       ON classroom_members.classroom_id = assignments.classroom_id
     WHERE assignment_submissions.id = $1
       AND classroom_members.user_id = $2
       AND (
         classroom_members.role = 'teacher'
         OR assignment_submissions.student_user_id = $2
       )
     LIMIT 1`,
    [submissionId, userId]
  );
  return Boolean(row);
}

export async function canManageTeacherResource(
  userId: string,
  resourceId: string
): Promise<boolean> {
  const row = await queryOne<{ id: string }>(
    `SELECT id
     FROM teacher_resources
     WHERE id = $1
       AND teacher_user_id = $2
     LIMIT 1`,
    [resourceId, userId]
  );
  return Boolean(row);
}

export async function canViewTeacherResource(
  userId: string,
  resourceId: string
): Promise<boolean> {
  return canManageTeacherResource(userId, resourceId);
}

export async function canManageAssignmentTemplate(
  userId: string,
  templateId: string
): Promise<boolean> {
  const row = await queryOne<{ id: string }>(
    `SELECT id
     FROM assignment_templates
     WHERE id = $1
       AND teacher_user_id = $2
     LIMIT 1`,
    [templateId, userId]
  );
  return Boolean(row);
}

export async function canUseTemplateInClassroom(
  userId: string,
  templateId: string,
  classroomId: string
): Promise<boolean> {
  const row = await queryOne<{ id: string }>(
    `SELECT assignment_templates.id
     FROM assignment_templates
     INNER JOIN classrooms
       ON classrooms.teacher_user_id = assignment_templates.teacher_user_id
     WHERE assignment_templates.id = $1
       AND classrooms.id = $2
       AND classrooms.teacher_user_id = $3
     LIMIT 1`,
    [templateId, classroomId, userId]
  );
  return Boolean(row);
}

export async function canViewTeacherReporting(
  userId: string,
  classroomId: string
): Promise<boolean> {
  return canManageClassroom(userId, classroomId);
}

export async function canManageReferralCode(
  userId: string,
  referralCodeId: string
): Promise<boolean> {
  const row = await queryOne<{ id: string }>(
    `SELECT id
     FROM referral_codes
     WHERE id = $1
       AND teacher_user_id = $2
     LIMIT 1`,
    [referralCodeId, userId]
  );
  return Boolean(row);
}

export async function canViewReferralDashboard(userId: string): Promise<boolean> {
  const row = await queryOne<{ id: string }>(
    `SELECT id
     FROM user_roles
     WHERE user_id = $1
       AND role = 'teacher'
     LIMIT 1`,
    [userId]
  );
  return Boolean(row);
}
