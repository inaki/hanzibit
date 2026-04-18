# UI Audit Lint

This repo now has a dedicated UI audit lint pass for catching two common design-system drift patterns:

1. hardcoded UI color usage
2. repeated raw surface/card shells that should probably be shared patterns/components

## Command

Run:

```bash
pnpm lint:ui-audit
```

## What it checks

### 1. Hardcoded colors

Flags:

- raw hex colors like `#f5f3f0`
- color functions like `rgb(...)`, `hsl(...)`, `oklch(...)`, `color-mix(...)`
- explicit Tailwind palette classes in feature UI like:
  - `text-gray-500`
  - `bg-red-50`
  - `border-emerald-500/20`

Goal:

- prefer semantic tokens from `src/app/globals.css`
- prefer shared pattern/component APIs instead of palette-level styling in feature code

### 2. Raw surface shells

Flags repeated class blocks that look like copied feature-local card shells, for example combinations of:

- `rounded-*`
- `border`
- `bg-card` / `bg-background` / `bg-muted`
- `p-*`

Goal:

- prefer shared `patterns` or reusable components instead of repeating the same panel shell in feature pages

## Scope

The audit targets feature UI in:

- `src/app/**/*.{ts,tsx}`
- `src/components/**/*.{ts,tsx}`

It intentionally ignores:

- `src/components/ui/**/*`
- `src/components/patterns/**/*`
- `*.stories.tsx`

## Important behavior

This is an **audit** tool, not a hard CI gate.

- normal `pnpm lint` is unchanged
- `pnpm lint:ui-audit` only prints the custom `ui-audit/*` findings
- it does not fail the build because the point is to help with cleanup prioritization

## Current result

The first run found a large number of warnings, which is expected.

That means the audit is useful now for identifying:

- old auth/landing surfaces still using raw gray/red/green palettes
- notebook screens still carrying hardcoded utility blocks
- places where extracted `patterns` should replace repeated wrappers

## Recommended use

Use the audit in this order:

1. fix high-traffic learner pages first
   - dashboard
   - study guide
   - journal
   - flashcards
2. then fix auth and upgrade surfaces
3. then keep chipping away at lower-priority pages during normal UI cleanup

## Notes

This is intentionally conservative and heuristic-based.
It is meant to surface likely design-system drift, not to prove every warning is wrong.
