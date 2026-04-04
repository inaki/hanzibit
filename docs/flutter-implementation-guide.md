# HanziBit Flutter App — Implementation Guide

This document is the complete technical handoff for building the HanziBit iOS/Android/iPad app in Flutter. The web app (Next.js + Postgres) remains the backend — Flutter is a new client that calls a REST API layer added on top of it.

---

## 1. What You Are Building

HanziBit is a Mandarin learning app with these core features:

- **Chinese journal** — write entries using inline annotation markup `[汉字|pinyin|meaning]`
- **Interlinear gloss view** — renders journal entries with pinyin above characters and English below, segmented via CEDICT dictionary
- **Spaced repetition flashcards** — SM-2 algorithm, due queue sorted by ease factor
- **HSK study guide** — word lists per HSK level (1–6), per-word flashcard status
- **Dashboard** — streak, HSK progress, weak cards, character of the day
- **Vocabulary list**, **grammar points** (Pro), **review history**, **numbers reference**
- **Audio pronunciation** — Azure TTS via server endpoint
- **Subscription** — free tier (HSK 1 + 5 reviews/day), Pro tier (all levels + unlimited)

---

## 2. Architecture Overview

```
Flutter App
    │
    ├─ REST API  ──►  Next.js API routes  ──►  Postgres (Neon)
    │                      │
    │                      ├─ Better Auth (email/password, Google, GitHub)
    │                      ├─ Stripe (subscriptions)
    │                      └─ Azure TTS
    │
    └─ local SQLite (offline flashcard cache — Phase 2)
```

The Flutter app is a **pure client**. All business logic (streak calculation, SM-2, paywall gating, CEDICT segmentation) runs server-side. Flutter calls JSON endpoints and renders the responses.

---

## 3. Backend API — What Needs to Be Added

The web app uses Next.js "server actions" (server-side functions), not REST endpoints. Before Flutter work begins, these REST routes must be added to the Next.js app. They live in `src/app/api/mobile/`.

All mobile API routes:
- Require a `Bearer <session_token>` header
- Return JSON
- Return `{ error: string }` on failure with appropriate HTTP status codes

### 3.1 Auth endpoints

Better Auth already exposes REST endpoints. Use these directly:

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/auth/sign-in/email` | Sign in with email + password |
| POST | `/api/auth/sign-up/email` | Create account |
| POST | `/api/auth/sign-out` | Sign out (invalidates session) |
| GET | `/api/auth/get-session` | Get current session + user info |
| GET | `/api/auth/sign-in/social?provider=google` | Start OAuth flow |
| GET | `/api/auth/sign-in/social?provider=github` | Start OAuth flow |

**Session token:** After sign-in, Better Auth returns a `Set-Cookie` header with the session cookie. Store this token in `flutter_secure_storage` and send it as a cookie on all subsequent requests.

**Request example:**
```
POST /api/auth/sign-in/email
Content-Type: application/json

