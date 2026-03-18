import { randomUUID } from "crypto";
import { execute, queryOne } from "./db";
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

export async function getSubscription(userId: string): Promise<Subscription | null> {
  return (
    (await queryOne<Subscription>(
      "SELECT * FROM subscriptions WHERE user_id = $1",
      [userId]
    )) ?? null
  );
}

export async function getSubscriptionByCustomerId(
  stripeCustomerId: string
): Promise<Subscription | null> {
  return (
    (await queryOne<Subscription>(
      "SELECT * FROM subscriptions WHERE stripe_customer_id = $1",
      [stripeCustomerId]
    )) ?? null
  );
}

export async function upsertSubscription(data: {
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId?: string | null;
  plan?: PlanId;
  status?: string;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd?: boolean;
}): Promise<void> {
  await execute(
    `INSERT INTO subscriptions (
       id,
       user_id,
       stripe_customer_id,
       stripe_subscription_id,
       plan,
       status,
       current_period_end,
       cancel_at_period_end
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (user_id) DO UPDATE SET
       stripe_customer_id = EXCLUDED.stripe_customer_id,
       stripe_subscription_id = COALESCE(EXCLUDED.stripe_subscription_id, subscriptions.stripe_subscription_id),
       plan = COALESCE(EXCLUDED.plan, subscriptions.plan),
       status = COALESCE(EXCLUDED.status, subscriptions.status),
       current_period_end = COALESCE(EXCLUDED.current_period_end, subscriptions.current_period_end),
       cancel_at_period_end = COALESCE(EXCLUDED.cancel_at_period_end, subscriptions.cancel_at_period_end),
       updated_at = NOW()`,
    [
      randomUUID(),
      data.userId,
      data.stripeCustomerId,
      data.stripeSubscriptionId ?? null,
      data.plan ?? "free",
      data.status ?? "active",
      data.currentPeriodEnd ?? null,
      data.cancelAtPeriodEnd !== undefined
        ? data.cancelAtPeriodEnd
          ? 1
          : 0
        : 0,
    ]
  );
}

export async function getUserPlan(userId: string): Promise<PlanId> {
  const sub = await getSubscription(userId);
  if (!sub) return "free";
  if (sub.plan === "pro" && (sub.status === "active" || sub.status === "trialing")) {
    return "pro";
  }
  return "free";
}

export async function isProUser(userId: string): Promise<boolean> {
  return (await getUserPlan(userId)) === "pro";
}
