---
name: Pilot Readiness Status
description: Current state of pilot readiness work and what remains — tracks which beginner-UX and production-readiness items are done
type: project
---

As of 2026-04-19, all 6 HSK curriculum phases (A-F) are complete. The project has shifted to pilot readiness for a beginner solo learner.

**What's done:**
- Dashboard first-run state (`isBeginnerFirstRun`) — welcome panel, step cards, single CTA, hides all technical metrics
- Notebook page empty state — now shows 你好, heading, explanation, and "Start with one word →" CTA
- Flashcard empty state — now shows heading + "Go to Study Guide →" link
- Navigation simplified for beginners — sidebar hides advanced items (Vocabulary, Grammar, Numbers, Reviews) until user has some activity
- Study Guide beginner mode — `?beginner=1` path shows compact word + tiny example + "Open tiny review →"
- DB constraint bug: added idempotent `ALTER TABLE ... ADD CONSTRAINT IF NOT EXISTS` for both `curated_grammar_points` and `hsk_collocations` before seed loops (these tables predated UNIQUE constraints in their DDL)

**SCHEMA_VERSION**: 37 (as of this session)

**What remains:**
- Error states not fully audited
- Auth/billing reliability not fully audited
- docs not fully updated for real app state

**Why:** The founder is the first real pilot user — learning Chinese from zero. Goal is daily use without confusion.

**How to apply:** When proposing changes, ask: does this make HanziBit better for a real beginner using it daily? Teacher/reporting features are complete and should not expand further until pilot is stable.