{ "email": "user@example.com", "password": "secret" }
```

**Response:**
```json
{
  "token": "...",
  "user": { "id": "...", "email": "...", "name": "..." }
}
```

### 3.2 Mobile API routes to create

Create these files in `src/app/api/mobile/`. Each is a thin wrapper over existing `data.ts` functions.

#### Journal

```
GET    /api/mobile/journal              → list all entries (newest first)
GET    /api/mobile/journal/:id          → single entry
POST   /api/mobile/journal              → create entry
PUT    /api/mobile/journal/:id          → update entry
DELETE /api/mobile/journal/:id          → delete entry
POST   /api/mobile/journal/:id/bookmark → toggle bookmark
```

**GET /api/mobile/journal response:**
```json
[
  {
    "id": "uuid",
    "title_zh": "我的周末",
    "title_en": "My Weekend",
    "unit": "Unit 3",
    "hsk_level": 1,
    "content_zh": "我去[餐厅|cān tīng|restaurant]吃饭。",
    "bookmarked": false,
    "created_at": "2026-04-01T10:00:00Z",
    "updated_at": "2026-04-01T10:00:00Z"
  }
]
```

**POST /api/mobile/journal body:**
```json
{
  "title_zh": "我的周末",
  "title_en": "My Weekend",
  "unit": "Unit 3",
  "hsk_level": 1,
  "content_zh": "我去[餐厅|cān tīng|restaurant]吃饭。"
}
```

#### Gloss

```
POST /api/mobile/gloss    → segment + gloss a content string
```

**Request:**
```json
{ "content": "我去[餐厅|cān tīng|restaurant]吃饭。" }
```

**Response:**
```json
{
  "paragraphs": [
    [
      { "type": "gloss", "hanzi": "我", "pinyin": "wǒ", "english": "I", "userAnnotated": false },
      { "type": "gloss", "hanzi": "去", "pinyin": "qù", "english": "go", "userAnnotated": false },
      { "type": "gloss", "hanzi": "餐厅", "pinyin": "cān tīng", "english": "restaurant", "userAnnotated": true },
      { "type": "gloss", "hanzi": "吃饭", "pinyin": "chī fàn", "english": "eat", "userAnnotated": false },
      { "type": "punctuation", "char": "。" }
    ]
  ]
}
```

This is the most expensive call — it hits the CEDICT table. Cache aggressively on the Flutter side per entry ID.

#### Flashcards

```
GET  /api/mobile/flashcards          → all cards (sorted next_review ASC)
GET  /api/mobile/flashcards/due      → due cards only (next_review <= NOW(), ease ASC)
POST /api/mobile/flashcards          → create card(s)
POST /api/mobile/flashcards/:id/review  → submit SM-2 review
DELETE /api/mobile/flashcards/:id    → delete card
```

**POST /api/mobile/flashcards body:**
```json
{
  "cards": [
    { "front": "餐厅", "back": "cān tīng — restaurant", "deck": "Journal: 我的周末" }
  ],
  "source_entry_id": "uuid-optional"
}
```

**POST /api/mobile/flashcards/:id/review body:**
```json
{ "quality": 3 }
```
Quality scale: 1=Again, 2=Hard, 3=Good, 5=Easy

**Review response:**
```json
{ "interval": 6, "ease_factor": 2.5 }
```
Or if daily limit reached (free users):
```json
{ "error": "DAILY_LIMIT_REACHED" }
```

#### Dashboard

```
GET /api/mobile/dashboard    → all dashboard data in one call
```

**Response:**
```json
{
  "streak": 7,
  "progress": { "encountered": 45, "total": 150, "percent": 30 },
  "stats": { "entryCount": 12, "vocabCount": 34, "reviewCount": 89, "avgMastery": 0 },
  "weakCards": [
    { "id": "uuid", "front": "难", "back": "nán — difficult", "ease_factor": 1.4, "review_count": 5 }
  ],
  "characterOfTheDay": { "simplified": "好", "pinyin": "hǎo", "english": "good", "hsk_level": 1 }
}
```

#### Study guide (lessons)

```
GET /api/mobile/lessons?level=1    → HSK level study guide data
```

**Response:**
```json
{
  "level": 1,
  "locked": false,
  "summary": { "total": 150, "encountered": 45, "withFlashcard": 20, "dueForReview": 3 },
  "words": [
    {
      "id": 1,
      "simplified": "你好",
      "pinyin": "nǐ hǎo",
      "english": "hello",
      "hsk_level": 1,
      "encountered": true,
      "flashcard": {
        "id": "uuid",
        "nextReview": "2026-04-05T00:00:00Z",
        "intervalDays": 6,
        "easeFactor": 2.5,
        "reviewCount": 2
      }
    }
  ],
  "grammarPoints": []
}
```

#### Other endpoints

```
GET  /api/mobile/vocabulary          → vocabulary list
GET  /api/mobile/reviews             → recent review history (last 50)
GET  /api/mobile/grammar             → grammar points (returns locked:true for free users)
GET  /api/mobile/subscription        → { plan: "free"|"pro", status: string }
GET  /api/tts?text=你好              → MP3 audio (existing endpoint, reuse as-is)
```

---

## 4. Flutter Project Structure

```
lib/
├── main.dart
├── app.dart                    # MaterialApp + router + theme
│
├── core/
│   ├── api/
│   │   ├── api_client.dart     # HTTP client, base URL, auth header injection
│   │   ├── auth_api.dart
│   │   ├── journal_api.dart
│   │   ├── flashcard_api.dart
│   │   ├── dashboard_api.dart
│   │   ├── lessons_api.dart
│   │   └── gloss_api.dart
│   ├── models/                 # Dart data classes (fromJson/toJson)
│   │   ├── journal_entry.dart
│   │   ├── flashcard.dart
│   │   ├── gloss_segment.dart
│   │   ├── study_guide.dart
│   │   ├── dashboard_data.dart
│   │   └── user.dart
│   ├── storage/
│   │   └── secure_storage.dart # flutter_secure_storage wrapper
│   └── providers/              # Riverpod providers (or Bloc — see §6)
│       ├── auth_provider.dart
│       ├── journal_provider.dart
│       └── flashcard_provider.dart
│
├── features/
│   ├── auth/
│   │   ├── sign_in_screen.dart
│   │   └── sign_up_screen.dart
│   ├── journal/
│   │   ├── journal_screen.dart        # entry list + detail
│   │   ├── entry_detail_screen.dart   # gloss view
│   │   ├── entry_editor_screen.dart   # create/edit with markup input
│   │   └── widgets/
│   │       ├── interlinear_gloss.dart # THE core widget (see §7)
│   │       └── entry_card.dart
│   ├── flashcards/
│   │   ├── flashcard_screen.dart
│   │   └── widgets/
│   │       ├── flashcard_card.dart
│   │       └── score_buttons.dart
│   ├── dashboard/
│   │   └── dashboard_screen.dart
│   ├── lessons/
│   │   ├── lessons_screen.dart
│   │   └── word_row.dart
│   ├── vocabulary/
│   │   └── vocabulary_screen.dart
│   └── settings/
│       └── settings_screen.dart
│
└── shared/
    ├── widgets/
    │   ├── upgrade_prompt.dart
    │   ├── hsk_level_selector.dart
    │   └── streak_badge.dart
    └── theme/
        └── app_theme.dart
