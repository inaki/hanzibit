# HanziBit: What This App Is About

## Summary

HanziBit is a Mandarin learning web app built around one central idea: learners should not only memorize vocabulary, they should use it in their own writing.

The app combines a personal journal, an HSK-based study guide, vocabulary lookup, grammar notes, flashcards, and lightweight progress tracking into a single notebook-style interface. Instead of treating Chinese as a sequence of isolated drills, it treats learning as a loop:

1. Write something in Chinese.
2. Mark or inspect the words inside that writing.
3. Turn useful words into flashcards.
4. Review them with spaced repetition.
5. Track how much of the current HSK level you have actually encountered.

## Who It Is For

The app is aimed at Mandarin learners, especially beginners and lower-intermediate learners working through HSK material. The current implementation is especially well suited for:

- Self-learners who want to keep a Chinese journal.
- Students following HSK vocabulary and grammar level by level.
- Learners who want pinyin and English support without leaving the text they are reading.
- People who prefer building study material from their own sentences instead of consuming only pre-made decks.

## Core Product Idea

The main experience is the notebook page at `/notebook`.

Users create journal entries with:

- A Chinese title
- An English title
- A Chinese body
- An optional unit label
- An HSK level

Inside the journal text, users can annotate vocabulary inline with a custom markup format:

```text
[汉字|pin1 yin1|english meaning]
```

Example:

```text
我去[餐厅|can1 ting1|restaurant]吃饭
```

That markup powers several parts of the app:

- Orange inline vocabulary highlighting in entries
- Hover/click pinyin and meaning popovers
- Pronunciation lists for the current entry
- Flashcard creation from words found in the entry

This makes the journal the source of truth for study, instead of a separate exercise disconnected from real usage.

## Main Areas Of The App

### 1. Landing Page

The home page is a marketing/entry page for the product. It explains the concept, shows feature cards, includes a product demo section, and presents Free/Pro pricing.

This page is mainly for discovery and conversion. It is not part of the learning workflow itself.

### 2. Authentication

The app uses Better Auth with:

- Email/password sign-in
- GitHub OAuth
- Google OAuth

In development, server-side data access falls back to a seeded dev user when there is no session. That makes local development easier and lets the notebook load even without a real signed-in session.

### 3. Notebook

This is the actual product. The notebook layout includes:

- A top navigation bar
- A left sidebar with progress and section links
- A main content area
- A right action bar on desktop
- Mobile-specific navigation and action dialogs

The notebook sections are:

- `Daily Journal`
- `Study Guide`
- `Flashcards`
- `Vocabulary List`
- `Numbers Guide`
- `Grammar Points`
- `Recent Reviews`

## What Users Can Do Today

### Journal Writing

Users can create and edit journal entries from the action bar. Each entry supports:

- Chinese and English titles
- HSK level tagging
- Unit labeling
- Rich inline vocabulary markup
- Bookmarking
- Printing

The journal view is the center of the app and is the most complete workflow currently implemented.

### Inline Vocabulary Support

Vocabulary inside entries is not auto-detected by default in the normal journal view. It is explicitly marked by the user with inline notation. This is important because it means the app is built around curated learning moments chosen by the learner.

When rendered, marked words show:

- Hanzi
- Pinyin
- English gloss

### Interlinear Glossing

The app also has an interlinear gloss mode. When activated, the entry is transformed into a word-by-word stacked view showing:

- Hanzi
- Pinyin
- English meaning

This glossing uses two sources:

- User-authored inline markup
- Dictionary-backed segmentation from imported CEDICT data

That makes the feature useful both for explicitly annotated words and for raw Chinese text that the learner did not manually tag.

### Pronunciation Help

For words marked in an entry, the app can open a pronunciation dialog and speak the hanzi using the browser's built-in speech synthesis.

This is lightweight pronunciation support, not a custom audio pipeline.

### Flashcards And Review

Users can create flashcards from journal-entry vocabulary or from the study guide. Flashcards are reviewed with an SM-2 spaced repetition algorithm and store:

- Next review date
- Review interval
- Ease factor
- Review count

The flashcards page supports:

