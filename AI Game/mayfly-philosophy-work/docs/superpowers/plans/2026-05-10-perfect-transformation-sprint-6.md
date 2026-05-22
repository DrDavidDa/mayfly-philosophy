# Perfect Transformation Sprint 6 Implementation Plan

**Goal:** Connect collection goals to moment-to-moment card choices by showing collection hints on action cards.

**Design:**
- Add a pure `buildCardCollectionHint(card, progress)` helper in `src/game-core.js`.
- Cards can point to postcard or personality collection targets.
- If a target is uncollected, show a teasing hint such as "可能通向未归档人格".
- If the target is already collected, show "已归档：X".
- Keep hints compact inside action cards so mobile choice readability stays intact.

**Files:**
- Modify: `/Users/david/Documents/Codex/mayfly-philosophy/src/game-core.js`
- Modify: `/Users/david/Documents/Codex/mayfly-philosophy/tests/game-core.test.mjs`
- Modify: `/Users/david/Documents/Codex/mayfly-philosophy/index.html`

## Task 1: Core Tests

- [x] Add failing test for an uncollected card hint.
- [x] Add failing test for an already collected card hint.
- [x] Run tests and confirm failure before implementation.

## Task 2: Core Implementation

- [x] Add card-to-collection target mapping.
- [x] Implement `buildCardCollectionHint(card, progress)`.
- [x] Export the helper.

## Task 3: UI Integration

- [x] Add compact hint styling inside action cards.
- [x] Render hints for current cards.
- [x] Ensure cards without relevant targets remain unchanged.

## Task 4: Verification

- [x] Run `node --test tests/game-core.test.mjs`.
- [x] Run `node --check src/game-core.js`.
- [x] Parse inline scripts in `index.html`.
- [x] Browser QA: force a card with a hint and verify uncollected/collected states render.
