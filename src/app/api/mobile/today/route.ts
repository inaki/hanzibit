import { NextRequest } from "next/server";
import { getMobileUserId } from "@/lib/mobile-auth";
import { mobileError, mobileOk, parseLevel } from "@/lib/mobile-api";
import { getDailyPracticePlanForUser } from "@/lib/daily-practice-service";

export async function GET(req: NextRequest) {
  const userId = await getMobileUserId(req);
  if (!userId) return mobileError("Unauthorized", 401);

  const level = parseLevel(req.nextUrl.searchParams.get("level") ?? "1");
  if (typeof level !== "number") return mobileError(level.error, 400);

  const plan = await getDailyPracticePlanForUser(userId, level);
  return mobileOk(plan);
}
