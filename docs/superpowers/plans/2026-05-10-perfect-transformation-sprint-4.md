# Perfect Transformation Sprint 4 Implementation Plan

**Goal:** Turn delayed workplace backlashes into recognizable end-of-run identity labels, so death reports feel personally earned instead of generic.

**Design:**
- Add signature-arc detection in `buildPersonalityReport`.
- Signature arcs are triggered by delayed consequence history:
  - `ppt-final-resurrection` -> `版本地狱居民`
  - `boss-small-thing` -> `朋友圈在岗证明`
  - `meme-aftershock` -> `撤回失败艺术家`
- Signature arc titles take priority over broad category ratios, because they represent a memorable story beat.
- Keep the visible death UI structure unchanged; the existing personality report will surface the new titles and taglines.

**Files:**
- Modify: `/Users/david/Documents/Codex/mayfly-philosophy/src/game-core.js`
- Modify: `/Users/david/Documents/Codex/mayfly-philosophy/tests/game-core.test.mjs`
- Read/verify: `/Users/david/Documents/Codex/mayfly-philosophy/index.html`

## Task 1: Core Tests

- [x] Add failing tests for the three signature arc personality reports.
- [x] Run tests and confirm the new tests fail before implementation.

## Task 2: Core Implementation

- [x] Add a small helper for checking whether a run history contains a specific event id.
- [x] Add signature arc priority before generic personality ratio logic.
- [x] Keep existing generic personality reports as fallback.

## Task 3: Verification

- [x] Run `node --test tests/game-core.test.mjs`.
- [x] Run `node --check src/game-core.js`.
- [x] Parse inline scripts in `index.html`.
- [x] Browser QA: trigger at least one signature arc and verify the death report title shows the new personality.
