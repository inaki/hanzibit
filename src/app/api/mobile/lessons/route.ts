import { NextRequest, NextResponse } from "next/server";
import { getMobileUserId } from "@/lib/mobile-auth";
import { getStudyGuideData } from "@/lib/data";
import { canAccessHskLevel } from "@/lib/gates";

export async function GET(req: NextRequest) {
  const userId = await getMobileUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const level = parseInt(req.nextUrl.searchParams.get("level") ?? "1", 10);
  if (level < 1 || level > 6) {
    return NextResponse.json({ error: "level must be between 1 and 6" }, { status: 400 });
  }

  if (!(await canAccessHskLevel(userId, level))) {
    return NextResponse.json({
      level,
      locked: true,
      words: [],
      grammarPoints: [],
      summary: { total: 0, encountered: 0, withFlashcard: 0, dueForReview: 0 },
    });
  }

  const data = await getStudyGuideData(userId, level);
  return NextResponse.json(data);
}
