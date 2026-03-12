<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?logo=tailwindcss&logoColor=white" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite&logoColor=white" alt="SQLite" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript 5" />
</p>

<h1 align="center">
  Chinese Notebook<br />
  <sub>Your Mandarin Learning Companion, from HSK 1 and Beyond</sub>
</h1>

<p align="center">
  A notebook-style web app for learning Mandarin Chinese, structured around the<br />
  HSK (Hanyu Shuiping Kaoshi) proficiency curriculum — starting from HSK 1 and progressing upward.<br />
  Write journal entries in Mandarin, build vocabulary in context,<br />
  review with spaced-repetition flashcards, and track your progress level by level.
</p>

---

## Why Chinese Notebook?

Learning Mandarin is hard. Most apps have you tapping multiple-choice answers or swiping through pre-made decks. **Chinese Notebook takes the opposite approach**: you *write* — in Mandarin, from day one.

The app follows the **HSK curriculum** (the standardized Mandarin proficiency test), starting at **HSK 1** and progressing upward. Whether you're writing your first `你好` or composing paragraphs about your weekend, everything is structured around your current level.

- **Active writing** — compose journal entries in Mandarin to force recall and build real sentence construction skills
- **Vocabulary in context** — key words are highlighted inside your own entries, not drilled in isolation
- **Self-annotation** — add your own grammar tips and mnemonics that stick better than any textbook
- **HSK-aligned progression** — every entry, lesson, and vocabulary item maps to an HSK level so you always know where you stand
- **Spaced repetition** — flashcards surface at optimal review intervals to maximize retention

---

## Features

### Daily Journal
Write journal entries in Mandarin with bilingual titles (Chinese + English). Key vocabulary is highlighted in orange within the text, showing pinyin and meaning on hover. Each entry is tagged with its HSK level and unit, and supports self-notes and annotations — grammar tips, mnemonics, or any personal observations.

### Vocabulary Builder
Browse your Mandarin vocabulary organized by HSK level and category (greetings, food, daily life, etc.). Track mastery percentage for each word and see when you last reviewed it.

### Grammar Reference
Store Mandarin grammar patterns with structured explanations and real examples. Expandable accordion UI lets you drill into patterns like `A 是 B`, `太 + Adj + 了`, or `会 + Verb` without leaving context.

### Flashcard Practice
Two modes: **Practice** (flip-card with navigation and progress bar) and **Browse** (grid overview of all cards). Cards track review count, interval, and ease factor for spaced repetition scheduling.

### Lessons
Lesson library aligned to the HSK curriculum, organized by unit and level. Starting from HSK 1 fundamentals (greetings, numbers, time) and progressing through more advanced topics.

### Review History
Track every review session across vocabulary, flashcards, and grammar. Scored on a 1-5 scale with visual badges and type indicators.

