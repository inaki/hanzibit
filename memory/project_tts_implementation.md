---
name: TTS implementation status
description: Azure TTS audio feature — what was built, what's pending, current state
type: project
---

TTS audio feature is fully implemented and working as of 2026-04-18.

**Why:** Add word/sentence audio to improve Mandarin tone learning without hurting margins. Full plan in docs/tts-pricing-and-profitability-plan.md. Implementation spec in docs/tts-implementation-spec.md.

**What's live:**
- Azure Neural TTS (zh-CN-XiaoxiaoNeural) via /api/tts route
- AudioPlayButton component with loading/playing/locked states and proper 403 handling
- Word audio on: Study Guide focus word, flashcard front, flashcard browse mode, interlinear gloss view (hover), journal entry word tooltip, mobile pronunciation dialog
- Sentence audio (Pro-gated) on: Study Guide example phrase, Study Guide "Notice This Phrase"
- DB tables: tts_cache and tts_usage (created manually, also in schema v34 migration)
- Local dev fallback: streams directly from Azure when BLOB_READ_WRITE_TOKEN is not set

**What's pending:**
- BLOB_READ_WRITE_TOKEN (Vercel Blob) — not set yet, streaming directly from Azure works fine for now
- Corpus pre-generation script ready at scripts/generate-tts-corpus.ts — run once Blob token is obtained
- Pricing: $59/year annual + $7.99/month (not yet updated in Stripe)

**How to apply:** When working on audio features or pricing, refer to the docs/ plans. The tts_cache table tracks all cached clips; tts_usage tracks per-user plays for monitoring.
