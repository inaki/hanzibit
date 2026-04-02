# HanziBit Improvement Implementation Guide

Four improvements, in priority order. Each section describes what exists, what to build, and how to build it.

---

## Priority 1: Enforce the Paywall

### Current State

The billing infrastructure is fully wired:

- `src/lib/stripe.ts` — Stripe client and checkout/portal helpers
- `src/lib/subscription.ts` — `getUserPlan(userId)`, `isProUser(userId)`
- `src/app/api/stripe/checkout/route.ts` — Creates checkout sessions
- `src/app/api/stripe/webhooks/route.ts` — Handles `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- `subscriptions` table — `plan` (free/pro), `status`, `current_period_end`

The plan definitions already exist in `stripe.ts`:

- **Free**: HSK 1 only, 5 flashcard reviews/day, basic journal
- **Pro**: All HSK levels 1–6, unlimited flashcards, grammar, pronunciation, export

Nothing is actually enforced. `isProUser()` exists but is called nowhere in the app.

### What to Build

**Step 1 — Add a usage tracking helper**

Create `src/lib/gates.ts`:

```typescript
import { isProUser } from "./subscription";
import { db } from "./db";

const FREE_DAILY_REVIEW_LIMIT = 5;

export async function canReviewFlashcard(userId: string): Promise<boolean> {
  if (await isProUser(userId)) return true;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const count = await db
    .select({ count: count() })
    .from(reviewHistory)
    .where(
      and(
        eq(reviewHistory.userId, userId),
        eq(reviewHistory.itemType, "flashcard"),
        gte(reviewHistory.reviewedAt, today)
      )
    );

  return (count[0]?.count ?? 0) < FREE_DAILY_REVIEW_LIMIT;
}

