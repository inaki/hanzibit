# HanziBit vs HSK Skool: App Comparison

## TL;DR

Both apps help Mandarin learners study HSK vocabulary, but they take fundamentally different approaches:

- **HanziBit** is a personal writing workspace. The learner's own journal entries are the center of the experience.
- **HSK Skool** is a structured learning platform. A pre-built curriculum path drives the experience.

Neither approach is strictly better — they serve different learner profiles and habits.

---

## Product Philosophy

| Dimension | HanziBit | HSK Skool |
|---|---|---|
| Core metaphor | Personal notebook | Guided course |
| What drives study | The learner's own writing | A structured curriculum |
| Vocabulary source | User-authored journal entries + HSK reference | Pre-authored lessons |
| Review origin | Words the learner has personally used | Mistakes made in lessons |
| Learning stance | Self-directed, expressive | Guided, progressive |

HanziBit bets that learners will stay engaged if their own sentences are the material. HSK Skool bets that learners need a clear path and scaffolded progression to stay on track.

---

## Learning Loop

### HanziBit
1. Write a journal entry in Chinese
2. Annotate vocabulary inline with `[汉字|pinyin|meaning]` markup
3. Turn annotated words into flashcards
4. Review flashcards with SM-2 spaced repetition
5. Check how many HSK words have appeared in your writing

### HSK Skool
1. Enter the dashboard and continue the current lesson
2. Study vocabulary, grammar, and example sentences
3. Submit a lesson quiz
4. Review items you got wrong in the review queue
5. Practice listening in the audio-first queue

HanziBit's loop is writing-out. HSK Skool's loop is consumption-in. Both end at review, but via opposite paths.

---

## Feature Comparison

### Shared Capabilities
- HSK vocabulary as the curriculum backbone
- Spaced repetition review
- Progress tracking
- Authentication (Better Auth in both)
- Stripe billing and subscription gating

### HanziBit Only
- Journal entry creation and editing with inline vocabulary markup
- Interlinear glossing (CEDICT-backed word-by-word breakdown)
- GitHub and Google OAuth (HSK Skool is email/password only)
- Numbers guide (interactive Chinese number reference)
- Pronunciation via browser speech synthesis
- Grammar points scoped to the user's own notes
- Vocabulary lookup backed by imported CEDICT dictionary data

### HSK Skool Only
- Pre-authored structured lessons with assessment questions
- Listening queue with audio-first recall and dedicated listening XP
- Custom audio assets with a generation pipeline
- Curriculum browser with level, unit, and track views
- Dashboard with streak, XP, and weak-item surfacing
- Curriculum-gated access (starter unit gating, daily review and listening caps)
- Server-enforced paywall with entitlement-based membership checks

---

## Content Model

| | HanziBit | HSK Skool |
|---|---|---|
| Content source | User-generated (journal) + imported reference (HSK, CEDICT) | Pre-authored by the product team |
| Content depth | Thin on authored content, rich on reference data | Pre-authored lesson set, currently limited in scope |
| Scalability | Scales with the learner (they generate content) | Scales with author output (team must write more lessons) |
| Admin/CMS | None visible | None visible — seed scripts and schema only |

Both apps currently have a content scaling problem, but of opposite types. HanziBit has no authored lesson content at all. HSK Skool has a sophisticated platform but still limited curriculum depth.

---

## Monetization

Both apps have Stripe billing connected. The meaningful difference is enforcement:

- **HanziBit**: billing infrastructure and pricing UI exist, but most feature gating is not yet enforced inside the learning experience.
- **HSK Skool**: free-tier limits are enforced server-side — daily review caps, listening caps, and starter unit gating are all active constraints.

HSK Skool is closer to a commercially launchable product on this dimension.

---

## Audio

| | HanziBit | HSK Skool |
|---|---|---|
| Audio support | Browser speech synthesis (no custom assets) | Custom audio files with a generation pipeline |
| Listening mode | None | Dedicated listening queue with separate XP and usage limits |
| Audio-first practice | No | Yes |

For a Mandarin product, audio is strategically important. HSK Skool has a meaningful lead here.

---

## Adaptive Learning

Both apps are at an early stage for adaptive logic.

- **HanziBit** uses SM-2 (a standard spaced repetition algorithm) on flashcards. Review scheduling is well-understood and principled.
- **HSK Skool** uses fixed mastery increments and fixed review intervals. The review system is integrated into lessons, which is architecturally stronger, but the scheduling logic itself is simpler than SM-2.

On algorithm sophistication, HanziBit's SM-2 implementation is more principled. On integration depth (lesson → mistake → review → listening), HSK Skool's architecture is more complete.

---

## Platform Maturity

| | HanziBit | HSK Skool |
|---|---|---|
| End-to-end product loop | Partial (journal + flashcards, no lesson system) | Complete (lessons → review → listening → XP → billing) |
| Automated tests | Not visible | Not visible |
| Mobile experience | Responsive web, mobile nav dialogs | Responsive web |
| Native app | No | No |
| Authoring system | No | No |

Neither app has visible test coverage. Both are web-only. HSK Skool has a more complete end-to-end loop; HanziBit has a more expressive individual-feature set.

---

## Learner Profile Fit

| Learner type | Better fit |
|---|---|
| Self-directed learner who writes in Chinese regularly | HanziBit |
| Beginner who needs a structured path | HSK Skool |
| Learner focused on listening and pronunciation | HSK Skool |
| Learner who wants to annotate their own sentences | HanziBit |
| Learner who needs daily habit and streak mechanics | HSK Skool |
| Learner who prefers building study material from personal writing | HanziBit |

---

## Summary Assessment

**HanziBit's strongest differentiator** is the inline journal annotation system. No equivalent exists in HSK Skool. If the app doubles down on this — richer glossing, better vocabulary suggestions, smarter review from journal content — it occupies a defensible niche that HSK Skool does not compete in.

**HSK Skool's strongest differentiator** is the complete end-to-end product loop: lessons, assessment, review, listening, XP, streaks, and a live paywall. It behaves more like a finished product today.

**The core strategic difference**: HanziBit is a personal study workspace in search of more structure. HSK Skool is a structured learning platform in search of more content and deeper adaptive logic. Both need what the other has, but they are approaching the same problem from opposite ends.