### Action Bar
Contextual toolbar for each journal entry:
- **Edit** — modify entry content in a dialog
- **Pronunciation** — pinyin guide with text-to-speech for each highlighted word
- **Flashcard Mode** — quick-review vocabulary from the current entry
- **New Entry** — create a new journal entry
- **Bookmark** — save entries for quick access
- **Print** — clean print layout of the journal entry with full CJK font support

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router, Server Components, Server Actions) |
| Language | TypeScript 5 |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) with custom CSS variables |
| Components | [shadcn/ui](https://ui.shadcn.com/) (base-nova style) + [@base-ui/react](https://base-ui.com/) primitives |
| Database | SQLite via [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) (WAL mode) |
| Auth | [Better Auth](https://better-auth.com/) (email/password + GitHub/Google OAuth) |
| Icons | [Lucide React](https://lucide.dev/) |
| Package Manager | pnpm |

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Install & Run

```bash
# Clone the repo
git clone https://github.com/your-username/chinese-notebook.git
cd chinese-notebook

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local

# Seed the database with demo data
pnpm seed

# Start the dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page.

### Dev Credentials

After running `pnpm seed`, you can sign in with:

| Field | Value |
|-------|-------|
| Email | `dev@chinese-notebook.local` |
| Password | `password123` |

The seed script creates a full demo dataset: 5 journal entries with highlights and annotations, 25 vocabulary items, 8 grammar points, 12 flashcards, 8 lessons, and 15 review history records.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `BETTER_AUTH_SECRET` | Yes | Secret key for session encryption |
| `BETTER_AUTH_URL` | Yes | Auth server URL (e.g. `http://localhost:3000`) |
| `NEXT_PUBLIC_APP_URL` | Yes | Public app URL for client-side auth |
| `GITHUB_CLIENT_ID` | No | GitHub OAuth app client ID |
| `GITHUB_CLIENT_SECRET` | No | GitHub OAuth app client secret |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret |

---

## Project Structure

```
src/
  app/
    page.tsx                    # Landing page
    notebook/
      page.tsx                  # Journal view (main)
      vocabulary/page.tsx       # Vocabulary list
      grammar/page.tsx          # Grammar points
      flashcards/page.tsx       # Flashcard practice
      lessons/page.tsx          # Lesson library
      reviews/page.tsx          # Review history
      layout.tsx                # Notebook shell (nav + sidebar)
    auth/
      signin/page.tsx           # Sign in
      signup/page.tsx           # Sign up
    api/auth/[...all]/route.ts  # Better Auth API handler
  components/
    landing/                    # Landing page sections
    notebook/                   # Notebook UI components
    ui/                         # shadcn/ui primitives
  lib/
    db.ts                       # SQLite connection + schema
    data.ts                     # Typed query functions
    actions.ts                  # Server Actions (mutations)
    auth.ts                     # Better Auth server config
    auth-client.ts              # Client-side auth helpers
    constants.ts                # DEV_USER_ID, etc.
scripts/
  seed-dev-user.ts              # Seeds auth user + demo data
docs/
  app-overview.md               # Detailed feature documentation
```

---

## Database

Eight SQLite tables power the app:

| Table | Purpose |
|-------|---------|
| `journal_entries` | Daily journal writings with bilingual titles, HSK level, unit, bookmark flag |
| `entry_highlights` | Vocabulary words highlighted within a specific entry (character, pinyin, meaning) |
| `entry_annotations` | Self-notes on entries — grammar tips, mnemonics |
| `vocabulary` | User's full vocabulary collection with mastery tracking (0-100%) |
| `grammar_points` | Grammar rules with patterns, explanations, and JSON example arrays |
| `flashcards` | Spaced repetition cards with interval, ease factor, and review scheduling |
| `lessons` | HSK-aligned lesson content organized by unit |
| `review_history` | Scored review log across all item types |

SQLite runs in WAL mode with foreign keys enabled and cascade deletes on entry-related tables.

---

## How Vocabulary Highlighting Works

The orange-highlighted characters in journal entries come from the `entry_highlights` table. For each entry, the rendering pipeline:

1. Collects all `character_zh` values from the entry's highlights
2. Sorts them longest-first (so `服务员` matches before `员`)
3. Builds a regex and splits the text on matches
4. Wraps matched segments in styled `<span>` elements with pinyin/meaning tooltips

Highlights are **curated per entry**, not auto-detected — giving full control over which words are called out for study.

---

## Design System

The app uses a warm orange brand palette defined as CSS custom properties:

| Token | Light | Dark |
|-------|-------|------|
| `--cn-orange` | `#e8601c` | `#f07030` |
| `--cn-orange-light` | `#fef3ed` | `#2a1a10` |
| `--cn-orange-dark` | `#c44d14` | `#ff8844` |

Typography uses [Geist](https://vercel.com/font) for UI text. Mandarin content renders at 22px with 2x line-height for optimal readability of hanzi characters.

The layout follows a **three-column notebook metaphor**: sidebar (navigation + progress) / content (journal entries) / action bar (contextual tools), on a warm beige background.

---

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm start` | Run production server |
| `pnpm lint` | Run ESLint |
| `pnpm seed` | Seed database with dev user + demo data |

---

## License

MIT
