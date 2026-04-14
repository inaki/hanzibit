import { randomUUID } from "crypto";
import { execute, query, queryOne, withTransaction } from "./db";

export type TeacherInquiryStatus = "pending" | "accepted" | "declined" | "converted";

export interface TeacherInquiry {
  id: string;
  teacher_user_id: string;
  student_user_id: string;
  message: string | null;
  status: TeacherInquiryStatus;
  created_classroom_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface TeacherInquiryListItem extends TeacherInquiry {
  teacher_name: string;
  teacher_email: string;
  student_name: string;
  student_email: string;
  classroom_name: string | null;
}

export async function createTeacherInquiry(params: {
  teacherUserId: string;
  studentUserId: string;
  message: string | null;
}): Promise<TeacherInquiryListItem> {
  const existing = await queryOne<TeacherInquiryListItem>(
    `SELECT
       teacher_inquiries.*,
       teacher_user.name AS teacher_name,
       teacher_user.email AS teacher_email,
       student_user.name AS student_name,
       student_user.email AS student_email,
       classrooms.name AS classroom_name
     FROM teacher_inquiries
     INNER JOIN "user" AS teacher_user
       ON teacher_user.id = teacher_inquiries.teacher_user_id
     INNER JOIN "user" AS student_user
       ON student_user.id = teacher_inquiries.student_user_id
     LEFT JOIN classrooms
       ON classrooms.id = teacher_inquiries.created_classroom_id
     WHERE teacher_inquiries.teacher_user_id = $1
       AND teacher_inquiries.student_user_id = $2
       AND teacher_inquiries.status = 'pending'
     ORDER BY teacher_inquiries.created_at DESC
     LIMIT 1`,
    [params.teacherUserId, params.studentUserId]
  );

  if (existing) {
    return existing;
  }

  const id = randomUUID();
  await execute(
    `INSERT INTO teacher_inquiries (
       id,
       teacher_user_id,
       student_user_id,
       message,
       status
     )
     VALUES ($1, $2, $3, $4, 'pending')`,
    [id, params.teacherUserId, params.studentUserId, params.message]
  );

  const created = await getTeacherInquiry(id);
  if (!created) throw new Error("Failed to create teacher inquiry.");
  return created;
}

export async function getTeacherInquiry(
  inquiryId: string
): Promise<TeacherInquiryListItem | null> {
  return (
    (await queryOne<TeacherInquiryListItem>(
      `SELECT
         teacher_inquiries.*,
         teacher_user.name AS teacher_name,
         teacher_user.email AS teacher_email,
         student_user.name AS student_name,
         student_user.email AS student_email,
         classrooms.name AS classroom_name
       FROM teacher_inquiries
       INNER JOIN "user" AS teacher_user
         ON teacher_user.id = teacher_inquiries.teacher_user_id
       INNER JOIN "user" AS student_user
         ON student_user.id = teacher_inquiries.student_user_id
       LEFT JOIN classrooms
         ON classrooms.id = teacher_inquiries.created_classroom_id
       WHERE teacher_inquiries.id = $1
       LIMIT 1`,
      [inquiryId]
    )) ?? null
  );
}

export async function listTeacherInquiries(
  teacherUserId: string
): Promise<TeacherInquiryListItem[]> {
  return query<TeacherInquiryListItem>(
    `SELECT
       teacher_inquiries.*,
       teacher_user.name AS teacher_name,
       teacher_user.email AS teacher_email,
       student_user.name AS student_name,
       student_user.email AS student_email,
       classrooms.name AS classroom_name
     FROM teacher_inquiries
     INNER JOIN "user" AS teacher_user
       ON teacher_user.id = teacher_inquiries.teacher_user_id
     INNER JOIN "user" AS student_user
       ON student_user.id = teacher_inquiries.student_user_id
     LEFT JOIN classrooms
       ON classrooms.id = teacher_inquiries.created_classroom_id
     WHERE teacher_inquiries.teacher_user_id = $1
     ORDER BY
       CASE teacher_inquiries.status
         WHEN 'pending' THEN 0
         WHEN 'accepted' THEN 1
         WHEN 'converted' THEN 2
         WHEN 'declined' THEN 3
         ELSE 4
       END,
       teacher_inquiries.created_at DESC`,
    [teacherUserId]
  );
}

export async function listStudentInquiries(
  studentUserId: string
): Promise<TeacherInquiryListItem[]> {
  return query<TeacherInquiryListItem>(
    `SELECT
       teacher_inquiries.*,
       teacher_user.name AS teacher_name,
       teacher_user.email AS teacher_email,
       student_user.name AS student_name,
       student_user.email AS student_email,
       classrooms.name AS classroom_name
     FROM teacher_inquiries
     INNER JOIN "user" AS teacher_user
       ON teacher_user.id = teacher_inquiries.teacher_user_id
     INNER JOIN "user" AS student_user
       ON student_user.id = teacher_inquiries.student_user_id
     LEFT JOIN classrooms
       ON classrooms.id = teacher_inquiries.created_classroom_id
     WHERE teacher_inquiries.student_user_id = $1
     ORDER BY teacher_inquiries.created_at DESC`,
    [studentUserId]
  );
}

export async function respondToTeacherInquiry(params: {
  inquiryId: string;
  teacherUserId: string;
  status: Exclude<TeacherInquiryStatus, "pending">;
}): Promise<TeacherInquiryListItem> {
  await execute(
    `UPDATE teacher_inquiries
     SET status = $3,
         updated_at = NOW()
     WHERE id = $1
       AND teacher_user_id = $2`,
    [params.inquiryId, params.teacherUserId, params.status]
  );

  const updated = await getTeacherInquiry(params.inquiryId);
  if (!updated) throw new Error("Failed to update teacher inquiry.");
  return updated;
}

function createJoinCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export async function convertInquiryToClassroom(params: {
  inquiryId: string;
  teacherUserId: string;
  classroomName?: string | null;
}): Promise<TeacherInquiryListItem> {
  return withTransaction(async (client) => {
    const inquiryResult = await client.query<
      TeacherInquiry & { student_name: string }
    >(
      `SELECT teacher_inquiries.*, student_user.name AS student_name
       FROM teacher_inquiries
       INNER JOIN "user" AS student_user
         ON student_user.id = teacher_inquiries.student_user_id
       WHERE teacher_inquiries.id = $1
         AND teacher_inquiries.teacher_user_id = $2
       LIMIT 1`,
      [params.inquiryId, params.teacherUserId]
    );

    const inquiry = inquiryResult.rows[0];
    if (!inquiry) {
      throw new Error("Inquiry not found.");
    }

    if (!["accepted", "converted"].includes(inquiry.status)) {
      throw new Error("Only accepted inquiries can be converted.");
    }

    if (inquiry.created_classroom_id) {
      const existing = await getTeacherInquiry(inquiry.id);
      if (!existing) throw new Error("Inquiry classroom not found.");
      return existing;
    }

    let joinCode = createJoinCode();
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const existing = await client.query<{ id: string }>(
        "SELECT id FROM classrooms WHERE join_code = $1 LIMIT 1",
        [joinCode]
      );
      if (existing.rowCount === 0) break;
      joinCode = createJoinCode();
    }

    const classroomId = randomUUID();
    const teacherMemberId = randomUUID();
    const studentMemberId = randomUUID();
    const classroomName =
      params.classroomName?.trim() || `${inquiry.student_name} Private Classroom`;

    await client.query(
      `INSERT INTO classrooms (
         id,
         teacher_user_id,
         name,
         description,
         join_code
       )
       VALUES ($1, $2, $3, $4, $5)`,
      [
        classroomId,
        params.teacherUserId,
        classroomName,
        "Created from a teacher inquiry.",
        joinCode,
      ]
    );

    await client.query(
      `INSERT INTO classroom_members (id, classroom_id, user_id, role)
       VALUES
         ($1, $2, $3, 'teacher'),
         ($4, $2, $5, 'student')
       ON CONFLICT (classroom_id, user_id) DO NOTHING`,
      [
        teacherMemberId,
        classroomId,
        params.teacherUserId,
        studentMemberId,
        inquiry.student_user_id,
      ]
    );

    await client.query(
      `UPDATE teacher_inquiries
       SET status = 'converted',
           created_classroom_id = $2,
           updated_at = NOW()
       WHERE id = $1`,
      [params.inquiryId, classroomId]
    );

    const converted = await getTeacherInquiry(params.inquiryId);
    if (!converted) throw new Error("Failed to convert inquiry.");
    return converted;
  });
}
