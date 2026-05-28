import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const core = require('../src/game-core.js');

test('drawCardPair returns two playable cards with visible costs', () => {
  const state = core.createRunState('mayfly');
  const cards = core.drawCardPair(state, 1);

  assert.equal(cards.length, 2);
  assert.ok(cards.every((card) => card.cost.time > 0));
});

test('drawCardOptions returns three varied choices for a less monotonous turn', () => {
  const state = core.createRunState('mayfly');
  const cards = core.drawCardOptions(state, 11, 3);
  const categories = new Set(cards.map((card) => card.category));

  assert.equal(cards.length, 3);
  assert.ok(categories.size >= 2);
  assert.ok(cards.every((card) => card.cost.time > 0 && card.cost.time <= 3));
});

test('buildCardFace turns an action into a clean card-table face', () => {
  const state = core.createRunState('mayfly');
  const card = core.ACTION_CARDS.find((item) => item.id === 'doom-scroll');
  const face = core.buildCardFace(card, state);

  assert.equal(face.role, 'action');
  assert.equal(face.typeLabel, '行动牌');
  assert.equal(face.title, '刷效率短视频');
  assert.match(face.costChip, /耗时/);
  assert.ok(face.temptation.length > 6);
  assert.ok(face.riskWhisper.length > 6);
  assert.ok(face.artMood);
  assert.ok(face.displayChips.length <= 3);
  assert.doesNotMatch(`${face.temptation}\n${face.riskWhisper}\n${face.displayChips.join('\n')}`, /精神|社交|健康|焦虑|荒诞债|搅局|[-+]\d/);
});

test('buildCardFace uses delayed debt as a whisper instead of a full preview wall', () => {
  const state = core.createRunState('mayfly');
  const card = core.ACTION_CARDS.find((item) => item.id === 'like-boss-post');
  const face = core.buildCardFace(card, state);

  assert.match(face.riskWhisper, /旧账|回访|记住|之后/);
  assert.ok(face.riskWhisper.length <= 30);
  assert.ok(face.detail.effectText);
  assert.match(face.detail.effectText, /焦虑|社交|精神|健康|搅局|荒诞债/);
});

test('AI era content uses recognizable parody names without official brand names', () => {
  const text = [
    JSON.stringify(core.ACTION_CARDS),
    JSON.stringify(core.EVENTS),
    JSON.stringify(core.DEATHS),
    JSON.stringify(core.LIFE_ROUTES),
    JSON.stringify(core.PERSONALITY_ARCHETYPES)
  ].join('\n');

  assert.match(text, /豆袋仔|深潜鲸|月影长文兽|圆宝搜答|万问工位|会议机器人|提示词/);
  assert.doesNotMatch(text, /DeepSeek|ChatGPT|Kimi|Claude|Gemini|豆包|通义|千问|文心|元宝|讯飞星火|腾讯元宝|Copilot/i);
});

test('AI outsourcing route forms, schedules prompt debt, and can end in agent replacement', () => {
  let state = core.createRunState('mayfly');
  ['ai-weekly-report', 'ai-deep-research', 'ai-meeting-bot'].forEach((id) => {
    state = core.applyCard(state, core.ACTION_CARDS.find((item) => item.id === id));
  });

  const route = core.buildRouteStatus(state);
  const pressure = state.pendingConsequences.find((item) => item.id === 'route-ai-prompt-debt');

  assert.equal(route.id, 'ai');
  assert.equal(route.title, 'AI外包路线');
  assert.ok(pressure);
  assert.match(pressure.preview, /提示词|外包|回访/);

  ['ai-comfort-bot', 'ai-weekly-report', 'ai-deep-research', 'ai-meeting-bot'].forEach((id) => {
    state = core.applyCard(state, core.ACTION_CARDS.find((item) => item.id === id));
  });
  state = { ...state, turnCount: state.turnCount + 1 };
  state = core.takeDueConsequences(state).state;

  assert.equal(core.checkDeath(state).id, 'agentized-away');
});

test('getChoiceCountForRun keeps first-run and mobile choices simple', () => {
  const state = core.createRunState('mayfly');
  const midRun = { ...state, turnCount: 4 };

  assert.equal(core.getChoiceCountForRun(state, 1365), 2);
  assert.equal(core.getChoiceCountForRun(midRun, 390), 2);
  assert.equal(core.getChoiceCountForRun(midRun, 1365), 3);
});

test('first-run early choices always include a low-risk recovery option', () => {
  const safeIds = new Set(['toilet-slack', 'fake-ide', 'milk-tea-social', 'notification-dnd', 'reschedule-meeting']);

  for (let seed = 1; seed <= 30; seed += 1) {
    const state = {
      ...core.createRunState('mayfly'),
      firstRun: true,
      turnCount: seed % 4
    };
    const cards = core.drawCardOptions(state, seed, 2);

    assert.ok(
      cards.some((card) => safeIds.has(card.id)),
      `expected a safe card for seed ${seed}, got ${cards.map((card) => card.id).join(', ')}`
    );
  }
});

test('every run opens with at least one low-risk option before pressure ramps up', () => {
  const safeIds = new Set(['toilet-slack', 'fake-ide', 'milk-tea-social', 'notification-dnd', 'reschedule-meeting']);

  for (let seed = 1; seed <= 20; seed += 1) {
    const state = {
      ...core.createRunState('mayfly'),
      turnCount: seed % 3
    };
    const cards = core.drawCardOptions(state, seed, 2);

    assert.ok(
      cards.some((card) => safeIds.has(card.id)),
      `expected an opening safe card for seed ${seed}, got ${cards.map((card) => card.id).join(', ')}`
    );
  }
});

test('high-pressure hands include a recovery valve instead of pure execution choices', () => {
  const reliefIds = new Set(['notification-dnd', 'reschedule-meeting', 'toilet-slack', 'fake-ide', 'milk-tea-social']);
  const state = {
    ...core.createRunState('mayfly'),
    turnCount: 7,
    stats: { spirit: 38, social: 30, health: 60, anxiety: 88 }
  };

  for (let seed = 1; seed <= 30; seed += 1) {
    const cards = core.drawCardOptions(state, seed, 2);

    assert.ok(
      cards.some((card) => reliefIds.has(card.id) && card.effect.anxiety < 0),
      `expected anxiety relief card for seed ${seed}, got ${cards.map((card) => card.id).join(', ')}`
    );
  }
});

test('overheated NPC relationships add relationship cooling cards to the hand', () => {
  const state = {
    ...core.createRunState('mayfly'),
    turnCount: 7,
    npc: { boss: 72, slacker: 70, coworker: 68 }
  };
  const coolingIds = new Set(['boundary-statement', 'solo-slack', 'return-favor']);

  for (let seed = 1; seed <= 20; seed += 1) {
    const cards = core.drawCardOptions(state, seed, 3);

    assert.ok(
      cards.some((card) => coolingIds.has(card.id)),
      `expected an NPC cooling card for seed ${seed}, got ${cards.map((card) => card.id).join(', ')}`
    );
  }
});

test('relationship cooling cards reduce overheated NPC values before old debts trigger', () => {
  const state = {
    ...core.createRunState('mayfly'),
    npc: { boss: 72, slacker: 50, coworker: 40 }
  };
  const card = core.ACTION_CARDS.find((item) => item.id === 'boundary-statement');

  const next = core.applyCard(state, card);
  const boss = core.buildNpcRelationshipStatus(next).items.find((item) => item.id === 'boss');

  assert.ok(next.npc.boss < 65);
  assert.notEqual(boss.level, 'hot');
  assert.match(next.history.find((item) => item.id === 'boundary-statement').quote, /边界|支持到这里/);
});

test('ordinary relationship dips are not mislabeled as cooling urgent relationship debt', () => {
  const state = core.createRunState('mayfly');
  const card = core.ACTION_CARDS.find((item) => item.id === 'fake-ide');
  const preview = core.buildChoiceCausalPreview(state, card);

  assert.equal(preview.npcRelief, null);
});

test('NPC relationship relief prioritizes the hottest visible debt on mobile hands', () => {
  const state = {
    ...core.createRunState('mayfly'),
    turnCount: 7,
    npc: { boss: 72, slacker: 70, coworker: 68 }
  };

  for (let seed = 1; seed <= 20; seed += 1) {
    const cards = core.drawCardOptions(state, seed, 2);

    assert.ok(
      cards.some((card) => card.id === 'boundary-statement'),
      `expected boss boundary card for seed ${seed}, got ${cards.map((card) => card.id).join(', ')}`
    );
  }
});

test('route climax hands always offer a route-breaking choice before terminal endings', () => {
  const state = {
    ...core.createRunState('mayfly'),
    firstRun: true,
    turnCount: 7,
    categoryCounts: { work: 0, meeting: 0, slack: 6, social: 0, phone: 0, think: 0, ai: 0, disrupt: 0 }
  };

  for (let seed = 1; seed <= 20; seed += 1) {
    const cards = core.drawCardOptions(state, seed, 2);

    assert.ok(
      cards.some((card) => !['slack', 'phone'].includes(card.category)),
      `expected a route-breaking card near slack terminal for seed ${seed}, got ${cards.map((card) => `${card.id}:${card.category}`).join(', ')}`
    );
  }
});

test('route-breaking choices explain that they can dodge a route terminal', () => {
  const state = {
    ...core.createRunState('mayfly'),
    turnCount: 7,
    categoryCounts: { work: 0, meeting: 0, slack: 6, social: 0, phone: 0, think: 0, ai: 0, disrupt: 0 }
  };
  const card = core.ACTION_CARDS.find((item) => item.id === 'milk-tea-social');
  const preview = core.buildChoiceCausalPreview(state, card);

  assert.equal(preview.routeEscape.routeId, 'slack');
  assert.match(preview.line, /换路线|终局/);
});

test('breaking a route streak prevents cumulative route counts from forcing the terminal ending', () => {
  let state = core.createRunState('mayfly');
  ['fake-ide', 'toilet-slack', 'notification-dnd', 'doom-scroll', 'old-post', 'fake-ide'].forEach((id) => {
    state = core.applyCard(state, core.ACTION_CARDS.find((item) => item.id === id));
  });
  state = core.applyCard(state, core.ACTION_CARDS.find((item) => item.id === 'speak-truth'));
  state = core.applyCard(state, core.ACTION_CARDS.find((item) => item.id === 'solo-slack'));

  assert.equal(state.categoryCounts.slack + state.categoryCounts.phone, 7);
  assert.ok(!state.pendingConsequences.some((item) => item.id === 'route-slack-permanent-away'));
});

test('low-social pressure prefers relationship repair over isolating relief cards', () => {
  const state = {
    ...core.createRunState('mayfly'),
    turnCount: 7,
    stats: { spirit: 50, social: 12, health: 60, anxiety: 62 }
  };

  for (let seed = 1; seed <= 20; seed += 1) {
    const cards = core.drawCardOptions(state, seed, 2);

    assert.ok(
      cards.some((card) => card.id === 'milk-tea-social' || card.id === 'fake-ide'),
      `expected social-safe relief for seed ${seed}, got ${cards.map((card) => card.id).join(', ')}`
    );
    assert.ok(
      !cards.some((card) => ['notification-dnd', 'reschedule-meeting', 'speak-truth'].includes(card.id)),
      `low social hand should not force isolating relief for seed ${seed}, got ${cards.map((card) => card.id).join(', ')}`
    );
  }
});

