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

export async function canManageTeacherStrategy(
  userId: string,
  strategyId: string
): Promise<boolean> {
  const row = await queryOne<{ id: string }>(
    `SELECT id
     FROM teacher_strategies
     WHERE id = $1
       AND teacher_user_id = $2
     LIMIT 1`,
    [strategyId, userId]
  );
  return Boolean(row);
}

export async function canManageTeacherPlaybook(
  userId: string,
  playbookId: string
): Promise<boolean> {
  const row = await queryOne<{ id: string }>(
    `SELECT id
     FROM teacher_playbooks
     WHERE id = $1
       AND teacher_user_id = $2
     LIMIT 1`,
    [playbookId, userId]
  );
  return Boolean(row);
}

export async function canApplyTeacherStrategy(
  userId: string,
  privateStudentId: string,
  strategyId: string
): Promise<boolean> {
  const row = await queryOne<{ id: string }>(
    `SELECT private_students.id
     FROM private_students
     INNER JOIN teacher_strategies
       ON teacher_strategies.teacher_user_id = private_students.teacher_user_id
     WHERE private_students.id = $1
       AND private_students.teacher_user_id = $2
       AND teacher_strategies.id = $3
     LIMIT 1`,
    [privateStudentId, userId, strategyId]
  );
  return Boolean(row);
}

export async function canApplyTeacherPlaybook(
  userId: string,
  privateStudentId: string,
  playbookId: string
): Promise<boolean> {
  const row = await queryOne<{ id: string }>(
    `SELECT private_students.id
     FROM private_students
     INNER JOIN teacher_playbooks
       ON teacher_playbooks.teacher_user_id = private_students.teacher_user_id
     WHERE private_students.id = $1
       AND private_students.teacher_user_id = $2
       AND teacher_playbooks.id = $3
     LIMIT 1`,
    [privateStudentId, userId, playbookId]
  );
  return Boolean(row);
}

export async function canRecordTeacherStrategyOutcome(
  userId: string,
  strategyApplicationId: string
): Promise<boolean> {
  const row = await queryOne<{ id: string }>(
    `SELECT private_student_strategy_applications.id
     FROM private_student_strategy_applications
     INNER JOIN private_students
       ON private_students.id = private_student_strategy_applications.private_student_id
     WHERE private_student_strategy_applications.id = $1
       AND private_students.teacher_user_id = $2
     LIMIT 1`,
    [strategyApplicationId, userId]
  );
  return Boolean(row);
}

export async function canRecordTeacherPlaybookOutcome(
  userId: string,
  playbookApplicationId: string
): Promise<boolean> {
  const row = await queryOne<{ id: string }>(
    `SELECT private_student_playbook_applications.id
     FROM private_student_playbook_applications
     INNER JOIN private_students
       ON private_students.id = private_student_playbook_applications.private_student_id
     WHERE private_student_playbook_applications.id = $1
       AND private_students.teacher_user_id = $2
     LIMIT 1`,
    [playbookApplicationId, userId]
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

export async function canManageTeacherProfile(
  userId: string,
  profileId: string
): Promise<boolean> {
  const row = await queryOne<{ id: string }>(
    `SELECT id
     FROM teacher_profiles
     WHERE id = $1
       AND teacher_user_id = $2
     LIMIT 1`,
    [profileId, userId]
  );
  return Boolean(row);
}

export async function canManageTeacherTutoringSetup(
  userId: string,
  setupId: string
): Promise<boolean> {
  const row = await queryOne<{ id: string }>(
    `SELECT id
     FROM teacher_tutoring_settings
     WHERE id = $1
       AND teacher_user_id = $2
     LIMIT 1`,
    [setupId, userId]
  );
  return Boolean(row);
}

export async function canManagePrivateLearnerState(
  userId: string,
  privateStudentId: string
): Promise<boolean> {
  const row = await queryOne<{ id: string }>(
    `SELECT id
     FROM private_students
     WHERE id = $1
       AND teacher_user_id = $2
     LIMIT 1`,
    [privateStudentId, userId]
  );
  return Boolean(row);
}

export async function canManagePrivateLearnerPlan(
  userId: string,
  privateStudentId: string
): Promise<boolean> {
  return canManagePrivateLearnerState(userId, privateStudentId);
}

export async function canManagePrivateLearnerAdaptation(
  userId: string,
  privateStudentId: string
): Promise<boolean> {
  return canManagePrivateLearnerState(userId, privateStudentId);
}

export async function canManagePrivateLearnerGoals(
  userId: string,
  privateStudentId: string
): Promise<boolean> {
  return canManagePrivateLearnerState(userId, privateStudentId);
}

export async function canManagePrivateLearnerReview(
  userId: string,
  privateStudentId: string
): Promise<boolean> {
  return canManagePrivateLearnerState(userId, privateStudentId);
}

export async function canManagePrivateLearnerHistory(
  userId: string,
  privateStudentId: string
): Promise<boolean> {
  return canManagePrivateLearnerState(userId, privateStudentId);
}

export async function canViewPrivateLearnerState(
  userId: string,
  privateStudentId: string
): Promise<boolean> {
  const row = await queryOne<{ id: string }>(
    `SELECT id
     FROM private_students
     WHERE id = $1
       AND (teacher_user_id = $2 OR student_user_id = $2)
     LIMIT 1`,
    [privateStudentId, userId]
  );
  return Boolean(row);
}

export async function canManagePrivateClassroomWorkflow(
  userId: string,
  classroomId: string
): Promise<boolean> {
  return canManageClassroom(userId, classroomId);
}

export async function canViewTeacherInquiry(
  userId: string,
  inquiryId: string
): Promise<boolean> {
  const row = await queryOne<{ id: string }>(
    `SELECT id
     FROM teacher_inquiries
     WHERE id = $1
       AND (teacher_user_id = $2 OR student_user_id = $2)
     LIMIT 1`,
    [inquiryId, userId]
  );
  return Boolean(row);
}

export async function canRespondToTeacherInquiry(
  userId: string,
  inquiryId: string
): Promise<boolean> {
  const row = await queryOne<{ id: string }>(
    `SELECT id
     FROM teacher_inquiries
     WHERE id = $1
       AND teacher_user_id = $2
     LIMIT 1`,
    [inquiryId, userId]
  );
  return Boolean(row);
}

export async function canViewOwnInquiry(
  userId: string,
  inquiryId: string
): Promise<boolean> {
  return canViewTeacherInquiry(userId, inquiryId);
}

export async function canConvertInquiryToClassroom(
  userId: string,
  inquiryId: string
): Promise<boolean> {
  const row = await queryOne<{ id: string }>(
    `SELECT id
     FROM teacher_inquiries
     WHERE id = $1
       AND teacher_user_id = $2
       AND status IN ('accepted', 'converted')
     LIMIT 1`,
    [inquiryId, userId]
  );
  return Boolean(row);
}
