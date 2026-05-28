# Phase 11 Card Table Implementation Plan

**Goal:** Replace the default heavy dashboard feel with a clean card-table presentation while keeping the existing game logic stable.

**Design Source:** `docs/superpowers/specs/2026-05-26-phase-11-card-table-design.md`

**Files:**
- Modify: `src/game-core.js`
- Modify: `tests/game-core.test.mjs`
- Modify: `tests/ui-copy.test.mjs`
- Modify: `index.html`

## Task 1: Card Face Contract

- [x] Add failing core tests for simplified card faces.
- [x] Add a `buildCardFace(card, state)` API.
- [x] Ensure each face has role, title, art mood, cost chip, temptation, risk whisper, and no raw numeric wall.

## Task 2: Card Table UI Tests

- [x] Add failing UI tests for `Phase 11 Card Table` CSS.
- [x] Assert default card content uses card-face fields.
- [x] Assert dashboard-heavy panels are visually de-emphasized or drawer-like in default state.

## Task 3: Main Screen Layout

- [x] Add card-table CSS variables and lighter palette.
- [x] Reframe `#screen-game` around a stage postcard and large action cards.
- [x] Reduce neon/glass dominance in default state.
- [x] Move secondary panels into visually quiet drawer/tray treatment.

## Task 4: Card Rendering

- [x] Render card face type badges, title, illustration, cost, temptation, and risk whisper.
- [x] Hide full effect rows unless details are open.
- [x] Keep accessibility labels informative.

## Task 5: Verification

- [x] Run `node --test tests/game-core.test.mjs tests/ui-copy.test.mjs`.
- [x] Run syntax checks on core and inline scripts.
- [x] Browser QA desktop and mobile.
- [ ] Commit and deploy to GitHub Pages.