test('first-run random events are suppressed during the opening choices', () => {
  const state = {
    ...core.createRunState('mayfly'),
    firstRun: true,
    turnCount: 2
  };
  const later = { ...state, turnCount: 4 };

  assert.equal(core.getRandomEventChance(state, 0.5), 0);
  assert.equal(core.getRandomEventChance(later, 0.5), 0.5);
});

test('ordinary runs also avoid random event ambushes in the first two choices', () => {
  const state = {
    ...core.createRunState('mayfly'),
    turnCount: 1
  };
  const later = { ...state, turnCount: 3 };

  assert.equal(core.getRandomEventChance(state, 0.5), 0);
  assert.equal(core.getRandomEventChance(later, 0.5), 0.5);
});

test('first-run grace prevents early stat threshold deaths from feeling like random execution', () => {
  const early = {
    ...core.createRunState('mayfly'),
    firstRun: true,
    turnCount: 4,
    stats: { spirit: 20, social: 20, health: 40, anxiety: 100 }
  };
  const later = { ...early, turnCount: 6 };

  assert.equal(core.checkDeath(early), null);
  assert.equal(core.checkDeath(later).id, 'anxiety-boom');
});

test('applyCard updates time, stats, disruption, absurd debt, and history', () => {
  const state = core.createRunState('mayfly');
  const card = core.ACTION_CARDS.find((item) => item.id === 'speak-truth');
  const next = core.applyCard(state, card);

  assert.equal(next.timeLeft, 23.25);
  assert.equal(next.disruption, 25);
  assert.equal(next.absurdDebt, 0);
  assert.equal(next.stats.anxiety, 50);
  assert.equal(next.history.length, 1);
  assert.equal(next.history[0].statsBefore.anxiety, 40);
  assert.equal(next.history[0].statsAfter.anxiety, 50);
  assert.equal(next.history[0].effect.anxiety, 10);
});

test('rebalance lets a mayfly survive several meaningful choices before time pressure', () => {
  let state = core.createRunState('mayfly');
  const sequence = [
    'speak-truth',
    'fake-ide',
    'milk-tea-social',
    'doom-scroll',
    'meeting-silence',
    'calculate-wage'
  ];

  sequence.forEach((id) => {
    state = core.applyCard(state, core.ACTION_CARDS.find((item) => item.id === id));
  });

  assert.ok(state.timeLeft >= 16, `expected at least 16h left, got ${state.timeLeft}`);
  assert.equal(core.checkDeath(state), null);
});

test('buildRunGoals tracks survival, variety, and disruption objectives', () => {
  let state = core.createRunState('mayfly');
  ['speak-truth', 'fake-ide', 'milk-tea-social', 'meeting-silence'].forEach((id) => {
    state = core.applyCard(state, core.ACTION_CARDS.find((item) => item.id === id));
  });

  const goals = core.buildRunGoals(state);
  const variety = goals.find((goal) => goal.id === 'try-four-lanes');

  assert.ok(goals.length >= 3);
  assert.equal(variety.complete, true);
  assert.equal(variety.progress, 4);
});

test('buildRunObjectiveBrief tells first-run players what a run is for', () => {
  const state = {
    ...core.createRunState('mayfly'),
    firstRun: true
  };

  const brief = core.buildRunObjectiveBrief(state);

  assert.match(brief.title, /这一局|做什么/);
  assert.match(brief.tag, /点牌|后果|结局/);
  assert.match(brief.premise, /撑过8次选择|代价|旧账/);
  assert.match(brief.steps.join(' '), /AI外包|提示词|助手/);
  assert.ok(brief.steps.some((item) => /明信片|归档|死亡/.test(item)));
  assert.ok(brief.steps.some((item) => /撑过|选择/.test(item)));
});

test('buildRunPacingSummary turns the first eight choices into readable beats', () => {
  let state = {
    ...core.applyRunIntent(core.createRunState('mayfly'), 'slack'),
    firstRun: true
  };

  let pacing = core.buildRunPacingSummary(state);
  assert.equal(pacing.progress.current, 0);
  assert.equal(pacing.progress.total, 8);
  assert.equal(pacing.current.id, 'pick');
  assert.ok(pacing.steps.some((step) => step.id === 'pick' && step.active));

  ['fake-ide', 'toilet-slack'].forEach((id) => {
    state = core.applyCard(state, core.ACTION_CARDS.find((card) => card.id === id));
  });
  pacing = core.buildRunPacingSummary(state);
  assert.equal(pacing.current.id, 'route');
  assert.ok(pacing.steps.find((step) => step.id === 'route').complete);
  assert.match(pacing.summary, /路线|活法/);

  state = core.applyCard(state, core.ACTION_CARDS.find((card) => card.id === 'doom-scroll'));
  pacing = core.buildRunPacingSummary(state);
  assert.equal(pacing.current.id, 'debt');
  assert.ok(pacing.steps.find((step) => step.id === 'debt').active);
  assert.match(pacing.summary, /旧账|回访/);

  ['fake-ide', 'toilet-slack', 'notification-dnd', 'milk-tea-social', 'reschedule-meeting'].forEach((id) => {
    state = core.applyCard(state, core.ACTION_CARDS.find((card) => card.id === id));
  });
  pacing = core.buildRunPacingSummary(state);
  assert.equal(state.turnCount, 8);
  assert.equal(pacing.current.id, 'settlement');
  assert.ok(pacing.steps.find((step) => step.id === 'settlement').complete);
  assert.match(pacing.summary, /小结算|撑过8次/);
});

test('run intent gives a clear one-run goal without pre-activating a route', () => {
  const state = core.applyRunIntent(core.createRunState('mayfly'), 'ai');
  const route = core.buildRouteStatus(state);
  const brief = core.buildRunObjectiveBrief(state);

  assert.equal(route.id, 'undecided');
  assert.equal(state.runIntent.id, 'ai');
  assert.match(brief.title, /AI外包|今日/);
  assert.ok(brief.steps.some((item) => /提示词|代理|助手/.test(item)));
});

test('opening hand follows selected run intent while keeping a second lane visible', () => {
  const state = {
    ...core.applyRunIntent(core.createRunState('mayfly'), 'ai'),
    firstRun: true
  };

  for (let seed = 1; seed <= 12; seed += 1) {
    const cards = core.drawCardOptions(state, seed, 2);
    const categories = new Set(cards.map((card) => card.category));

    assert.ok(cards.some((card) => card.category === 'ai'), cards.map((card) => card.id).join(','));
    assert.ok(categories.size >= 2, cards.map((card) => card.id).join(','));
  }
});

test('run intent objective shows how many matching choices remain before route forms', () => {
  let state = core.applyRunIntent(core.createRunState('mayfly'), 'ai');
  let brief = core.buildRunObjectiveBrief(state);

  assert.ok(brief.steps.some((item) => /再选2次|AI外包路线成形/.test(item)));

  state = core.applyCard(state, core.ACTION_CARDS.find((item) => item.id === 'ai-weekly-report'));
  brief = core.buildRunObjectiveBrief(state);

  assert.ok(brief.steps.some((item) => /再选1次|AI外包路线成形/.test(item)));
});

test('run objective previews route debt milestones before they ambush the player', () => {
  let state = core.applyRunIntent(core.createRunState('mayfly'), 'ai');
  let brief = core.buildRunObjectiveBrief(state);

  assert.ok(brief.steps.some((item) => /再选3次同路线|提示词债|首次旧账/.test(item)));

  ['ai-weekly-report', 'ai-deep-research'].forEach((id) => {
    state = core.applyCard(state, core.ACTION_CARDS.find((item) => item.id === id));
  });
  brief = core.buildRunObjectiveBrief(state);

  assert.ok(brief.steps.some((item) => /再选1次同路线|提示词债|首次旧账/.test(item)));

  state = core.applyCard(state, core.ACTION_CARDS.find((item) => item.id === 'ai-meeting-bot'));
  brief = core.buildRunObjectiveBrief(state);

  assert.ok(brief.steps.some((item) => /旧账已排队|AI外包路线|提示词债/.test(item)));
});

test('run objective turns a route into a concrete task chain', () => {
  let state = core.applyRunIntent(core.createRunState('mayfly'), 'ai');
  let chain = core.buildRouteTaskChainStatus(state, { id: 'ai' });
  let brief = core.buildRunObjectiveBrief(state);

  assert.equal(chain.title, '本人外包闭环');
  assert.equal(chain.progress, 0);
  assert.deepEqual(chain.nextCardIds, ['ai-comfort-bot']);
  assert.ok(brief.steps.some((item) => /任务链|本人外包闭环|助手安慰/.test(item)));

  state = core.applyCard(state, core.ACTION_CARDS.find((item) => item.id === 'ai-comfort-bot'));
  chain = core.buildRouteTaskChainStatus(state, { id: 'ai' });
  brief = core.buildRunObjectiveBrief(state);

  assert.equal(chain.progress, 1);
  assert.deepEqual(chain.nextCardIds, ['ai-weekly-report']);
  assert.ok(brief.steps.some((item) => /周报替疲惫|AI代写周报|周报/.test(item)));
});

test('drawCardOptions offers the next route task instead of only same-category filler', () => {
  let state = core.applyRunIntent(core.createRunState('mayfly'), 'ai');

  for (let seed = 1; seed <= 12; seed += 1) {
    const cards = core.drawCardOptions(state, seed, 2);
    assert.ok(cards.some((card) => card.id === 'ai-comfort-bot'), cards.map((card) => card.id).join(','));
  }

  state = core.applyCard(state, core.ACTION_CARDS.find((item) => item.id === 'ai-comfort-bot'));

  for (let seed = 1; seed <= 12; seed += 1) {
    const cards = core.drawCardOptions(state, seed, 2);
    assert.ok(cards.some((card) => card.id === 'ai-weekly-report'), cards.map((card) => card.id).join(','));
  }
});

test('disrupt intent survives route formation instead of dying before the first route backlash', () => {
  let state = core.applyRunIntent(core.createRunState('mayfly'), 'disrupt');
  ['speak-truth', 'wrong-emoji', 'speak-truth'].forEach((id) => {
    state = core.applyCard(state, core.ACTION_CARDS.find((item) => item.id === id));
  });

  assert.equal(core.buildRouteStatus(state).id, 'disrupt');
  assert.ok(state.pendingConsequences.some((item) => item.id === 'route-disrupt-immunity'));
  assert.equal(core.checkDeath(state), null);
  assert.ok(state.stats.social > 0);
});

test('disrupt task chain stays alive long enough to reach its own backlash', () => {
  let state = core.applyRunIntent(core.createRunState('mayfly'), 'disrupt');
  ['calculate-wage', 'speak-truth', 'wrong-emoji', 'boundary-statement', 'speak-truth', 'boundary-statement'].forEach((id) => {
    state = core.applyCard(state, core.ACTION_CARDS.find((item) => item.id === id));
  });

  assert.equal(core.buildRouteStatus(state).id, 'disrupt');
  assert.equal(core.checkDeath(state), null);
  assert.ok(state.stats.social > 0);
  assert.ok(state.pendingConsequences.some((item) => item.id === 'route-disrupt-clarification-loop'));
});

