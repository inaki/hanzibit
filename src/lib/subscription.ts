import { getDb } from "./db";
import type { PlanId } from "./stripe";

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string | null;
  plan: PlanId;
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: number;
  created_at: string;
  updated_at: string;
}

export function getSubscription(userId: string): Subscription | null {
  const db = getDb();
  return (
    (db
      .prepare("SELECT * FROM subscriptions WHERE user_id = ?")
      .get(userId) as Subscription | undefined) ?? null
  );
}

export function getSubscriptionByCustomerId(
  stripeCustomerId: string
): Subscription | null {
  const db = getDb();
  return (
    (db
      .prepare("SELECT * FROM subscriptions WHERE stripe_customer_id = ?")
      .get(stripeCustomerId) as Subscription | undefined) ?? null
  );
}

export function upsertSubscription(data: {
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId?: string | null;
  plan?: PlanId;
  status?: string;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd?: boolean;
}): void {
  const db = getDb();
  const existing = getSubscription(data.userId);

  if (existing) {
    db.prepare(
      `UPDATE subscriptions SET
        stripe_customer_id = ?,
        stripe_subscription_id = COALESCE(?, stripe_subscription_id),
        plan = COALESCE(?, plan),
        status = COALESCE(?, status),
        current_period_end = COALESCE(?, current_period_end),
        cancel_at_period_end = COALESCE(?, cancel_at_period_end),
        updated_at = datetime('now')
      WHERE user_id = ?`
    ).run(
      data.stripeCustomerId,
      data.stripeSubscriptionId ?? null,
      data.plan ?? null,
      data.status ?? null,
      data.currentPeriodEnd ?? null,
      data.cancelAtPeriodEnd !== undefined
        ? data.cancelAtPeriodEnd
          ? 1
          : 0
        : null,
      data.userId
    );
  } else {
    const id = crypto.randomUUID();
    db.prepare(
      `INSERT INTO subscriptions (id, user_id, stripe_customer_id, stripe_subscription_id, plan, status, current_period_end, cancel_at_period_end)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      data.userId,
      data.stripeCustomerId,
      data.stripeSubscriptionId ?? null,
      data.plan ?? "free",
      data.status ?? "active",
      data.currentPeriodEnd ?? null,
      data.cancelAtPeriodEnd ? 1 : 0
    );
  }
}

export function getUserPlan(userId: string): PlanId {
  const sub = getSubscription(userId);
  if (!sub) return "free";
  if (sub.plan === "pro" && (sub.status === "active" || sub.status === "trialing")) {
    return "pro";
  }
  return "free";
}

export function isProUser(userId: string): boolean {
  return getUserPlan(userId) === "pro";
}
