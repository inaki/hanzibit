import { randomUUID } from "crypto";
import { query, queryOne, withTransaction } from "./db";

export interface PrivateStudentReview {
  id: string;
  private_student_id: string;
  teacher_user_id: string;
  reviewed_at: string;
  summary: string;
  what_improved: string | null;
  what_needs_change: string | null;
  adaptation_note: string | null;
  created_at: string;
  updated_at: string;
}

export async function listPrivateStudentReviews(
  privateStudentId: string
): Promise<PrivateStudentReview[]> {
  return query<PrivateStudentReview>(
    `SELECT *
     FROM private_student_reviews
     WHERE private_student_id = $1
     ORDER BY reviewed_at DESC, created_at DESC`,
    [privateStudentId]
  );
}

export async function getLatestPrivateStudentReview(
  privateStudentId: string
): Promise<PrivateStudentReview | null> {
  return (
    (await queryOne<PrivateStudentReview>(
      `SELECT *
       FROM private_student_reviews
       WHERE private_student_id = $1
       ORDER BY reviewed_at DESC, created_at DESC
       LIMIT 1`,
      [privateStudentId]
    )) ?? null
  );
}

export async function createPrivateStudentReview(params: {
  privateStudentId: string;
  teacherUserId: string;
  summary: string;
  whatImproved?: string | null;
  whatNeedsChange?: string | null;
  adaptationNote?: string | null;
  reviewedAt?: string | null;
}): Promise<PrivateStudentReview> {
  const id = randomUUID();

  await withTransaction(async (client) => {
    await client.query(
      `INSERT INTO private_student_reviews (
         id,
         private_student_id,
         teacher_user_id,
         reviewed_at,
         summary,
         what_improved,
         what_needs_change,
         adaptation_note
       )
       VALUES ($1, $2, $3, COALESCE($4::timestamptz, NOW()), $5, $6, $7, $8)`,
      [
        id,
        params.privateStudentId,
        params.teacherUserId,
        params.reviewedAt ?? null,
        params.summary,
        params.whatImproved ?? null,
        params.whatNeedsChange ?? null,
        params.adaptationNote ?? null,
      ]
    );

    await client.query(
      `UPDATE private_students
       SET last_review_snapshot_at = COALESCE($3::timestamptz, NOW()),
           last_teacher_action_at = NOW(),
           updated_at = NOW()
       WHERE id = $1
         AND teacher_user_id = $2`,
      [params.privateStudentId, params.teacherUserId, params.reviewedAt ?? null]
    );
  });

  const created = await queryOne<PrivateStudentReview>(
    `SELECT *
     FROM private_student_reviews
     WHERE id = $1
     LIMIT 1`,
    [id]
  );

  if (!created) {
    throw new Error("Failed to create private learner review.");
  }

  return created;
}

export async function updatePrivateStudentReviewAdaptation(params: {
  reviewId: string;
  teacherUserId: string;
  adaptationNote: string | null;
}): Promise<void> {
  await query(
    `UPDATE private_student_reviews
     SET adaptation_note = $3,
         updated_at = NOW()
     WHERE id = $1
       AND teacher_user_id = $2`,
    [params.reviewId, params.teacherUserId, params.adaptationNote?.trim() || null]
  );
}