test('AI intent reaches its route climax instead of being preempted by arranged-life debt', () => {
  let state = core.applyRunIntent(core.createRunState('mayfly'), 'ai');
  ['ai-comfort-bot', 'ai-weekly-report', 'ai-deep-research', 'ai-meeting-bot', 'ai-comfort-bot', 'ai-weekly-report', 'ai-deep-research'].forEach((id) => {
    state = core.applyCard(state, core.ACTION_CARDS.find((item) => item.id === id));
  });

  assert.equal(core.buildRouteStatus(state).id, 'ai');
  assert.ok(state.pendingConsequences.some((item) => item.id === 'route-ai-agent-replacement'));
  assert.notEqual(core.checkDeath(state)?.id, 'arranged-life');
});

test('arranged-life waits when a committed route is approaching its promised climax', () => {
  let state = core.applyRunIntent(core.createRunState('mayfly'), 'work');
  ['voluntary-overtime', 'final-ppt', 'write-minutes', 'voluntary-overtime', 'final-ppt'].forEach((id) => {
    state = core.applyCard(state, core.ACTION_CARDS.find((item) => item.id === id));
  });

  state = { ...state, absurdDebt: 100 };
  state = { ...state, stats: { ...state.stats, anxiety: 40, spirit: 45, social: 20, health: 40 } };

  assert.equal(core.buildRouteStatus(state).id, 'work');
  assert.equal(core.checkDeath(state), null);
});

test('buildRunObjectiveBrief points repeat runs at route and collection targets', () => {
  const state = {
    ...core.createRunState('mayfly'),
    firstRun: false,
    collectionTarget: { kind: 'personality', target: '信息溺水者' }
  };
  const card = core.ACTION_CARDS.find((item) => item.id === 'doom-scroll');
  const progressed = core.applyCard(core.applyCard(state, card), card);

  const brief = core.buildRunObjectiveBrief(progressed);

  assert.match(brief.title, /信息溺水者|追踪/);
  assert.match(brief.tag, /摸鱼|路线|追踪/);
  assert.ok(brief.steps.some((item) => /信息溺水者|相关麻烦/.test(item)));
  assert.ok(brief.steps.some((item) => /摸鱼路线|路线/.test(item)));
});

test('buildRunObjectiveBrief highlights a just-completed run goal', () => {
  const state = {
    ...core.createRunState('mayfly'),
    turnCount: 7,
    timeLeft: 20,
    claimedGoals: []
  };
  const card = core.ACTION_CARDS.find((item) => item.id === 'fake-ide');
  const next = core.applyCard(state, card);

  const brief = core.buildRunObjectiveBrief(next);

  assert.equal(brief.pulse.tone, 'complete');
  assert.match(brief.pulse.title, /入账|完成/);
  assert.match(brief.pulse.text, /撑过8次|摸鱼缓冲/);
});

test('buildRunObjectiveBrief highlights a collection tracking hit on the current turn', () => {
  const state = {
    ...core.createRunState('mayfly'),
    firstRun: false,
    collectionTarget: { kind: 'personality', target: '朋友圈在岗证明' }
  };
  const card = core.ACTION_CARDS.find((item) => item.id === 'like-boss-post');
  const next = core.applyCard(state, card);

  const brief = core.buildRunObjectiveBrief(next);

  assert.equal(brief.pulse.tone, 'tracking');
  assert.match(brief.pulse.title, /追踪|线索/);
  assert.match(brief.pulse.text, /朋友圈在岗证明|点赞老板朋友圈/);
});

test('buildFirstRunGuide teaches cost, route, and old debt without a manual', () => {
  const opening = {
    ...core.createRunState('mayfly'),
    firstRun: true
  };
  const fakeIde = core.ACTION_CARDS.find((item) => item.id === 'fake-ide');
  const toiletSlack = core.ACTION_CARDS.find((item) => item.id === 'toilet-slack');
  const doomScroll = core.ACTION_CARDS.find((item) => item.id === 'doom-scroll');

  const firstGuide = core.buildFirstRunGuide(opening, fakeIde);
  assert.equal(firstGuide.step, 1);
  assert.match(firstGuide.title, /先看代价|代价/);
  assert.match(firstGuide.text, /寿命|属性|路线/);

  const afterSlack = core.applyCard(opening, toiletSlack);
  const routeGuide = core.buildFirstRunGuide(afterSlack, fakeIde);
  assert.equal(routeGuide.step, 2);
  assert.match(routeGuide.title, /活法|路线/);
  assert.match(routeGuide.text, /延续|摸鱼路线/);

  const debtGuide = core.buildFirstRunGuide({ ...afterSlack, turnCount: 2 }, doomScroll);
  assert.equal(debtGuide.step, 3);
  assert.match(debtGuide.title, /旧账|回访/);
  assert.match(debtGuide.text, /旧账|回访|回来/);

  assert.equal(core.buildFirstRunGuide({ ...opening, firstRun: false }, fakeIde), null);
});

test('buildRouteStatus turns repeated choices into a readable life route', () => {
  let state = core.createRunState('mayfly');
  ['voluntary-overtime', 'final-ppt'].forEach((id) => {
    state = core.applyCard(state, core.ACTION_CARDS.find((item) => item.id === id));
  });

  const route = core.buildRouteStatus(state);

  assert.equal(route.id, 'work');
  assert.equal(route.title, '卷王路线');
  assert.equal(route.active, true);
  assert.match(route.risk, /荒诞债|焦虑|默认负责人/);
});

test('drawCardOptions includes a matching route card after the player commits to a route', () => {
  const state = {
    ...core.createRunState('mayfly'),
    turnCount: 2,
    categoryCounts: { social: 2 }
  };

  for (let seed = 1; seed <= 20; seed += 1) {
    const cards = core.drawCardOptions(state, seed, 2);

    assert.ok(
      cards.some((card) => ['social'].includes(card.category)),
      `expected a social route card for seed ${seed}, got ${cards.map((card) => `${card.id}:${card.category}`).join(', ')}`
    );
  }
});

test('active work route makes work choices faster but more arranged', () => {
  let state = core.createRunState('mayfly');
  ['voluntary-overtime', 'meeting-silence'].forEach((id) => {
    state = core.applyCard(state, core.ACTION_CARDS.find((item) => item.id === id));
  });

  const card = core.ACTION_CARDS.find((item) => item.id === 'final-ppt');
  const before = state;
  const preview = core.buildChoiceCausalPreview(state, card);
  const next = core.applyCard(state, card);
  const history = next.history.find((item) => item.id === 'final-ppt');

  assert.equal(core.buildRouteStatus(before).id, 'work');
  assert.equal(history.timeCost, 2.5);
  assert.equal(next.timeLeft, before.timeLeft - 2.5);
  assert.equal(history.absurdDebt, card.absurdDebt + 5);
  assert.equal(history.effect.anxiety, card.effect.anxiety + 3);
  assert.match(preview.immediate, /卷王惯性/);
  assert.match(preview.line, /路线惯性/);
});

test('active slack route strengthens relief choices but leaves audit debt', () => {
  let state = core.createRunState('mayfly');
  ['toilet-slack', 'fake-ide'].forEach((id) => {
    state = core.applyCard(state, core.ACTION_CARDS.find((item) => item.id === id));
  });
  state.stats.anxiety = 82;

  const card = core.ACTION_CARDS.find((item) => item.id === 'notification-dnd');
  const next = core.applyCard(state, card);
  const history = next.history.find((item) => item.id === 'notification-dnd');

  assert.equal(core.buildRouteStatus(state).id, 'slack');
  assert.equal(history.effect.anxiety, card.effect.anxiety - 3);
  assert.equal(history.effect.spirit, (card.effect.spirit || 0) + 3);
  assert.equal(history.absurdDebt, card.absurdDebt + 3);
  assert.equal(history.routeModifier.routeId, 'slack');
  assert.match(history.routeModifier.note, /摸鱼惯性/);
});

test('active route weighting makes committed route choices show up consistently', () => {
  const state = {
    ...core.createRunState('mayfly'),
    firstRun: false,
    turnCount: 4,
    categoryCounts: { disrupt: 3 }
  };

  let routeCardCount = 0;
  for (let seed = 1; seed <= 30; seed += 1) {
    const cards = core.drawCardOptions(state, seed, 3);
    routeCardCount += cards.filter((card) => card.category === 'disrupt').length;
  }

  assert.ok(routeCardCount >= 35, `expected strong disrupt weighting, got ${routeCardCount}`);
});

test('active route hands rotate away from a repeatedly chosen exact card', () => {
  let state = core.applyRunIntent(core.createRunState('mayfly'), 'ai');
  ['ai-weekly-report', 'ai-deep-research', 'ai-meeting-bot', 'ai-deep-research', 'ai-deep-research'].forEach((id) => {
    state = core.applyCard(state, core.ACTION_CARDS.find((item) => item.id === id));
  });

  for (let seed = 1; seed <= 12; seed += 1) {
    const cards = core.drawCardOptions(state, seed, 3);
    const aiCards = cards.filter((card) => card.category === 'ai');

    assert.notEqual(cards[0].id, 'ai-deep-research');
    assert.ok(aiCards.some((card) => card.id !== 'ai-deep-research'));
  }
});

test('third committed route choice schedules one route-specific backlash', () => {
  let state = core.createRunState('mayfly');
  ['milk-tea-social', 'like-boss-post', 'milk-tea-social'].forEach((id) => {
    state = core.applyCard(state, core.ACTION_CARDS.find((item) => item.id === id));
  });

  const routeEvents = state.pendingConsequences.filter((item) => item.routeId === 'social');

  assert.equal(routeEvents.length, 1);
  assert.equal(routeEvents[0].id, 'route-social-human-debt');
  assert.match(routeEvents[0].preview, /社交路线|人情账/);

  state = core.applyCard(state, core.ACTION_CARDS.find((item) => item.id === 'milk-tea-social'));

  assert.equal(state.pendingConsequences.filter((item) => item.id === 'route-social-human-debt').length, 1);
});

test('fifth committed route choice schedules a stronger route escalation', () => {
  let state = core.createRunState('mayfly');
  ['milk-tea-social', 'like-boss-post', 'milk-tea-social', 'milk-tea-social', 'like-boss-post'].forEach((id) => {
    state = core.applyCard(state, core.ACTION_CARDS.find((item) => item.id === id));
  });

  const escalation = state.pendingConsequences.find((item) => item.id === 'route-social-black-history');
  const responses = core.buildConsequenceResponses(state, escalation);

  assert.ok(escalation);
  assert.equal(escalation.routeStage, 5);
  assert.match(escalation.preview, /第5次|黑历史/);
  assert.deepEqual(responses.map((item) => item.id), ['laugh-at-old-self', 'ask-who-searched', 'hide-behind-milk-tea']);
});