export async function canAccessHskLevel(userId: string, level: number): Promise<boolean> {
  if (level <= 1) return true;
  return isProUser(userId);
}
```

**Step 2 — Gate flashcard review**

In `src/app/notebook/flashcards/page.tsx` (or wherever the review action lives), call `canReviewFlashcard` before processing a review submission. Return a 403 with a structured error when the limit is hit:

```typescript
const allowed = await canReviewFlashcard(userId);
if (!allowed) {
  return { error: "DAILY_LIMIT_REACHED", upgradeUrl: "/pricing" };
}
```

**Step 3 — Gate HSK level access in the study guide**

In `src/lib/data.ts`, inside `getStudyGuideData`, check `canAccessHskLevel` before returning words for levels 2–6. Return an empty result with a `locked: true` flag for free users.

In `src/components/notebook/study-guide.tsx`, render a locked state with an upgrade CTA when `locked === true`.

**Step 4 — Add an upgrade prompt component**

Create `src/components/upgrade-prompt.tsx`:

```tsx
export function UpgradePrompt({ reason }: { reason: string }) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
      <p className="text-sm text-amber-800">{reason}</p>
      <a href="/pricing" className="mt-2 inline-block text-sm font-medium text-amber-700 underline">
        Upgrade to Pro
      </a>
    </div>
  );
}
```

Use this component in both the flashcard review limit state and the locked study guide levels.

**Step 5 — Wire the billing portal**

A billing portal route likely exists but is not linked anywhere visible. Add a "Manage subscription" link to the settings/account area that POSTs to `/api/stripe/portal` and redirects to Stripe.

### Testing Checklist

- [ ] Free user hitting review #6 sees the upgrade prompt, not a blank error
- [ ] Free user switching to HSK Level 2 sees the locked state
- [ ] Pro user has no limits
- [ ] Webhook correctly flips plan from free → pro on checkout completion
- [ ] Webhook correctly flips plan from pro → free on subscription cancellation

---

## Priority 2: Add Streaks

### Current State

- `review_history` table has `reviewed_at TIMESTAMPTZ` — raw timestamps for all reviews
- `journal_entries` table has `created_at TIMESTAMPTZ`
- No streak field exists anywhere
- No daily activity grouping exists

The data needed is already being written. It just is not being summarized.

### What to Build

**Step 1 — Add a streak calculation function**

Add to `src/lib/data.ts`:

```typescript
export async function getUserStreak(userId: string): Promise<number> {
  // Fetch all distinct activity dates (journal writes + reviews)
  // A "active day" = any journal entry created OR any review completed
  const reviews = await db
    .selectDistinct({ date: sql<string>`DATE(${reviewHistory.reviewedAt})` })
    .from(reviewHistory)
    .where(eq(reviewHistory.userId, userId));

  const entries = await db
    .selectDistinct({ date: sql<string>`DATE(${journalEntries.createdAt})` })
    .from(journalEntries)
    .where(eq(journalEntries.userId, userId));

  const allDates = new Set([
    ...reviews.map((r) => r.date),
    ...entries.map((e) => e.date),
  ]);

  // Walk backwards from today counting consecutive days
  let streak = 0;
  const today = new Date();

  for (let i = 0; i <= 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
    if (allDates.has(key)) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
```

No schema changes needed. This derives the streak from existing data.

**Step 2 — Add a longest streak function (optional but motivating)**

```typescript
export async function getLongestStreak(userId: string): Promise<number> {
  // Same date set as above, then find the longest consecutive run
  // ...
}
```

**Step 3 — Surface the streak in the sidebar**

In `src/components/notebook/sidebar.tsx`, alongside the existing HSK progress percentage, add:

```tsx
const streak = await getUserStreak(userId);

// In JSX:
<div className="flex items-center gap-2">
  <span className="text-orange-500 font-bold">{streak}</span>
  <span className="text-sm text-muted-foreground">
    {streak === 1 ? "day streak" : "day streak"}
  </span>
</div>
```

Show "Start your streak today" when streak is 0.

**Step 4 — Add streak to the dashboard**

If a dashboard page exists (`src/app/app/page.tsx` equivalent in HanziBit), include the streak alongside the HSK progress.

**Step 5 — Streak freeze grace (optional)**

A grace period of 1 missed day before resetting the streak is common in learning apps and meaningfully reduces frustration. Modify the calculation to allow a gap of 1 between the current day and the last active day before resetting.

```typescript
// Allow one missed day before breaking the streak
if (!allDates.has(key)) {
  if (i === 0) continue; // today hasn't been active yet
  break;
}
```

### Testing Checklist

- [ ] Streak is 0 for a new user
- [ ] Streak increments after writing a journal entry or completing a review
- [ ] Streak resets after a missed day (with or without grace period, be consistent)
- [ ] Sidebar renders correctly for streak of 0, 1, and 100+

---

## Priority 3: Surface Weak Flashcard Items

### Current State

The `flashcards` table already has everything needed:

```
ease_factor     DOUBLE PRECISION DEFAULT 2.5   -- lower = harder
interval_days   INTEGER DEFAULT 1               -- reset to 1 on failure
review_count    INTEGER DEFAULT 0
next_review     TIMESTAMPTZ
```

`getStudyGuideData` already maps words to flashcard objects with `easeFactor` and `nextReview`. The data is there — it just is not ranked or surfaced as "weak."

### What to Build

**Step 1 — Define a weakness score**

A simple, effective formula:

```typescript
function weaknessScore(card: {
  easeFactor: number;
  intervalDays: number;
  reviewCount: number;
}): number {
  // Lower ease = worse. Ease ranges from 1.3 (hard) to 2.5+ (easy).
  const easePenalty = (2.5 - card.easeFactor) * 10; // 0 to 12
  // Short interval after many reviews = still struggling
  const intervalPenalty = card.reviewCount > 2 ? Math.max(0, 7 - card.intervalDays) : 0;
  return easePenalty + intervalPenalty;
}
```

Cards scoring above a threshold (e.g., 8) are "weak."

**Step 2 — Add a weak items query**

Add to `src/lib/data.ts`:

```typescript
export async function getWeakFlashcards(userId: string, limit = 5) {
  const cards = await db
    .select()
    .from(flashcards)
    .where(
      and(
        eq(flashcards.userId, userId),
        lt(flashcards.easeFactor, 2.0),   // below default ease
        gt(flashcards.reviewCount, 1)      // reviewed at least twice
      )
    )
    .orderBy(asc(flashcards.easeFactor))
    .limit(limit);

  return cards;
}
```

**Step 3 — Surface weak items in the sidebar**

In `src/components/notebook/sidebar.tsx`, below the streak, add a "Needs attention" section:

```tsx
const weakCards = await getWeakFlashcards(userId, 3);

// In JSX:
{weakCards.length > 0 && (
  <div>
    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
      Needs attention
    </p>
    {weakCards.map((card) => (
      <div key={card.id} className="text-sm py-1 border-b last:border-0">
        <span className="font-medium">{card.front}</span>
        <span className="text-xs text-muted-foreground ml-2">
          ease {card.easeFactor.toFixed(1)}
        </span>
      </div>
    ))}
    <a href="/notebook/flashcards" className="text-xs text-primary mt-1 block">
      Review now →
    </a>
  </div>
)}
```

**Step 4 — Highlight weak words in the study guide**

In `src/components/notebook/study-guide.tsx`, add a "Struggling" badge next to words whose associated flashcard has a low ease factor. The `getStudyGuideData` function already returns the flashcard object per word — add a check:

```tsx
{word.flashcard && word.flashcard.easeFactor < 2.0 && word.flashcard.reviewCount > 1 && (
  <span className="text-xs bg-red-100 text-red-700 rounded px-1 ml-1">struggling</span>
)}
```

**Step 5 — Prioritize weak items in due flashcard ordering**

In `src/lib/data.ts`, modify `getDueFlashcards` to order by `ease_factor ASC` instead of `next_review ASC`, so the hardest due cards appear first:

```typescript
.orderBy(asc(flashcards.easeFactor), asc(flashcards.nextReview))
```

### Testing Checklist

- [ ] A new user with no reviews sees no "weak items" section
- [ ] After repeatedly scoring a card "Again", it appears in weak items
- [ ] Weak items in the study guide show the "struggling" badge
- [ ] Due flashcard queue leads with the hardest cards, not just the oldest

---

## Priority 4: Improve Audio

### Current State

Pronunciation currently uses the browser's Web Speech API:

```typescript
// src/components/notebook/action-bar.tsx
const utterance = new SpeechSynthesisUtterance(h.hanzi);
utterance.lang = "zh-CN";
utterance.rate = 0.8;
speechSynthesis.speak(utterance);
```

This is unreliable. Voice quality varies by OS and browser. It fails silently on some mobile browsers and has no offline capability. No audio URL fields exist in `hsk_words` or `vocabulary`.

### What to Build

This improvement has two phases. Phase 1 is low cost and immediately ships. Phase 2 is the full solution.

---

**Phase 1 — Better TTS with a server-side API route**

Instead of using the browser's built-in synthesis, route audio through a server endpoint that calls a quality TTS provider (Google Cloud TTS or Azure Cognitive Services both support zh-CN with natural voices).

**Step 1 — Create the audio endpoint**

`src/app/api/tts/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const text = req.nextUrl.searchParams.get("text");
  if (!text || text.length > 50) {
    return new NextResponse("Invalid", { status: 400 });
  }

  // Example: Google Cloud TTS
  const response = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GOOGLE_TTS_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: { text },
        voice: { languageCode: "zh-CN", name: "zh-CN-Wavenet-C" },
        audioConfig: { audioEncoding: "MP3", speakingRate: 0.85 },
      }),
    }
  );

  const data = await response.json();
  const audio = Buffer.from(data.audioContent, "base64");

  return new NextResponse(audio, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=86400", // cache for 24h
    },
  });
}
```

**Step 2 — Replace browser TTS calls with the endpoint**

In `src/components/notebook/action-bar.tsx`, replace the `SpeechSynthesisUtterance` block:

```typescript
async function speak(hanzi: string) {
  const audio = new Audio(`/api/tts?text=${encodeURIComponent(hanzi)}`);
  await audio.play();
}
```

This keeps the same UI, upgrades the voice quality, and works cross-browser including mobile.

**Step 3 — Add audio to flashcard review**

In the flashcard practice component, add a speaker button that calls the same `speak()` function with `card.front` (the hanzi side).

---

**Phase 2 — Pre-generated audio files for HSK vocabulary**

For HSK 1 vocabulary (~150 words), pre-generate MP3 files using the TTS API in a one-time script. This eliminates per-request latency and API cost at review time.

**Step 1 — Add an `audio_url` column to `hsk_words`**

Migration:

```sql
ALTER TABLE hsk_words ADD COLUMN audio_url TEXT;
```

And update the Drizzle schema in `src/lib/db.ts`:

```typescript
audioUrl: text("audio_url"),
```

**Step 2 — Write a generation script**

`scripts/generate-audio.ts`:

```typescript
import { db } from "../src/lib/db";
import { hskWords } from "../src/lib/db";
import { eq, isNull } from "drizzle-orm";
import fs from "fs/promises";
import path from "path";

