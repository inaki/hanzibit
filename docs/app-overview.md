# Chinese Notebook — App Overview & Feature Documentation

## What is Chinese Notebook?

Chinese Notebook is a notebook-style web application designed for structured Chinese (Mandarin) language learning. It combines the feel of a personal journal with the structure of a language course, giving learners a single place to write, review, annotate, and track their progress through the HSK (Hanyu Shuiping Kaoshi) proficiency levels.

The core idea is simple: **learning a language works best when it's personal, organized, and consistent.** Chinese Notebook provides the scaffolding — HSK-aligned content, vocabulary tracking, spaced-repetition flashcards, grammar references — while letting the learner own the process through daily journal writing and self-annotation.

---

## Why Chinese Notebook Is Effective for Learning Chinese

### 1. Active Writing Over Passive Reading

Most language apps focus on consuming content — reading, listening, choosing from multiple-choice answers. Chinese Notebook flips this by making **writing the primary activity**. Learners compose journal entries in Chinese, which forces recall, reinforces character recognition, and builds sentence construction skills. Writing is one of the most effective ways to move vocabulary from short-term to long-term memory.

### 2. HSK-Aligned Progression

Content is organized around the official HSK levels (1–6), the standardized Chinese proficiency test recognized worldwide. Each journal entry and lesson ties to a specific HSK level, so learners always know exactly where they are and what they need to learn next. The progress tracker gives a concrete, visual sense of advancement.

### 3. Contextual Vocabulary Learning

Rather than drilling isolated word lists, vocabulary appears **in context** within journal entries. Key words are highlighted in the text where they're actually used, making it easier to understand meaning, usage patterns, and grammatical context. This mirrors how native speakers encounter new words — through real usage, not flashcard decks alone.

### 4. Self-Annotation and Personal Notes

Every journal entry has a dedicated space for the learner's own grammar tips, mnemonics, and observations. Research shows that **self-generated explanations** stick far better than pre-written ones. When a learner writes "累 looks like a person working in a field with a burden above — no wonder they're tired!" they're creating a personal memory hook that no textbook can replicate.

### 5. Spaced Repetition Built In

The flashcard system uses spaced repetition to surface vocabulary at optimal intervals. Combined with the "Recent Reviews" section, learners revisit material right when they're about to forget it, maximizing retention with minimal effort.

### 6. Consistent Daily Practice

The "Character of the Day" widget and the daily journal format create a natural daily habit loop. Language learning is a long game — consistency beats intensity — and the app is designed around a sustainable daily practice of 10–20 minutes.

---

## App Structure

The app has four major areas: the **Landing Page** (marketing), **Authentication**, the **Notebook** (main app), and a **Design System** that ties it all together.

---

## Landing Page

The landing page introduces the app to new visitors and drives them toward account creation.

### Navigation Bar

A sticky header with the app logo (orange BookOpen icon + "Chinese Notebook" wordmark), links to page sections (Features, Preview, Pricing), and authentication buttons (Sign In, Get Started). The nav uses a frosted-glass effect (`backdrop-blur`) to stay readable over scrolling content.

### Hero Section

The main headline — **"Master Chinese, One Character at a Time"** — communicates the app's step-by-step philosophy. The background features faintly rendered Chinese characters (学 "study", 写 "write", 读 "read") as decorative elements that reinforce the app's identity without distracting from the content. A badge reads "Your personal Chinese learning companion" and two call-to-action buttons lead to sign-up or a demo preview.

### Features Grid

Six feature cards in a responsive grid, each with an icon, title, and description:

| Feature | Description |
|---|---|
| **Daily Journal** | Write daily entries in Chinese with guided prompts. Build writing confidence one day at a time. |
| **Vocabulary Builder** | Organize vocabulary by HSK level, theme, or custom categories. Never lose track of new words. |
| **Smart Flashcards** | Spaced repetition flashcards that adapt to your learning pace. Focus on what you need most. |
| **Progress Tracking** | Track your HSK level progress with detailed analytics. See how far you've come. |
| **Grammar Points** | Structured grammar lessons with clear explanations, examples, and self-notes. |
| **Pronunciation** | Practice pronunciation with pinyin guides and audio support for every character. |

Each card has a hover effect where the icon background transitions from light orange to solid orange with a white icon, giving the page a lively, interactive feel.

### Interactive Demo

A fully rendered, non-functional preview of the actual notebook interface, embedded directly in the landing page. This shows visitors exactly what the app looks like before they sign up — the sidebar, progress bar, journal entry, Chinese text with highlighted vocabulary, and the self-notes section. This is one of the most effective conversion elements because it removes uncertainty about what the product is.

