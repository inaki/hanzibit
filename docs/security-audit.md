# Security Audit — Hanzibit

**Date**: 2026-04-19  
**Auditor**: Claude Code  
**Scope**: Full codebase — API routes, auth, billing, DB layer, client components

---

## Implementation Plan

Track status as fixes are shipped. Update the status column and add a note with the fix date.

| # | Severity | Status | Area | Issue |
|---|----------|--------|------|-------|
| 1 | Critical | `[x] DONE 2026-04-19` | TTS API | SSML injection — user text not XML-escaped before SSML interpolation |
| 2 | High | `[x] DONE 2026-04-19` | Stripe | Unvalidated price ID — any Stripe price ID accepted in checkout |
| 3 | High | `[ ] TODO` | Secrets | Real credentials in `.env.local` — rotate manually in each service dashboard |
| 4 | Medium | `[x] DONE 2026-04-19` | Mobile API | No input size limit on `/api/mobile/gloss` — DoS via large payloads |
| 5 | Medium | `[x] DONE 2026-04-19` | Mobile API | No rate limiting on `/api/mobile/*` endpoints (gloss/flashcards/journal) |
| 6 | Medium | `[x] DONE 2026-04-19` | TTS API | No timeout on Azure TTS fetch — thread exhaustion under slow responses |
| 7 | Low | `[x] DONE 2026-04-19` | Logging | Verbose error logging leaks stack traces and user data |
| 8 | Low | `[x] DONE 2026-04-19` | Email | User `name` not HTML-escaped before interpolation into email template |

**Status key**: `[ ] TODO` → `[~] IN PROGRESS` → `[x] DONE (YYYY-MM-DD)`

---

## Findings

### 1. CRITICAL — SSML Injection in TTS Endpoint

**File**: `src/app/api/tts/route.ts:18-27`

User-supplied text is directly interpolated into SSML XML without escaping. An attacker can inject SSML tags to alter speech synthesis or attempt XML-based attacks.

```typescript
// VULNERABLE — as-is
const ssml = `<speak version='1.0' xml:lang='zh-CN'>
  <voice name='${VOICE}'>
    <prosody rate='0.85'>${text.trim()}</prosody>
  </voice>
</speak>`;
```

**PoC**: `text=测试<break/>injected` (14 chars, under the 100-char limit) breaks SSML structure.

**Fix**:
```typescript
function escapeXml(str: string): string {
  return str.replace(/[<>&"']/g, (c) => (
    { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c]!
  ));
}

const ssml = `<speak version='1.0' xml:lang='zh-CN'>
  <voice name='${VOICE}'>
    <prosody rate='0.85'>${escapeXml(text.trim())}</prosody>
  </voice>
</speak>`;
```

---

### 2. HIGH — Unvalidated Stripe Price ID

**File**: `src/app/api/stripe/checkout/route.ts:19-25, 62-66`

The `priceId` from the request body is only checked for existence, then passed directly to Stripe. An attacker can substitute any Stripe price ID — including test/competitor products.

```typescript
// VULNERABLE — as-is
const { priceId } = await req.json();
if (!priceId) return NextResponse.json({ error: "..." }, { status: 400 });
// ...
line_items: [{ price: priceId, quantity: 1 }],
```

**Fix**: Whitelist against the configured price IDs:
```typescript
const ALLOWED_PRICE_IDS = new Set([
  process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID,
  process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID,
].filter(Boolean));

if (!ALLOWED_PRICE_IDS.has(priceId)) {
  return NextResponse.json({ error: "Invalid price ID" }, { status: 400 });
}
```

---

### 3. HIGH — Real Credentials in `.env.local`

**File**: `.env.local`

The following live/test credentials are present in the local env file. If this file is ever committed or shared, all services are compromised.

| Secret | Action Required |
|--------|----------------|
| `BETTER_AUTH_SECRET` | Rotate — regenerate random secret |
| `STRIPE_SECRET_KEY` (sk_test_51...) | Rotate in Stripe Dashboard |
| `STRIPE_WEBHOOK_SECRET` (whsec_...) | Rotate in Stripe Dashboard |
| `DATABASE_URL` (neon.tech with password) | Rotate DB password in Neon Dashboard |
| `AZURE_TTS_KEY` | Rotate in Azure Portal |
| Sentry token (commented out) | Rotate if not yet revoked |

