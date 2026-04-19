# HanziBit HSK Curriculum Strategy

**Status**: Planning — started 2026-04-19  
**Purpose**: Make HanziBit the best tool for systematic HSK learning without abandoning the journal-first philosophy that makes it unique.  
**Related docs**: `language-learning-effectiveness-strategy.md`, `app-comparison.md`, `implementation-roadmap.md`

---

## 1. The Comparison That Drives This Plan

### Official HSK Teaching Approach (Standard Course + HSK 3.0)

The official *HSK Standard Course* books (Beijing Language and Culture University Press) follow a single philosophy: **"Learn through testing, teach through testing"** (以考促教、以考促学). Published by Chinese Testing International, fully aligned to the HSK exam syllabus.

**Typical lesson structure:**

| Section | Content | Skills |
|---|---|---|
| Warm-up | Pictures + questions | Listening + Speaking |
| Text | Dialogue or passage with pinyin | All 4 skills |
| New Words | 10–30 words with context examples | Vocabulary |
| Language Points | 3–5 grammar patterns, rule → practice | Grammar |
| Exercises | Listening, speaking, reading, writing | All 4 skills |
| Culture | Short cultural notes | Context |

**HSK 3.0 (2025)**: Adds AI helper "Little Fish" (Xiǎoyú), animated stroke order, short cultural videos, and a continuous story with recurring characters across levels.

**Strengths of the official approach:**
- Most systematic progression in the world — difficulty increases like climbing stairs
- Very high exam pass rate (3–6 months per level)
- Practical and often humorous texts close to real life
- Fully balanced: all 4 skills trained equally
- Silent grammar recycling — earlier patterns reappear naturally in later levels

**Weaknesses:**
- Some texts feel "idealized" (not always real-life natural speech)
- Advanced levels explained in Chinese only (no scaffolding)
- Passive format — no adaptive feedback, no personal writing

---

## 2. HanziBit Current State

### What We Do Well

| Official Book Feature | HanziBit Equivalent | Rating |
|---|---|---|
| Communicative approach | Journal writing as primary output | ✅ Strong |
| Real-life context | Contextual mini-readings in Study Guide | ✅ Strong |
| Spaced repetition | SM-2 algorithm, adaptive intervals | ✅ Strong |
| Vocabulary in context | Words discovered through entries, not lists | ✅ Strong |
| Daily habit / progress | 3-step loop + streaks + dashboard | ✅ Strong |
| Skill scaffolding by level | Study Guide reading complexity HSK 1→6 | ✅ Good |
| Pronunciation | TTS audio on words + interlinear gloss | ⚠️ Partial |
| Grammar | Grammar points table, no teaching sequence | ❌ Weak |
| Character teaching | Numbers Guide only, no radicals | ❌ Missing |
| Listening activities | TTS helper only, no comprehension tasks | ❌ Missing |
| Level assessment | No milestones or readiness signals | ❌ Missing |

### Core Architecture

- **Vocabulary**: `hsk_words` table (~2,500 words, HSK 1–6), encounter tracking via journal tokenization
- **Spaced Repetition**: SM-2 algorithm in `src/lib/sm2.ts` (intervals: 1→6→adaptive days)
- **Daily Loop**: Review (flashcards due) → Study (Study Guide word) → Write (journal entry)
- **Study Guide**: Per-word mini-reading passages, complexity scales by level, guided journal prompt
- **Assignments**: 4 types — `journal_prompt`, `study_guide_word`, `study_guide_level`, `reading_response`
- **Grammar**: `grammar_points` table (title, pattern, explanation, examples, hsk_level) — exists but untaught
- **Progression**: User sets target level manually; `canAccessHskLevel()` guards higher levels; no completion milestones

### Fundamental Difference in Philosophy

**Official books**: Scope-and-sequence curriculum, linear, exam-optimized, teacher-led.  
**HanziBit**: Habit loop + discovery, non-linear, fluency-optimized, learner-led.

This is a deliberate and defensible choice. The journal-first approach has no equivalent in any textbook and is better for long-term production ability and retention. The goal of this strategy is **not** to become a textbook clone — it is to fill the structural gaps that prevent serious HSK learners from relying on HanziBit as their primary tool.

---

## 3. Critical Gaps to Close

