import { NextRequest } from "next/server";
import { getMobileUserId } from "@/lib/mobile-auth";
import { getDueFlashcards } from "@/lib/data";
import { mobileError, mobileOk } from "@/lib/mobile-api";

export async function GET(req: NextRequest) {
  const userId = await getMobileUserId(req);
  if (!userId) return mobileError("Unauthorized", 401);

  const cards = await getDueFlashcards(userId);
  return mobileOk(cards);
}