test('seventh committed route choice enters a dedicated route ending', () => {
  let state = core.createRunState('mayfly');
  [
    'milk-tea-social',
    'like-boss-post',
    'milk-tea-social',
    'milk-tea-social',
    'like-boss-post',
    'milk-tea-social',
    'like-boss-post'
  ].forEach((id) => {
    state = core.applyCard(state, core.ACTION_CARDS.find((item) => item.id === id));
  });

  const finale = state.pendingConsequences.find((item) => item.id === 'route-social-public-material');
  const responses = core.buildConsequenceResponses(state, finale);
  const resolved = core.resolveConsequenceResponse(state, finale, 'change-slide');
  const death = core.checkDeath(resolved);

  assert.ok(finale);
  assert.equal(finale.routeStage, 7);
  assert.match(finale.preview, /第7次|社交火葬场/);
  assert.deepEqual(responses.map((item) => item.id), ['host-icebreaker', 'change-slide', 'order-dessert']);
  assert.equal(death.id, 'social-cremation');
});

test('completing a run goal grants a one-time comeback reward', () => {
  let state = core.createRunState('mayfly');
  const sequence = [
    'speak-truth',
    'fake-ide',
    'milk-tea-social',
    'meeting-silence'
  ];

  sequence.forEach((id) => {
    state = core.applyCard(state, core.ACTION_CARDS.find((item) => item.id === id));
  });

  assert.ok(state.claimedGoals.includes('try-four-lanes'));
  assert.ok(state.history.some((item) => item.id === 'goal-try-four-lanes'));
  assert.ok(state.disruption >= 55);

  const afterRepeat = core.applyCard(state, core.ACTION_CARDS.find((item) => item.id === 'old-post'));
  assert.equal(afterRepeat.claimedGoals.filter((id) => id === 'try-four-lanes').length, 1);
});

test('getLifePhase gives the run a changing midgame identity', () => {
  const state = core.createRunState('mayfly');
  const morning = core.getLifePhase(state);
  const evening = core.getLifePhase({ ...state, timeLeft: 6 });

  assert.equal(morning.id, 'birth-shift');
  assert.equal(evening.id, 'existential-revolt');
  assert.ok(morning.title && evening.title);
  assert.doesNotMatch(morning.title + evening.title, /清晨|午间|傍晚|午夜|凌晨/);
});

test('formatLifeAge renders elapsed lifespan rather than wall-clock time', () => {
  const state = core.createRunState('mayfly');
  const next = { ...state, timeLeft: 22.25 };

  assert.equal(core.formatLifeAge(next), '已活1小时45分');
  assert.doesNotMatch(core.formatLifeAge(next), /^\d{2}:\d{2}$/);
});

test('doom-scroll feedback is a relatable mini-scene instead of abstract efficiency loss', () => {
  const state = core.createRunState('mayfly');
  const card = core.ACTION_CARDS.find((item) => item.id === 'doom-scroll');
  const next = core.applyCard(state, card);
  const feedback = core.buildTurnFeedback(state, card, next).join('');

  assert.match(feedback, /收藏/);
  assert.match(feedback, /待办|明天开始自律/);
  assert.doesNotMatch(card.quote, /效率降低了$/);
});

test('doom-scroll schedules a delayed algorithm backlash', () => {
  const state = core.createRunState('mayfly');
  const card = core.ACTION_CARDS.find((item) => item.id === 'doom-scroll');
  const next = core.applyCard(state, card);

  assert.equal(next.pendingConsequences.length, 1);
  assert.equal(next.pendingConsequences[0].sourceCardId, 'doom-scroll');
  assert.equal(next.pendingConsequences[0].dueTurn, next.turnCount + 2);
  assert.match(next.pendingConsequences[0].preview, /算法|效率|回访/);
});

test('contextual events react to the last concrete player action', () => {
  let state = core.createRunState('mayfly');
  state = core.applyCard(state, core.ACTION_CARDS.find((item) => item.id === 'notification-dnd'));
  let events = core.buildContextualEvents(state);

  assert.ok(events.some((event) => /勿扰|怎么没回|吃饭/.test(event.text)));

  state = core.applyCard(core.createRunState('mayfly'), core.ACTION_CARDS.find((item) => item.id === 'speak-truth'));
  events = core.buildContextualEvents(state);

  assert.ok(events.some((event) => /需求价值再澄清|开场|真话/.test(event.text)));
});

test('work and phone choices can pull life-pressure events into the random pool', () => {
  let state = core.applyCard(core.createRunState('mayfly'), core.ACTION_CARDS.find((item) => item.id === 'final-ppt'));
  let events = core.buildContextualEvents(state);

  assert.ok(events.some((event) => /绩效自评|800字|自证/.test(event.text)));

  state = core.applyCard(core.createRunState('mayfly'), core.ACTION_CARDS.find((item) => item.id === 'doom-scroll'));
  events = core.buildContextualEvents(state);

  assert.ok(events.some((event) => /妈妈|59秒|图什么/.test(event.text)));
});

test('pickRandomEvent prioritizes urgent contextual health reports under high pressure', () => {
  let state = {
    ...core.createRunState('mayfly'),
    stats: { spirit: 50, social: 30, health: 60, anxiety: 90 }
  };
  state = core.applyCard(state, core.ACTION_CARDS.find((item) => item.id === 'fake-ide'));

  const picks = Array.from({ length: 8 }, (_, index) => core.pickRandomEvent(state, index + 1).id);

  assert.ok(picks.every((id) => id === 'context-health-report'), picks.join(','));
});

test('pickRandomEvent follows the active route when no contextual event is waiting', () => {
  const workState = {
    ...core.createRunState('mayfly'),
    firstRun: false,
    categoryCounts: { work: 2, meeting: 0, slack: 0, social: 0, phone: 0, think: 0, disrupt: 0 },
    history: []
  };
  const disruptState = {
    ...core.createRunState('mayfly'),
    firstRun: false,
    categoryCounts: { work: 0, meeting: 0, slack: 0, social: 0, phone: 0, think: 0, disrupt: 2 },
    history: []
  };

  const workPick = core.pickRandomEvent(workState, 7);
  const disruptPick = core.pickRandomEvent(disruptState, 7);

  assert.match(workPick.id, /boss-email|kpi-update|calendar-ambush|anonymous-praise/);
  assert.match(disruptPick.id, /silent-room|sunset-leak|deadline-delay/);
});

test('high boss affinity injects default-owner NPC events into the contextual pool', () => {
  let state = core.createRunState('mayfly');
  state = core.applyCard(state, core.ACTION_CARDS.find((item) => item.id === 'final-ppt'));
  state.npc.boss = 72;

  const events = core.buildContextualEvents(state);
  const event = events.find((item) => item.id === 'npc-boss-default-mention');

  assert.ok(event);
  assert.match(event.text, /老板|默认|@|顺手/);
});

test('high slacker affinity injects cover-up NPC events into the contextual pool', () => {
  let state = core.createRunState('mayfly');
  state = core.applyCard(state, core.ACTION_CARDS.find((item) => item.id === 'toilet-slack'));
  state.npc.slacker = 74;

  const events = core.buildContextualEvents(state);
  const event = events.find((item) => item.id === 'npc-slacker-cover-shift');

  assert.ok(event);
  assert.match(event.text, /摸鱼搭子|离席|审计|盯一下/);
});

test('high coworker affinity turns social warmth into favor-debt events', () => {
  let state = core.createRunState('mayfly');
  state = core.applyCard(state, core.ACTION_CARDS.find((item) => item.id === 'milk-tea-social'));
  state.npc.coworker = 68;

  const events = core.buildContextualEvents(state);
  const event = events.find((item) => item.id === 'npc-coworker-one-look');

  assert.ok(event);
  assert.match(event.text, /同事|看一眼|人情|排队/);
});

test('buildNpcRelationshipStatus explains relationship heat and pending NPC trouble', () => {
  const state = {
    ...core.createRunState('mayfly'),
    npc: { boss: 72, slacker: 64, coworker: 12 }
  };

  const status = core.buildNpcRelationshipStatus(state);
  const boss = status.items.find((item) => item.id === 'boss');
  const slacker = status.items.find((item) => item.id === 'slacker');
  const coworker = status.items.find((item) => item.id === 'coworker');

  assert.equal(status.hotCount, 1);
  assert.equal(boss.level, 'hot');
  assert.equal(boss.eventId, 'npc-boss-default-mention');
  assert.match(boss.warning, /默认@|顺手|过热/);
  assert.equal(slacker.level, 'warm');
  assert.match(slacker.warning, /接近|离席|搭子/);
  assert.equal(coworker.level, 'cold');
  assert.match(coworker.warning, /冷却|疏离|不找你/);
});

test('new pressure relief cards reduce anxiety but schedule readable backlash', () => {
  const state = {
    ...core.createRunState('mayfly'),
    stats: { spirit: 50, social: 30, health: 60, anxiety: 88 }
  };
  const dnd = core.ACTION_CARDS.find((item) => item.id === 'notification-dnd');
  const reschedule = core.ACTION_CARDS.find((item) => item.id === 'reschedule-meeting');

  const afterDnd = core.applyCard(state, dnd);
  const afterReschedule = core.applyCard(state, reschedule);

  assert.ok(afterDnd.stats.anxiety < state.stats.anxiety);
  assert.ok(afterReschedule.stats.anxiety < state.stats.anxiety);
  assert.match(afterDnd.pendingConsequences[0].preview, /勿扰|99\\+|消息/);
  assert.match(afterReschedule.pendingConsequences[0].preview, /明天|会议|穿越/);
});

test('buildCardConsequencePreview warns before a choice creates delayed backlash', () => {
  const card = core.ACTION_CARDS.find((item) => item.id === 'final-ppt');
  const preview = core.buildCardConsequencePreview(card);
  const safeCard = core.ACTION_CARDS.find((item) => item.id === 'toilet-slack');

  assert.match(preview.label, /后果回访/);
  assert.match(preview.text, /1次选择|PPT|复活/);
  assert.equal(core.buildCardConsequencePreview(safeCard), null);
});

test('buildChoiceCausalPreview explains route, immediate cost, and delayed old debt', () => {
  const state = core.createRunState('mayfly');
  const card = core.ACTION_CARDS.find((item) => item.id === 'like-boss-post');
  const preview = core.buildChoiceCausalPreview(state, card);

  assert.equal(preview.routeTitle, '社交路线');
  assert.match(preview.immediate, /寿命-1h|焦虑\+8|社交\+8/);
  assert.match(preview.callback.text, /老板|朋友圈|2次选择/);
  assert.equal(preview.risk.level, 'mild');
});

test('buildChoiceCausalPreview warns when a card will overheat an NPC relationship', () => {
  const state = {
    ...core.createRunState('mayfly'),
    npc: { boss: 58, slacker: 50, coworker: 40 }
  };
  const card = core.ACTION_CARDS.find((item) => item.id === 'final-ppt');

  const preview = core.buildChoiceCausalPreview(state, card);

  assert.ok(preview.npcWarning);
  assert.equal(preview.npcWarning.id, 'boss');
  assert.equal(preview.npcWarning.level, 'hot');
  assert.match(preview.npcWarning.text, /老板|过热|默认@|顺手/);
});

