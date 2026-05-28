# Phase 11 Card Table Design

## Goal

Turn the current heavy cyberpunk dashboard into a clean, collectible card-table experience.

The game should feel like a fast absurd-life card roguelite: each turn is a tempting card choice, each death is a collectible postcard, and deeper systems reveal themselves only when they matter.

## Diagnosis

The current build exposes too many systems at once: HUD, state dock, stage, objective panel, rookie guide, route, NPC, consequences, target tracker, goals, legacy, turn feed, and action cards. The result feels like a control room rather than a card game.

The card UI also over-explains itself. Each card can show route progress, immediate effects, old debt warnings, NPC warnings, collection hints, recommended labels, and multiple chips. This makes the choice feel like reading a disclosure form instead of drawing a dangerous life card.

Phase 11 must stop adding another visual layer on top of this. It should create a new hierarchy that hides secondary systems by default.

## External Reference Principles

- Slay the Spire: choices create future possibilities; the screen does not explain every future branch at once.
- Balatro: rules are simple on the surface, while depth emerges from modifiers and combos.
- Marvel Snap: short rounds stay readable by limiting hand size and making each card immediately scannable.
- Inscryption: cards carry character and dread through art, names, and concise effects.
- Material card guidance: a card should group content and actions around one clear subject.

## Product Direction

Use a "Mayfly Card Table" metaphor.

The screen is a light paper desktop. The player sees the remaining lifespan, one central stage postcard, and two or three large action cards. Everything else is a drawer, not a wall.

Tone:
- Clean paper, black line art, red/yellow warning accents.
- Cute but sharp, like a workplace absurdity postcard set.
- Less neon glow, less glass, fewer panels.
- The first read should be: "I am choosing a card," not "I am managing a dashboard."

## Main Screen Hierarchy

Always visible:
- Remaining lifespan.
- Current life phase.
- One compact status strip for spirit, social, health, anxiety.
- Stage postcard.
- Action cards.

Collapsed by default:
- Route status.
- NPC status.
- Old debt ledger.
- Legacy cards.
- Collection target.
- Detailed numeric settlement.

Shown only at trigger moments:
- Old debt response cards.
- Death rescue cards.
- Route climax card.
- Death postcard.

## Card Anatomy

Each action card should show only:

1. Type badge: action, reaction, legacy, scene, or death.
2. Title: short and concrete.
3. Illustration: large enough to be the card's emotional center.
4. Time cost: a single chip.
5. Temptation line: what the player thinks they gain.
6. Risk whisper: one short hint, not a full preview.
7. Primary click area.

Default card face must not show:
- Full stat deltas.
- NPC numeric changes.
- Route math.
- Multi-line delayed consequence previews.
- More than three chips.
- "Recommended" as an always-on answer.

Detailed effects may appear after selection or on deliberate long-press/detail affordance.

## Gameplay Changes

Cards need roles, not only categories:

- Action cards: ordinary choices such as work, slack, social, phone, AI, disruption.
- Reaction cards: appear when old debt arrives; they let the player hard-carry, deflect, confess, or counterattack.
- Legacy stickers: death rewards that modify future cards, inspired by Balatro-style modifiers.
- Scene cards: per-run context that changes rules, inspired by location modifiers.
- Death postcards: collectible endings with one-line social share hooks.

The first implementation slice should not build every system. It should establish card roles and a lightweight display contract so the UI can become card-first.

## Visual System

Preferred theme: Clean Absurd Postcard.

Palette:
- Paper base: warm off-white.
- Ink: near-black blue.
- Warning red: sparing, for danger and death.
- Mayfly yellow: small highlight.
- Muted cyan/green: only for recovery or odd hope.

Typography:
- Display font can stay characterful.
- Body text should become calmer and easier to read.
- Pixel font should be used only for tiny labels, not body copy.

Motion:
- Cards enter with a light deal animation.
- Hover/tap lifts cards subtly.
- Old debt response cards slide in like a bill.
- Death postcard should feel like being stamped into a collection.

## Layout Rules

Desktop:
- Center the stage and card row.
- Keep secondary systems in a slim side drawer or expandable tray.
- No three-column dashboard in the default state.

Mobile:
- One stage postcard above.
- Two large cards below.
- Optional third card only after first-run onboarding.
- No horizontal peeking carousel for the first playable moment.
- Details should be a bottom sheet, not a second permanent screen.

## First Slice Scope

Phase 11.1 should implement:

- A new CSS mode called `Phase 11 Card Table`.
- A card display contract in core code that maps existing action cards to simplified card faces.
- Tests that prevent tiny labels and dashboard panels from reappearing as default card content.
- A lighter main-screen layout where action cards are the visual priority.

Phase 11.1 should not yet implement:

- Full deck-building progression.
- New art generation for every card.
- Full reaction-card engine.
- Full legacy sticker inventory redesign.

## Acceptance Criteria

- The default game screen reads as a card table within two seconds.
- A first-run player can identify the next playable card without scanning panels.
- Each action card has a large illustration zone and at most three visible chips.
- Full numeric details are still available, but not default card content.
- Desktop has no default dashboard wall.
- Mobile has no overlap and no card/detail control collision.
- Existing game-core behavior remains test-green.

