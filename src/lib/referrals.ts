import { randomUUID } from "crypto";
import { execute, query, queryOne } from "./db";

export const REFERRAL_COOKIE_NAME = "hanzibit_referral_code";
export const REFERRAL_COMMISSION_RATE = 0.25;

export interface ReferralCode {
  id: string;
  teacher_user_id: string;
  code: string;
  active: number;
  created_at: string;
  updated_at: string;
}

export interface ReferralAttribution {
  id: string;
  referral_code_id: string;
  teacher_user_id: string;
  student_user_id: string;
  referral_code: string;
  attribution_source: string;
  attributed_at: string;
  converted_at: string | null;
  stripe_checkout_session_id: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
}

export interface ReferralCommission {
  id: string;
  attribution_id: string;
  teacher_user_id: string;
  student_user_id: string;
  stripe_checkout_session_id: string | null;
  stripe_subscription_id: string | null;
  payout_id?: string | null;
  gross_amount_cents: number;
  commission_rate: number;
  commission_amount_cents: number;
  status: "pending" | "approved" | "paid" | "reversed";
  created_at: string;
  updated_at: string;
}

export interface TeacherPayout {
  id: string;
  teacher_user_id: string;
  period_label: string;
  total_amount_cents: number;
  status: "pending" | "paid";
  paid_at: string | null;
  created_at: string;
}

export interface TeacherReferralDashboard {
  code: ReferralCode;
  referredStudents: number;
  convertedStudents: number;
  pendingCommissionCents: number;
  paidCommissionCents: number;
  approvedCommissionCents: number;
  recentAttributions: Array<{
    attribution_id: string;
    student_user_id: string;
    student_name: string;
    student_email: string;
    attributed_at: string;
    converted_at: string | null;
  }>;
  recentCommissions: Array<ReferralCommission & {
    student_name: string;
    student_email: string;
  }>;
  payouts: TeacherPayout[];
}

