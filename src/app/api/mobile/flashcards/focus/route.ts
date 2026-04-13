import { NextRequest } from "next/server";
import { getMobileUserId } from "@/lib/mobile-auth";
import { mobileError, mobileOk, parseLevel } from "@/lib/mobile-api";
import { getDailyPracticePlanForUser } from "@/lib/daily-practice-service";
import { buildFocusedReviewPayload } from "@/lib/mobile-phase1";

export async function GET(req: NextRequest) {
  const userId = await getMobileUserId(req);
  if (!userId) return mobileError("Unauthorized", 401);

  const level = parseLevel(req.nextUrl.searchParams.get("level") ?? "1");
  if (typeof level !== "number") return mobileError(level.error, 400);

  const dailyPractice = await getDailyPracticePlanForUser(userId, level);
  return mobileOk(buildFocusedReviewPayload({ level, dailyPractice }));
}