**Additional hardening**:
- Confirm `.env*.local` is in `.gitignore`
- Use `.env.example` with placeholder values for onboarding
- Use a secrets manager (Doppler, Infisical, Vercel env vars) for production

---

### 4. MEDIUM — No Input Size Limit on Gloss Endpoint

**File**: `src/app/api/mobile/gloss/route.ts:6-35`

The endpoint processes arbitrary-length text with no size cap. Large payloads trigger many DB lookups (one per unique bigram/word) and high memory use.

**Fix**:
```typescript
const MAX_CONTENT_CHARS = 10_000;
if (content.length > MAX_CONTENT_CHARS) {
  return mobileError(`Content must be under ${MAX_CONTENT_CHARS} characters`, 413);
}
```

---

### 5. MEDIUM — No Rate Limiting on Mobile API Endpoints

**Files**: All `src/app/api/mobile/*` route handlers

Authenticated users can spam all mobile endpoints without throttling. Expensive operations like `/gloss` and flashcard creation are particularly vulnerable.

**Fix** (using Upstash Ratelimit):
```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, "1 h"),
});

// In each handler:
const { success } = await ratelimit.limit(userId!);
if (!success) return mobileError("Rate limit exceeded", 429);
```

Alternatively, implement via Next.js middleware scoped to `/api/mobile/*`.

---

### 6. MEDIUM — No Timeout on Azure TTS Fetch

**File**: `src/app/api/tts/route.ts`

The `callAzure` function awaits the TTS response with no timeout. A slow or hung Azure response holds the request open indefinitely, exhausting Node.js worker threads under load.

**Fix**:
```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 10_000);
try {
  const res = await fetch(url, {
    method: "POST",
    headers: { ... },
    body: ssml,
    signal: controller.signal,
  });
  // ...
} finally {
  clearTimeout(timeoutId);
}
```

---

### 7. LOW — Verbose Error Logging

**Files**:
- `src/app/api/stripe/webhooks/route.ts:39, 139`
- `src/app/api/stripe/checkout/route.ts:77`
- `src/app/api/stripe/portal/route.ts:31`
- `src/lib/email.ts:69-73`

Full error objects (including stack traces and user emails) are logged directly:
```typescript
console.error("Webhook handler error:", error);      // full Error object
console.error("[auth] Failed to send password reset email", { email, body }); // user email + response body
```

**Fix**: Log only what's needed for debugging, omitting PII and full stack traces in production:
```typescript
console.error("Webhook handler error", {
  type: event?.type,
  message: error instanceof Error ? error.message : "unknown",
});
```

---

### 8. LOW — Unescaped User Name in Email HTML

**File**: `src/lib/email.ts:37`

The user's `name` field is interpolated directly into HTML email content without escaping:
```typescript
const greeting = name ? `Hi ${name},` : "Hi,";
```

Risk is low since `name` is set at signup via better-auth, but a user who sets their name to `<script>alert(1)</script>` would inject that into the email HTML.

**Fix**:
```typescript
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const greeting = name ? `Hi ${escapeHtml(name)},` : "Hi,";
```

---

## Positive Findings

These areas were audited and found to be correctly implemented.

| Area | Finding |
|------|---------|
| SQL injection | All DB queries use `$1` parameterized placeholders throughout `src/lib/db.ts` and all query helpers |
| Stripe webhooks | `stripe.webhooks.constructEvent()` with `STRIPE_WEBHOOK_SECRET` is correctly implemented |
| XSS | No `dangerouslySetInnerHTML` usage found; React JSX escapes all user content by default |
| Authorization / IDOR | `canManageClassroom()`, `canViewClassroom()`, `canSubmitAssignment()` properly enforce ownership — no IDOR vulnerabilities found |
| Auth on API routes | All mobile API routes call `getMobileUserId()` which validates the Bearer token before processing |
