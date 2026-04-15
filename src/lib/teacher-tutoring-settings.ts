import { randomUUID } from "crypto";
import { execute, queryOne } from "./db";

export interface TeacherTutoringSettings {
  id: string;
  teacher_user_id: string;
  default_template_id: string | null;
  intro_message: string | null;
  default_private_classroom_prefix: string | null;
  cadence_type: string | null;
  target_session_length_minutes: number | null;
  cadence_notes: string | null;
  format_notes: string | null;
  created_at: string;
  updated_at: string;
}

export function getCadenceLabel(cadenceType: string | null) {
  switch (cadenceType) {
    case "weekly":
      return "Weekly";
    case "twice_weekly":
      return "Twice weekly";
    case "flexible":
      return "Flexible";
    case "async_support":
      return "Async support";
    default:
      return "Not set";
  }
}

export async function getTeacherTutoringSettings(
  teacherUserId: string
): Promise<TeacherTutoringSettings | null> {
  return (
    (await queryOne<TeacherTutoringSettings>(
      `SELECT *
       FROM teacher_tutoring_settings
       WHERE teacher_user_id = $1
       LIMIT 1`,
      [teacherUserId]
    )) ?? null
  );
}

export async function ensureTeacherTutoringSettings(
  teacherUserId: string
): Promise<TeacherTutoringSettings> {
  const existing = await getTeacherTutoringSettings(teacherUserId);
  if (existing) return existing;

  const id = randomUUID();
  await execute(
    `INSERT INTO teacher_tutoring_settings (
       id,
       teacher_user_id
     )
     VALUES ($1, $2)`,
    [id, teacherUserId]
  );

  const created = await getTeacherTutoringSettings(teacherUserId);
  if (!created) {
    throw new Error("Failed to create teacher tutoring settings.");
  }
  return created;
}

export async function updateTeacherTutoringSettings(params: {
  teacherUserId: string;
  defaultTemplateId: string | null;
  introMessage: string | null;
  defaultPrivateClassroomPrefix: string | null;
  cadenceType: string | null;
  targetSessionLengthMinutes: number | null;
  cadenceNotes: string | null;
  formatNotes: string | null;
}): Promise<TeacherTutoringSettings> {
  const settings = await ensureTeacherTutoringSettings(params.teacherUserId);

  await execute(
    `UPDATE teacher_tutoring_settings
     SET default_template_id = $2,
         intro_message = $3,
         default_private_classroom_prefix = $4,
         cadence_type = $5,
         target_session_length_minutes = $6,
         cadence_notes = $7,
         format_notes = $8,
         updated_at = NOW()
     WHERE id = $1`,
    [
      settings.id,
      params.defaultTemplateId,
      params.introMessage,
      params.defaultPrivateClassroomPrefix,
      params.cadenceType,
      params.targetSessionLengthMinutes,
      params.cadenceNotes,
      params.formatNotes,
    ]
  );

  const updated = await getTeacherTutoringSettings(params.teacherUserId);
  if (!updated) {
    throw new Error("Failed to update teacher tutoring settings.");
  }
  return updated;
}
