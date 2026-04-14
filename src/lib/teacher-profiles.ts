import { randomUUID } from "crypto";
import { execute, query, queryOne } from "./db";

export interface TeacherProfile {
  id: string;
  teacher_user_id: string;
  public_slug: string;
  headline: string | null;
  bio: string | null;
  languages_json: string[];
  specialties_json: string[];
  levels_json: string[];
  timezone: string | null;
  pricing_summary: string | null;
  availability_summary: string | null;
  years_experience: number | null;
  teaching_style: string | null;
  is_public: number;
  created_at: string;
  updated_at: string;
}

interface TeacherIdentity {
  name: string;
  email: string;
}

function parseList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function createTeacherProfileSlug(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

  return slug || "teacher";
}

async function getTeacherIdentity(userId: string): Promise<TeacherIdentity | null> {
  return (
    (await queryOne<TeacherIdentity>(
      `SELECT name, email
       FROM "user"
       WHERE id = $1`,
      [userId]
    )) ?? null
  );
}

async function generateUniqueTeacherSlug(seed: string): Promise<string> {
  const base = createTeacherProfileSlug(seed);

  for (let attempt = 0; attempt < 20; attempt++) {
    const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`;
    const existing = await queryOne<{ id: string }>(
      `SELECT id
       FROM teacher_profiles
       WHERE public_slug = $1
       LIMIT 1`,
      [candidate]
    );
    if (!existing) return candidate;
  }

  return `${base}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export async function getTeacherProfileByTeacherUserId(
  teacherUserId: string
): Promise<TeacherProfile | null> {
  return (
    (await queryOne<TeacherProfile>(
      `SELECT *
       FROM teacher_profiles
       WHERE teacher_user_id = $1
       LIMIT 1`,
      [teacherUserId]
    )) ?? null
  );
}

export async function getTeacherProfileBySlug(
  slug: string
): Promise<TeacherProfile | null> {
  return (
    (await queryOne<TeacherProfile>(
      `SELECT *
       FROM teacher_profiles
       WHERE public_slug = $1
       LIMIT 1`,
      [slug]
    )) ?? null
  );
}

export async function ensureTeacherProfile(
  teacherUserId: string
): Promise<TeacherProfile> {
  const existing = await getTeacherProfileByTeacherUserId(teacherUserId);
  if (existing) return existing;

  const identity = await getTeacherIdentity(teacherUserId);
  const slug = await generateUniqueTeacherSlug(identity?.name || identity?.email || teacherUserId);

  await execute(
    `INSERT INTO teacher_profiles (
       id,
       teacher_user_id,
       public_slug,
       languages_json,
       specialties_json,
       levels_json
     )
     VALUES ($1, $2, $3, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb)`,
    [randomUUID(), teacherUserId, slug]
  );

  const created = await getTeacherProfileByTeacherUserId(teacherUserId);
  if (!created) {
    throw new Error("Failed to create teacher profile.");
  }
  return created;
}

export async function updateTeacherProfile(params: {
  teacherUserId: string;
  publicSlug: string;
  headline: string | null;
  bio: string | null;
  languages: string[];
  specialties: string[];
  levels: string[];
  timezone: string | null;
  pricingSummary: string | null;
  availabilitySummary: string | null;
  yearsExperience: number | null;
  teachingStyle: string | null;
  isPublic: boolean;
}): Promise<TeacherProfile> {
  const profile = await ensureTeacherProfile(params.teacherUserId);
  const requestedSlug = createTeacherProfileSlug(params.publicSlug || profile.public_slug);

  const slugOwner = await queryOne<{ teacher_user_id: string }>(
    `SELECT teacher_user_id
     FROM teacher_profiles
     WHERE public_slug = $1
     LIMIT 1`,
    [requestedSlug]
  );

  if (slugOwner && slugOwner.teacher_user_id !== params.teacherUserId) {
    throw new Error("Public profile slug is already in use.");
  }

  await execute(
    `UPDATE teacher_profiles
     SET public_slug = $2,
         headline = $3,
         bio = $4,
         languages_json = $5::jsonb,
         specialties_json = $6::jsonb,
         levels_json = $7::jsonb,
         timezone = $8,
         pricing_summary = $9,
         availability_summary = $10,
         years_experience = $11,
         teaching_style = $12,
         is_public = $13,
         updated_at = NOW()
     WHERE id = $1`,
    [
      profile.id,
      requestedSlug,
      params.headline,
      params.bio,
      JSON.stringify(params.languages),
      JSON.stringify(params.specialties),
      JSON.stringify(params.levels),
      params.timezone,
      params.pricingSummary,
      params.availabilitySummary,
      params.yearsExperience,
      params.teachingStyle,
      params.isPublic ? 1 : 0,
    ]
  );

  const updated = await getTeacherProfileByTeacherUserId(params.teacherUserId);
  if (!updated) {
    throw new Error("Failed to update teacher profile.");
  }
  return updated;
}

export async function getTeacherPublicProfileView(slug: string): Promise<{
  profile: TeacherProfile;
  teacher: TeacherIdentity;
} | null> {
  const row = await queryOne<
    TeacherProfile & {
      teacher_name: string;
      teacher_email: string;
    }
  >(
    `SELECT
       teacher_profiles.*,
       "user".name AS teacher_name,
       "user".email AS teacher_email
     FROM teacher_profiles
     INNER JOIN "user"
       ON "user".id = teacher_profiles.teacher_user_id
     WHERE teacher_profiles.public_slug = $1
       AND teacher_profiles.is_public = 1
     LIMIT 1`,
    [slug]
  );

  if (!row) return null;

  const { teacher_name, teacher_email, ...profile } = row;
  return {
    profile,
    teacher: {
      name: teacher_name,
      email: teacher_email,
    },
  };
}

export async function listPublicTeacherProfiles(): Promise<
  Array<
    TeacherProfile & {
      teacher_name: string;
    }
  >
> {
  return query<
    TeacherProfile & {
      teacher_name: string;
    }
  >(
    `SELECT
       teacher_profiles.*,
       "user".name AS teacher_name
     FROM teacher_profiles
     INNER JOIN "user"
       ON "user".id = teacher_profiles.teacher_user_id
     WHERE teacher_profiles.is_public = 1
     ORDER BY teacher_profiles.updated_at DESC`,
    []
  );
}

export { parseList };