```

---

## 5. Key Dependencies

```yaml
dependencies:
  flutter:
    sdk: flutter

  # Navigation
  go_router: ^13.0.0

  # State management
  flutter_riverpod: ^2.5.0
  riverpod_annotation: ^2.3.0

  # HTTP
  dio: ^5.4.0

  # Auth + secure storage
  flutter_secure_storage: ^9.0.0

  # Audio
  just_audio: ^0.9.38

  # In-app purchases (Phase 2)
  purchases_flutter: ^7.0.0   # RevenueCat

  # URL launcher (Stripe web checkout)
  url_launcher: ^6.2.0

  # Local SQLite (Phase 2 offline)
  sqflite: ^2.3.0

  # Utilities
  freezed_annotation: ^2.4.0
  json_annotation: ^4.9.0

dev_dependencies:
  build_runner: ^2.4.0
  freezed: ^2.4.0
  json_serializable: ^6.8.0
  riverpod_generator: ^2.3.0
```

---

## 6. State Management

Use **Riverpod** with code generation. Each feature has a notifier that calls the API and exposes `AsyncValue<T>`.

Example pattern for journal:

```dart
// core/providers/journal_provider.dart

@riverpod
class JournalNotifier extends _$JournalNotifier {
  @override
  Future<List<JournalEntry>> build() async {
    return ref.read(journalApiProvider).getEntries();
  }

  Future<void> create(CreateEntryRequest req) async {
    await ref.read(journalApiProvider).createEntry(req);
    ref.invalidateSelf();
  }
}
```

---

## 7. The Interlinear Gloss Widget

This is the most important and most complex widget in the app. It renders Chinese text with pinyin above and English below each word.

**Input:** A list of `GlossSegment` objects from `POST /api/mobile/gloss`

**Layout:** Use `Wrap` with custom inline widgets. Each glossed word is a `Column` of three rows:
1. Pinyin (small, muted, top)
2. Hanzi (large, bold, center)
3. English (small, muted, bottom)

Punctuation renders inline without the pinyin/english rows. Line breaks (`type: "break"`) force a new `Wrap`.

User-annotated tokens (from the `[汉字|pinyin|meaning]` markup) can be highlighted with the orange brand color to distinguish them from auto-glossed CEDICT tokens.

```dart
class GlossTokenWidget extends StatelessWidget {
  final GlossSegment segment;