test('buildChoiceCausalPreview shows NPC relationship relief before choosing cooling cards', () => {
  const state = {
    ...core.createRunState('mayfly'),
    npc: { boss: 72, slacker: 50, coworker: 40 }
  };
  const card = core.ACTION_CARDS.find((item) => item.id === 'boundary-statement');

  const preview = core.buildChoiceCausalPreview(state, card);

  assert.ok(preview.npcRelief);
  assert.equal(preview.npcRelief.id, 'boss');
  assert.equal(preview.npcRelief.before, 72);
  assert.equal(preview.npcRelief.after, 54);
  assert.match(preview.npcRelief.text, /降温|解除|旧账/);
});

test('buildChoiceCausalPreview flags choices that can immediately trigger a death threshold', () => {
  const state = {
    ...core.createRunState('mayfly'),
    stats: { spirit: 50, social: 30, health: 60, anxiety: 90 }
  };
  const card = core.ACTION_CARDS.find((item) => item.id === 'calculate-wage');
  const preview = core.buildChoiceCausalPreview(state, card);

  assert.equal(preview.risk.level, 'lethal');
  assert.match(preview.risk.text, /焦虑|死亡|焦虑爆炸/);
});

test('buildChoiceCausalPreview highlights the stat that is currently under pressure', () => {
  const state = {
    ...core.createRunState('mayfly'),
    stats: { spirit: 38, social: 30, health: 60, anxiety: 88 }
  };
  const card = core.ACTION_CARDS.find((item) => item.id === 'notification-dnd');
  const preview = core.buildChoiceCausalPreview(state, card);

  assert.match(preview.immediate, /焦虑-16/);
});

test('takeDueConsequences applies due delayed events and keeps future ones pending', () => {
  let state = core.createRunState('mayfly');
  const card = core.ACTION_CARDS.find((item) => item.id === 'doom-scroll');
  state = core.applyCard(state, card);
  state = { ...state, turnCount: state.turnCount + 2 };

  const result = core.takeDueConsequences(state);

  assert.equal(result.events.length, 1);
  assert.equal(result.events[0].sourceCardId, 'doom-scroll');
  assert.equal(result.state.pendingConsequences.length, 0);
  assert.equal(result.state.timeLeft, state.timeLeft - result.events[0].timeCost);
  assert.ok(result.state.history.some((item) => item.id === result.events[0].id));
});

test('recognizable workplace cards schedule distinct delayed backlashes', () => {
  let state = core.createRunState('mayfly');
  ['final-ppt', 'like-boss-post', 'wrong-emoji'].forEach((id) => {
    state = core.applyCard(state, core.ACTION_CARDS.find((item) => item.id === id));
  });

  const sources = state.pendingConsequences.map((item) => item.sourceCardId);
  const text = state.pendingConsequences.map((item) => `${item.preview} ${item.text}`).join('');

  assert.deepEqual(sources, ['final-ppt', 'like-boss-post', 'wrong-emoji']);
  assert.match(text, /PPT|最终版|版本/);
  assert.match(text, /老板|小事|朋友圈/);
  assert.match(text, /表情包|撤回|群/);
});

test('multiple delayed backlashes drain only when their due turn arrives', () => {
  let state = core.createRunState('mayfly');
  state = core.applyCard(state, core.ACTION_CARDS.find((item) => item.id === 'final-ppt'));
  state = core.applyCard(state, core.ACTION_CARDS.find((item) => item.id === 'like-boss-post'));

  let result = core.takeDueConsequences(state);
  assert.equal(result.events.length, 1);
  assert.equal(result.events[0].sourceCardId, 'final-ppt');
  assert.equal(result.state.pendingConsequences.length, 1);

  result = core.takeDueConsequences({ ...result.state, turnCount: result.state.turnCount + 2 });
  assert.equal(result.events.length, 1);
  assert.equal(result.events[0].sourceCardId, 'like-boss-post');
  assert.equal(result.state.pendingConsequences.length, 0);
  assert.ok(result.state.history.some((item) => /小事|朋友圈|老板/.test(item.causality)));
});

test('ppt resurrection creates a signature version-hell personality', () => {
  let state = core.createRunState('mayfly');
  state = core.applyCard(state, core.ACTION_CARDS.find((item) => item.id === 'final-ppt'));
  state = core.takeDueConsequences({ ...state, turnCount: state.turnCount + 1 }).state;

  const report = core.buildPersonalityReport(state);

  assert.equal(report.type, '版本地狱居民');
  assert.match(report.tagline, /最终版|复活|版本/);
  assert.equal(report.signatureArc, 'ppt-final-resurrection');
});

test('boss social like creates a signature always-online personality', () => {
  let state = core.createRunState('mayfly');
  state = core.applyCard(state, core.ACTION_CARDS.find((item) => item.id === 'like-boss-post'));
  state = core.takeDueConsequences({ ...state, turnCount: state.turnCount + 2 }).state;

  const report = core.buildPersonalityReport(state);

  assert.equal(report.type, '朋友圈在岗证明');
  assert.match(report.tagline, /点赞|小事|老板/);
  assert.equal(report.signatureArc, 'boss-small-thing');
});

test('recalled meme creates a signature recall-failure personality', () => {
  let state = core.createRunState('mayfly');
  state = core.applyCard(state, core.ACTION_CARDS.find((item) => item.id === 'wrong-emoji'));
  state = core.takeDueConsequences({ ...state, turnCount: state.turnCount + 1 }).state;

  const report = core.buildPersonalityReport(state);

  assert.equal(report.type, '撤回失败艺术家');
  assert.match(report.tagline, /撤回|表情包|茶水间/);
  assert.equal(report.signatureArc, 'meme-aftershock');
});

test('ordinary early events avoid natural day imagery that conflicts with compressed-life time', () => {
  const forbidden = /晚霞|日落|傍晚|凌晨|清晨|午夜/;
  const ordinaryEvents = core.EVENTS.filter((event) => !event.requiresPhase);

  assert.ok(ordinaryEvents.length > 0);
  assert.ok(ordinaryEvents.every((event) => !forbidden.test(event.text)));
});

test('final natural-imagery cards are gated out of early compressed-life choices', () => {
  const early = core.createRunState('mayfly');
  const late = { ...early, timeLeft: 2 };
  const finalCard = core.ACTION_CARDS.find((item) => item.id === 'window-sunset');

  assert.equal(finalCard.requiresPhase, 'final-settlement');
  assert.ok(!core.drawCardOptions(early, 3, 20).some((card) => card.id === 'window-sunset'));
  assert.ok(core.drawCardOptions(late, 3, 20).some((card) => card.id === 'window-sunset'));
});

test('absurd debt can trigger the arranged life death before natural death', () => {
  const state = {
    ...core.createRunState('mayfly'),
    timeLeft: 0,
    absurdDebt: 100,
    stats: { spirit: 50, social: 30, health: 60, anxiety: 40 }
  };

  const death = core.checkDeath(state);
  assert.equal(death.id, 'arranged-life');
});

test('death rescue options explain the fatal metric before final death', () => {
  const state = {
    ...core.createRunState('mayfly'),
    turnCount: 7,
    stats: { spirit: 50, social: 30, health: 60, anxiety: 104 }
  };
  const death = core.checkDeath(state);

  const options = core.buildDeathRescueOptions(state, death);

  assert.equal(death.id, 'anxiety-boom');
  assert.equal(options.length, 3);
  assert.ok(options.every((option) => option.title && option.text));
  assert.match(options.map((option) => option.reason).join(' '), /焦虑|104|100|爆炸/);
});

test('resolving a death rescue option can pull a lethal stat back below threshold once per run', () => {
  const state = {
    ...core.createRunState('mayfly'),
    turnCount: 7,
    stats: { spirit: 50, social: 30, health: 60, anxiety: 104 }
  };
  const death = core.checkDeath(state);
  const [option] = core.buildDeathRescueOptions(state, death);

  const rescued = core.resolveDeathRescueOption(state, death, option.id);

  assert.equal(core.checkDeath(rescued), null);
  assert.ok(rescued.flags.deathRescueUsed);
  assert.ok(rescued.stats.anxiety < 100);
  assert.ok(rescued.history.some((item) => item.id === `death-rescue-${death.id}`));
  assert.deepEqual(core.buildDeathRescueOptions(rescued, core.checkDeath(rescued)), []);
});

test('buildDeathRescueStatus makes the one rescue visible before and after use', () => {
  const fresh = {
    ...core.createRunState('mayfly'),
    firstRun: false
  };
  const used = {
    ...fresh,
    flags: { deathRescueUsed: true, lastDeathRescue: 'anxiety-boom' }
  };

  const before = core.buildDeathRescueStatus(fresh);
  const after = core.buildDeathRescueStatus(used);

  assert.equal(before.used, false);
  assert.match(before.title, /未用|可用|抢救/);
  assert.equal(after.used, true);
  assert.match(after.title, /已用|没有第二次/);
  assert.match(after.text, /焦虑爆炸|第二次|兜底/);
});

test('death rescue options use death-specific button language', () => {
  const anxietyState = {
    ...core.createRunState('mayfly'),
    turnCount: 7,
    stats: { spirit: 50, social: 30, health: 60, anxiety: 104 }
  };
  const socialState = {
    ...core.createRunState('mayfly'),
    turnCount: 7,
    stats: { spirit: 50, social: 96, health: 60, anxiety: 40 },
    history: [
      { turn: 1, id: 'old-post', name: '翻到黑历史', category: 'phone', quote: '旧朋友圈复活。' }
    ]
  };

  const anxietyTitles = core.buildDeathRescueOptions(anxietyState, core.checkDeath(anxietyState)).map((item) => item.title).join(' ');
  const socialTitles = core.buildDeathRescueOptions(socialState, core.checkDeath(socialState)).map((item) => item.title).join(' ');

  assert.match(anxietyTitles, /手机|呼吸|离线|焦虑/);
  assert.match(socialTitles, /撤回|存在感|投影|社交/);
  assert.notEqual(anxietyTitles, socialTitles);
});

test('death rescue schedules a readable aftershock instead of a free revive', () => {
  const state = {
    ...core.createRunState('mayfly'),
    turnCount: 7,
    stats: { spirit: 50, social: 30, health: 60, anxiety: 104 }
  };
  const death = core.checkDeath(state);
  const option = core.buildDeathRescueOptions(state, death)[0];

  const rescued = core.resolveDeathRescueOption(state, death, option.id);
  const aftershock = rescued.pendingConsequences.find((item) => item.id === 'death-rescue-aftershock-anxiety-boom');

  assert.ok(aftershock);
  assert.equal(aftershock.dueTurn, state.turnCount + 2);
  assert.match(aftershock.preview, /抢救后遗症|手机|红点|焦虑/);
  assert.match(aftershock.sourceCardName, /临终抢救|焦虑爆炸/);
});

test('high social can backfire into social cremation when black history is active', () => {
  const state = {
    ...core.createRunState('mayfly'),
    stats: { spirit: 50, social: 96, health: 60, anxiety: 40 },
    history: [
      {
        turn: 1,
        id: 'old-post',
        name: '翻到黑历史',
        category: 'phone',
        quote: '旧朋友圈复活。',
        causality: '黑历史已激活。'
      }
    ]
  };

  const death = core.checkDeath(state);

  assert.equal(death.id, 'social-cremation');
});

