import { NextRequest, NextResponse } from "next/server";
import { getMobileUserId } from "@/lib/mobile-auth";
import { getGrammarPoints } from "@/lib/data";
import { isProUser } from "@/lib/subscription";

export async function GET(req: NextRequest) {
  const userId = await getMobileUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!(await isProUser(userId))) {
    return NextResponse.json({ locked: true, grammarPoints: [] });
  }

  const grammarPoints = await getGrammarPoints(userId);
  return NextResponse.json({ locked: false, grammarPoints });
}
