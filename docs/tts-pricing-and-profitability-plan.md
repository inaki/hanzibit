# TTS Pricing And Profitability Plan

## Goal

Add sentence and word audio to HanziBit without turning audio into a margin problem.

The right framing is:

- sell **guided beginner learning**
- treat TTS as one feature inside the product
- keep usage bounded and cached
- prioritize **Mandarin voice quality above all else** — tones are the product

---

## Provider evaluation

### Primary criterion: Mandarin quality

For a Mandarin learning app, a flat or unnatural tone on a Chinese word actively harms learning — it is worse than no audio. Provider selection must be driven by Mandarin tone quality first, price second. OpenAI TTS is excluded from consideration because its voices are English-optimized; using it for Chinese content would undermine the core value of the feature.

### Provider comparison

| Provider | Mandarin quality | Pricing | Notes |
|---|---|---|---|
| **Microsoft Azure Neural TTS** | Excellent — multiple regional voices (Mainland, Taiwan) | ~$16/1M chars | Best-documented, most reliable for Chinese |
| **Minimax TTS** | Arguably best-in-class for Mandarin naturalness | Competitive — check current docs | Chinese AI company, purpose-built for Chinese |
| **Google Cloud TTS** | Good | ~$16/1M chars (WaveNet) | Solid fallback, well-documented |
| **xAI / Grok TTS** | Unknown for Mandarin — beta | $4.20/1M chars | Very cheap if Mandarin quality holds — evaluate |

OpenAI TTS is not listed. It does not belong in a Chinese language product.

### Recommended evaluation order

1. **Azure Neural TTS** — start with zh-CN-XiaoxiaoNeural (warm, natural female) and zh-CN-YunxiNeural (natural male)
2. **Minimax TTS** — evaluate on tone accuracy and naturalness for short clips
3. **xAI TTS** — evaluate on Mandarin quality only; price is attractive if it clears the quality bar
4. **Google Cloud TTS** — reliable fallback if the above don't work out

Commit to one voice per language variant. Learners build familiarity with a consistent voice — switching voices between updates is a product regression.

### Critical: polyphonic characters (多音字)

Mandarin has characters with different pronunciations depending on context (e.g., 行, 长, 好, 乐). Test each provider specifically on polyphonic characters in beginner-level sentences before committing. This is a hard quality gate — if a provider fails here, it fails.

---

## Cost model

### Primary strategy: pre-generate the core corpus

For a structured beginner curriculum, the core vocabulary is bounded. HSK 1 is ~150 words. HSK 1+2 combined is ~300–600 words. Each word plus one short example sentence is roughly 20–50 characters.

**One-time batch generation of the entire core corpus:**

- 600 words × 40 chars avg = ~24,000 characters
- At Azure pricing ($16/1M chars): **~$0.38 total, one time**
- At xAI pricing ($4.20/1M chars): **~$0.10 total, one time**

This eliminates per-user generation cost for all core curriculum content entirely. Ongoing per-user TTS cost applies only to dynamic content (custom sentences, journal entries).

Pre-generation is the default strategy. Dynamic generation is the exception.

### Ongoing per-user cost (dynamic content only)

| Scenario | Daily chars | Annual cost/user (Azure) | Annual cost/user (xAI) |
|---|---|---|---|
| Light use | ~60 chars/day | ~$0.35 | ~$0.09 |
| Active learner | ~200 chars/day | ~$1.17 | ~$0.31 |
| Heavy use | ~500 chars/day | ~$2.92 | ~$0.77 |

With pre-generation absorbing core content, most Pro users will land in the light-to-active range.

### Storage and CDN

- Short TTS clip (1–3 sec, mp3): ~20–60 KB
- 10,000 cached clips ≈ 200–600 MB on S3 (~$0.01–$0.015/month)
- CDN egress: negligible at early scale

At 1,000 active users, storage and CDN together are under **$5/month**. Budget it but it is not a cost driver.

### Total per-user cost ceiling

| Cost item | Annual |
|---|---|
| TTS (active user, Azure) | ~$1.17 |
| Storage + CDN per user | ~$0.10 |
| **Total ceiling** | **~$1.27/year** |

Even in a worst-case heavy-use scenario with Azure, total TTS cost per user stays under **$3.10/year**.

---

## Pricing

### Tiers

| Tier | Price | Includes |
|---|---|---|
| **Free** | $0 | Core word audio only (pre-generated corpus), limited plays/day |
| **Pro Monthly** | $7.99/month | Full audio on all surfaces, dynamic sentence audio, guided beginner loop, review system, progress tracking |
| **Pro Annual** | $59/year (~$4.92/month) | Same as Pro Monthly — ~38% discount for annual commit |

Monthly pricing is essential for conversion. Many users will not commit to annual without trying first. Annual LTV is still the goal — make the discount visible and clear.