test('overly high spirit can become false enlightenment after repeated slack thinking', () => {
  const state = {
    ...core.createRunState('mayfly'),
    stats: { spirit: 98, social: 30, health: 60, anxiety: 10 },
    categoryCounts: { slack: 5, think: 2 }
  };

  const death = core.checkDeath(state);

  assert.equal(death.id, 'false-enlightenment');
});

test('pure slack recovery does not turn into false enlightenment without actual thinking', () => {
  const state = {
    ...core.createRunState('mayfly'),
    stats: { spirit: 100, social: 30, health: 60, anxiety: 8 },
    categoryCounts: { slack: 7, think: 0 }
  };

  assert.equal(core.checkDeath(state), null);
});

test('false enlightenment stays rare and does not punish ordinary recovery', () => {
  const state = {
    ...core.createRunState('mayfly'),
    stats: { spirit: 96, social: 30, health: 60, anxiety: 20 },
    categoryCounts: { slack: 5 }
  };

  assert.equal(core.checkDeath(state), null);
});

test('disruptive runs generate a disruption personality with display labels', () => {
  let state = core.createRunState('mayfly');
  const card = core.ACTION_CARDS.find((item) => item.id === 'speak-truth');

  for (let index = 0; index < 4; index += 1) {
    state = core.applyCard(state, card);
  }

  const report = core.buildPersonalityReport(state);
  assert.equal(report.type, '反制度小虫');
  assert.ok(report.timeSplit.every((item) => item.label));
});

test('buildWorldGlitches makes disruption visible before the ending', () => {
  let state = core.createRunState('mayfly');
  ['speak-truth', 'wrong-emoji', 'speak-truth'].forEach((id) => {
    state = core.applyCard(state, core.ACTION_CARDS.find((item) => item.id === id));
  });

  const glitch = core.buildWorldGlitches(state);

  assert.equal(glitch.active, true);
  assert.equal(glitch.level, 'corrupted');
  assert.match(glitch.title + glitch.text, /会议纪要|现实|组织|系统|世界/);
  assert.match(glitch.hudLabel, /搅局|现实|污染|偏移/);
  assert.ok(glitch.className.includes('world-glitch'));
});

test('causality ledger keeps the last three meaningful consequences', () => {
  let state = core.createRunState('mayfly');
  const ids = ['final-ppt', 'wrong-emoji', 'window-sunset', 'speak-truth'];

  ids.forEach((id) => {
    state = core.applyCard(state, core.ACTION_CARDS.find((item) => item.id === id));
  });

  const ledger = core.buildCausalityLedger(state);
  assert.equal(ledger.length, 3);
  assert.match(ledger[0], /表情包|日落|真话/);
});

test('buildDeathExplanation names the lethal threshold and last concrete causes', () => {
  let state = core.createRunState('mayfly');
  state = core.applyCard(state, core.ACTION_CARDS.find((item) => item.id === 'final-ppt'));
  state = core.takeDueConsequences({ ...state, turnCount: state.turnCount + 1 }).state;
  state = {
    ...state,
    stats: { ...state.stats, anxiety: 100 }
  };
  const death = core.checkDeath(state);
  const explanation = core.buildDeathExplanation(state, death);

  assert.equal(explanation.deathId, 'anxiety-boom');
  assert.match(explanation.thresholdText, /焦虑 100\/100/);
  assert.ok(explanation.chain.some((item) => /最终版PPT/.test(item.title)));
  assert.match(explanation.summary, /最终版PPT|焦虑/);
});

test('buildDeathExplanation includes a fatal bill with before, delta, and after values', () => {
  let state = {
    ...core.createRunState('mayfly'),
    stats: { spirit: 50, social: 30, health: 60, anxiety: 82 }
  };
  state = core.applyCard(state, core.ACTION_CARDS.find((item) => item.id === 'calculate-wage'));
  const death = core.checkDeath(state);
  const explanation = core.buildDeathExplanation(state, death);

  assert.equal(death.id, 'anxiety-boom');
  assert.ok(explanation.fatalBill);
  assert.match(explanation.summary, /致命账单/);
  assert.match(explanation.fatalBill.summary, /焦虑 82\/100 -> \+18 -> 100\/100/);
  assert.match(explanation.fatalBill.contributors[0].title, /计算时薪/);
});

test('buildDeathExplanation includes a readable verdict receipt for confused players', () => {
  let state = {
    ...core.createRunState('mayfly'),
    stats: { spirit: 50, social: 30, health: 60, anxiety: 82 }
  };
  state = core.applyCard(state, core.ACTION_CARDS.find((item) => item.id === 'calculate-wage'));
  const death = core.checkDeath(state);
  const explanation = core.buildDeathExplanation(state, death);

  assert.equal(explanation.receipt.title, '为什么会到这个终局');
  assert.ok(explanation.receipt.rows.length >= 3);
  assert.match(explanation.receipt.rows[0].label, /最后|一脚/);
  assert.match(explanation.receipt.rows[0].text, /计算时薪|焦虑|100\/100/);
  assert.match(explanation.receipt.rows.at(-1).label, /终局|判定/);
  assert.match(explanation.receipt.rows.at(-1).text, /不是随机|账单|焦虑爆炸/);
});

test('buildConsequenceRisk marks delayed consequences that can become lethal', () => {
  const state = {
    ...core.createRunState('mayfly'),
    stats: { spirit: 40, social: 30, health: 60, anxiety: 92 }
  };
  const event = core.ACTION_CARDS
    .find((item) => item.id === 'final-ppt')
    .delayedConsequences[0];

  const risk = core.buildConsequenceRisk(state, event);

  assert.equal(risk.level, 'lethal');
  assert.match(risk.label, /可能致死/);
  assert.match(risk.reason, /焦虑/);
});

test('due consequences offer response choices before the backlash lands', () => {
  let state = core.createRunState('mayfly');
  state = core.applyCard(state, core.ACTION_CARDS.find((item) => item.id === 'final-ppt'));
  state = { ...state, turnCount: state.turnCount + 1 };
  const due = core.getDueConsequences(state);
  const responses = core.buildConsequenceResponses(state, due[0]);

  assert.equal(due.length, 1);
  assert.deepEqual(responses.map((item) => item.strategy), ['endure', 'deflect', 'slack-buffer']);
  assert.ok(responses.every((item) => item.title && item.text));
});

test('boss small thing offers context-specific responses instead of generic templates', () => {
  let state = core.createRunState('mayfly');
  state = core.applyCard(state, core.ACTION_CARDS.find((item) => item.id === 'like-boss-post'));
  state = { ...state, turnCount: state.turnCount + 2 };
  const event = core.getDueConsequences(state)[0];
  const responses = core.buildConsequenceResponses(state, event);

  assert.equal(event.id, 'boss-small-thing');
  assert.deepEqual(responses.map((item) => item.id), ['reply-received', 'ask-priority', 'pretend-offline']);
  assert.match(responses.map((item) => item.text).join(' '), /收到|优先级|离线|附件/);
  assert.doesNotMatch(responses.map((item) => item.text).join(' '), /照单全收|花半小时假装整理思路/);
});

test('base random events offer event-specific responses instead of generic templates', () => {
  const genericIds = ['endure', 'deflect', 'slack-buffer'];
  const genericText = /照单全收|甩锅给流程|花半小时假装整理思路|流程待确认|先去接水/;

  core.EVENTS.forEach((event) => {
    const state = core.createRunState('mayfly');
    const responses = core.buildConsequenceResponses(state, event);
    const next = core.resolveConsequenceResponse(state, event, responses[1].id);
    const resolved = next.history.find((item) => item.id === event.id);

    assert.notDeepEqual(responses.map((item) => item.id), genericIds, event.id);
    assert.doesNotMatch(responses.map((item) => `${item.title}${item.text}`).join(' '), genericText, event.id);
    assert.match(responses.map((item) => `${item.title}${item.text}`).join(' '), new RegExp(event.text.slice(0, 2)));
    assert.doesNotMatch(resolved.quote + resolved.causality, genericText, event.id);
  });
});

test('life-pressure rescue and memory events offer specific responses', () => {
  const genericIds = ['endure', 'deflect', 'slack-buffer'];
  const genericText = /照单全收|甩锅给流程|花半小时假装整理思路|流程待确认|先去接水/;
  const events = [];

  let dnd = core.applyCard(core.createRunState('mayfly'), core.ACTION_CARDS.find((item) => item.id === 'notification-dnd'));
  events.push(core.buildContextualEvents(dnd).find((item) => item.id === 'context-dnd-where-are-you'));

  let truth = core.applyCard(core.createRunState('mayfly'), core.ACTION_CARDS.find((item) => item.id === 'speak-truth'));
  events.push(core.buildContextualEvents(truth).find((item) => item.id === 'context-truth-clarification'));

  let selfReview = core.applyCard(core.createRunState('mayfly'), core.ACTION_CARDS.find((item) => item.id === 'final-ppt'));
  events.push(core.buildContextualEvents(selfReview).find((item) => item.id === 'context-performance-self-review'));

  let voice = core.applyCard(core.createRunState('mayfly'), core.ACTION_CARDS.find((item) => item.id === 'doom-scroll'));
  events.push(core.buildContextualEvents(voice).find((item) => item.id === 'context-life-voice-message'));

  let report = core.applyCard({
    ...core.createRunState('mayfly'),
    stats: { spirit: 50, social: 30, health: 60, anxiety: 90 }
  }, core.ACTION_CARDS.find((item) => item.id === 'fake-ide'));
  events.push(core.buildContextualEvents(report).find((item) => item.id === 'context-health-report'));

  const lethal = {
    ...core.createRunState('mayfly'),
    turnCount: 7,
    stats: { spirit: 50, social: 30, health: 60, anxiety: 104 }
  };
  const death = core.checkDeath(lethal);
  const rescued = core.resolveDeathRescueOption(lethal, death, core.buildDeathRescueOptions(lethal, death)[0].id);
  events.push(rescued.pendingConsequences.find((item) => item.id === 'death-rescue-aftershock-anxiety-boom'));

  const legacy = core.buildLegacyCard(
    { id: 'anxiety-boom', title: '焦虑爆炸', emoji: '💥', rarity: 'R', color: '#ff2d78' },
    { type: '完美无用者' }
  );
  events.push(legacy.memoryEvent);

  events.forEach((event) => {
    assert.ok(event, 'expected event to exist');
    const state = core.createRunState('mayfly');
    const responses = core.buildConsequenceResponses(state, event);
    const next = core.resolveConsequenceResponse(state, event, responses[1].id);
    const resolved = next.history.find((item) => item.id === event.id);

    assert.notDeepEqual(responses.map((item) => item.id), genericIds, event.id);
    assert.doesNotMatch(responses.map((item) => `${item.title}${item.text}`).join(' '), genericText, event.id);
    assert.doesNotMatch(resolved.quote + resolved.causality, genericText, event.id);
  });
});

