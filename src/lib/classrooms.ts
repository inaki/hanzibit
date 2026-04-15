import { randomUUID } from "crypto";
import { execute, query, queryOne, withTransaction } from "./db";

export type ClassroomMemberRole = "teacher" | "student";

export interface Classroom {
  id: string;
  teacher_user_id: string;
  name: string;
  description: string | null;
  join_code: string;
  is_private_tutoring: number;
  archived: number;
  created_at: string;
  updated_at: string;
}

export interface ClassroomMember {
  id: string;
  classroom_id: string;
  user_id: string;
  role: ClassroomMemberRole;
  joined_at: string;
}

export interface ClassroomWithRole extends Classroom {
  membership_role: ClassroomMemberRole;
}

function createJoinCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export async function isTeacherUser(userId: string): Promise<boolean> {
  const role = await queryOne<{ id: string }>(
    `SELECT id
     FROM user_roles
     WHERE user_id = $1
       AND role = 'teacher'
     LIMIT 1`,
    [userId]
  );
  return Boolean(role);
}

export async function grantTeacherRole(userId: string): Promise<void> {
  await execute(
    `INSERT INTO user_roles (id, user_id, role)
     VALUES ($1, $2, 'teacher')
     ON CONFLICT (user_id, role) DO NOTHING`,
    [randomUUID(), userId]
  );
}

export async function getClassroom(id: string): Promise<Classroom | undefined> {
  return queryOne<Classroom>("SELECT * FROM classrooms WHERE id = $1", [id]);
}

export async function getClassroomByJoinCode(joinCode: string): Promise<Classroom | undefined> {
  return queryOne<Classroom>(
    "SELECT * FROM classrooms WHERE join_code = $1 AND archived = 0",
    [joinCode.trim().toUpperCase()]
  );
}

export async function getClassroomMember(
  classroomId: string,
  userId: string
): Promise<ClassroomMember | undefined> {
  return queryOne<ClassroomMember>(
    `SELECT * FROM classroom_members
     WHERE classroom_id = $1
       AND user_id = $2`,
    [classroomId, userId]
  );
}

export async function listClassroomsForUser(userId: string): Promise<ClassroomWithRole[]> {
  return query<ClassroomWithRole>(
    `SELECT classrooms.*, classroom_members.role AS membership_role
     FROM classrooms
     INNER JOIN classroom_members
       ON classroom_members.classroom_id = classrooms.id
     WHERE classroom_members.user_id = $1
       AND classrooms.archived = 0
     ORDER BY classrooms.created_at DESC`,
    [userId]
  );
}

export async function listOwnedClassrooms(userId: string): Promise<Classroom[]> {
  return query<Classroom>(
    `SELECT *
     FROM classrooms
     WHERE teacher_user_id = $1
       AND archived = 0
     ORDER BY created_at DESC`,
    [userId]
  );
}

export async function getClassroomRoster(classroomId: string): Promise<
  Array<
    ClassroomMember & {
      name: string;
      email: string;
    }
  >
> {
  return query<
    ClassroomMember & {
      name: string;
      email: string;
    }
  >(
    `SELECT classroom_members.*, "user".name, "user".email
     FROM classroom_members
     INNER JOIN "user" ON "user".id = classroom_members.user_id
     WHERE classroom_members.classroom_id = $1
     ORDER BY classroom_members.role DESC, classroom_members.joined_at ASC`,
    [classroomId]
  );
}

export async function createClassroom(input: {
  teacherUserId: string;
  name: string;
  description?: string | null;
}): Promise<Classroom> {
  await grantTeacherRole(input.teacherUserId);

  return withTransaction(async (client) => {
    const classroomId = randomUUID();
    const memberId = randomUUID();
    let joinCode = createJoinCode();

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const existing = await client.query<{ id: string }>(
        "SELECT id FROM classrooms WHERE join_code = $1 LIMIT 1",
        [joinCode]
      );
      if (existing.rowCount === 0) break;
      joinCode = createJoinCode();
    }

    const classroomResult = await client.query<Classroom>(
      `INSERT INTO classrooms (
         id,
         teacher_user_id,
         name,
         description,
         join_code
       )
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        classroomId,
        input.teacherUserId,
        input.name.trim(),
        input.description?.trim() || null,
        joinCode,
      ]
    );

    await client.query(
      `INSERT INTO classroom_members (id, classroom_id, user_id, role)
       VALUES ($1, $2, $3, 'teacher')
       ON CONFLICT (classroom_id, user_id) DO NOTHING`,
      [memberId, classroomId, input.teacherUserId]
    );

    return classroomResult.rows[0];
  });
}

export async function joinClassroom(input: {
  userId: string;
  joinCode: string;
}): Promise<Classroom | undefined> {
  const classroom = await getClassroomByJoinCode(input.joinCode);
  if (!classroom) return undefined;

  await execute(
    `INSERT INTO classroom_members (id, classroom_id, user_id, role)
     VALUES ($1, $2, $3, 'student')
     ON CONFLICT (classroom_id, user_id) DO NOTHING`,
    [randomUUID(), classroom.id, input.userId]
  );

  return classroom;
}
