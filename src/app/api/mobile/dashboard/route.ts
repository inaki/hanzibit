import { NextRequest, NextResponse } from "next/server";
import { getMobileUserId } from "@/lib/mobile-auth";
import {
  getUserStreak,
  getUserProgress,
  getUserStats,
  getWeakFlashcards,
  getCharacterOfTheDay,
} from "@/lib/data";

export async function GET(req: NextRequest) {
  const userId = await getMobileUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const level = parseInt(req.nextUrl.searchParams.get("level") ?? "1", 10);

  const [streak, progress, stats, weakCards, characterOfTheDay] = await Promise.all([
    getUserStreak(userId),
    getUserProgress(userId, level),
    getUserStats(userId),
    getWeakFlashcards(userId, 5),
    getCharacterOfTheDay(level),
  ]);

  return NextResponse.json({ streak, progress, stats, weakCards, characterOfTheDay });
}
