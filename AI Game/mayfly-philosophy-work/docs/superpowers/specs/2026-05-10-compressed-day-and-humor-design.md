# Compressed Day And Humor Design

## Goal

Keep the mayfly "one-day life" premise while removing misleading real-clock logic, and make action feedback feel like lived workplace absurdity instead of summary jokes.

## Time Model

The game uses a compressed day: a mayfly lives through one day, but that day represents a whole modern life compressed into 24 hours. The countdown is remaining lifespan, not wall-clock time.

UI should say:
- `剩余寿命 20:45:00`
- `已活 3小时15分 / 第4次选择`

Phases should be life-stage labels, not natural day labels:
- 破壳上岗
- 适应规则
- 内卷发热
- 精神松动
- 临终清算

Natural imagery is allowed only when it is stage-appropriate or explicitly supernatural. Ordinary early-game events must not mention sunset, dusk, dawn, morning, midnight, or wall-clock times.

## Humor Model

Each action can define `processBeats`: 2-3 short lines that show self-justification, the real sunk-cost process, and the ironic settlement.

Example:
- Old: `你刷到了“提高效率的五个方法”，效率降低了。`
- New:
  - `你点开《提高效率的五个方法》，告诉自己这叫学习。`
  - `你收藏了它，顺手看了作者主页，又看了评论区吵架。`
  - `1小时后，你没有提高效率，但新增了一个待办：明天开始自律。`

## Boundaries

- Core phase/feedback rules live in `/Users/david/Documents/Codex/mayfly-philosophy/src/game-core.js`.
- Tests live in `/Users/david/Documents/Codex/mayfly-philosophy/tests/game-core.test.mjs`.
- UI wording lives in `/Users/david/Documents/Codex/mayfly-philosophy/index.html`.
