# HanziBit Web App — UI Kit

Recreation of the HanziBit notebook UI from `inaki/hanzibit`. Covers the sidebar, dashboard, journal + interlinear gloss, and flashcard practice — the four surfaces the learner spends 95% of their time in.

## Files

- `index.html` — click-through demo; load this to see the UI in action
- `app.jsx` — mounts the demo and wires tab switching
- `Sidebar.jsx` — left nav with sections, active/hover/default states, due-count badge, character-of-the-day tile
- `Dashboard.jsx` — practice loop card, streak + entries + reviews stat strip, HSK progress, needs-attention list
- `Journal.jsx` — journal entry with interlinear gloss (hanzi / pinyin / english)
- `Flashcards.jsx` — flashcard flip + rating buttons + progress bar
- `shared.jsx` — Pill, Card, Eyebrow primitives shared across screens
- `kit.css` — design tokens (mirrors colors_and_type.css at the root)

## Running

Open `index.html`. Lucide is loaded from CDN; no build step.

## What was cut

- **Teacher / With-Teacher hubs** — documented in the brief but the design is a reuse of the same primitives.
- **Settings dialog, admin, Stripe** — not core to the visual vocabulary.
- **Real TTS** — audio buttons flip visual state only.
- **Real spaced-repetition scheduling** — flashcard rating advances to the next card; it doesn't actually update an ease factor.
