import { NextRequest } from "next/server";
import { getMobileUserId } from "@/lib/mobile-auth";
import { canAccessHskLevel } from "@/lib/gates";
import { getStudyGuideData } from "@/lib/data";
import { mobileError, mobileOk, parseLevel } from "@/lib/mobile-api";
import { getDailyPracticePlanForUser } from "@/lib/daily-practice-service";
import { buildStudyGuideDetailPayload } from "@/lib/mobile-phase1";

type Params = { params: Promise<{ wordId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const userId = await getMobileUserId(req);
  if (!userId) return mobileError("Unauthorized", 401);

  const level = parseLevel(req.nextUrl.searchParams.get("level") ?? "1");
  if (typeof level !== "number") return mobileError(level.error, 400);

  if (!(await canAccessHskLevel(userId, level))) {
    return mobileError("Locked", 403);
  }

  const { wordId } = await params;
  const parsedWordId = Number.parseInt(wordId, 10);
  if (!Number.isInteger(parsedWordId)) {
    return mobileError("wordId must be a number", 400);
  }

  const [studyGuideData, dailyPractice] = await Promise.all([
    getStudyGuideData(userId, level),
    getDailyPracticePlanForUser(userId, level),
  ]);
  const item = studyGuideData.words.find((word) => word.word.id === parsedWordId);
  if (!item) {
    return mobileError("Not found", 404);
  }

  return mobileOk({
    level,
    locked: false,
    ...buildStudyGuideDetailPayload({ level, item, dailyPractice }),
  });
}