const OUTPUT_DIR = "public/audio/hsk";

async function generateAudio() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const words = await db
    .select()
    .from(hskWords)
    .where(isNull(hskWords.audioUrl));

  for (const word of words) {
    const filename = `${word.id}.mp3`;
    const filepath = path.join(OUTPUT_DIR, filename);

    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GOOGLE_TTS_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: { text: word.simplified },
          voice: { languageCode: "zh-CN", name: "zh-CN-Wavenet-C" },
          audioConfig: { audioEncoding: "MP3", speakingRate: 0.85 },
        }),
      }
    );

    const data = await response.json();
    const audio = Buffer.from(data.audioContent, "base64");
    await fs.writeFile(filepath, audio);

    await db
      .update(hskWords)
      .set({ audioUrl: `/audio/hsk/${filename}` })
      .where(eq(hskWords.id, word.id));

    console.log(`Generated: ${word.simplified}`);
  }
}

generateAudio();
```

Run once: `npx ts-node scripts/generate-audio.ts`

**Step 3 — Use static audio URLs when available**

Update `speak()` in the pronunciation dialog to prefer the static URL when it exists:

```typescript
async function speak(hanzi: string, audioUrl?: string | null) {
  const src = audioUrl ?? `/api/tts?text=${encodeURIComponent(hanzi)}`;
  const audio = new Audio(src);
  await audio.play();
}
```

### Environment Variables to Add

```env
GOOGLE_TTS_API_KEY=your_key_here
# or Azure alternative:
AZURE_TTS_KEY=your_key_here
AZURE_TTS_REGION=eastus
```

### Testing Checklist

- [ ] Pronunciation dialog uses server-side audio, not browser TTS
- [ ] Audio plays on Safari and mobile Chrome (previously unreliable)
- [ ] Flashcard review screen has a speaker button on the hanzi side
- [ ] Pre-generated HSK 1 words play instantly (no API call)
- [ ] Words without a pre-generated file fall back to the `/api/tts` route
- [ ] API route rejects input longer than 50 characters

---

## Implementation Order Within the Sprint

If working on all four at once, the recommended sequencing within a team is:

1. **Paywall gates** first — this is the one that directly affects revenue and can be done without any new UI
2. **Streak calculation** in parallel — pure data logic, no schema changes, touches only the sidebar
3. **Weak item surfacing** after streaks — depends on the same data patterns, builds on the sidebar work
4. **Audio (Phase 1 only)** last — isolated change, no schema migration needed for Phase 1

Phase 2 audio (pre-generated files) is a separate task that can happen any time after Phase 1 is live.
