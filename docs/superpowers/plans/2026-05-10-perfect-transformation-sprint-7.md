# Perfect Transformation Sprint 7 Implementation Plan

**Goal:** Let players actively chase an uncollected ending from the collection book, instead of waiting for random card rolls.

**Design:**
- Add `collectionTarget` to run state.
- `drawCardOptions` should prioritize cards that lead to the active target.
- Add UI affordance in the collection personality cards:
  - locked personality route -> "追踪这条线"
  - collected personality route -> archived, no chase button
- Starting a run carries the selected target into the run.

**Files:**
- Modify: `/Users/david/Documents/Codex/mayfly-philosophy/src/game-core.js`
- Modify: `/Users/david/Documents/Codex/mayfly-philosophy/tests/game-core.test.mjs`
- Modify: `/Users/david/Documents/Codex/mayfly-philosophy/index.html`

## Task 1: Core Tests

- [x] Add failing test that active collection target prioritizes matching action cards.
- [x] Add failing test that cloning/applying legacy preserves target.
- [x] Run tests and confirm failure before implementation.

## Task 2: Core Implementation

- [x] Add target matching helper.
- [x] Add `collectionTarget` to state and clone flow.
- [x] Prioritize matching target cards in `drawCardOptions`.

## Task 3: UI Integration

- [x] Add chase button in locked personality collection cards.
- [x] Store active target in game state.
- [x] Carry target into `selectCharacter`.
- [x] Show current target in opening feed.

## Task 4: Verification

- [x] Run `node --test tests/game-core.test.mjs`.
- [x] Run `node --check src/game-core.js`.
- [x] Parse inline scripts in `index.html`.
- [x] Browser QA: pick a locked personality target and verify matching card appears.
