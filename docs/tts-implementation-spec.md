# TTS Implementation Spec

## Current state

The TTS API route already exists at `src/app/api/tts/route.ts`. It:

- accepts `?text=` (max 50 chars)
- calls Azure `zh-CN-XiaoxiaoNeural` at 0.85x rate
- returns MP3 with `Cache-Control: public, max-age=86400`

What it does **not** do:

- check auth or plan
- cache server-side (HTTP cache only, no persistent store)
- gate sentence audio to Pro
- track usage
- serve pre-generated corpus clips

This spec builds on what exists rather than replacing it.

---

## Architecture overview

```
Client
  └── <AudioPlayButton text="好" type="word" />
        └── GET /api/tts?text=好&type=word
              ├── check tts_cache → if hit, 302 to blob URL
              ├── check auth + plan for type=sentence
              └── generate → store to Vercel Blob → cache in DB → stream MP3
```

Storage layer: **Vercel Blob** for audio files, **Postgres** for the cache index and usage tracking.

---

## Phase 1 — Database schema

Bump `SCHEMA_VERSION` from `33` to `34` in `src/lib/db.ts` and add two tables to `APP_SCHEMA_SQL`.

### Table: `tts_cache`

```sql
CREATE TABLE IF NOT EXISTS tts_cache (
  cache_key   TEXT PRIMARY KEY,
  blob_url    TEXT NOT NULL,
  char_count  INTEGER NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  play_count  INTEGER NOT NULL DEFAULT 0
);
```

`cache_key` is a deterministic string: `{voice}:{sha256(text.trim())}`.

Example: `xiaoxiao:a3f2b1...`

Using a hash keeps the key short and stable regardless of text length or special characters.

### Table: `tts_usage`

```sql
CREATE TABLE IF NOT EXISTS tts_usage (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id     TEXT REFERENCES "user"(id) ON DELETE SET NULL,
  cache_key   TEXT,
  was_cache_hit BOOLEAN NOT NULL,
  char_count  INTEGER NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('word','sentence','dynamic')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS tts_usage_user_id_idx ON tts_usage(user_id);
CREATE INDEX IF NOT EXISTS tts_usage_created_at_idx ON tts_usage(created_at);
```

---

## Phase 2 — Storage setup

Add Vercel Blob to the project.

```bash
npm install @vercel/blob
```

Add to `.env.local` and Vercel project env vars:

```
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
```

Audio files will be stored at paths like:

```
tts/xiaoxiao/a3f2b1c4d5e6.mp3
```

Public read, no auth required on the blob URL itself — auth is enforced at the API route level before the blob URL is ever returned.

---

## Phase 3 — Pre-generation script

Create `scripts/generate-tts-corpus.ts`. This is a one-time script that:

1. Reads all HSK 1 and HSK 2 words from the `hsk_words` table
2. Skips any `cache_key` already in `tts_cache`
3. Calls Azure TTS for each word
4. Uploads the MP3 to Vercel Blob
5. Inserts a row into `tts_cache`

```typescript
import { createHash } from "crypto";
import { put } from "@vercel/blob";
import { query, execute } from "../src/lib/db";

const VOICE = "zh-CN-XiaoxiaoNeural";
const REGION = process.env.AZURE_TTS_REGION!;
const API_KEY = process.env.AZURE_TTS_KEY!;

function cacheKey(text: string): string {
  const hash = createHash("sha256").update(text.trim()).digest("hex").slice(0, 16);
  return `xiaoxiao:${hash}`;
}

async function generateAudio(text: string): Promise<ArrayBuffer> {
  const ssml = `<speak version='1.0' xml:lang='zh-CN'>
    <voice name='${VOICE}'>
      <prosody rate='0.85'>${text.trim()}</prosody>
    </voice>
  </speak>`;

  const res = await fetch(
    `https://${REGION}.tts.speech.microsoft.com/cognitiveservices/v1`,
    {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": API_KEY,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-24khz-96kbitrate-mono-mp3",
      },
      body: ssml,
    }
  );

  if (!res.ok) throw new Error(`Azure TTS failed: ${res.status}`);
  return res.arrayBuffer();
}