test('NPC contextual events offer relationship-specific response buttons', () => {
  const samples = [
    {
      eventId: 'npc-boss-default-mention',
      setup() {
        let state = core.applyCard(core.createRunState('mayfly'), core.ACTION_CARDS.find((item) => item.id === 'final-ppt'));
        state.npc.boss = 72;
        return state;
      },
      ids: ['accept-mention', 'ask-owner-list', 'calendar-decoy'],
      text: /默认@|负责人|日程/
    },
    {
      eventId: 'npc-slacker-cover-shift',
      setup() {
        let state = core.applyCard(core.createRunState('mayfly'), core.ACTION_CARDS.find((item) => item.id === 'toilet-slack'));
        state.npc.slacker = 74;
        return state;
      },
      ids: ['cover-the-seat', 'rotate-cover-duty', 'fake-water-run'],
      text: /盯工位|轮班|接水/
    },
    {
      eventId: 'npc-coworker-one-look',
      setup() {
        let state = core.applyCard(core.createRunState('mayfly'), core.ACTION_CARDS.find((item) => item.id === 'milk-tea-social'));
        state.npc.coworker = 68;
        return state;
      },
      ids: ['look-once', 'trade-for-specifics', 'milk-tea-buffer'],
      text: /看一眼|具体|奶茶/
    }
  ];

  samples.forEach((sample) => {
    const state = sample.setup();
    const event = core.buildContextualEvents(state).find((item) => item.id === sample.eventId);
    const responses = core.buildConsequenceResponses(state, event);

    assert.deepEqual(responses.map((item) => item.id), sample.ids);
    assert.match(responses.map((item) => `${item.title}${item.text}`).join(' '), sample.text);
    assert.doesNotMatch(responses.map((item) => item.text).join(' '), /照单全收|花半小时假装整理思路/);
  });
});

test('resolved consequence text follows the selected contextual response', () => {
  let state = core.createRunState('mayfly');
  state = core.applyCard(state, core.ACTION_CARDS.find((item) => item.id === 'like-boss-post'));
  state = { ...state, turnCount: state.turnCount + 2 };
  const event = core.getDueConsequences(state)[0];

  const next = core.resolveConsequenceResponse(state, event, 'ask-priority');
  const resolved = next.history.find((item) => item.id === event.id);

  assert.ok(resolved, 'expected resolved event to be recorded in history');
  assert.match(resolved.quote, /优先级|拉进群|不再只压在你身上/);
  assert.match(resolved.causality, /小事|优先级|流程表/);
  assert.doesNotMatch(resolved.quote + resolved.causality, /流程待确认|去接水|灾难还在/);
});

test('all contextual consequence responses carry matching settlement copy', () => {
  const samples = [
    {
      source: 'final-ppt',
      turnDelta: 1,
      responseId: 'ask-template',
      expected: /模板|旧稿|感觉/,
      forbidden: /流程待确认|去接水/
    },
    {
      source: 'doom-scroll',
      turnDelta: 2,
      responseId: 'lock-screen',
      expected: /锁屏|黑屏|下一条/,
      forbidden: /流程待确认|去接水/
    },
    {
      source: 'wrong-emoji',
      turnDelta: 1,
      responseId: 'vanish-from-pantry',
      expected: /茶水间|绕开|眼神/,
      forbidden: /流程待确认|去接水/
    },
    {
      source: 'notification-dnd',
      turnDelta: 2,
      responseId: 'blame-signal',
      expected: /信号|网络|路由器/,
      forbidden: /流程待确认|去接水/
    },
    {
      source: 'reschedule-meeting',
      turnDelta: 2,
      responseId: 'ask-agenda',
      expected: /议程|会议|存在/,
      forbidden: /流程待确认|去接水/
    },
    {
      setup() {
        let state = core.applyCard(core.createRunState('mayfly'), core.ACTION_CARDS.find((item) => item.id === 'final-ppt'));
        state.npc.boss = 72;
        return {
          state,
          event: core.buildContextualEvents(state).find((item) => item.id === 'npc-boss-default-mention')
        };
      },
      responseId: 'ask-owner-list',
      expected: /负责人清单|默认@|表格/,
      forbidden: /流程待确认|去接水/
    },
    {
      setup() {
        let state = core.applyCard(core.createRunState('mayfly'), core.ACTION_CARDS.find((item) => item.id === 'toilet-slack'));
        state.npc.slacker = 74;
        return {
          state,
          event: core.buildContextualEvents(state).find((item) => item.id === 'npc-slacker-cover-shift')
        };
      },
      responseId: 'rotate-cover-duty',
      expected: /轮班|盯工位|审计/,
      forbidden: /流程待确认|去接水/
    },
    {
      setup() {
        let state = core.applyCard(core.createRunState('mayfly'), core.ACTION_CARDS.find((item) => item.id === 'milk-tea-social'));
        state.npc.coworker = 68;
        return {
          state,
          event: core.buildContextualEvents(state).find((item) => item.id === 'npc-coworker-one-look')
        };
      },
      responseId: 'trade-for-specifics',
      expected: /具体|看一眼|售后/,
      forbidden: /流程待确认|去接水/
    }
  ];

  samples.forEach((sample) => {
    let state;
    let event;
    if (sample.setup) {
      ({ state, event } = sample.setup());
    } else {
      state = core.createRunState('mayfly');
      state = core.applyCard(state, core.ACTION_CARDS.find((item) => item.id === sample.source));
      state = { ...state, turnCount: state.turnCount + sample.turnDelta };
      event = core.getDueConsequences(state)[0];
    }
    const next = core.resolveConsequenceResponse(state, event, sample.responseId);
    const resolved = next.history.find((item) => item.id === event.id);

    assert.match(resolved.quote + resolved.causality, sample.expected);
    assert.doesNotMatch(resolved.quote + resolved.causality, sample.forbidden);
  });
});

test('route backlash responses also resolve with route-specific payoff text', () => {
  let state = core.createRunState('mayfly');
  ['milk-tea-social', 'like-boss-post', 'milk-tea-social'].forEach((id) => {
    state = core.applyCard(state, core.ACTION_CARDS.find((item) => item.id === id));
  });
  state = { ...state, turnCount: state.turnCount + 1 };
  const event = core.getDueConsequences(state).find((item) => item.id === 'route-social-human-debt');

  const next = core.resolveConsequenceResponse(state, event, 'split-favor');
  const resolved = next.history.find((item) => item.id === event.id);

  assert.match(resolved.quote, /拉了个群|人情债|多人协作/);
  assert.match(resolved.causality, /私人求助|群体流程|人情债/);
  assert.doesNotMatch(resolved.quote + resolved.causality, /流程待确认|去接水/);
});

test('resolving a consequence response can mitigate a lethal backlash', () => {
  let state = {
    ...core.createRunState('mayfly'),
    stats: { spirit: 40, social: 30, health: 60, anxiety: 92 }
  };
  state = core.applyCard(state, core.ACTION_CARDS.find((item) => item.id === 'final-ppt'));
  state = { ...state, turnCount: state.turnCount + 1 };
  const event = core.getDueConsequences(state)[0];

  const next = core.resolveConsequenceResponse(state, event, 'slack-buffer');

  assert.equal(next.pendingConsequences.some((item) => item.id === event.id), false);
  assert.ok(next.stats.anxiety < 100, `expected anxiety below 100, got ${next.stats.anxiety}`);
  assert.equal(core.checkDeath(next), null);
  assert.ok(next.history.some((item) => item.id === `response-${event.id}`));
});

test('true sunset death builds a shareable postcard', () => {
  let state = core.createRunState('mayfly');
  const card = core.ACTION_CARDS.find((item) => item.id === 'window-sunset');
  state = core.applyCard(state, card);
  state = { ...state, timeLeft: 0 };

  const death = core.checkDeath(state);
  const postcard = core.buildDeathPostcard(state, death);

  assert.equal(death.id, 'true-sunset');
  assert.equal(postcard.rarity, 'SSR');
  assert.match(postcard.shareText, /真正的日落/);
});

test('formatCountdown renders remaining life as HH:MM:SS', () => {
  assert.equal(core.formatCountdown(23.5), '23:30:00');
  assert.equal(core.formatCountdown(0.25), '00:15:00');
});

test('formatWorldTime renders elapsed run time as a clock timestamp', () => {
  const state = core.createRunState('mayfly');
  const next = { ...state, timeLeft: 23.5 };

  assert.equal(core.formatWorldTime(next), '00:30');
});

test('getMentorQuip returns a contextual AI毒舌导师 comment', () => {
  const state = core.createRunState('mayfly');
  const card = core.ACTION_CARDS.find((item) => item.id === 'voluntary-overtime');
  const quip = core.getMentorQuip(state, card);

  assert.match(quip, /导师|卷|命|系统|老板/);
});

test('getMentorQuip changes voice after a route becomes active', () => {
  let state = core.createRunState('mayfly');
  ['toilet-slack', 'fake-ide'].forEach((id) => {
    state = core.applyCard(state, core.ACTION_CARDS.find((item) => item.id === id));
  });
  const card = core.ACTION_CARDS.find((item) => item.id === 'doom-scroll');

  const quip = core.getMentorQuip(state, card);

  assert.match(quip, /摸鱼路线|算法|离席|审计|投喂/);
});

test('buildTurnFeedback adds route-aware NPC chatter when inertia rewrites a card', () => {
  let state = core.createRunState('mayfly');
  ['voluntary-overtime', 'meeting-silence'].forEach((id) => {
    state = core.applyCard(state, core.ACTION_CARDS.find((item) => item.id === id));
  });
  const card = core.ACTION_CARDS.find((item) => item.id === 'final-ppt');
  const next = core.applyCard(state, card);

  const feedback = core.buildTurnFeedback(state, card, next).join('');

  assert.match(feedback, /老板|默认负责人|顺手|路线惯性/);
});

test('buildMemorialComments returns NPC-style social comments', () => {
  let state = core.createRunState('mayfly');
  state = core.applyCard(state, core.ACTION_CARDS.find((item) => item.id === 'speak-truth'));
  const report = core.buildPersonalityReport(state);
  const comments = core.buildMemorialComments(state, report);

  assert.ok(comments.length >= 3);
  assert.ok(comments.every((comment) => comment.speaker && comment.text));
});

test('buildNextRunRecommendation turns the last run into a concrete replay hook', () => {
  let state = core.createRunState('mayfly');
  ['milk-tea-social', 'like-boss-post', 'milk-tea-social'].forEach((id) => {
    state = core.applyCard(state, core.ACTION_CARDS.find((item) => item.id === id));
  });
  const report = core.buildPersonalityReport(state);
  const recommendation = core.buildNextRunRecommendation(state, null, report);

  assert.equal(recommendation.routeId, 'social');
  assert.match(recommendation.title, /下一世|社交路线/);
  assert.ok(recommendation.seedCards.includes('like-boss-post'));
  assert.match(recommendation.text, /人情账|点赞|社交/);
});

test('buildNextRunRecommendation suggests a pressure release route after anxiety death', () => {
  const state = {
    ...core.createRunState('mayfly'),
    stats: { spirit: 35, social: 20, health: 60, anxiety: 100 }
  };
  const death = core.checkDeath(state);
  const recommendation = core.buildNextRunRecommendation(state, death, core.buildPersonalityReport(state));

  assert.equal(recommendation.routeId, 'slack');
  assert.match(recommendation.text, /摸鱼|焦虑|缓冲/);
});