### Why $59/year still works

At **$59/year** with a ceiling of **$1.27/year TTS cost per user**:

| Item | Amount |
|---|---|
| Annual revenue per Pro user | $59.00 |
| TTS cost (active, Azure) | −$1.17 |
| Storage + CDN | −$0.10 |
| **Gross left for infra + margin** | **$57.73 (97.8%)** |

Even at heavy dynamic usage ($3.10/year), gross margin on audio stays above **94%**.

The TTS feature costs less than 2% of revenue at the new price. This is not a cost problem.

### Why not go lower than $59/year

TTS is not the only cost. Fixed infrastructure (hosting, database) and other AI features (study guide generation, glossing) add real overhead. At $59/year, 50 paying users generates ~$2,950/year — enough to cover a lean infra stack and stay in the black. Below $49/year, early-stage fixed costs start to squeeze margin before the user base is large enough to absorb them.

$59/year is the floor for a sustainable solo product at early scale.

---

## Product strategy

Do **not** sell "audio" as a feature.

Sell:

- confidence hearing tones correctly
- correct pronunciation exposure at the moment of learning
- less beginner friction
- word retention through sound

The value proposition:

- hear the word in context
- hear the example at the right moment
- hear the beginner sentence before you try to build one

Not: "AI voice" or "text-to-speech."

---

## How to stay profitable

### 1. Pre-generate the core corpus (most important)

Generate audio once for every word and example sentence in the structured curriculum. Store it. Serve it from cache. Never regenerate per user.

This single decision makes TTS economics trivial at any reasonable price point.

### 2. Cache everything else

For dynamic content (custom sentences, journal entries):

- generate once per unique text + voice combination
- store with a stable key (hash of text + voice ID)
- never regenerate on repeat plays

### 3. Keep clips short

Good:

- one word
- one short example sentence (≤15 chars ideally)
- one beginner guided sentence

Avoid:

- long paragraph narration
- passive background playback on every screen transition

### 4. Gate dynamic audio to Pro

Free:

- pre-generated word audio from the core corpus
- limited plays per day

Pro:

- sentence audio
- dynamic sentence audio
- guided beginner sentence audio
- expanded review audio

### 5. Commit to one voice

Pick one zh-CN voice and one zh-TW voice (if you support Traditional). Do not expose voice selection to users in v1. Consistency is a learning feature, not a preference.

### 6. Track usage from day one

Instrument before launch:

- total TTS API requests (dynamic generation calls)
- unique cached clips served
- cache hit rate (target: >90%)
- audio plays per active learner per day
- which surfaces get played most

These numbers protect pricing decisions and catch unexpected cost spikes early.

---

## Rollout plan

### Phase 1 — Core corpus + focused surfaces

- Pre-generate audio for all HSK 1 (and HSK 2 if ready) vocabulary and examples
- Implement playback on:
  - Study Guide focus word
  - Study Guide tiny example
  - Optional: beginner guided sentence
- Serve entirely from cache — no dynamic generation in Phase 1

### Phase 2 — Measure and decide

Run for 3–4 weeks and evaluate:

| Metric | Green (expand) | Red (deprioritize) |
|---|---|---|
| Audio play rate among active users | >40% | <20% |
| Retention lift vs. non-audio cohort | Measurable positive | Flat or negative |
| Cache hit rate | >90% | <70% |
| Dynamic TTS cost per user/month | <$0.25 | >$1.00 |

Make the Phase 3 decision based on these numbers, not intuition.

### Phase 3 — Expand (if Phase 2 is green)

- Enable dynamic audio for Pro users (journal entries, custom sentences)
- Keep caching aggressive
- Expand to 2–3 additional high-value surfaces only
- Do not add audio everywhere

---

## Final recommendation

| Decision | Recommendation |
|---|---|
| Provider | Azure Neural TTS or Minimax — evaluate both on Mandarin tone quality |
| OpenAI TTS | Excluded — English-optimized, wrong tool for Chinese content |
| Cost strategy | Pre-generate core curriculum corpus upfront (~$0.38 one-time with Azure) |
| Ongoing dynamic cost | Budget $1.27/user/year as the working ceiling |
| Voice | Commit to one voice per language variant — do not expose as a user setting |
| Polyphonic characters | Hard quality gate — test 多音字 before selecting any provider |
| Pricing | $59/year annual + $7.99/month monthly |
| Price floor | $59/year — below $49/year, fixed infra costs squeeze early-stage margin |
| Free tier audio | Core word audio only from pre-generated corpus |
| Phase 2 go/no-go | Numeric thresholds defined before launch, not after |

TTS should be a quiet feature that makes the product feel more alive — not something users think about, not something that shows up in your cost reports.
