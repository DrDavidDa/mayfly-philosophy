# Perfect Transformation Sprint 5 Implementation Plan

**Goal:** Add an in-game collection book so deaths, personalities, and legacy cards become visible long-term goals.

**Design:**
- Add a pure `buildCollectionSummary(progress)` helper in `src/game-core.js`.
- The helper exposes three sections:
  - death postcards from `DEATHS`
  - known personality archetypes
  - stored legacy cards
- Locked postcards and personalities use hidden display text while keeping IDs for stable rendering.
- Add a new `collection` screen in `index.html`.
- Add entry buttons from title and death screens.

**Files:**
- Modify: `/Users/david/Documents/Codex/mayfly-philosophy/src/game-core.js`
- Modify: `/Users/david/Documents/Codex/mayfly-philosophy/tests/game-core.test.mjs`
- Modify: `/Users/david/Documents/Codex/mayfly-philosophy/index.html`

## Task 1: Core Tests

- [x] Add failing tests for collection summary counts and locked/unlocked display.
- [x] Add failing tests for personality archetype collection.
- [x] Run tests and confirm failure before implementation.

## Task 2: Core Implementation

- [x] Add `PERSONALITY_ARCHETYPES`.
- [x] Implement `buildCollectionSummary(progress)`.
- [x] Export helper and replace hard-coded personality total in UI.

## Task 3: UI Implementation

- [x] Add collection screen markup.
- [x] Add title/death screen buttons.
- [x] Render postcard/personality/legacy sections.
- [x] Keep collection screen scrollable on mobile.

## Task 4: Verification

- [x] Run `node --test tests/game-core.test.mjs`.
- [x] Run `node --check src/game-core.js`.
- [x] Parse inline scripts in `index.html`.
- [x] Browser QA: open collection, verify unlocked and locked entries render.