test('buildRecommendedCollectionTarget turns the death recommendation into a next-run tracker', () => {
  const target = core.buildRecommendedCollectionTarget({
    routeId: 'slack',
    seedCards: ['toilet-slack', 'fake-ide', 'doom-scroll']
  });

  assert.deepEqual(target, { kind: 'personality', target: '信息溺水者' });
});

test('buildLegacyCard turns a death postcard into a future-run modifier', () => {
  let state = core.createRunState('mayfly');
  state = core.applyCard(state, core.ACTION_CARDS.find((item) => item.id === 'speak-truth'));
  state = { ...state, stats: { ...state.stats, anxiety: 100 } };
  const death = core.checkDeath(state);
  const postcard = core.buildDeathPostcard(state, death);
  const report = core.buildPersonalityReport(state);
  const legacy = core.buildLegacyCard(postcard, report);

  assert.equal(legacy.id, 'legacy-anxiety-boom');
  assert.equal(legacy.sourceDeathId, 'anxiety-boom');
  assert.ok(legacy.title.includes('焦虑爆炸'));
  assert.ok(legacy.effect.stats.anxiety < 0);
  assert.equal(legacy.stack, 1);
});

test('legacy cards can inject previous-life memory events into the next run', () => {
  const state = {
    ...core.createRunState('mayfly'),
    stats: { spirit: 35, social: 20, health: 60, anxiety: 100 }
  };
  const death = core.checkDeath(state);
  const postcard = core.buildDeathPostcard(state, death);
  const report = core.buildPersonalityReport(state);
  const legacy = core.buildLegacyCard(postcard, report);
  const next = core.applyLegacyCards(core.createRunState('mayfly'), [legacy]);

  assert.equal(legacy.sourceDeathId, 'anxiety-boom');
  assert.ok(legacy.memoryEvent);
  assert.match(legacy.memoryEvent.text, /预防焦虑|红点|老板|房东|体检/);
  assert.ok(next.pendingConsequences.some((item) => item.id === 'memory-anxiety-inbox-anxiety-boom'));
});

test('buildCollectionSummary marks collected death postcards and hides locked ones', () => {
  const summary = core.buildCollectionSummary({
    collectedPostcards: ['anxiety-boom'],
    collectedPersonalities: [],
    legacyCards: []
  });
  const collected = summary.postcards.find((item) => item.id === 'anxiety-boom');
  const locked = summary.postcards.find((item) => item.id !== 'anxiety-boom');

  assert.equal(summary.postcardCount.collected, 1);
  assert.equal(summary.postcardCount.total, core.DEATHS.length);
  assert.equal(collected.collected, true);
  assert.equal(collected.displayTitle, '焦虑爆炸');
  assert.equal(locked.collected, false);
  assert.match(locked.displayTitle, /未发现|？？？/);
});

test('buildCollectionSummary tracks personality archetypes and legacy cards', () => {
  const summary = core.buildCollectionSummary({
    collectedPostcards: [],
    collectedPersonalities: ['撤回失败艺术家'],
    legacyCards: [
      {
        id: 'legacy-anxiety-boom',
        title: '焦虑爆炸遗产',
        emoji: '💥',
        effectText: '焦虑-10',
        stack: 2
      }
    ]
  });
  const personality = summary.personalities.find((item) => item.type === '撤回失败艺术家');

  assert.ok(summary.personalityCount.total >= 10);
  assert.equal(summary.personalityCount.collected, 1);
  assert.equal(personality.collected, true);
  assert.match(personality.displayTagline, /撤回|茶水间/);
  assert.equal(summary.legacyCards.length, 1);
  assert.equal(summary.legacyCards[0].stack, 2);
});

test('buildCardCollectionHint teases an uncollected personality route', () => {
  const card = core.ACTION_CARDS.find((item) => item.id === 'final-ppt');
  const hint = core.buildCardCollectionHint(card, {
    collectedPostcards: [],
    collectedPersonalities: []
  });

  assert.equal(hint.status, 'uncollected');
  assert.equal(hint.kind, 'personality');
  assert.equal(hint.target, '版本地狱居民');
  assert.match(hint.text, /未归档人格|可能通向/);
});

test('buildCardCollectionHint marks already collected routes as archived', () => {
  const card = core.ACTION_CARDS.find((item) => item.id === 'final-ppt');
  const hint = core.buildCardCollectionHint(card, {
    collectedPostcards: [],
    collectedPersonalities: ['版本地狱居民']
  });

  assert.equal(hint.status, 'collected');
  assert.equal(hint.target, '版本地狱居民');
  assert.match(hint.text, /已归档|版本地狱居民/);
});

test('drawCardOptions prioritizes cards for the active collection target', () => {
  const state = {
    ...core.createRunState('mayfly'),
    collectionTarget: { kind: 'personality', target: '版本地狱居民' }
  };

  const cards = core.drawCardOptions(state, 99, 2);

  assert.equal(cards[0].id, 'final-ppt');
});

test('drawCardOptions stops repeating a completed collection target step', () => {
  let state = {
    ...core.createRunState('mayfly'),
    collectionTarget: { kind: 'personality', target: '版本地狱居民' }
  };
  state = core.applyCard(state, core.ACTION_CARDS.find((item) => item.id === 'final-ppt'));

  const cards = core.drawCardOptions(state, 99, 2);

  assert.ok(!cards.some((card) => card.id === 'final-ppt'));
});

test('applyLegacyCards preserves active collection target across run setup', () => {
  const state = {
    ...core.createRunState('mayfly'),
    collectionTarget: { kind: 'personality', target: '撤回失败艺术家' }
  };
  const next = core.applyLegacyCards(state, []);

  assert.deepEqual(next.collectionTarget, { kind: 'personality', target: '撤回失败艺术家' });
});

test('buildCollectionTargetTracker explains active ending route progress', () => {
  let state = {
    ...core.createRunState('mayfly'),
    collectionTarget: { kind: 'personality', target: '版本地狱居民' }
  };

  const empty = core.buildCollectionTargetTracker(state, {});

  assert.equal(empty.target, '版本地狱居民');
  assert.equal(empty.completed, 0);
  assert.equal(empty.total, 2);
  assert.match(empty.nextText, /最终版PPT/);

  state = core.applyCard(state, core.ACTION_CARDS.find((item) => item.id === 'final-ppt'));
  const tracker = core.buildCollectionTargetTracker(state, {});

  assert.equal(tracker.completed, 1);
  assert.equal(tracker.steps[0].status, 'complete');
  assert.equal(tracker.steps[1].status, 'pending');
  assert.match(tracker.nextText, /因果|复活|选择后/);
});

test('mergeLegacyCard deduplicates repeated death cards and stacks them', () => {
  const progress = { legacyCards: [] };
  const card = {
    id: 'legacy-spirit-crash',
    sourceDeathId: 'spirit-crash',
    title: '精神崩溃遗产',
    effect: { stats: { spirit: 10 } },
    stack: 1
  };

  let next = core.mergeLegacyCard(progress, card);
  next = core.mergeLegacyCard(next, card);

  assert.equal(next.legacyCards.length, 1);
  assert.equal(next.legacyCards[0].stack, 2);
});

test('selectActiveLegacyCards returns the three newest stored legacies', () => {
  const progress = {
    legacyCards: ['a', 'b', 'c', 'd'].map((id, index) => ({
      id: `legacy-${id}`,
      title: id,
      effect: {},
      gainedAt: index + 1,
      stack: 1
    }))
  };

  const active = core.selectActiveLegacyCards(progress, 3);

  assert.deepEqual(active.map((card) => card.id), ['legacy-d', 'legacy-c', 'legacy-b']);
});

test('applyLegacyCards mutates a new run and records opening inheritance', () => {
  const state = core.createRunState('mayfly');
  const legacyCards = [
    {
      id: 'legacy-anxiety-boom',
      title: '焦虑爆炸遗产',
      effect: { time: 0.5, stats: { anxiety: -10 }, disruption: 5, absurdDebt: -3 },
      stack: 2
    }
  ];

  const next = core.applyLegacyCards(state, legacyCards);

  assert.equal(next.timeLeft, 24);
  assert.equal(next.stats.anxiety, 20);
  assert.equal(next.disruption, 10);
  assert.equal(next.absurdDebt, 0);
  assert.equal(next.activeLegacyCards.length, 1);
  assert.ok(next.history.some((item) => item.id === 'legacy-anxiety-boom'));
});

test('daily challenge getDailySeed and getDailyMutator return correct deterministic values', () => {
  const seed1 = core.getDailySeed('2026-05-20');
  const seed2 = core.getDailySeed('2026-05-20');
  const seed3 = core.getDailySeed('2026-05-21');
  assert.equal(seed1.date, '2026-05-20');
  assert.equal(seed1.seed, seed2.seed);
  assert.notEqual(seed1.seed, seed3.seed);

  const mutator1 = core.getDailyMutator('2026-05-20'); // Wednesday (3)
  const mutator2 = core.getDailyMutator('2026-05-20');
  const mutator3 = core.getDailyMutator('2026-05-21'); // Thursday (4)
  assert.equal(mutator1.id, 'ai-explosion');
  assert.equal(mutator2.id, mutator1.id);
  assert.equal(mutator3.id, 'crazy-thursday');
});

test('daily challenge mutators modify card effects correctly', () => {
  const mondayMutator = core.getDailyMutator('2026-05-18'); // Monday (1)
  assert.equal(mondayMutator.id, 'blue-monday');

  let state = core.createRunState('mayfly');
  state.dailyChallenge = true;
  state.dailyMutator = mondayMutator;

  const workCard = core.ACTION_CARDS.find(item => item.id === 'final-ppt');
  assert.ok(workCard);
  const baseAnxiety = workCard.effect.anxiety;
  assert.ok(baseAnxiety > 0);
  const expectedAnxiety = Math.round(baseAnxiety * 1.2);
  const nextState = core.applyCard(state, workCard);
  assert.equal(nextState.stats.anxiety - state.stats.anxiety, expectedAnxiety);

  const wednesdayMutator = core.getDailyMutator('2026-05-20'); // Wednesday (3)
  assert.equal(wednesdayMutator.id, 'ai-explosion');
  let aiState = core.createRunState('mayfly');
  aiState.dailyChallenge = true;
  aiState.dailyMutator = wednesdayMutator;
  const aiCard = core.ACTION_CARDS.find(item => item.id === 'ai-weekly-report');
  assert.ok(aiCard);
  const nextAiState = core.applyCard(aiState, aiCard);
  assert.equal(nextAiState.timeLeft, aiState.timeLeft);
});

test('daily challenge weekend-recovery applies passive stats recovery on card play', () => {
  const satMutator = core.getDailyMutator('2026-05-23'); // Saturday (6)
  assert.equal(satMutator.id, 'weekend-recovery');

  let state = core.createRunState('mayfly');
  state.dailyChallenge = true;
  state.dailyMutator = satMutator;
  state.stats.anxiety = 85;
  state.stats.spirit = 10;

  const card = core.ACTION_CARDS.find(item => item.id === 'milk-tea-social');
  const next = core.applyCard(state, card);

  const expectedAnxietyWithoutRecovery = Math.max(0, state.stats.anxiety + (card.effect.anxiety || 0));
  assert.ok(next.stats.anxiety < expectedAnxietyWithoutRecovery + 3);
});