- Practice mode
- Browse-all mode
- Filtering due cards
- Scoring cards as `Again`, `Hard`, `Good`, or `Easy`

Each review writes to a review history log.

### Study Guide

The route named `/notebook/lessons` is currently a study guide rather than a traditional lesson reader.

It lets users:

- Switch between HSK levels 1 through 6
- Browse imported HSK words
- Filter words by encountered/not encountered/flashcard status
- Search by hanzi, pinyin, or English
- See whether a word has appeared in journal entries
- Create a flashcard directly from a study-guide word
- View grammar points for the selected HSK level

This is one of the app's strongest features because it connects official HSK vocabulary with the learner's own writing history.

### Progress Tracking

Progress is measured against imported HSK word lists.

For the selected HSK level, the app estimates progress by checking whether HSK words have appeared in:

- The user's journal entries
- The fronts of the user's flashcards

This produces a simple "encountered vs total" progress metric in the sidebar.

### Vocabulary List

The vocabulary page is currently powered by imported HSK vocabulary data, not just the user's personal saved vocabulary table.

It functions as a browsable HSK word reference with level summaries.

### Grammar Points

The grammar page shows saved grammar points for the current user. Each point includes:

- Title
- Optional pattern
- Explanation
- Example data stored as JSON

The grammar content is user-scoped and can be tied into the study guide by HSK level.

### Numbers Guide

The app includes a dedicated Chinese numbers guide. This is a self-contained teaching page for:

- 1 to 10
- Teens
- Tens and combinations
- Large-number logic using `万` and `亿`
- A number-to-Chinese converter

It is more like a mini interactive reference than a notebook feature, but it fits the broader study-tool goal of the app.

### Review History

The review page shows recent review activity across item types, currently:

- Vocabulary
- Flashcards
- Grammar

This gives the learner a lightweight study log.

## How The App Thinks About Learning

HanziBit is built around a practical learning model:

- Writing is the primary activity.
- Vocabulary should live inside meaningful sentences.
- Review should be generated from what the learner has actually used.
- HSK provides structure, but the learner's own writing provides context.

In other words, the app is trying to bridge structured curriculum and personal expression.

## Data Model In Plain English

The main database tables support these concepts:

- `journal_entries`: the user's writing
- `entry_annotations`: notes such as grammar tips and mnemonics tied to an entry
- `vocabulary`: a legacy personal vocabulary table with mastery fields
- `grammar_points`: user-scoped grammar notes
- `flashcards`: spaced-repetition cards
- `review_history`: log of completed reviews
- `hsk_words`: imported official study vocabulary
- `cedict_entries`: dictionary data used for glossing and lookup
- `gloss_cache`: cached interlinear gloss output
- `subscriptions`: Stripe subscription state

At a high level, the app mixes two data sources:

- Personal learning data created by the user
- Reference data imported from HSK and CEDICT

## Business Model And Billing

The codebase includes a Free/Pro pricing model and Stripe integration:

- Checkout session creation
- Billing portal access
- Subscription persistence in SQLite
- Free and Pro plan definitions

However, most feature gating is not yet enforced inside the notebook experience itself. The billing system and pricing UI exist, but the product is still closer to a functional learning prototype than a fully locked-down SaaS app.

## Current Positioning

The most accurate way to describe the app today is:

> A notebook-style Mandarin learning app that helps users write Chinese journal entries, annotate vocabulary in context, generate flashcards, review with spaced repetition, and track progress against HSK vocabulary.

It is not just a flashcard app, not just a dictionary, and not just a lesson platform. Its distinguishing angle is that the learner's own writing sits at the center of the study workflow.

## Important Implementation Notes

- The journal annotation format is a core product mechanic, not an incidental implementation detail.
- `/notebook/lessons` is currently a study guide, despite the route name.
- Pronunciation currently relies on browser speech synthesis.
- Some landing-page claims describe intended product packaging more than strictly enforced feature access.
- The app already contains the foundation for a real subscription product, but the learning experience is the main mature part of the codebase.

## One-Sentence Description

HanziBit is a personal Mandarin study workspace where learners write journal entries in Chinese, annotate words in context, turn them into flashcards, and measure progress against the HSK curriculum.
