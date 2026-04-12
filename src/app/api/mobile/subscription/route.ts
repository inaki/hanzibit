import { NextRequest } from "next/server";
import { getMobileUserId } from "@/lib/mobile-auth";
import { getSubscription } from "@/lib/subscription";
import { mobileError, mobileOk } from "@/lib/mobile-api";

export async function GET(req: NextRequest) {
  const userId = await getMobileUserId(req);
  if (!userId) return mobileError("Unauthorized", 401);

  const sub = await getSubscription(userId);

  if (!sub) {
    return mobileOk({ plan: "free", status: "none" });
  }

  return mobileOk({
    plan: sub.plan,
    status: sub.status,
    current_period_end: sub.current_period_end,
    cancel_at_period_end: sub.cancel_at_period_end === 1,
  });
}
