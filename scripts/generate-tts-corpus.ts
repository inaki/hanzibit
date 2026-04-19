import { createHash } from "crypto";
import { put } from "@vercel/blob";
import { query, execute } from "../src/lib/db";

const VOICE = "zh-CN-XiaoxiaoNeural";

function cacheKey(text: string): string {
  const hash = createHash("sha256").update(text.trim()).digest("hex").slice(0, 16);
  return `xiaoxiao:${hash}`;
}

async function generateAudio(text: string): Promise<ArrayBuffer> {
  const region = process.env.AZURE_TTS_REGION;
  const apiKey = process.env.AZURE_TTS_KEY;
  if (!region || !apiKey) throw new Error("AZURE_TTS_REGION and AZURE_TTS_KEY must be set");

  const ssml = `<speak version='1.0' xml:lang='zh-CN'>
    <voice name='${VOICE}'>
      <prosody rate='0.85'>${text.trim()}</prosody>
    </voice>
  </speak>`;

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
    }
  );

  if (!res.ok) throw new Error(`Azure TTS failed: ${res.status} ${await res.text()}`);
  return res.arrayBuffer();
}

async function main() {
  const levels = process.argv.includes("--hsk1") ? [1] : [1, 2];
  const levelList = levels.join(", ");

  const rows = await query<{ simplified: string }>(
    `SELECT DISTINCT simplified FROM hsk_words WHERE level IN (${levels.map((_, i) => `$${i + 1}`).join(", ")}) ORDER BY simplified`,
    levels
  );

  console.log(`Generating TTS corpus for HSK ${levelList}: ${rows.length} words`);

  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (const row of rows) {
    const text = row.simplified;
    const key = cacheKey(text);

    const existing = await query(
      "SELECT 1 FROM tts_cache WHERE cache_key = $1",
      [key]
    );
    if (existing.length > 0) {
      skipped++;
      continue;
    }

    try {
      const audio = await generateAudio(text);
      const hash = key.split(":")[1];
      const blob = await put(`tts/xiaoxiao/${hash}.mp3`, audio, {
        access: "public",
        contentType: "audio/mpeg",
      });

      await execute(
        `INSERT INTO tts_cache (cache_key, blob_url, char_count)
         VALUES ($1, $2, $3)
         ON CONFLICT (cache_key) DO NOTHING`,
        [key, blob.url, text.length]
      );

      generated++;
      process.stdout.write(`  [${generated}] ${text}\r`);
      await new Promise((r) => setTimeout(r, 150));
    } catch (err) {
      failed++;
      console.error(`\n  failed: ${text}`, err);
    }
  }

  console.log(`\nDone. generated=${generated} skipped=${skipped} failed=${failed}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