async function main() {
  // Pull HSK 1 and 2 words
  const rows = await query<{ simplified: string }>(
    "SELECT DISTINCT simplified FROM hsk_words WHERE level IN (1, 2) ORDER BY simplified"
  );

  console.log(`Generating corpus for ${rows.length} words...`);

  for (const row of rows) {
    const text = row.simplified;
    const key = cacheKey(text);

    // Skip if already cached
    const existing = await query(
      "SELECT 1 FROM tts_cache WHERE cache_key = $1",
      [key]
    );
    if (existing.length > 0) {
      console.log(`  skip: ${text}`);
      continue;
    }

    try {
      const audio = await generateAudio(text);
      const blob = await put(`tts/xiaoxiao/${key.split(":")[1]}.mp3`, audio, {
        access: "public",
        contentType: "audio/mpeg",
      });

      await execute(
        `INSERT INTO tts_cache (cache_key, blob_url, char_count)
         VALUES ($1, $2, $3)
         ON CONFLICT (cache_key) DO NOTHING`,
        [key, blob.url, text.length]
      );

      console.log(`  generated: ${text}`);
      // Stay well under Azure rate limits
      await new Promise((r) => setTimeout(r, 150));
    } catch (err) {
      console.error(`  failed: ${text}`, err);
    }
  }

  console.log("Done.");
}

main().catch(console.error);
```

Run with:

```bash
npx tsx scripts/generate-tts-corpus.ts
```

Expected cost: ~$0.38 for full HSK 1+2 corpus at Azure pricing.

---

## Phase 4 — Enhanced API route

Replace `src/app/api/tts/route.ts` entirely.

```typescript
import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@/lib/auth";
import { getUserPlan } from "@/lib/subscription";
import { query, execute } from "@/lib/db";
import { headers } from "next/headers";

const VOICE = "zh-CN-XiaoxiaoNeural";

type AudioType = "word" | "sentence" | "dynamic";

function cacheKey(text: string): string {
  const hash = createHash("sha256").update(text.trim()).digest("hex").slice(0, 16);
  return `xiaoxiao:${hash}`;
}