function compactCode(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function normalizeReferralCode(value: string): string {
  return compactCode(value.trim());
}

function buildCandidateBase(seed: string): string {
  const compact = compactCode(seed);
  if (!compact) return "HANZI";
  return compact.slice(0, 6);
}

export function calculateReferralCommissionAmount(
  grossAmountCents: number,
  commissionRate = REFERRAL_COMMISSION_RATE
): number {
  return Math.round(grossAmountCents * commissionRate);
}

async function getUserIdentity(userId: string): Promise<{ name: string; email: string } | null> {
  return (
    (await queryOne<{ name: string; email: string }>(
      `SELECT name, email
       FROM "user"
       WHERE id = $1`,
      [userId]
    )) ?? null
  );
}

export async function getTeacherReferralCode(
  teacherUserId: string
): Promise<ReferralCode | null> {
  return (
    (await queryOne<ReferralCode>(
      `SELECT *
       FROM referral_codes
       WHERE teacher_user_id = $1
         AND active = 1
       ORDER BY created_at ASC
       LIMIT 1`,
      [teacherUserId]
    )) ?? null
  );
}

export async function getReferralCodeByCode(code: string): Promise<ReferralCode | null> {
  const normalized = normalizeReferralCode(code);
  if (!normalized) return null;

  return (
    (await queryOne<ReferralCode>(
      `SELECT *
       FROM referral_codes
       WHERE code = $1
         AND active = 1
       LIMIT 1`,
      [normalized]
    )) ?? null
  );
}

export async function ensureTeacherReferralCode(
  teacherUserId: string
): Promise<ReferralCode> {
  const existing = await getTeacherReferralCode(teacherUserId);
  if (existing) return existing;

  const identity = await getUserIdentity(teacherUserId);
  const base = buildCandidateBase(identity?.name || identity?.email || teacherUserId);

  for (let attempt = 0; attempt < 10; attempt++) {
    const suffix = attempt === 0 ? "" : `${Math.floor(100 + Math.random() * 900)}`;
    const candidate = `${base}${suffix}`;
    try {
      await execute(
        `INSERT INTO referral_codes (
           id,
           teacher_user_id,
           code
         )
         VALUES ($1, $2, $3)`,
        [randomUUID(), teacherUserId, candidate]
      );
      const created = await getReferralCodeByCode(candidate);
      if (created) return created;
    } catch {
      // Try another candidate on unique conflicts.
    }
  }

  throw new Error("Failed to generate a unique referral code.");
}

export async function getReferralAttributionForStudent(
  studentUserId: string
): Promise<ReferralAttribution | null> {
  return (
    (await queryOne<ReferralAttribution>(
      `SELECT *
       FROM referral_attributions
       WHERE student_user_id = $1
       LIMIT 1`,
      [studentUserId]
    )) ?? null
  );
}

export async function ensureReferralAttribution(params: {
  studentUserId: string;
  code: string;
  attributionSource?: string;
}): Promise<ReferralAttribution | null> {
  const normalized = normalizeReferralCode(params.code);
  if (!normalized) return null;

  const existing = await getReferralAttributionForStudent(params.studentUserId);
  if (existing) return existing;

  const referralCode = await getReferralCodeByCode(normalized);
  if (!referralCode) return null;
  if (referralCode.teacher_user_id === params.studentUserId) return null;

  const inserted = await queryOne<ReferralAttribution>(
    `INSERT INTO referral_attributions (
       id,
       referral_code_id,
       teacher_user_id,
       student_user_id,
       referral_code,
       attribution_source
     )
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (student_user_id) DO UPDATE
       SET student_user_id = referral_attributions.student_user_id
     RETURNING *`,
    [
      randomUUID(),
      referralCode.id,
      referralCode.teacher_user_id,
      params.studentUserId,
      referralCode.code,
      params.attributionSource || "referral_link",
    ]
  );

  return inserted ?? getReferralAttributionForStudent(params.studentUserId);
}

export async function markReferralConversion(params: {
  attributionId: string;
  stripeCheckoutSessionId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
}): Promise<void> {
  await execute(
    `UPDATE referral_attributions
     SET converted_at = COALESCE(converted_at, NOW()),
         stripe_checkout_session_id = COALESCE(stripe_checkout_session_id, $2),
         stripe_customer_id = COALESCE(stripe_customer_id, $3),
         stripe_subscription_id = COALESCE(stripe_subscription_id, $4)
     WHERE id = $1`,
    [
      params.attributionId,
      params.stripeCheckoutSessionId,
      params.stripeCustomerId,
      params.stripeSubscriptionId,
    ]
  );
}

export async function createReferralCommissionForCheckout(params: {
  attributionId: string;
  teacherUserId: string;
  studentUserId: string;
  stripeCheckoutSessionId: string;
  stripeSubscriptionId: string;
  grossAmountCents: number;
  commissionRate?: number;
}): Promise<void> {
  const rate = params.commissionRate ?? REFERRAL_COMMISSION_RATE;
  const commissionAmountCents = calculateReferralCommissionAmount(
    params.grossAmountCents,
    rate
  );

  await execute(
    `INSERT INTO referral_commissions (
       id,
       attribution_id,
       teacher_user_id,
       student_user_id,
       stripe_checkout_session_id,
       stripe_subscription_id,
       gross_amount_cents,
       commission_rate,
       commission_amount_cents,
       status
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')
     ON CONFLICT (stripe_checkout_session_id) DO NOTHING`,
    [
      randomUUID(),
      params.attributionId,
      params.teacherUserId,
      params.studentUserId,
      params.stripeCheckoutSessionId,
      params.stripeSubscriptionId,
      params.grossAmountCents,
      rate,
      commissionAmountCents,
    ]
  );
}

export async function listTeacherPayouts(
  teacherUserId: string
): Promise<TeacherPayout[]> {
  return query<TeacherPayout>(
    `SELECT *
     FROM teacher_payouts
     WHERE teacher_user_id = $1
     ORDER BY created_at DESC
     LIMIT 12`,
    [teacherUserId]
  );
}

export async function approveReferralCommission(commissionId: string): Promise<void> {
  await execute(
    `UPDATE referral_commissions
     SET status = 'approved',
         updated_at = NOW()
     WHERE id = $1
       AND status = 'pending'`,
    [commissionId]
  );
}

export async function createTeacherPayoutBatch(params: {
  teacherUserId: string;
  periodLabel?: string;
}): Promise<TeacherPayout | null> {
  const pending = await query<{
    id: string;
    commission_amount_cents: number;
  }>(
    `SELECT id, commission_amount_cents
     FROM referral_commissions
     WHERE teacher_user_id = $1
       AND status IN ('pending', 'approved')
       AND payout_id IS NULL
     ORDER BY created_at ASC`,
    [params.teacherUserId]
  );

  if (pending.length === 0) return null;

  const payoutId = randomUUID();
  const totalAmountCents = pending.reduce(
    (sum, commission) => sum + commission.commission_amount_cents,
    0
  );
  const periodLabel =
    params.periodLabel ||
    new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });

  await execute(
    `INSERT INTO teacher_payouts (
       id,
       teacher_user_id,
       period_label,
       total_amount_cents,
       status,
       paid_at
     )
     VALUES ($1, $2, $3, $4, 'paid', NOW())`,
    [payoutId, params.teacherUserId, periodLabel, totalAmountCents]
  );

  await execute(
    `UPDATE referral_commissions
     SET status = 'paid',
         payout_id = $2,
         updated_at = NOW()
     WHERE teacher_user_id = $1
       AND status IN ('pending', 'approved')
       AND payout_id IS NULL`,
    [params.teacherUserId, payoutId]
  );

  return (
    (await queryOne<TeacherPayout>(
    `SELECT *
     FROM teacher_payouts
     WHERE id = $1`,
    [payoutId]
    )) ?? null
  );
}

