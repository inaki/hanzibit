import { NextRequest } from "next/server";
import { getMobileUserId } from "@/lib/mobile-auth";
import {
  getUserStreak,
  getUserProgress,
  getUserStats,
  getWeakFlashcards,
  getCharacterOfTheDay,
} from "@/lib/data";
import { mobileError, mobileOk } from "@/lib/mobile-api";

export async function GET(req: NextRequest) {
  const userId = await getMobileUserId(req);
  if (!userId) return mobileError("Unauthorized", 401);

  const level = parseInt(req.nextUrl.searchParams.get("level") ?? "1", 10);

  const [streak, progress, stats, weakCards, characterOfTheDay] = await Promise.all([
    getUserStreak(userId),
    getUserProgress(userId, level),
    getUserStats(userId),
    getWeakFlashcards(userId, 5),
    getCharacterOfTheDay(level),
  ]);

  return mobileOk({ streak, progress, stats, weakCards, characterOfTheDay });
}
