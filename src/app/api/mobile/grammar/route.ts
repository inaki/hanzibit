import { NextRequest } from "next/server";
import { getMobileUserId } from "@/lib/mobile-auth";
import { getGrammarPoints } from "@/lib/data";
import { isProUser } from "@/lib/subscription";
import { mobileError, mobileOk } from "@/lib/mobile-api";

export async function GET(req: NextRequest) {
  const userId = await getMobileUserId(req);
  if (!userId) return mobileError("Unauthorized", 401);

  if (!(await isProUser(userId))) {
    return mobileOk({ locked: true, grammarPoints: [] });
  }

  const grammarPoints = await getGrammarPoints(userId);
  return mobileOk({ locked: false, grammarPoints });
}
