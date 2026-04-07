import { NextRequest, NextResponse } from "next/server";
import { getMobileUserId } from "@/lib/mobile-auth";
import { getSubscription } from "@/lib/subscription";

export async function GET(req: NextRequest) {
  const userId = await getMobileUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sub = await getSubscription(userId);

  if (!sub) {
    return NextResponse.json({ plan: "free", status: "none" });
  }

  return NextResponse.json({
    plan: sub.plan,
    status: sub.status,
    current_period_end: sub.current_period_end,
    cancel_at_period_end: sub.cancel_at_period_end === 1,
  });
}