export async function overrideReferralAttribution(params: {
  studentEmail: string;
  referralCode: string;
}): Promise<{ studentUserId: string; attributionId: string } | null> {
  const normalizedCode = normalizeReferralCode(params.referralCode);
  if (!normalizedCode) return null;

  const student = await queryOne<{ id: string }>(
    `SELECT id
     FROM "user"
     WHERE LOWER(email) = LOWER($1)
     LIMIT 1`,
    [params.studentEmail.trim()]
  );
  if (!student) return null;

  const referralCode = await getReferralCodeByCode(normalizedCode);
  if (!referralCode) return null;
  if (referralCode.teacher_user_id === student.id) return null;

  const existing = await getReferralAttributionForStudent(student.id);
  if (existing) {
    await execute(
      `UPDATE referral_attributions
       SET referral_code_id = $2,
           teacher_user_id = $3,
           referral_code = $4,
           attribution_source = 'support_override'
       WHERE id = $1`,
      [existing.id, referralCode.id, referralCode.teacher_user_id, referralCode.code]
    );

    await execute(
      `UPDATE referral_commissions
       SET teacher_user_id = $2,
           updated_at = NOW()
       WHERE attribution_id = $1`,
      [existing.id, referralCode.teacher_user_id]
    );

    return {
      studentUserId: student.id,
      attributionId: existing.id,
    };
  }

  const attribution = await ensureReferralAttribution({
    studentUserId: student.id,
    code: referralCode.code,
    attributionSource: "support_override",
  });

  if (!attribution) return null;

  return {
    studentUserId: student.id,
    attributionId: attribution.id,
  };
}

export async function getTeacherReferralDashboard(
  teacherUserId: string
): Promise<TeacherReferralDashboard> {
  const code = await ensureTeacherReferralCode(teacherUserId);

  const [stats, recentAttributions, recentCommissions, payouts] = await Promise.all([
    queryOne<{
      referred_students: number;
      converted_students: number;
      pending_commission_cents: number | null;
      approved_commission_cents: number | null;
      paid_commission_cents: number | null;
    }>(
      `SELECT
         COUNT(DISTINCT referral_attributions.student_user_id)::int AS referred_students,
         COUNT(DISTINCT CASE WHEN referral_attributions.converted_at IS NOT NULL THEN referral_attributions.student_user_id END)::int AS converted_students,
         COALESCE(SUM(CASE WHEN referral_commissions.status = 'pending' THEN referral_commissions.commission_amount_cents ELSE 0 END), 0)::int AS pending_commission_cents,
         COALESCE(SUM(CASE WHEN referral_commissions.status = 'approved' THEN referral_commissions.commission_amount_cents ELSE 0 END), 0)::int AS approved_commission_cents,
         COALESCE(SUM(CASE WHEN referral_commissions.status = 'paid' THEN referral_commissions.commission_amount_cents ELSE 0 END), 0)::int AS paid_commission_cents
       FROM referral_codes
       LEFT JOIN referral_attributions
         ON referral_attributions.referral_code_id = referral_codes.id
       LEFT JOIN referral_commissions
         ON referral_commissions.attribution_id = referral_attributions.id
       WHERE referral_codes.teacher_user_id = $1`,
      [teacherUserId]
    ),
    query<{
      attribution_id: string;
      student_user_id: string;
      student_name: string;
      student_email: string;
      attributed_at: string;
      converted_at: string | null;
    }>(
      `SELECT
         referral_attributions.id AS attribution_id,
         referral_attributions.student_user_id,
         "user".name AS student_name,
         "user".email AS student_email,
         referral_attributions.attributed_at,
         referral_attributions.converted_at
       FROM referral_attributions
       INNER JOIN "user"
         ON "user".id = referral_attributions.student_user_id
       WHERE referral_attributions.teacher_user_id = $1
       ORDER BY referral_attributions.attributed_at DESC
       LIMIT 8`,
      [teacherUserId]
    ),
    query<ReferralCommission & { student_name: string; student_email: string }>(
      `SELECT
         referral_commissions.*,
         "user".name AS student_name,
         "user".email AS student_email
       FROM referral_commissions
       INNER JOIN "user"
         ON "user".id = referral_commissions.student_user_id
      WHERE referral_commissions.teacher_user_id = $1
       ORDER BY referral_commissions.created_at DESC
       LIMIT 8`,
      [teacherUserId]
    ),
    listTeacherPayouts(teacherUserId),
  ]);

  return {
    code,
    referredStudents: stats?.referred_students ?? 0,
    convertedStudents: stats?.converted_students ?? 0,
    pendingCommissionCents: stats?.pending_commission_cents ?? 0,
    approvedCommissionCents: stats?.approved_commission_cents ?? 0,
    paidCommissionCents: stats?.paid_commission_cents ?? 0,
    recentAttributions,
    recentCommissions,
    payouts,
  };
}
