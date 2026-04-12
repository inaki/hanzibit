import { NextRequest } from "next/server";
import { getMobileUserId } from "@/lib/mobile-auth";
import { glossContent } from "@/lib/gloss";
import { mobileError, mobileOk, requireString } from "@/lib/mobile-api";

export async function POST(req: NextRequest) {
  const userId = await getMobileUserId(req);
  if (!userId) return mobileError("Unauthorized", 401);

  const body = await req.json();
  const content = requireString(body.content, "content");

  if (typeof content !== "string") return mobileError(content.error, 400);

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