  @override
  Widget build(BuildContext context) {
    if (segment.type == 'punctuation') {
      return Text(segment.char, style: hanziStyle);
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 2, vertical: 4),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(segment.pinyin, style: pinyinStyle),
          Text(
            segment.hanzi,
            style: hanziStyle.copyWith(
              color: segment.userAnnotated ? AppColors.orange : null,
            ),
          ),
          Text(segment.english, style: englishStyle),
        ],
      ),
    );
  }
}
```

On iPad, this view has room to breathe — increase font sizes and horizontal padding.

---

## 8. The Markup Editor

The journal entry editor needs to support the inline annotation format:
`[汉字|pinyin|meaning]`

**Approach:** A plain `TextField` with a monospace font is sufficient for v1. Users type the markup directly, as on web.

For v2, add an "annotate" helper:
- User selects a Chinese word in the text
- A bottom sheet appears with a search field hitting `/api/mobile/gloss` for that word
- Selecting a result inserts the formatted `[hanzi|pinyin|meaning]` markup at the cursor

This avoids a custom `TextEditingController` for v1 while still being functional.

---

## 9. Flashcard Screen

The SM-2 flow:

1. Show card front (Chinese character, large)
2. "Pronounce" button → `GET /api/tts?text=<hanzi>` → play MP3 via `just_audio`
3. Tap card to flip → show back (pinyin + meaning)
4. Show four score buttons: Again (1), Hard (2), Good (3), Easy (5)
5. On tap → `POST /api/mobile/flashcards/:id/review` with `{ quality: N }`
6. Show feedback ("Next review in 6 days") → auto-advance after 1.2s
7. On `DAILY_LIMIT_REACHED` error → show `UpgradePrompt` widget

**Due filter:** Fetch `/api/mobile/flashcards/due` for the "Due" tab, all cards for "All" tab.

---

## 10. Audio Pronunciation

The TTS endpoint already exists at `GET /api/tts?text=<encoded_text>` and returns MP3 audio.

```dart
final player = AudioPlayer();

Future<void> pronounce(String text) async {
  final url = '${ApiClient.baseUrl}/api/tts?text=${Uri.encodeComponent(text)}';
  await player.setUrl(url, headers: {'Cookie': sessionCookie});
  await player.play();
}
```

The endpoint caches audio for 24 hours on the server. Consider caching locally too using `path_provider` + a simple filename hash.

---

## 11. Authentication Flow

1. App starts → check `flutter_secure_storage` for stored session token
2. If found → `GET /api/auth/get-session` to validate → if valid, go to main app
3. If not found or invalid → show sign-in screen

**Sign in:**
```
POST /api/auth/sign-in/email
{ "email": "...", "password": "..." }
```
Store the returned token in secure storage. Send as `Cookie: better-auth.session_token=<token>` on all requests.

**Social login (Google/GitHub):**
Use `url_launcher` to open the OAuth URL in the system browser. Better Auth will redirect back to a deep link (`hanzibit://auth/callback?token=...`). Register the scheme in `AndroidManifest.xml` and `Info.plist`.

**Sign out:**
```
POST /api/auth/sign-out
```
Clear secure storage → navigate to sign-in screen.

---

## 12. Subscription + Paywall

### Free tier limits (enforced server-side)
- HSK Level 1 only (lessons, study guide)
- 5 flashcard reviews per day

The server enforces these limits — Flutter just needs to handle the error responses and show an upgrade prompt.

### Paywall UI
Show an `UpgradePrompt` widget (orange-bordered card with lock icon and "Upgrade to Pro" button) when:
- `GET /api/mobile/lessons?level=2` returns `{ "locked": true }`
- `POST /api/mobile/flashcards/:id/review` returns `{ "error": "DAILY_LIMIT_REACHED" }`
- `GET /api/mobile/grammar` returns locked state

### Upgrade flow
**Do NOT implement in-app purchases for v1.** Apple and Google require IAP for digital subscriptions sold in the app, which means 30% cut + significant compliance work.