### Pricing Section

Two tiers presented side by side:

**Free ($0/month)**
- Daily journal entries
- Basic vocabulary list
- HSK 1 content
- 5 flashcard reviews per day

**Pro ($9/month)** — highlighted with an orange border
- Unlimited journal entries
- All HSK levels (1–6)
- Unlimited flashcards
- Grammar deep-dives
- Pronunciation practice
- Export & print

### Footer

Logo, legal links (Privacy, Terms, Contact), and copyright.

---

## Authentication

Authentication is handled by [Better Auth](https://www.better-auth.com/), an open-source auth library, with a SQLite database for local development.

### Sign In Page (`/auth/signin`)

- Email and password form with validation
- Social login buttons for GitHub and Google (OAuth)
- Error display for failed attempts
- Loading state while authenticating
- Link to sign-up page

### Sign Up Page (`/auth/signup`)

- Name, email, and password fields (password requires 8+ characters)
- Same OAuth options as sign-in
- Redirects to the notebook on success
- Link to sign-in page

### Auth Configuration

- **Server** (`lib/auth.ts`): Better Auth with SQLite via `better-sqlite3`, email/password enabled, optional GitHub and Google OAuth
- **Client** (`lib/auth-client.ts`): React client with `signIn`, `signUp`, `signOut`, `useSession` exports
- **API Route** (`/api/auth/[...all]`): Catch-all handler for all auth endpoints

---

## The Notebook (Main Application)

This is the core of the app — the interface students use daily. It's structured as a three-column layout.

### Top Navigation Bar

| Element | Purpose |
|---|---|
| Logo | App branding with orange BookOpen icon |
| Lessons link | Navigate to lesson content |
| Flashcards link | Navigate to flashcard review mode |
| My Notebook link | Current view (active state with orange underline) |
| Search bar | Search for Chinese characters across entries (rounded, with search icon) |
| Settings button | App settings |
| User avatar | Circular avatar with user initials on orange background |

### Left Sidebar

The sidebar (240px wide, visible on large screens) contains three sections:

#### Current Progress

Displays the learner's HSK level and completion percentage. In the demo state this shows **HSK 2 Level** at **65%** with an orange progress bar. This gives learners an at-a-glance view of where they stand in the current proficiency level.

#### Notebook Sections

Four navigable sections, each with an icon:

| Section | Icon | Purpose |
|---|---|---|
| **Daily Journal** | PenLine | The primary writing area where learners compose and review journal entries |
| **Vocabulary List** | BookOpen | A collection of all vocabulary encountered, organized by level/theme |
| **Grammar Points** | Languages | Reference section for grammar rules, patterns, and examples |
| **Recent Reviews** | RotateCcw | Previously studied entries and flashcards due for review |

The active section is highlighted with an orange background and white text. Inactive sections show gray text with a subtle hover effect.

#### Character of the Day

A small widget at the bottom of the sidebar that highlights a single Chinese character each day. Shows the character in large orange text, its pinyin romanization, and English meaning. For example:

> **学** — xué — To study / learn

This serves as a daily micro-lesson and conversation starter, encouraging learners to open the app even when they don't have time for a full journal entry.

### Main Content Area — Journal Entry

The central area displays journal entries on a white card with generous padding, set against a warm beige background (`#f5f3f0`) that evokes the feel of a physical notebook.

#### Entry Header

Each entry is contextualized with:
- **Unit and level tag**: "UNIT 4: DAILY LIFE · Intermediate HSK 2" in orange uppercase text
- **Date**: "October 24, 2023" in orange
- **Entry number**: "Entry #142" in gray

This metadata helps learners orient themselves within the curriculum and track their consistency.

#### Entry Title

The title appears in both Chinese and English: **我的一天 (My Day)**. The Chinese title is rendered in large, bold text (48px), while the English translation appears smaller and lighter alongside it.

#### Chinese Text Content

The body of the journal entry is Chinese text rendered at 22px with double line-height for readability. This generous spacing is intentional — Chinese characters are denser than Latin text and need more breathing room, especially for learners who are still building character recognition.

**Vocabulary highlighting** is the key feature here. Important or new vocabulary words appear in **bold orange text**, making them visually distinct from the surrounding text. In the demo entry, the highlighted words are:

| Character | Pinyin | Meaning |
|---|---|---|
| 累 | lèi | tired |
| 高兴 | gāoxìng | happy |
| 早餐 | zǎocān | breakfast |
| 咖啡 | kāfēi | coffee |
| 学习 | xuéxí | to study |
| 写字 | xiězì | to write characters |

This inline highlighting teaches vocabulary in context — learners see new words where they're actually used, not in isolation.

#### Self-Notes & Annotations

Below the journal text is an orange-tinted annotation section with a left border accent. This area contains user-created notes in a two-column card layout:

**Grammar Tip**
> The particle "也" (yě) always comes after the subject and before the adjective/verb.

**Mnemonic**
> "累" (lèi) looks like a person working in a field (田) with a burden above. No wonder they are tired!

These are meant to be written by the learner themselves. Self-generated explanations and memory aids are significantly more effective for retention than pre-written notes.

### Right Action Bar

A narrow vertical toolbar (56px wide, visible on large screens) with icon buttons:

| Button | Icon | Purpose |
|---|---|---|
| **Edit entry** | Pencil | Edit the current journal entry |
| **Pronunciation** | Microphone | Listen to pronunciation of the entry or selected text |
| **Flashcard mode** | Layers | Convert highlighted vocabulary into flashcards for review |
| **New entry** | Plus (orange FAB) | Create a new journal entry — the primary action, visually prominent |
| **Bookmark** | Bookmark (red) | Save the current entry for quick access later |
| **Print** | Printer | Print the entry for offline study |

All buttons have tooltips (appearing on the left side) for discoverability. The "New entry" button is the most prominent — a large orange circle with a shadow — because creating new entries is the most important action in the app.

---

## Design System

### Color Palette

The app's visual identity is built around a warm orange that evokes energy, enthusiasm, and the traditional red-orange tones often associated with Chinese culture.

| Token | Light Mode | Dark Mode | Usage |
|---|---|---|---|
| `--cn-orange` | `#e8601c` | `#f07030` | Primary brand color, highlights, active states |
| `--cn-orange-light` | `#fef3ed` | `#2a1a10` | Backgrounds for orange-tinted sections |
| `--cn-orange-dark` | `#c44d14` | `#ff8844` | Hover states on orange buttons |
| `--background` | warm off-white | dark gray | Page background |
| `--card` | pure white | dark gray | Card surfaces |
| `--foreground` | near-black | off-white | Primary text |
| `--muted-foreground` | medium gray | light gray | Secondary text |

### Typography

- **Primary font**: Geist Sans — a clean, modern sans-serif from Google Fonts
- **Monospace font**: Geist Mono — for code or technical content
- **Chinese text**: Rendered at 22px with 2x line-height for comfortable reading
- **Headings**: Bold with tight tracking for impact
- **UI text**: Small (12–14px) with appropriate weight hierarchy

### Layout Philosophy

The app uses a "notebook page" metaphor — a white card centered on a warm beige background, surrounded by tools and navigation. This creates a focused, distraction-free writing environment that feels personal rather than institutional.

- **Three-column layout**: Sidebar (context/navigation) → Content (primary focus) → Action bar (tools)
- **Responsive design**: Sidebar and action bar collapse on smaller screens, leaving the content area full-width
- **Generous whitespace**: Especially in the journal entry area, where readability of Chinese characters is paramount

### Component Library

Built on [shadcn/ui](https://ui.shadcn.com/) with the `base-nova` style, using `@base-ui/react` primitives for accessibility. Components include:

- Button (6 variants, 8 sizes)
- Input, Avatar, Progress, Tooltip
- Card, Badge, Dialog, Dropdown Menu
- Sheet, Tabs, Separator, Scroll Area

All components support the custom orange theme and dark mode.

---

## Technical Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui (base-nova) with @base-ui/react |
| Authentication | Better Auth (email/password + OAuth) |
| Database | SQLite via better-sqlite3 |
| Icons | Lucide React |
| Language | TypeScript |
| Package Manager | pnpm |

---

## Development Setup

```bash
pnpm install                          # Install dependencies
npx @better-auth/cli migrate \
  --config src/lib/auth.ts -y         # Create database tables
pnpm dev                              # Start dev server at localhost:3000
pnpm seed                             # Create dev user (dev@chinese-notebook.local / password123)
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | Required | Purpose |
|---|---|---|
| `BETTER_AUTH_SECRET` | Yes | Session encryption secret |
| `BETTER_AUTH_URL` | Yes | App URL (http://localhost:3000) |
| `NEXT_PUBLIC_APP_URL` | Yes | Public app URL for client-side auth |
| `GITHUB_CLIENT_ID` | No | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | No | GitHub OAuth client secret |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret |
