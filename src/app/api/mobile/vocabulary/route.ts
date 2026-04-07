import { NextRequest, NextResponse } from "next/server";
import { getMobileUserId } from "@/lib/mobile-auth";
import { getVocabulary } from "@/lib/data";

export async function GET(req: NextRequest) {
  const userId = await getMobileUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const vocabulary = await getVocabulary(userId);
  return NextResponse.json(vocabulary);
}
