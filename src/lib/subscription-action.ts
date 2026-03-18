"use server";

import { auth } from "@/lib/auth";
import { getUserPlan, getSubscription } from "@/lib/subscription";
import { headers } from "next/headers";
import type { PlanId } from "./stripe";

export interface SubscriptionInfo {
  plan: PlanId;
  status: string | null;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
}

export async function getSubscriptionInfo(): Promise<SubscriptionInfo | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;

  const sub = await getSubscription(session.user.id);
  return {
    plan: await getUserPlan(session.user.id),
    status: sub?.status ?? null,
    cancelAtPeriodEnd: sub?.cancel_at_period_end === 1,
    currentPeriodEnd: sub?.current_period_end ?? null,
  };
}
