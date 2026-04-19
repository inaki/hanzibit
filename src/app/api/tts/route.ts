import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getUserPlan } from "@/lib/subscription";
import { query, execute } from "@/lib/db";

const VOICE = "zh-CN-XiaoxiaoNeural";
const AZURE_TIMEOUT_MS = 10_000;

type AudioType = "word" | "sentence" | "dynamic";

function escapeXml(str: string): string {
  return str.replace(/[<>&"']/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" }[c]!)
  );
}

function cacheKey(text: string): string {
  const hash = createHash("sha256").update(text.trim()).digest("hex").slice(0, 16);
  return `xiaoxiao:${hash}`;
}

async function callAzure(text: string): Promise<ArrayBuffer> {
  const region = process.env.AZURE_TTS_REGION;
  const apiKey = process.env.AZURE_TTS_KEY;
  if (!region || !apiKey) throw new Error("TTS not configured");

  const ssml = `<speak version='1.0' xml:lang='zh-CN'>
    <voice name='${VOICE}'>
      <prosody rate='0.85'>${escapeXml(text.trim())}</prosody>
    </voice>
  </speak>`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AZURE_TIMEOUT_MS);

  try {
    const res = await fetch(
      `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
      {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": apiKey,
          "Content-Type": "application/ssml+xml",
          "X-Microsoft-OutputFormat": "audio-24khz-96kbitrate-mono-mp3",
        },
        body: ssml,
        signal: controller.signal,
      }
    );
    if (!res.ok) throw new Error(`Azure TTS error: ${res.status}`);
    return res.arrayBuffer();
  } finally {
    clearTimeout(timeoutId);
  }
}

async function generateAndCache(text: string, key: string): Promise<string> {
  const audio = await callAzure(text);
  const hash = key.split(":")[1];
  const blob = await put(`tts/xiaoxiao/${hash}.mp3`, audio, {
    access: "public",
    contentType: "audio/mpeg",
  });

  await execute(
    `INSERT INTO tts_cache (cache_key, blob_url, char_count)
     VALUES ($1, $2, $3)
     ON CONFLICT (cache_key) DO NOTHING`,
    [key, blob.url, text.trim().length]
  );

  return blob.url;
}

export async function GET(req: NextRequest) {
  const text = req.nextUrl.searchParams.get("text")?.trim();
  const type = (req.nextUrl.searchParams.get("type") ?? "word") as AudioType;

  if (!text || text.length === 0 || text.length > 100) {
    return new NextResponse("Invalid input", { status: 400 });
  }
  if (!["word", "sentence", "dynamic"].includes(type)) {
    return new NextResponse("Invalid type", { status: 400 });
  }

  let userId: string | null = null;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    userId = session?.user?.id ?? null;
  } catch {
    // no valid session — fine for word requests
  }

  if (type !== "word") {
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });
    const plan = await getUserPlan(userId);
    if (plan !== "pro") return new NextResponse("Pro required", { status: 403 });
  }

  const key = cacheKey(text);

  try {
    const cached = await query<{ blob_url: string }>(
      "SELECT blob_url FROM tts_cache WHERE cache_key = $1",
      [key]
    );

    if (cached.length > 0) {
      if (userId) {
        execute(
          `INSERT INTO tts_usage (user_id, cache_key, was_cache_hit, char_count, type)
           VALUES ($1, $2, true, $3, $4)`,
          [userId, key, text.length, type]
        ).catch(() => {});
        execute(
          "UPDATE tts_cache SET play_count = play_count + 1 WHERE cache_key = $1",
          [key]
        ).catch(() => {});
      }
      return NextResponse.redirect(cached[0].blob_url, { status: 302 });
    }

    // When Blob storage isn't configured (local dev), stream directly from Azure
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      const audio = await callAzure(text);
      return new NextResponse(audio, {
        headers: {
          "Content-Type": "audio/mpeg",
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    const blobUrl = await generateAndCache(text, key);
    if (userId) {
      execute(
        `INSERT INTO tts_usage (user_id, cache_key, was_cache_hit, char_count, type)
         VALUES ($1, $2, false, $3, $4)`,
        [userId, key, text.length, type]
      ).catch(() => {});
    }
    return NextResponse.redirect(blobUrl, { status: 302 });
  } catch (err) {
    console.error("[TTS]", err);
    return new NextResponse("TTS generation failed", { status: 502 });
  }
}
