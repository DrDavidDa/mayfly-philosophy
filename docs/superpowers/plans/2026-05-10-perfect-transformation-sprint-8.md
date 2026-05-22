# Perfect Transformation Sprint 8 Implementation Plan

**Goal:** Make active ending chase readable during a run, so players understand what route they are advancing and what absurd step comes next.

**Design:**
- Add a core route tracker for active collection targets.
- Track completed route steps from run history and pending consequences.
- Render a compact in-run "结局追踪" panel.
- Update the panel every turn.

**Files:**
- Modify: `/Users/david/Documents/Codex/mayfly-philosophy/src/game-core.js`
- Modify: `/Users/david/Documents/Codex/mayfly-philosophy/tests/game-core.test.mjs`
- Modify: `/Users/david/Documents/Codex/mayfly-philosophy/index.html`

## Task 1: Core Tests

- [x] Add failing test for active route progress and pending consequence state.
- [x] Run tests and confirm failure before implementation.

## Task 2: Core Implementation

- [x] Add explicit route steps for signature personality endings.
- [x] Add `buildCollectionTargetTracker`.
- [x] Export tracker API.

## Task 3: UI Integration

- [x] Add in-run tracker panel markup.
- [x] Add tracker panel styling.
- [x] Render tracker state in `renderGameUI`.

## Task 4: Verification

- [x] Run `node --test tests/game-core.test.mjs`.
- [x] Run `node --check src/game-core.js`.
- [x] Parse inline scripts in `index.html`.
- [x] Browser QA: chase target, start run, play matching card, verify panel updates to pending step.