Instead:
1. "Upgrade" button opens the web pricing page via `url_launcher`
2. User subscribes on the web with Stripe
3. App re-fetches `/api/mobile/subscription` on next foreground resume

This is legally compliant as long as the app doesn't mention the price inside the app binary itself.

**Phase 2:** Implement RevenueCat (`purchases_flutter`) for native IAP with server-side receipt validation synced to the Postgres `subscriptions` table.

---

## 13. Settings

| Setting | Storage | Notes |
|---------|---------|-------|
| HSK level preference | `flutter_secure_storage` or app prefs | Determines which level loads by default |
| Dark/light mode | `SharedPreferences` | System default on first launch |
| Font size | `SharedPreferences` | Affects gloss widget sizing |

---

## 14. iPad Layout

Flutter handles iPad via `LayoutBuilder` and screen width breakpoints. Use a two-column layout on wide screens (≥768dp):

```dart
class AdaptiveJournalLayout extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    if (width >= 768) {
      return Row(
        children: [
          SizedBox(width: 300, child: EntryListPanel()),
          Expanded(child: EntryDetailPanel()),
        ],
      );
    }
    return EntryListScreen(); // phone: stack navigation
  }
}
```

Use `NavigationRail` on iPad (left side), `BottomNavigationBar` on phone.

---

## 15. Build + Environment

The base API URL must be configurable per environment:

```dart
// lib/core/api/api_client.dart
const _baseUrl = String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: 'http://localhost:3000',
);
```

Build with:
```bash
# Development
flutter run --dart-define=API_BASE_URL=http://localhost:3000

# Production
flutter build ios --dart-define=API_BASE_URL=https://hanzibit.com
flutter build apk --dart-define=API_BASE_URL=https://hanzibit.com
```

---

## 16. Implementation Order

Build in this order — each phase is independently shippable.

### Phase 1 — Core loop (journal + flashcards)
1. Backend: Add all `/api/mobile/` routes to Next.js
2. Flutter project setup: dependencies, theme, router, API client, secure storage
3. Auth screens (sign in / sign up)
4. Journal screen: entry list + entry detail with interlinear gloss view
5. Journal entry editor (plain text markup input)
6. Flashcard screen: practice mode with SM-2 scoring + TTS audio
7. Dashboard screen

### Phase 2 — Full feature parity
8. HSK lessons / study guide screen
9. Vocabulary list
10. Grammar points (with Pro lock)
11. Review history
12. Numbers reference
13. Settings screen
14. iPad two-column layouts

### Phase 3 — Native polish
15. Offline flashcard cache (SQLite sync)
16. Markup editor autocomplete (CEDICT search)
17. RevenueCat IAP
18. Push notifications for due flashcards

---

## 17. Brand + Design Tokens

| Token | Value |
|-------|-------|
| Primary orange | `#E8651A` |
| Orange light (bg) | `#FFF0E6` |
| Orange dark | `#C4520F` |
| Background (light) | `#FAFAF8` |
| Card (light) | `#FFFFFF` |
| Muted (light) | `#F4F4F4` |
| Foreground (light) | `#1A1A1A` |
| Muted text (light) | `#737373` |
| Background (dark) | `#141414` |
| Card (dark) | `#1E1E1E` |
| Muted (dark) | `#2A2A2A` |
| Foreground (dark) | `#FAFAFA` |
| Muted text (dark) | `#A1A1A1` |
| Font | System default (SF Pro on iOS, Roboto on Android) |

---

## 18. Questions to Resolve Before Starting

1. **OAuth deep link scheme** — confirm `hanzibit://` is registered and the Next.js app handles the redirect
2. **CORS** — the Next.js API must allow the Flutter app's origin (or use cookie auth correctly)
3. **Better Auth mobile token format** — confirm whether Better Auth returns a bearer token or only sets a cookie; mobile needs a token it can store and send
4. **Production URL** — confirm the production domain for `API_BASE_URL`
5. **Minimum OS versions** — iOS 16+? Android API 26+?
6. **Tablet-first or phone-first** — recommend starting with iPad layout given the app's content density, then adapting down to phone
