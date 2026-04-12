import { NextRequest } from "next/server";
import { getMobileUserId } from "@/lib/mobile-auth";
import { getStudyGuideData } from "@/lib/data";
import { canAccessHskLevel } from "@/lib/gates";
import { mobileError, mobileOk } from "@/lib/mobile-api";

export async function GET(req: NextRequest) {
  const userId = await getMobileUserId(req);
  if (!userId) return mobileError("Unauthorized", 401);

  const level = parseInt(req.nextUrl.searchParams.get("level") ?? "1", 10);
  if (level < 1 || level > 6) {
    return mobileError("level must be between 1 and 6", 400);
  }

  if (!(await canAccessHskLevel(userId, level))) {
    return mobileOk({
      level,
      locked: true,
      words: [],
      grammarPoints: [],
      summary: { total: 0, encountered: 0, withFlashcard: 0, dueForReview: 0 },
    });
  }

  const data = await getStudyGuideData(userId, level);
  return mobileOk(data);
}