### Gap 1: Grammar has no curriculum
Official books treat grammar as a primary teaching object — 3–5 patterns per lesson with explicit progression chains (e.g., HSK 2: 了 → HSK 3: 已经…了 → HSK 4: 了 with resultative complements). HanziBit has a `grammar_points` table that is essentially a user-managed notepad. Users don't know *what* grammar to study for their level.

### Gap 2: No level readiness signal
Official books have a clear "this level is complete" moment. HanziBit users have no way to know when they're ready for the HSK exam or the next level. There are no milestones, no thresholds, no "you're ready" prompt.

### Gap 3: Vocabulary works in isolation per level
Official books silently recycle earlier vocabulary in higher-level content. In HanziBit, HSK 4 study content doesn't reinforce HSK 1–3 words the user already knows. Each level is treated as a separate island.

### Gap 4: No word register or pragmatic context
Official books include cultural notes and register awareness (formal vs. casual vs. written). HanziBit shows no indication of whether a word is formal, slang, literary, or colloquial.

### Gap 5: Listening comprehension is absent
Official books train all 4 skills equally. TTS playback exists in HanziBit as a helper but there are no dedicated listening activities (listen → answer, dictation, etc.).

### Gap 6: Character/radical foundation is missing
No stroke order, no radical grouping, no component-based character teaching. Official books scaffold this from day one.

---

## 4. Implementation Plan

### Philosophy Constraint
Every improvement must fit inside the existing habit loop (Review → Study → Write). We are not building a second app inside HanziBit — we are deepening the existing loop.

---

### Phase A — Grammar Curriculum (Priority: High, Effort: Medium)
**Goal**: Give every HSK level a curated set of grammar patterns with the same Study Guide treatment vocabulary already receives.

**What to build:**
- Curate 15–20 core grammar patterns per HSK level (HSK 1–6 = ~100 patterns total), based on the official HSK syllabus
- Each pattern gets: a mini-reading passage demonstrating it in context, a comprehension question, and a guided journal prompt ("Write 2 sentences using 已经…了")
- Grammar patterns appear in the Study Guide alongside vocabulary — same UI, same tabs
- Grammar step added to the daily loop as an optional 4th step: Review → Study → Grammar → Write
- Patterns are linked to vocabulary: the mini-reading for a grammar pattern reuses words the user has already encountered

**Database changes:**
- `grammar_points` table already exists — add `curated: boolean`, `display_order: integer`, `reading_passage: text`, `comprehension_question: text`, `journal_prompt: text`, `source_words: text[]`
- Track completion via `daily_loop_completions` (add `grammar_completed` column)

**Success metric**: Users who complete grammar steps show higher journal entry quality scores and encounter more advanced vocabulary.

---

### Phase B — Level Readiness Dashboard (Priority: High, Effort: Small)
**Goal**: Give learners a clear signal when they're ready for the HSK exam and/or the next level.

**What to build:**
- Level Completion Score: composite of % words encountered, % with flashcards, % reviewed ≥2 times, % grammar patterns studied
- When score ≥ 80%: show "You're ready for HSK X" banner on dashboard with suggested next steps (mock test, move up)
- Monthly progress report card: words encountered this month, entries written, reviews completed, grammar studied
- "Move to next level" flow: prompt when current level is near-complete, confirm and update `hskLevel` setting

**Database changes:** None required — all data already exists, just needs aggregation.

**Success metric**: Users who see the readiness signal convert to the next level 3× faster than those who don't.

---

### Phase C — Vocabulary Collocations & Cross-Level Links (Priority: Medium, Effort: Small)
**Goal**: Stop treating each HSK level as an island. Surface related known words when studying new ones.

**What to build:**
- In Study Guide word view: show 3–5 collocations using words the user already knows (from lower HSK levels)
- Example: Studying HSK 4 word 打算 (plan to) → show "你打算做什么?" using HSK 1 words 你 and 做什么
- "Already know" badge on collocations — reinforces that prior knowledge scaffolds new learning
- Collocations sourced from a static collocation table (can be seeded from HSK example sentences)

**Database changes:**
- New `hsk_collocations` table: `word_id`, `collocation_sentence_zh`, `collocation_sentence_en`, `word_ids_used: text[]`

---

### Phase D — Word Register & Cultural Notes (Priority: Medium, Effort: Small)
**Goal**: Add pragmatic context to vocabulary — when and where is this word actually used?

