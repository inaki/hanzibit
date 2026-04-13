import { NextRequest } from "next/server";
import { getMobileUserId } from "@/lib/mobile-auth";
import {
  getUserStreak,
  getUserProgress,
  getUserStats,
  getWeakFlashcards,
  getCharacterOfTheDay,
} from "@/lib/data";
import { mobileError, mobileOk, parseLevel } from "@/lib/mobile-api";

export async function GET(req: NextRequest) {
  const userId = await getMobileUserId(req);
  if (!userId) return mobileError("Unauthorized", 401);

  const level = parseLevel(req.nextUrl.searchParams.get("level") ?? "1");
  if (typeof level !== "number") return mobileError(level.error, 400);

  const [streak, progress, stats, weakCards, characterOfTheDay] = await Promise.all([
    getUserStreak(userId),
    getUserProgress(userId, level),
    getUserStats(userId),
    getWeakFlashcards(userId, 5),
    getCharacterOfTheDay(level),
  ]);

  return mobileOk({
    streak,
    progress,
    stats,
    weakCards,
    characterOfTheDay: characterOfTheDay
      ? {
          id: characterOfTheDay.id,
          simplified: characterOfTheDay.simplified,
          traditional: characterOfTheDay.traditional,
          pinyin: characterOfTheDay.pinyin,
          english: characterOfTheDay.english,
          hsk_level: characterOfTheDay.hsk_level,
        }
      : null,
  });
}
