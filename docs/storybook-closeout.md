# Storybook Closeout

This document summarizes the current Storybook state in the repo after the first UI extraction and product-story pass.

## Status

Storybook is now in a **usable development state**.

It is not a complete catalog of every live screen, but it is far enough along to:

- iterate on shared UI safely
- review extracted `patterns` components in isolation
- test product-level layout ideas before back-porting into app pages
- use as the primary environment for further UI cleanup

## Runtime state

Current repo state:

- Storybook config exists in `.storybook/`
- Storybook dependencies are present in `package.json`
- the Storybook binary exists at `node_modules/.bin/storybook`
- npm/pnpm scripts exist:
  - `storybook`
  - `build-storybook`

Important note:

- in this environment, the Storybook binary exists, but CLI probing was not fully reliable, so runtime should still be verified locally in a normal dev session with:
  - `pnpm storybook`
  - or `npm run storybook`

## Story coverage summary

Current story inventory:

- Foundations: 2
- UI primitives: 6
- Patterns: 8
- Product stories: 10
- Total stories: 26

### Foundations

Covers:

- design system overview
- patterns overview

### UI primitives

Covers core `src/components/ui` entries like:

- button
- card
- input
- badge
- progress
- tabs

### Patterns

Covers the extracted middle layer in `src/components/patterns`, including:

- metrics
- status
- guidance
- surfaces
- action rail
- forms
- hub
- teaching

### Product stories

Covers composed product surfaces for both learner and teacher workflows, including:

- dashboard cards
- learner teacher hub
- learner teacher classes
- learner teacher assignments
- learner teacher inquiries
- teaching overview blocks
- reporting sections
- teaching library sections
- teaching private learner detail
- product screens overview

## What is genuinely finished

The following parts are in a good enough state to treat as real Storybook infrastructure:

### 1. Storybook structure

There is now a clear information architecture:

- `Foundations/*`
- `UI/*`
- `Patterns/*`
- `Product/*`

### 2. Middle-layer coverage

The extracted `patterns` layer is now actually represented in Storybook, not only in code.

That matters because the repo now has a real design-development ladder:

- `ui` = low-level primitives
- `patterns` = reusable product primitives
- `product` = composed screen sections

### 3. Storybook-driven back-porting is working

We have already used product stories to drive real live-page cleanup on:

- learner dashboard
- teacher overview
- teacher reporting
- learner teacher hub
- learner teacher classes / assignments / inquiries
- teacher library
- teacher private learner detail

So Storybook is no longer just a style catalog. It is affecting the real product.

## What is still incomplete

Storybook is usable, but not complete.

### 1. Runtime verification is still not fully closed out

We still need one explicit local verification pass that confirms:

- `pnpm storybook` starts cleanly
- stories render without missing imports/errors
- dark/light theme switching works as expected

### 2. Not every important feature screen has a product story

Coverage is strong, but not exhaustive.

Missing or still underrepresented areas include:

- Study Guide detail states
- Daily Journal / editor dialog states
- Flashcard practice states
- mobile-specific product states
- some teacher detail/drill-down screens

### 3. Not every reusable pattern has its own story matrix

Some patterns are covered only in one or two examples rather than a fuller state matrix.

## Recommended next use of Storybook

Do not try to make it a perfect component catalog before using it.

Use it as the working environment for:

1. screen redesign before live-page changes
2. testing `patterns` extraction candidates
3. documenting reusable product UI states

## Suggested follow-up checklist

### High priority

- verify local Storybook runtime end to end
- fix any startup/runtime issues if they appear
- add missing `Study Guide` product story
- add missing `Journal dialog` product story
- add missing `Flashcard practice` product story

### Medium priority

- improve pattern story matrices for:
  - teaching
  - hub
  - surfaces
  - forms
- add dark-mode review notes to product stories

### Low priority

- expand docs/addons only after runtime and major product stories are stable

## Final read

Storybook is now:

- **usable** as a UI development environment
- **valuable** for refactoring and review
- **not yet complete** as a full design-system showcase

That is a good place to be for the current stage of HanziBit.