**What to build:**
- Add `register` field to `hsk_words`: `formal | neutral | colloquial | written | slang | chengyu`
- Add `cultural_note` text field for words with cultural significance
- Display register badge in Study Guide word view and flashcard back
- Filter in vocabulary list: "Show only colloquial words" — useful for learners preparing for real conversation vs. exam

**Database changes:**
- `ALTER TABLE hsk_words ADD COLUMN register TEXT`
- `ALTER TABLE hsk_words ADD COLUMN cultural_note TEXT`
- Migration can be run incrementally — most words start as `neutral`

---

### Phase E — Listening Activities (Priority: Low, Effort: Large)
**Goal**: Add a dedicated listening skill to the daily loop.

**What to build:**
- "Listen & Respond" activity: TTS reads a sentence using current level vocabulary, user writes what they heard (pinyin or characters), app checks against source
- Dictation mode: hear a sentence, type the characters — graded by character accuracy
- Feeds into the daily loop as an alternative to Review step for users who prefer listening practice

**Note**: Low priority because most motivated learners have better external options (HSK listening podcasts, ChinesePod, etc.). This is a "nice to have" that would make HanziBit feel complete, not a competitive differentiator.

---

### Phase F — Character & Radical Foundation (Priority: Low, Effort: Large)
**Goal**: Teach character recognition through components, not just rote exposure.

**What to build:**
- Radical grouping in vocabulary list: filter/browse HSK words by shared radical
- "Character breakdown" panel in Study Guide: shows character components with meanings (e.g., 好 = 女+子 = woman+child = good)
- Stroke order animation for any word (reuse the Numbers Guide infrastructure)
- Links from radical to all HSK words sharing that component

**Note**: Significant content curation required. Lower priority than grammar and readiness because many learners already have character recognition from school or other tools.

---

## 5. Priority Summary

| Phase | Feature | Priority | Effort | Status |
|---|---|---|---|---|
| A | Grammar curriculum per HSK level | 🔴 High | Medium | ✅ Done (2026-04-19) |
| B | Level readiness dashboard & score | 🔴 High | Small | ✅ Done (2026-04-19) |
| C | Vocabulary collocations + cross-level links | 🟡 Medium | Small | ✅ Done (2026-04-19) |
| D | Word register & cultural notes | 🟡 Medium | Small | ✅ Done (2026-04-19) |
| E | Listening activities | 🟢 Low | Large | ✅ Done (2026-04-19) |
| F | Character & radical foundation | 🟢 Low | Large | ✅ Done (2026-04-19) |

---

## 6. What Stays the Same

The following are HanziBit's core differentiators and should not be changed to mimic the official book approach:

- **Journal-first learning** — the learner's own writing is the curriculum
- **SM-2 spaced repetition** — superior to official book workbook exercises
- **Interlinear gloss** — nothing like this exists in any textbook
- **Teacher-student assignment loop** — more personalized than any printed curriculum
- **Non-linear discovery** — learners explore words that interest them, not just what the book says next

The goal is to add structure where it's missing, not to replace the philosophy that makes HanziBit worth using.

---

## 7. Competitive Position After Implementation

| Dimension | Official HSK Books | HSK Skool / apps | HanziBit (current) | HanziBit (after) |
|---|---|---|---|---|
| Grammar curriculum | ✅ Best in class | ✅ Good | ❌ Weak | ✅ Strong |
| Vocabulary coverage | ✅ Complete | ✅ Complete | ✅ Complete | ✅ Complete |
| Spaced repetition | ❌ None | ⚠️ Basic | ✅ SM-2 | ✅ SM-2 |
| Personal output | ❌ None | ❌ None | ✅ Best in class | ✅ Best in class |
| Level readiness | ✅ Implicit (end of book) | ⚠️ Progress bar | ❌ Missing | ✅ Strong |
| Character teaching | ✅ Strong | ⚠️ Partial | ❌ Weak | ⚠️ Partial (Phase F) |
| Listening skills | ✅ Strong | ✅ Good | ❌ Missing | ⚠️ Basic (Phase E) |
| Cultural context | ✅ Strong | ⚠️ Some | ❌ Missing | ✅ (Phase D) |
| Teacher integration | ❌ None | ❌ None | ✅ Unique | ✅ Unique |
| Daily habit system | ❌ None | ⚠️ Streaks | ✅ Strong | ✅ Strong |

After Phases A–D, HanziBit will be competitive with or better than official textbooks on every dimension that matters for learners who want to actually *use* Mandarin — not just pass a test.

---

*Last updated: 2026-04-19*
