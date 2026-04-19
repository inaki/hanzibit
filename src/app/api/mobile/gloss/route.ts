import { NextRequest } from "next/server";
import { getMobileUserId } from "@/lib/mobile-auth";
import { glossContent } from "@/lib/gloss";
import { mobileError, mobileOk, requireObject, requireString } from "@/lib/mobile-api";
import { checkRateLimit } from "@/lib/rate-limit";

const MAX_CONTENT_CHARS = 10_000;

export async function POST(req: NextRequest) {
  const userId = await getMobileUserId(req);
  if (!userId) return mobileError("Unauthorized", 401);

  if (!checkRateLimit(`gloss:${userId}`, 30, 60_000)) {
    return mobileError("Rate limit exceeded", 429);
  }

  const parsedBody = requireObject(await req.json());
  if (!("error" in parsedBody)) {
    const content = requireString(parsedBody.content, "content");

    if (typeof content !== "string") return mobileError(content.error, 400);

    if (content.length > MAX_CONTENT_CHARS) {
      return mobileError(`Content must be under ${MAX_CONTENT_CHARS} characters`, 413);
    }

    const paragraphs = await glossContent(content);

    // Flatten each paragraph's GlossSegment objects into a plain JSON shape
    const result = paragraphs.map((para) =>
      para.map((seg) => {
        if (seg.type === "break") return { type: "break" };
        if (seg.type === "punctuation") return { type: "punctuation", char: seg.char };
        return {
          type: "gloss",
          hanzi: seg.token.hanzi,
          pinyin: seg.token.pinyin,
          english: seg.token.english,
          userAnnotated: seg.token.userAnnotated,
        };
      })
    );

    return mobileOk({ paragraphs: result });
  }
  return mobileError(parsedBody.error, 400);
}
