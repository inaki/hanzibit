import { NextRequest } from "next/server";
import { getMobileUserId } from "@/lib/mobile-auth";
import { getVocabulary } from "@/lib/data";
import { mobileError, mobileOk } from "@/lib/mobile-api";

export async function GET(req: NextRequest) {
  const userId = await getMobileUserId(req);
  if (!userId) return mobileError("Unauthorized", 401);

  const vocabulary = await getVocabulary(userId);
  return mobileOk(vocabulary);
}