async function generateAndCache(text: string, key: string): Promise<string> {
  const region = process.env.AZURE_TTS_REGION!;
  const apiKey = process.env.AZURE_TTS_KEY!;

  const ssml = `<speak version='1.0' xml:lang='zh-CN'>
    <voice name='${VOICE}'>
      <prosody rate='0.85'>${text.trim()}</prosody>
    </voice>
  </speak>`;

  const azureRes = await fetch(
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

  if (!azureRes.ok) throw new Error(`Azure TTS error: ${azureRes.status}`);

  const audio = await azureRes.arrayBuffer();
  const blob = await put(`tts/xiaoxiao/${key.split(":")[1]}.mp3`, audio, {
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

  // Auth check
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id ?? null;

  // Pro gate: sentence and dynamic types require Pro
  if (type !== "word" && userId) {
    const plan = await getUserPlan(userId);
    if (plan !== "pro") {
      return new NextResponse("Pro required", { status: 403 });
    }
  } else if (type !== "word" && !userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const key = cacheKey(text);

  // Check cache
  const cached = await query<{ blob_url: string }>(
    "SELECT blob_url FROM tts_cache WHERE cache_key = $1",
    [key]
  );

  if (cached.length > 0) {
    // Async usage tracking — don't await
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

  // Generate, cache, and serve
  try {
    const blobUrl = await generateAndCache(text, key);

    if (userId) {
      execute(
        `INSERT INTO tts_usage (user_id, cache_key, was_cache_hit, char_count, type)
         VALUES ($1, $2, false, $3, $4)`,
        [userId, key, text.length, type]
      ).catch(() => {});
    }

    return NextResponse.redirect(blobUrl, { status: 302 });
  } catch {
    return new NextResponse("TTS generation failed", { status: 502 });
  }
}
```

---

## Phase 5 — Client component

Create `src/components/notebook/audio-play-button.tsx`.

```typescript
"use client";

import { useState, useRef, useCallback } from "react";
import { Volume2, Loader2 } from "lucide-react";

interface AudioPlayButtonProps {
  text: string;
  type?: "word" | "sentence" | "dynamic";
  size?: "sm" | "md";
  className?: string;
}

export function AudioPlayButton({
  text,
  type = "word",
  size = "sm",
  className = "",
}: AudioPlayButtonProps) {
  const [state, setState] = useState<"idle" | "loading" | "playing">("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = useCallback(async () => {
    if (state === "playing") {
      audioRef.current?.pause();
      setState("idle");
      return;
    }

    setState("loading");

    const url = `/api/tts?text=${encodeURIComponent(text)}&type=${type}`;

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;
    audio.src = url;

    audio.oncanplaythrough = () => {
      setState("playing");
      audio.play().catch(() => setState("idle"));
    };

    audio.onended = () => setState("idle");
    audio.onerror = () => setState("idle");
    audio.load();
  }, [text, type, state]);

  const iconSize = size === "sm" ? 14 : 16;
  const btnSize = size === "sm" ? "h-6 w-6" : "h-8 w-8";

  return (
    <button
      onClick={play}
      aria-label={`Play pronunciation of ${text}`}
      className={`inline-flex items-center justify-center rounded-full transition-colors
        text-muted-foreground hover:text-foreground hover:bg-muted
        ${btnSize} ${className}`}
    >
      {state === "loading" ? (
        <Loader2 size={iconSize} className="animate-spin" />
      ) : (
        <Volume2 size={iconSize} className={state === "playing" ? "text-primary" : ""} />
      )}
    </button>
  );
}
```

---

## Phase 6 — Integration points

### Study Guide focus word

In `src/components/notebook/study-guide.tsx`, add the play button next to the selected word's Chinese character display.

Import and place it inline:

```tsx
import { AudioPlayButton } from "./audio-play-button";

// Next to the focus word heading:
<span className="flex items-center gap-1">
  <span className="text-4xl font-bold">{selectedWord.simplified}</span>
  <AudioPlayButton text={selectedWord.simplified} type="word" size="md" />
</span>
```

### Study Guide example sentence (Pro only)

```tsx
{isPro && (
  <span className="flex items-center gap-1">
    <span>{exampleSentence}</span>
    <AudioPlayButton text={exampleSentence} type="sentence" />
  </span>
)}
```

Pass `isPro` as a prop from the server component that already calls `getUserPlan`.

### Interlinear gloss view

In `src/components/notebook/interlinear-gloss-view.tsx`, add word-level play buttons on hover to individual tokens:

```tsx
<AudioPlayButton text={token.chinese} type="word" size="sm" className="opacity-0 group-hover:opacity-100" />
```

Wrap the token container with `className="group"`.

---

## Phase 7 — Environment variables

Add to `.env.local` and Vercel project settings:

```
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
```

Existing vars already needed:
```
AZURE_TTS_KEY=...
AZURE_TTS_REGION=eastus
```

---

## Phase 8 — Usage monitoring query

Run this query periodically to check health:

```sql
-- Cache hit rate (last 7 days)
SELECT
  COUNT(*) FILTER (WHERE was_cache_hit) AS cache_hits,
  COUNT(*) FILTER (WHERE NOT was_cache_hit) AS cache_misses,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE was_cache_hit) / NULLIF(COUNT(*), 0), 1
  ) AS hit_rate_pct
FROM tts_usage
WHERE created_at > NOW() - INTERVAL '7 days';

-- Per-user audio plays (last 30 days)
SELECT user_id, COUNT(*) AS plays, SUM(char_count) AS total_chars
FROM tts_usage
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY user_id
ORDER BY total_chars DESC
LIMIT 20;

-- Estimated Azure cost (last 30 days, misses only)
SELECT
  SUM(char_count) AS total_chars_generated,
  ROUND(SUM(char_count) / 1000000.0 * 16, 4) AS estimated_cost_usd
FROM tts_usage
WHERE was_cache_hit = false
  AND created_at > NOW() - INTERVAL '30 days';
```

---

## Implementation order

| Step | Task | Effort |
|---|---|---|
| 1 | Bump schema to v34, add `tts_cache` and `tts_usage` tables | 30 min |
| 2 | Set up Vercel Blob (`npm install @vercel/blob`, add env var) | 15 min |
| 3 | Run `scripts/generate-tts-corpus.ts` to pre-generate HSK 1+2 | 20 min (mostly wait) |
| 4 | Replace `src/app/api/tts/route.ts` with enhanced version | 30 min |
| 5 | Create `src/components/notebook/audio-play-button.tsx` | 20 min |
| 6 | Add `AudioPlayButton` to Study Guide focus word | 15 min |
| 7 | Add `AudioPlayButton` to Study Guide example sentence (Pro gate) | 15 min |
| 8 | Add `AudioPlayButton` to interlinear gloss tokens | 20 min |
| 9 | Verify cache hit rate after 1 week | — |

Total dev time: **~3 hours**.

---

## What this does not include (Phase 3 of the rollout plan)

- Dynamic audio for journal entries
- Flashcard audio
- Mobile-specific audio handling

These are gated behind Phase 2 metrics. Do not build them until play rate and retention data justify it.
