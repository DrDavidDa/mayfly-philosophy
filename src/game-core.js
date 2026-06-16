(function initMayflyCore(root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  root.MayflyCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : window, function createMayflyCore() {
  const STAT_NAMES = {
    spirit: '精神',
    social: '社交',
    health: '健康',
    anxiety: '焦虑'
  };

  const CATEGORY_LABELS = {
    work: '加班',
    meeting: '开会',
    slack: '摸鱼',
    social: '社交',
    phone: '刷手机',
    think: '思考',
    ai: 'AI外包',
    disrupt: '搅局',
    event: '事件'
  };

  const CHARACTERS = {
    mayfly: {
      id: 'mayfly',
      name: '蜉蝣',
      emoji: '🪽',
      subtitle: '朝生暮死，卷生卷死',
      baseStats: { spirit: 50, social: 30, health: 60, anxiety: 40 },
      timeLimit: 24,
      description: '你知道自己只有24小时。但你还是决定把TODO list写满。',
      color: 'var(--neon-cyan)'
    },
    mosquito: {
      id: 'mosquito',
      name: '蚊子',
      emoji: '🦟',
      subtitle: '嗡嗡嗡，我来帮你搅局',
      baseStats: { spirit: 42, social: 22, health: 70, anxiety: 48 },
      timeLimit: 12,
      description: '你的一生就是找机会叮一口。每个人都想拍死你，但你很自由。',
      color: 'var(--neon-pink)',
      locked: true
    },
    old_wang: {
      id: 'old_wang',
      name: '老王',
      emoji: '🧎',
      subtitle: '万物皆可卷，奋斗无终点',
      baseStats: { spirit: 35, social: 45, health: 40, anxiety: 55 },
      timeLimit: 24,
      description: 'KPI专家。工作与开会时间减少30%，双倍老板好感，但双倍累积荒诞债。',
      color: 'var(--neon-yellow)',
      locked: true
    },
    slacker_yu: {
      id: 'slacker_yu',
      name: '小余',
      emoji: '🛌',
      subtitle: '生命在于静止，工作不如摸鱼',
      baseStats: { spirit: 65, social: 25, health: 50, anxiety: 30 },
      timeLimit: 24,
      description: '摸鱼达人。摸鱼和刷手机效果提升50%，但每回合老板好感度自动-3。',
      color: 'var(--neon-green)',
      locked: true
    }
  };

  const ACTION_CARDS = [
    {
      id: 'voluntary-overtime',
      name: '自愿加班',
      icon: '💻',
      category: 'work',
      quote: '你主动说“我来吧”，这三个字被系统永久收藏。',
      processBeats: [
        '你在群里打出“我来吧”，发送前还觉得自己很成熟。',
        '老板回了一个大拇指。两分钟后，他又发来三个“顺手也看下”。',
        '你没有升职，但获得了一个隐形头衔：默认负责人。'
      ],
      cost: { time: 2.5 },
      effect: { spirit: -10, social: -4, health: -8, anxiety: 15 },
      disruption: -5,
      absurdDebt: 15,
      npc: { boss: 12, coworker: -4 },
      tag: '正确得危险',
      causality: '你上辈子自愿加班，下一世的工位多了三份“顺手帮忙”。'
    },
    {
      id: 'final-ppt',
      name: '最终版PPT',
      icon: '📊',
      category: 'work',
      quote: '你把文件命名为“最终版”，这是灾难的第一步。',
      processBeats: [
        '你把文件命名为“最终版”。老板说方向对了，但感觉不对。',
        '你沉默三秒，把它改成“最终版_按老板感觉改_真的最终”。',
        '文件夹里出现了17个最终版，只有你知道它们都不是。'
      ],
      cost: { time: 3 },
      effect: { spirit: -12, social: 2, health: -6, anxiety: 18 },
      disruption: 6,
      absurdDebt: 18,
      npc: { boss: 8, coworker: -2 },
      delayedConsequences: [
        {
          id: 'ppt-final-resurrection',
          delayTurns: 1,
          emoji: '📊',
          text: '最终版PPT复活了：老板说“整体没问题，就是重新来一版更有感觉”。你的文件名开始长出尾巴。',
          preview: '最终版PPT将在1次选择后申请复活。',
          effect: { spirit: -8, anxiety: 10, health: -3 },
          timeCost: 0.75,
          disruption: 4,
          absurdDebt: 10,
          type: 'negative',
          causality: '你命名过的最终版PPT拒绝最终。'
        }
      ],
      tag: '版本地狱',
      causality: '你留下了17个PPT版本，下一世的会议卡权重上升。'
    },
    {
      id: 'meeting-silence',
      name: '会议沉默',
      icon: '🗣',
      category: 'meeting',
      quote: '你全程没说话，但会议纪要替你发言了。',
      processBeats: [
        '你全程没说话，只点了两次头，动作克制得像一份合规文件。',
        '会议纪要里写着：“此项由你跟进”。',
        '你试图回忆自己什么时候加入了这个项目。记忆没有配合。'
      ],
      cost: { time: 1.5 },
      effect: { spirit: -7, social: -5, health: -2, anxiety: 12 },
      disruption: -10,
      absurdDebt: 12,
      npc: { boss: -3, coworker: 2 },
      tag: '时间黑洞',
      causality: '你沉默了太久，下一世所有人都以为你负责这件事。'
    },
    {
      id: 'write-minutes',
      name: '主动写纪要',
      icon: '📝',
      category: 'meeting',
      quote: '你总结了所有废话，废话因此获得了永生。',
      processBeats: [
        '你打开文档，试图把40分钟的绕圈翻译成人话。',
        '你写下“后续持续跟进”，这句话像胶水一样粘住了所有责任。',
        '废话没有消失。它获得了标题、编号和下次会议。'
      ],
      cost: { time: 1.5 },
      effect: { spirit: -8, social: 8, health: -3, anxiety: 10 },
      disruption: -4,
      absurdDebt: 14,
      npc: { boss: 6, coworker: 4 },
      tag: '废话固化',
      causality: '你写下的纪要复活了，下一世会自动生成一个会。'
    },
    {
      id: 'toilet-slack',
      name: '厕所摸鱼',
      icon: '🐟',
      category: 'slack',
      quote: '你躲进厕所，开始合理使用公共资源。',
      processBeats: [
        '你躲进厕所，打开手机，世界终于安静。',
        '第17分钟，门外有人咳了一声。第23分钟，你开始假装冲水。',
        '你没有摸到鱼，但练成了“带薪屏住呼吸”。'
      ],
      cost: { time: 0.75 },
      effect: { spirit: 12, social: -2, health: 2, anxiety: -8 },
      disruption: 10,
      absurdDebt: -6,
      npc: { slacker: 8 },
      tag: '正义之举',
      causality: '你上辈子占用厕所太久，下一世门口贴了“禁止顿悟”。'
    },
    {
      id: 'fake-ide',
      name: '假装写代码',
      icon: '⌨️',
      category: 'slack',
      quote: '屏幕上全是代码，其实你在研究午饭。',
      processBeats: [
        '你把IDE切到深色主题，整个人看起来像正在解决复杂问题。',
        '实际问题是：黄焖鸡还是麻辣烫。你研究了12分钟评论区。',
        '同事路过时点了点头。你获得了不该属于你的专业感。'
      ],
      cost: { time: 0.75 },
      effect: { spirit: 9, social: 0, health: 1, anxiety: -5 },
      disruption: 8,
      absurdDebt: -4,
      npc: { slacker: 6, boss: -2 },
      tag: '伪装艺术',
      causality: '你留下了一个假IDE窗口，下一世老板开始怀疑所有黑屏。'
    },
    {
      id: 'milk-tea-social',
      name: '奶茶社交',
      icon: '🧋',
      category: 'social',
      quote: '你用一杯全糖确认自己仍在组织生态里。',
      processBeats: [
        '同事问“喝奶茶吗”，你本想拒绝，嘴已经说了“都行”。',
        '你在小程序里纠结糖度，像在给人生选择难度。',
        '奶茶到了，你获得12分钟同事关系续费。'
      ],
      cost: { time: 0.5 },
      effect: { spirit: 7, social: 14, health: -2, anxiety: -5 },
      disruption: 2,
      absurdDebt: 4,
      npc: { slacker: 5, coworker: 4 },
      tag: '表面温暖',
      causality: '你请过的奶茶变成了人情债，下一世自动加入茶水间事件。'
    },
    {
      id: 'like-boss-post',
      name: '点赞老板朋友圈',
      icon: '👍',
      category: 'social',
      quote: '你完成了一次组织忠诚认证。',
      processBeats: [
        '老板发了跑步自拍，配文“自律的人生不设限”。',
        '你本想划走，手指却完成了一次组织忠诚认证。',
        '三分钟后，老板私聊你：“还没睡？正好有个小事。”'
      ],
      cost: { time: 1 },
      effect: { spirit: -3, social: 8, health: 0, anxiety: 8 },
      disruption: -2,
      absurdDebt: 12,
      npc: { boss: 10 },
      delayedConsequences: [
        {
          id: 'boss-small-thing',
          delayTurns: 2,
          emoji: '👍',
          text: '老板看见你点赞了朋友圈，私聊你：“还没休息？正好有个小事。”小事打开后有六个附件。',
          preview: '老板将在2次选择后兑现你的朋友圈忠诚。',
          effect: { spirit: -6, social: 2, anxiety: 14 },
          timeCost: 0.5,
          disruption: -3,
          absurdDebt: 12,
          type: 'negative',
          causality: '你点过的赞变成了老板口中的一个小事。'
        }
      ],
      tag: '社交抵押',
      causality: '你点过的赞会在下一世变成“你很认可公司文化”。'
    },
    {
      id: 'doom-scroll',
      name: '短视频续命',
      icon: '📱',
      category: 'phone',
      quote: '你把拖延包装成了自我提升。',
      processBeats: [
        '你点开《提高效率的五个方法》，告诉自己这叫学习。',
        '你收藏了它，顺手看了作者主页，又看了评论区吵架。',
        '1小时后，你没有提高效率，但新增了一个待办：明天开始自律。'
      ],
      cost: { time: 1 },
      effect: { spirit: 5, social: 2, health: -2, anxiety: 7 },
      disruption: 1,
      absurdDebt: 3,
      delayedConsequences: [
        {
          id: 'algorithm-backlash',
          delayTurns: 2,
          emoji: '📱',
          text: '算法回访：你刷过的“提高效率五法”出了续集。你点开前说只看30秒，身体替你点了下一条。',
          preview: '算法将在2次选择后回访你的效率焦虑。',
          effect: { spirit: -4, anxiety: 12 },
          timeCost: 0.5,
          disruption: 3,
          absurdDebt: 8,
          type: 'negative',
          causality: '你收藏过的效率视频开始收藏你。'
        }
      ],
      tag: '信息内耗',
      causality: '你上辈子刷过的视频，会在下一世精准推荐给你。'
    },
    {
      id: 'notification-dnd',
      name: '开勿扰模式',
      icon: '🔕',
      category: 'phone',
      quote: '你把所有通知静音，世界第一次没能立刻找到你。',
      processBeats: [
        '你长按勿扰模式，像按下一枚不体面的逃生按钮。',
        '飞书、微信、日历一起闭嘴，办公室短暂像没通电。',
        '半小时后你发现消息没有消失，只是排队等着报复。'
      ],
      cost: { time: 0.5 },
      effect: { spirit: 6, social: -2, health: 1, anxiety: -16 },
      disruption: 14,
      absurdDebt: -4,
      npc: { boss: -4, coworker: -2 },
      delayedConsequences: [
        {
          id: 'notification-avalanche',
          delayTurns: 2,
          emoji: '🔕',
          text: '勿扰模式回访：你错过的消息没有死，它们叠成99+瀑布，其中三条写着“刚刚怎么没回”。',
          preview: '勿扰模式将在2次选择后堆成99+消息瀑布。',
          effect: { spirit: -4, social: -6, anxiety: 14 },
          timeCost: 0.25,
          disruption: 4,
          absurdDebt: 8,
          type: 'negative',
          causality: '你静音过的消息没有消失，只是学会了排队复仇。'
        }
      ],
      tag: '临时断网',
      causality: '你上辈子把通知静音，下一世的消息会先检查你还在不在。'
    },
    {
      id: 'old-post',
      name: '翻到黑历史',
      icon: '🕳',
      category: 'phone',
      quote: '三年前的你亲手刺杀了今天的你。',
      processBeats: [
        '你只是想搜一张旧照片，结果翻到了三年前的朋友圈。',
        '那时的你说“未来可期”，配了一张过曝自拍。',
        '你关掉相册。未来没有可期，只有已读不回。'
      ],
      cost: { time: 0.5 },
      effect: { spirit: -12, social: -8, health: 0, anxiety: 15 },
      disruption: 12,
      absurdDebt: 5,
      tag: '赛博社死',
      causality: '你的黑历史没有删除，它只是去了下一条时间线。'
    },
    {
      id: 'calculate-wage',
      name: '计算时薪',
      icon: '🧮',
      category: 'think',
      quote: '你算到一半，决定尊重数学，也放过自己。',
      processBeats: [
        '你打开计算器，试图用理性解释疲惫。',
        '算到第三步，你发现自己的时薪不如外卖满减。',
        '你关掉计算器。数学赢了，你没有。'
      ],
      cost: { time: 0.5 },
      effect: { spirit: -10, social: -3, health: 0, anxiety: 18 },
      disruption: 14,
      absurdDebt: -2,
      tag: '危险认知',
      causality: '你算出的时薪在下一世变成了一声很轻的叹气。'
    },
    {
      id: 'ai-weekly-report',
      name: 'AI代写周报',
      icon: '🤖',
      category: 'ai',
      quote: '你把一周的疲惫交给豆袋仔，它回你“本周稳步推进”。',
      processBeats: [
        '你把“这周很累”粘进豆袋仔，要求它写得积极、专业、像没被生活打过。',
        '它生成了“主动协同、持续沉淀、稳步推进”，每个词都像穿了工牌。',
        '你复制粘贴，感觉自己不是在写周报，而是在给疲惫套模板。'
      ],
      cost: { time: 0.5 },
      effect: { spirit: 6, social: -1, health: 0, anxiety: -6 },
      disruption: 6,
      absurdDebt: 12,
      npc: { boss: 4 },
      delayedConsequences: [
        {
          id: 'ai-weekly-fingerprint',
          delayTurns: 2,
          emoji: '🤖',
          text: 'AI周报回访：老板说你这周“稳步推进”得太标准了，问能不能把提示词也沉淀成团队模板。',
          preview: 'AI周报将在2次选择后暴露提示词指纹。',
          effect: { spirit: -5, anxiety: 12 },
          timeCost: 0.25,
          disruption: 2,
          absurdDebt: 14,
          type: 'negative',
          causality: '你把疲惫外包给豆袋仔，豆袋仔把你外包给模板。'
        }
      ],
      tag: '提示词遮羞布',
      causality: '你用AI写过周报，下一世的老板会先问你提示词。'
    },
    {
      id: 'ai-deep-research',
      name: '深潜鲸调研',
      icon: '🐋',
      category: 'ai',
      quote: '你让深潜鲸研究行业趋势，它很自信地给了你三种互相矛盾的未来。',
      processBeats: [
        '你打开深潜鲸，输入“请全面分析这个市场”，仿佛自己也全面了。',
        '它吐出八页报告，引用很像真的，结论很像老板想听的。',
        '你越读越安心，直到发现两段话在互相否定，还都很有道理。'
      ],
      cost: { time: 0.75 },
      effect: { spirit: 3, social: 0, health: -1, anxiety: 4 },
      disruption: 10,
      absurdDebt: 10,
      delayedConsequences: [
        {
          id: 'ai-citation-ghost',
          delayTurns: 2,
          emoji: '🐋',
          text: '深潜鲸回访：你引用的“行业白皮书”像真名，又像梦话。会议室开始搜索来源，搜索结果也开始紧张。',
          preview: '深潜鲸将在2次选择后要求你证明引用存在。',
          effect: { spirit: -6, social: -3, anxiety: 13 },
          timeCost: 0.25,
          disruption: 8,
          absurdDebt: 10,
          type: 'negative',
          causality: '你把自信交给深潜鲸，深潜鲸把出处交给概率。'
        }
      ],
      tag: '自信幻觉',
      causality: '你上辈子信过一份AI调研，下一世的引用会先自我介绍。'
    },
    {
      id: 'ai-meeting-bot',
      name: '会议机器人替身',
      icon: '🎙️',
      category: 'ai',
      quote: '你派会议机器人听会，本人去摸鱼。机器人比你更会点头。',
      processBeats: [
        '你把会议机器人放进会议室，自己去接水，水都显得很先进。',
        '机器人实时转写“嗯嗯、对齐一下、后续跟进”，像一台职业废话榨汁机。',
        '会后纪要说你“积极参与并承诺推进”。你本人第一次听说。'
      ],
      cost: { time: 0.5 },
      effect: { spirit: 8, social: -2, health: 1, anxiety: -4 },
      disruption: 12,
      absurdDebt: 14,
      npc: { boss: 3, coworker: -2 },
      delayedConsequences: [
        {
          id: 'ai-minutes-betrayal',
          delayTurns: 1,
          emoji: '🎙️',
          text: '会议机器人回访：它把你的沉默总结成“主动认领”。纪要很完整，你的人生很被动。',
          preview: '会议机器人将在1次选择后把沉默总结成承诺。',
          effect: { spirit: -7, social: -4, anxiety: 12 },
          timeCost: 0.5,
          disruption: 4,
          absurdDebt: 16,
          type: 'negative',
          causality: '你让机器人替你听会，机器人替你答应了更多会。'
        }
      ],
      tag: '自动背锅',
      causality: '你用机器人替身开会，下一世纪要会先替你报名。'
    },
    {
      id: 'ai-comfort-bot',
      name: '圆宝搜答安慰',
      icon: '🧸',
      category: 'ai',
      quote: '你问圆宝搜答“我是不是废了”，它说你只是需要结构化休息。',
      processBeats: [
        '你把焦虑发给圆宝搜答，它先肯定你的感受，再建议你列个清单。',
        '你被安慰到三分，又被“结构化休息”吓回两分。',
        '你突然发现，连崩溃都开始有步骤说明了。'
      ],
      cost: { time: 0.5 },
      effect: { spirit: 5, social: -1, health: 1, anxiety: -10 },
      disruption: 8,
      absurdDebt: 4,
      delayedConsequences: [
        {
          id: 'ai-comfort-subscription',
          delayTurns: 2,
          emoji: '🧸',
          text: '圆宝搜答回访：它问你今天是否继续情绪打卡。你还没来得及崩溃，崩溃已经被产品化。',
          preview: '圆宝搜答将在2次选择后把安慰变成打卡。',
          effect: { spirit: -3, anxiety: 9 },
          disruption: 6,
          absurdDebt: 6,
          type: 'negative',
          causality: '你把情绪交给圆宝搜答，它把情绪改造成用户留存。'
        }
      ],
      tag: '情绪外包',
      causality: '你让AI安慰过自己，下一世连崩溃都会收到提醒。'
    },
    {
      id: 'reschedule-meeting',
      name: '把会挪到明天',
      icon: '📅',
      category: 'meeting',
      quote: '你没有明天，但会议有。它比你更长寿。',
      processBeats: [
        '你点开日历，把会议往后拖了一格。',
        '所有人都松了一口气，像共同签署了一份自欺欺人协议。',
        '你突然意识到：蜉蝣没有明天，但会议可以继承你的明天。'
      ],
      cost: { time: 0.75 },
      effect: { spirit: 4, social: -2, health: 1, anxiety: -14 },
      disruption: 18,
      absurdDebt: 6,
      npc: { boss: -3, coworker: 3 },
      delayedConsequences: [
        {
          id: 'tomorrow-meeting-returns',
          delayTurns: 2,
          emoji: '📅',
          text: '被挪到明天的会穿越回来了：它说“虽然你没有明天，但我们可以先同步一下背景”。',
          preview: '被挪到明天的会将在2次选择后穿越回来。',
          effect: { spirit: -5, social: -3, anxiety: 12 },
          timeCost: 0.5,
          disruption: 8,
          absurdDebt: 10,
          type: 'negative',
          causality: '你推迟过的会议发现了蜉蝣寿命漏洞，决定提前回来。'
        }
      ],
      tag: '时间诈骗',
      causality: '你把会议推到不存在的明天，下一世的日历开始怀疑物理学。'
    },
    {
      id: 'boundary-statement',
      name: '边界声明',
      icon: '📎',
      category: 'disrupt',
      quote: '你说“我只能支持到这里”，空气突然开始考勤。',
      processBeats: [
        '老板把第六个附件发来时，你没有立刻回“收到”。',
        '你写下“我今晚只能支持到这里，剩余部分请排明天优先级”。光标闪得像心电图。',
        '消息发出后，群里安静了七秒。你少了一点体面，但多了一点命。'
      ],
      cost: { time: 0.5 },
      effect: { spirit: -3, social: 0, health: 1, anxiety: -6 },
      disruption: 16,
      absurdDebt: -10,
      npc: { boss: -18, coworker: -3 },
      tag: '不体面自救',
      causality: '你划过一次边界，下一世系统会记得你不是默认附件接收器。'
    },
    {
      id: 'solo-slack',
      name: '单人摸鱼',
      icon: '🚪',
      category: 'slack',
      quote: '你没有帮搭子盯工位，这次只把自己藏起来。',
      processBeats: [
        '摸鱼搭子发来“帮我看下老板来没”，你盯着消息没有秒回。',
        '你把手机扣在桌上，独自去茶水间接水，像一次低配版离职。',
        '搭子少了一点安全感，你少了一份连带责任。水很普通，但很自由。'
      ],
      cost: { time: 0.5 },
      effect: { spirit: 6, social: -2, health: 1, anxiety: -4 },
      disruption: 12,
      absurdDebt: -3,
      npc: { slacker: -18 },
      tag: '解绑互保',
      causality: '你拒绝过一次互相放风，下一世厕所门口少了一张共同犯罪记录。'
    },
    {
      id: 'return-favor',
      name: '还一杯奶茶',
      icon: '🧋',
      category: 'social',
      quote: '你把人情账还到刚好不欠，像给关系做了一次手动对账。',
      processBeats: [
        '同事第三次说“帮我看一眼”前，你先递过去一杯奶茶。',
        '你说“上次谢谢你，这杯算我还账”。对方的请求在嘴边短暂停车。',
        '关系没有变冷，只是从无限续费改成了当场结清。'
      ],
      cost: { time: 0.5 },
      effect: { spirit: 2, social: 1, health: -1, anxiety: -5 },
      disruption: 2,
      absurdDebt: -8,
      npc: { coworker: -18 },
      tag: '人情清账',
      causality: '你清过一次人情账，下一世茶水间账本会晚一点翻到你。'
    },
    {
      id: 'window-sunset',
      name: '临终看天光',
      icon: '🌅',
      category: 'think',
      quote: '你没有优化任何东西。世界因此安静了一秒。',
      processBeats: [
        '你没有点开任务，也没有刷新消息，只是看向窗外。',
        '玻璃反射出一只戴工牌的虫，看起来比你更像员工。',
        '远处有一点天光。你没有拍照，也没有汇报。'
      ],
      cost: { time: 0.5 },
      effect: { spirit: 8, social: -2, health: 2, anxiety: -12 },
      disruption: 50,
      absurdDebt: -10,
      tag: '终极搅局',
      flag: 'sunsetSeen',
      requiresPhase: 'final-settlement',
      causality: '你看过一秒日落，下一世开局会少一点焦虑。'
    },
    {
      id: 'speak-truth',
      name: '当众说真话',
      icon: '⚡',
      category: 'disrupt',
      quote: '会议室安静了三秒，像系统卡住了。',
      processBeats: [
        '你听了半小时“拉齐认知”，突然问：“所以这事到底谁需要？”',
        '会议室安静了三秒。有人低头喝水，有人假装看电脑。',
        '老板说“这个问题很好”，语气像在给你选墓地。'
      ],
      cost: { time: 0.75 },
      effect: { spirit: -5, social: -8, health: 0, anxiety: 10 },
      disruption: 25,
      absurdDebt: -10,
      npc: { boss: -15, coworker: 8 },
      tag: '搅局核心',
      causality: '你说过的真话没有消失，它躲进了下一世的会议室。'
    },
    {
      id: 'wrong-emoji',
      name: '误发表情包',
      icon: '😬',
      category: 'disrupt',
      quote: '你把老板表情包发进了老板也在的群。',
      processBeats: [
        '你本想发给小群，手指替命运选择了大群。',
        '表情包里老板正在咆哮，现实里的老板正在输入。',
        '群里安静得像全员同时断网。只有撤回提示很响。'
      ],
      cost: { time: 0.5 },
      effect: { spirit: -6, social: -12, health: 0, anxiety: 16 },
      disruption: 30,
      absurdDebt: -4,
      npc: { boss: -20, slacker: 10, coworker: 6 },
      delayedConsequences: [
        {
          id: 'meme-aftershock',
          delayTurns: 1,
          emoji: '😬',
          text: '撤回的表情包没有消失，它只是进入了同事的离线缓存。茶水间开始出现“你很勇”的眼神。',
          preview: '撤回表情包将在1次选择后引发茶水间余震。',
          effect: { social: -8, anxiety: 8 },
          timeCost: 0.25,
          disruption: 12,
          absurdDebt: -2,
          type: 'disrupt',
          causality: '你撤回的表情包在群里死了，在茶水间活了。'
        }
      ],
      tag: '组织震荡',
      causality: '你误发的表情包已经传到下一世老板手机里。'
    },
    {
      id: 'feishu-unread',
      name: '飞书已读不回',
      icon: '💬',
      category: 'social',
      quote: '你盯着“已读”两个字，仿佛在等待审判。',
      processBeats: [
        '你在群里发了工作进度，系统显示老板已读。',
        '你连续刷新了15次，已读状态很扎眼，却没有收到任何文字回复。',
        '你开始深度反思：是不是刚才发消息用的语气词不太合适？'
      ],
      cost: { time: 0.5 },
      effect: { spirit: -4, social: -8, health: 0, anxiety: 12 },
      disruption: 2,
      absurdDebt: 4,
      npc: { boss: -8, coworker: -4 },
      tag: '已读是种态度',
      causality: '你上辈子的已读不回，成为了这一世永远未读的飞书。'
    },
    {
      id: 'self-performance',
      name: '绩效自评',
      icon: '📊',
      category: 'work',
      quote: '你绞尽脑汁地编造修辞，证明自己并非微不足道。',
      processBeats: [
        '你开始写自评，硬生生把每天的机械打杂写成了“多维业务赋能”。',
        '写了一千字自吹自擂，系统提示超长，你又咬牙删去五百字废话。',
        '在点击提交的瞬间你突然明白，写再多也抵不过一次PPT展示。'
      ],
      cost: { time: 1.5 },
      effect: { spirit: -15, social: 0, health: -4, anxiety: 20 },
      disruption: -2,
      absurdDebt: 15,
      tag: '语言的艺术',
      causality: '你上辈子的绩效自评，变成了这一世更冗长的述职框架。',
      delayedConsequences: [
        {
          id: 'hr-optimized-chat',
          delayTurns: 2,
          probability: 1,
          text: 'HR约谈：你的绩效自评“重点不突出”，需要重新对齐。',
          effect: { spirit: -10, anxiety: 15 }
        }
      ]
    },
    {
      id: 'vacation-expired',
      name: '调休假到期',
      icon: '⏰',
      category: 'slack',
      quote: '假还没有请，考勤系统先发来了过期警告。',
      processBeats: [
        '系统发来自动邮件：你去年未休完的8天调休假即将在本周末作废。',
        '你犹豫再三准备请假，发现需要提交复杂的交接文档 and 备岗证明。',
        '最终你坐在工位上默默算账，看着假期的沙漏清零，化为虚无。'
      ],
      cost: { time: 1 },
      effect: { spirit: -10, social: -2, health: -4, anxiety: 15 },
      disruption: 8,
      absurdDebt: 6,
      tag: '过期作废',
      causality: '上辈子没休完的假，化为这一世床头永远闹钟响。'
    },
    {
      id: 'medical-report',
      name: '体检报告未读',
      icon: '🩺',
      category: 'think',
      quote: '薛定谔的报告。只要不点开，你就永远没有得病。',
      processBeats: [
        '短信通知你的体检报告已生成，密码是身份证号后六位。',
        '你在密码输入框填好，但在点击“确定”的瞬间停下了手指。',
        '万一真的查出什么，你哪来积蓄付医药费，又如何向家里交代？'
      ],
      cost: { time: 0.5 },
      effect: { spirit: -15, social: 0, health: -20, anxiety: 30 },
      disruption: 4,
      absurdDebt: 10,
      tag: '薛定谔的病',
      causality: '上一世没点开的体检报告，变成了这一世隐隐作痛的腰椎。'
    },
    {
      id: 'mom-voice',
      name: '妈妈的60秒语音',
      icon: '👵',
      category: 'social',
      quote: '那是家乡的唠叨，而你只能躲在办公室厕所里戴耳机听。',
      processBeats: [
        '微信突然弹出一条语音，长度正好是沉甸甸的“60秒”。',
        '你戴上耳机，里面传来了母亲啰里啰唆让你按时吃饭、注意冷暖的碎念。',
        '听完你呆坐在马桶上，突然觉得屏幕上闪烁的飞书工作并没有那么重要。'
      ],
      cost: { time: 2 },
      effect: { spirit: 10, social: 8, health: 0, anxiety: -5 },
      disruption: -4,
      absurdDebt: 2,
      tag: '唯一的港湾',
      causality: '上辈子那一声叹息，化为这一世开局时包裹你的微温风声。'
    },
    {
      id: 'match-vs-overtime',
      name: '相亲撞上紧急加班',
      icon: '💔',
      category: 'social',
      quote: '在老板的好感度与家人的期盼之间，你只能极限拉扯。',
      processBeats: [
        '今晚是家人千叮咛万嘱咐的相亲局，老板却在下班前五分钟发了紧急对齐。',
        '如果不去相亲会被家里人念叨一整年，不加班又可能直接失去饭碗。',
        '你被迫极限两头顾，最后迟到在饭局，也漏掉了老板群里的多次提问。'
      ],
      cost: { time: 1.5 },
      effect: { spirit: -8, social: 12, health: -4, anxiety: 10 },
      disruption: 5,
      absurdDebt: 8,
      npc: { boss: -10, coworker: -2 },
      tag: '极限拉扯',
      causality: '上辈子的遗憾纠葛，化为下一世难以自拔的社交修罗场。'
    },
    {
      id: 'bonus-shrink',
      name: '年终奖缩水',
      icon: '💸',
      category: 'work',
      quote: '你辛苦干了一整年，换来一封充满格局的“致全员信”。',
      processBeats: [
        '公司发布年终奖核算通知：因行业环境恶劣，基数打折，系数打折。',
        '甚至发放形式也拖延成了分期支付，第一笔得等到今年下半年。',
        '你默算了一下，扣完个人所得税，剩下的数额勉强够交两个月房租。'
      ],
      cost: { time: 1 },
      effect: { spirit: -20, social: -2, health: -4, anxiety: 25 },
      disruption: 15,
      absurdDebt: 12,
      tag: '年度惊悚',
      causality: '上辈子消失的财富，在这一世开局时变为了更重的工作压力。'
    },
    {
      id: 'pip-interview',
      name: 'PIP优化面谈',
      icon: '⚖️',
      category: 'work',
      quote: '老板微笑着看着你：“我们觉得，你还可以表现得更优秀。”',
      processBeats: [
        '你被叫进昏暗的小会议室，老板和HR面带公式化的微笑静坐等待。',
        '他们推过来一份“个人改进计划”（PIP）表格，上面写满了无法完成的指标。',
        '你知道所有的陈述都没有意义，这只是合法劝退的一场体面排演。'
      ],
      cost: { time: 2 },
      effect: { spirit: -25, social: -6, health: -6, anxiety: 30 },
      disruption: 20,
      absurdDebt: 15,
      npc: { boss: -20, coworker: -5 },
      tag: '职业休克',
      causality: '上一世没走完的PIP协议，在这一世变为了老板工位上的锐利余光。'
    }
  ];

  const EVENTS = [
    {
      id: 'boss-email',
      emoji: '📧',
      text: '老板发来邮件：明天的PPT改成……算了，你看到邮件再说。',
      effect: { anxiety: 20, spirit: -5 },
      disruption: 0,
      absurdDebt: 8,
      type: 'negative'
    },
    {
      id: 'free-tea',
      emoji: '🧋',
      text: '同事请了奶茶。你感动得差点哭出来，虽然只是因为凑单。',
      effect: { spirit: 10, anxiety: -5 },
      disruption: 0,
      absurdDebt: 0,
      type: 'positive'
    },
    {
      id: 'silent-room',
      emoji: '⚠️',
      text: '会议室突然沉默。大家同时意识到这个项目可能没意义。',
      effect: { anxiety: 8, social: -4 },
      disruption: 18,
      absurdDebt: -5,
      type: 'disrupt'
    },
    {
      id: 'kpi-update',
      emoji: '📋',
      text: 'KPI调整了。没有人知道为什么，但所有人都开始忙。',
      effect: { anxiety: 25, spirit: -10 },
      disruption: -5,
      absurdDebt: 20,
      type: 'negative'
    },
    {
      id: 'deadline-delay',
      emoji: '🕰️',
      text: '截止时间突然延期。大家松了一口气，然后立刻安排了一个复盘会。',
      effect: { spirit: 8, anxiety: -12 },
      disruption: 6,
      absurdDebt: -4,
      type: 'positive'
    },
    {
      id: 'snack-rebellion',
      emoji: '🍪',
      text: '茶水间零食补货。办公室短暂恢复人性，三分钟后恢复绩效。',
      effect: { spirit: 10, social: 6, health: -1 },
      disruption: 4,
      absurdDebt: 0,
      type: 'positive'
    },
    {
      id: 'calendar-ambush',
      emoji: '📆',
      text: '日历凭空多出一个“对齐会”。你不知道要对齐什么，但已经开始歪了。',
      effect: { spirit: -7, anxiety: 14 },
      disruption: -3,
      absurdDebt: 10,
      type: 'negative'
    },
    {
      id: 'anonymous-praise',
      emoji: '🧾',
      text: '匿名表扬信出现了。内容像夸你，又像把工作甩给你。',
      effect: { social: 8, anxiety: 8 },
      disruption: 2,
      absurdDebt: 7,
      type: 'negative'
    },
    {
      id: 'ai-model-update',
      emoji: '🧠',
      text: '新一代办公助手上线了。大家说效率会翻倍，然后花半小时找旧按钮在哪里。',
      effect: { spirit: -3, anxiety: 10 },
      disruption: 8,
      absurdDebt: 6,
      type: 'negative'
    },
    {
      id: 'ai-robot-colleague',
      emoji: '🤖',
      text: '部门来了一个流程机器人。它第一句话是：“请确认你仍然需要亲自存在。”',
      effect: { social: -3, anxiety: 12 },
      disruption: 10,
      absurdDebt: 10,
      type: 'negative'
    },
    {
      id: 'sunset-leak',
      emoji: '🪟',
      text: '你看向窗外。玻璃上映出一只穿工牌的小虫，看起来比你更像员工。',
      effect: { spirit: 8, anxiety: -10 },
      disruption: 12,
      absurdDebt: -6,
      type: 'disrupt'
    },
    {
      id: 'feishu-99-notifications',
      emoji: '💬',
      text: '飞书突然弹出 99+ 消息。你深吸一口气，开始学习如何在十秒内不读也回复。',
      effect: { anxiety: 15, social: -5 },
      disruption: 0,
      absurdDebt: 5,
      type: 'negative'
    },
    {
      id: 'projector-broken',
      emoji: '🔌',
      text: '会议室投影仪坏了。在等待IT抢修的二十分钟里，办公室实现了短暂的人性复苏。',
      effect: { spirit: 8, anxiety: -10 },
      disruption: 5,
      absurdDebt: -3,
      type: 'positive'
    },
    {
      id: 'layoff-next-door',
      emoji: '📦',
      text: '隔壁部门今天裁员。抱着箱子的同事走过，你突然对工牌的挂绳产生了某种哲学思考。',
      effect: { anxiety: 20, spirit: -8 },
      disruption: 5,
      absurdDebt: 10,
      type: 'negative'
    },
    {
      id: 'canteen-inflation',
      emoji: '🍛',
      text: '食堂套餐又涨价了。你看着盘子里缩水的排骨，再次确认了劳动力在贬值。',
      effect: { health: -5, anxiety: 8 },
      disruption: 0,
      absurdDebt: 3,
      type: 'negative'
    },
    {
      id: 'ex-coworker',
      emoji: '🫣',
      text: '前任竟然在同一层楼上班。今天为了避开他，你多走了两千步并憋尿半小时。',
      effect: { social: -10, anxiety: 15 },
      disruption: 0,
      absurdDebt: 5,
      type: 'negative'
    },
    {
      id: 'office-plant-death',
      emoji: '🍂',
      text: '发财树居然死了。号称能防辐射的它，甚至撑不过你的半天试用期。',
      effect: { spirit: -5 },
      disruption: 3,
      absurdDebt: 2,
      type: 'disrupt'
    }
  ];

  const DEATHS = [
    {
      id: 'system-stutter',
      title: '系统卡顿 1 秒',
      rarity: 'SSR',
      emoji: '🌀',
      color: 'var(--neon-cyan)',
      condition: (state) => state.disruption >= 150 && state.timeLeft <= 0,
      epitaph: '世界没有改变，但它停顿了一下，像是在思考。'
    },
    {
      id: 'true-sunset',
      title: '真正的日落',
      rarity: 'SSR',
      emoji: '🌅',
      color: 'var(--neon-yellow)',
      condition: (state) => state.flags.sunsetSeen && state.timeLeft <= 0,
      epitaph: '你看完了日落，没有发朋友圈。'
    },
    {
      id: 'self-optimized-away',
      title: '被自己优化掉',
      rarity: 'SR',
      emoji: '📎',
      color: 'var(--neon-purple)',
      condition: (state) => hasHistoryEvent(state, 'route-work-self-replacement'),
      epitaph: '你把经验沉淀成流程，流程把你沉淀成案例。新人参观你的工位时，讲解员说：这里曾经效率很高。'
    },
    {
      id: 'permanent-away',
      title: '永久离席',
      rarity: 'SR',
      emoji: '🚪',
      color: 'var(--neon-cyan)',
      condition: (state) => hasHistoryEvent(state, 'route-slack-permanent-away'),
      epitaph: '你终于摸到了一条大鱼：离开。考勤系统仍显示你“暂时不在”，这是它说过最温柔的话。'
    },
    {
      id: 'social-cremation',
      title: '社交火葬场',
      rarity: 'SR',
      emoji: '🔥',
      color: 'var(--neon-pink)',
      condition: (state) => hasHistoryEvent(state, 'route-social-public-material')
        || (state.stats.social >= 95 && (hasHistoryEvent(state, 'old-post') || hasHistoryEvent(state, 'route-social-black-history'))),
      epitaph: '你认识了所有人，所有人也终于认识了不该认识的你。团建投影仪很亮，你的灵魂很暗。'
    },
    {
      id: 'clarified-to-death',
      title: '澄清到死',
      rarity: 'SR',
      emoji: '🔁',
      color: 'var(--neon-cyan)',
      condition: (state) => hasHistoryEvent(state, 'route-disrupt-question-department'),
      epitaph: '你的问题没有被回答，但它拥有了专项小组、周会和复盘文档。你死后，大家终于达成共识：下次继续讨论。'
    },
    {
      id: 'agentized-away',
      title: '被代理成工具人',
      rarity: 'SR',
      emoji: '🤖',
      color: 'var(--neon-purple)',
      condition: (state) => hasHistoryEvent(state, 'route-ai-agent-replacement'),
      epitaph: '你把判断外包给助手，助手把你外包给流程。最后系统保留了你的账号，注销了你的存在。'
    },
    {
      id: 'false-enlightenment',
      title: '假性顿悟',
      rarity: 'SR',
      emoji: '🧘',
      color: 'var(--neon-yellow)',
      condition: (state) => state.stats.spirit >= 98
        && state.stats.anxiety <= 15
        && ((state.categoryCounts.slack || 0) + (state.categoryCounts.think || 0) >= 7)
        && (state.categoryCounts.think || 0) > 0,
      epitaph: '你突然觉得一切都想通了。五秒后你发现想通的只是“先不管了”，但灵魂已经提交离职申请。'
    },
    {
      id: 'arranged-life',
      title: '被合理安排的一生',
      rarity: 'SR',
      emoji: '📎',
      color: 'var(--neon-purple)',
      condition: (state) => state.absurdDebt >= 100 && !shouldHoldForRouteClimax(state),
      epitaph: '你没有犯错，没有越界。第二天你的工位被改成“新人可参考样板”，样板不需要活着。'
    },
    {
      id: 'anxiety-boom',
      title: '焦虑爆炸',
      rarity: 'N',
      emoji: '💥',
      color: 'var(--neon-pink)',
      condition: (state) => state.stats.anxiety >= 100,
      epitaph: '你同时收到老板、房租扣款和体检提醒。公司第二天照常开会，纪要写：大家状态都不错。'
    },
    {
      id: 'spirit-crash',
      title: '精神崩溃',
      rarity: 'N',
      emoji: '🫠',
      color: 'var(--neon-orange)',
      condition: (state) => state.stats.spirit <= 0,
      epitaph: '你把 Excel 第48行调成绿色，因为它看起来比较健康。十分钟后，你被移出群聊，理由是先好好休息。'
    },
    {
      id: 'unlisted',
      title: '查无此人',
      rarity: 'N',
      emoji: '🫥',
      color: 'var(--neon-purple)',
      condition: (state) => state.stats.social <= 0,
      epitaph: '公司通讯录删掉了你。唯一弹窗来自奶茶群：有人问这杯少冰三分糖是谁的。'
    },
    {
      id: 'body-strike',
      title: '身体罢工',
      rarity: 'N',
      emoji: '🏥',
      color: 'var(--neon-green)',
      condition: (state) => state.stats.health <= 0,
      epitaph: '你的身体说不再服务。体检报告终于加载出来，结论很体面：建议保持规律作息。'
    },
    {
      id: 'natural',
      title: '寿终正寝',
      rarity: 'N',
      emoji: '🌆',
      color: 'var(--neon-yellow)',
      condition: (state) => state.timeLeft <= 0,
      epitaph: '你活了一整天。对于蜉蝣来说，这已经很了不起了。'
    },
    {
      id: 'overload',
      title: '信息过载',
      rarity: 'R',
      emoji: '🤯',
      color: 'var(--neon-pink)',
      condition: (state) => (((state.categoryCounts.phone || 0) + (state.categoryCounts.think || 0)) / Math.max(1, state.turnCount)) >= 0.6 && state.stats.anxiety >= 80,
      epitaph: '你的大脑同时处理了太多信息。它选择了关机。'
    },
    {
      id: 'perfect-attendance',
      title: '全勤奖',
      rarity: 'R',
      emoji: '🏆',
      color: 'var(--neon-cyan)',
      condition: (state) => state.timeLeft <= 0 && ((state.categoryCounts.work || 0) + (state.categoryCounts.meeting || 0) >= 5) && (state.categoryCounts.slack || 0) === 0 && (state.categoryCounts.phone || 0) === 0 && (state.categoryCounts.think || 0) === 0,
      epitaph: '你全勤了！奖品是一张通往天堂的单程票。'
    },
    {
      id: 'perfect-mayfly',
      title: '完美蜉蝣',
      rarity: 'SR',
      emoji: '🌟',
      color: 'var(--neon-yellow)',
      condition: (state) => state.stats.spirit >= 80 && state.stats.health >= 80 && state.stats.social >= 80 && state.stats.anxiety >= 80,
      epitaph: '你是蜉蝣中的神。但神也只活一天。'
    },
    {
      id: 'office-legend',
      title: '办公室传奇',
      rarity: 'SR',
      emoji: '👑',
      color: 'var(--neon-yellow)',
      condition: (state) => state.turnCount >= 12,
      epitaph: '你是这个办公室活得最久的蜉蝣。'
    }
  ];

  const LIFE_PHASES = [
    {
      id: 'birth-shift',
      title: '破壳上岗',
      subtitle: '你刚学会呼吸，系统已经把工牌挂到了你脖子上。',
      eventChance: 0.28
    },
    {
      id: 'rule-adaptation',
      title: '适应规则',
      subtitle: '你开始学会装忙、点头，以及在群里回复“收到”。',
      eventChance: 0.36
    },
    {
      id: 'overheat-loop',
      title: '内卷发热',
      subtitle: '所有事情开始同时发生，连摸鱼都需要项目管理。',
      eventChance: 0.46
    },
    {
      id: 'existential-revolt',
      title: '精神松动',
      subtitle: '你开始怀疑规则本身，也开始怀疑自己为什么这么熟练。',
      eventChance: 0.54
    },
    {
      id: 'final-settlement',
      title: '临终清算',
      subtitle: '剩下的时间很薄，每个选择都会变成遗产或证据。',
      eventChance: 0.58
    }
  ];

  const PERSONALITY_ARCHETYPES = [
    { type: '撤回失败艺术家', tagline: '你相信撤回能抹平一切，茶水间不同意。', category: '签名弧线' },
    { type: '朋友圈在岗证明', tagline: '你点了一个赞，老板看见了一个小事。', category: '签名弧线' },
    { type: '版本地狱居民', tagline: '你写下最终版，最终版当场复活。', category: '签名弧线' },
    { type: '提示词外包虫', tagline: '你没有偷懒，你只是把灵魂改成了可调用接口。', category: 'AI外包' },
    { type: '反制度小虫', tagline: '你没有推翻世界，但你让它尴尬了一下。', category: '搅局' },
    { type: '卷王蜉蝣', tagline: '你把24小时活成了24个deadline。', category: '工作' },
    { type: '摸鱼仙人', tagline: '你没赢过世界，但也没怎么输。', category: '摸鱼' },
    { type: '社交烟花', tagline: '你照亮了所有人，也炸伤了自己。', category: '社交' },
    { type: '黄昏观察者', tagline: '你终于没有优化任何东西。', category: '哲学' },
    { type: '信息溺水者', tagline: '你知道很多事，但没有一件帮你活下去。', category: '手机' },
    { type: '蜉蝣哲学练习生', tagline: '你悟了一点，但世界照常开会。', category: '哲学' },
    { type: '焦虑永动机', tagline: '你的焦虑比你的寿命还持久', category: '焦虑' },
    { type: '赌徒蜉蝣', tagline: '你把生命当成了一场豪赌', category: '搅局' },
    { type: '完美无用者', tagline: '你什么都刚刚好，除了人生。', category: '默认' }
  ];

  const LIFE_ROUTES = [
    {
      id: 'work',
      title: '卷王路线',
      categories: ['work', 'meeting'],
      hook: '你正在把一生压缩成待办、纪要和默认负责人。',
      risk: '荒诞债、焦虑和默认负责人会越来越爱你。',
      perk: '更容易抽到工作和会议旧账。',
      pressureAt: 3,
      pressureEvent: {
        id: 'route-work-default-owner',
        emoji: '📌',
        text: '卷王路线回访：飞书机器人把你标记成“可自动@对象”。从此任何没人认领的事，都会先经过你的工牌。',
        preview: '卷王路线将在1次选择后生成默认负责人账单。',
        effect: { spirit: -7, health: -4, anxiety: 14 },
        timeCost: 0.5,
        disruption: -2,
        absurdDebt: 14,
        type: 'negative',
        causality: '你连续接活，组织终于把你识别为默认负责人。'
      },
      pressureEvents: [
        {
          at: 5,
          event: {
            id: 'route-work-okr-tax',
            emoji: '📋',
            text: '卷王路线升级：OKR系统发现你很好用，要求你把“为什么总能扛住”沉淀成方法论，供全员学习。',
            preview: '卷王路线将在第5次同路选择后升级成OKR方法论税。',
            effect: { spirit: -8, health: -4, anxiety: 16 },
            timeCost: 0.5,
            disruption: -4,
            absurdDebt: 18,
            type: 'negative',
            causality: '你把能扛变成了组织资产，组织决定复制你，顺便继续使用你。'
          }
        },
        {
          at: 7,
          event: {
            id: 'route-work-self-replacement',
            emoji: '📎',
            text: '卷王路线终局：你的方法论太完整，岗位开始不需要你本人。公司把你的工位改成“高效样板间”，供新人参观学习。',
            preview: '卷王路线将在第7次同路选择后进入专属终局：被自己优化掉。',
            effect: { spirit: -10, health: -8, anxiety: 18 },
            timeCost: 0.5,
            disruption: -6,
            absurdDebt: 22,
            type: 'negative',
            causality: '你把自己卷成了流程，流程终于发现可以没有你。'
          }
        }
      ]
    },
    {
      id: 'slack',
      title: '摸鱼路线',
      categories: ['slack', 'phone'],
      hook: '你开始用厕所、短视频和深色IDE争夺人生主权。',
      risk: '算法和拖延会把快乐包装成新的待办。',
      perk: '更容易抽到缓冲、摸鱼和信息内耗。',
      pressureAt: 3,
      pressureEvent: {
        id: 'route-slack-audit',
        emoji: '🚪',
        text: '摸鱼路线回访：厕所门口贴出了“工位离席热力图”。你的名字不在榜首，但颜色已经很热。',
        preview: '摸鱼路线将在1次选择后触发离席审计。',
        effect: { social: -4, anxiety: 9, spirit: -2 },
        timeCost: 0.25,
        disruption: 8,
        absurdDebt: 6,
        type: 'negative',
        causality: '你连续摸鱼，组织开始研究厕所门口的大数据。'
      },
      pressureEvents: [
        {
          at: 5,
          event: {
            id: 'route-slack-time-theft',
            emoji: '⏱',
            text: '摸鱼路线升级：你的离席时间被折算成“潜在产能损失”。连你发呆的30秒，都被画进了饼图。',
            preview: '摸鱼路线将在第5次同路选择后升级成潜在产能审计。',
            effect: { spirit: -4, social: -5, anxiety: 13 },
            timeCost: 0.25,
            disruption: 12,
            absurdDebt: 8,
            type: 'negative',
            causality: '你把摸鱼练成习惯，习惯被组织改名为潜在产能损失。'
          }
        },
        {
          at: 7,
          event: {
            id: 'route-slack-permanent-away',
            emoji: '🚪',
            text: '摸鱼路线终局：你离席太久，考勤系统把你识别成一种环境噪声。工位还在，椅子上只剩一件外套和一条“稍后回来”。',
            preview: '摸鱼路线将在第7次同路选择后进入专属终局：永久离席。',
            effect: { social: -10, anxiety: 8, spirit: 4 },
            timeCost: 0.25,
            disruption: 20,
            absurdDebt: -4,
            type: 'disrupt',
            causality: '你把离席练到极致，终于从人变成了一个状态。'
          }
        }
      ]
    },
    {
      id: 'social',
      title: '社交路线',
      categories: ['social'],
      hook: '你用点赞、奶茶和表面温暖维持组织生态。',
      risk: '人情债会比寿命更准时地回访。',
      perk: '更容易抽到社交、人情和朋友圈旧账。',
      pressureAt: 3,
      pressureEvent: {
        id: 'route-social-human-debt',
        emoji: '🧾',
        text: '社交路线回访：茶水间自动生成了你的人情账单。奶茶、点赞、都行，全部折算成“帮我看一眼”。',
        preview: '社交路线将在1次选择后结算人情账。',
        effect: { spirit: -4, social: -3, anxiety: 11 },
        timeCost: 0.25,
        disruption: 1,
        absurdDebt: 10,
        type: 'negative',
        causality: '你连续维持表面温暖，人情账单终于开始计息。'
      },
      pressureEvents: [
        {
          at: 5,
          event: {
            id: 'route-social-black-history',
            emoji: '🕳',
            text: '社交路线升级：你太活跃了，大家开始翻你的旧朋友圈。三年前那句“未来可期”正在会议室投影上复活。',
            preview: '社交路线将在第5次同路选择后升级成黑历史复活。',
            effect: { spirit: -6, social: -12, anxiety: 15 },
            timeCost: 0.25,
            disruption: 10,
            absurdDebt: 6,
            type: 'negative',
            causality: '你把存在感刷太高，过去的你终于被算法推给了现在的同事。'
          }
        },
        {
          at: 7,
          event: {
            id: 'route-social-public-material',
            emoji: '🔥',
            text: '社交路线终局：你太会做人，所有人都觉得可以拿你开玩笑。你的黑历史被做成团建破冰素材，标题叫《真实的我们》。',
            preview: '社交路线将在第7次同路选择后进入专属终局：社交火葬场。',
            effect: { spirit: -8, social: -18, anxiety: 18 },
            timeCost: 0.25,
            disruption: 12,
            absurdDebt: 8,
            type: 'negative',
            causality: '你把关系维护到满格，关系终于开始公开使用你。'
          }
        }
      ]
    },
    {
      id: 'ai',
      title: 'AI外包路线',
      categories: ['ai'],
      hook: '你开始把周报、调研、会议和情绪都交给助手，自己负责看起来仍在场。',
      risk: '提示词债、引用幻觉和代理背锅会越来越像你的同事。',
      perk: '更容易抽到AI外包、机器人和提示词旧账。',
      pressureAt: 3,
      pressureEvent: {
        id: 'route-ai-prompt-debt',
        emoji: '🤖',
        text: 'AI外包路线回访：万问工位开始追问“你到底想让我做什么”。你发现最难自动化的是把需求说清楚。',
        preview: 'AI外包路线将在1次选择后回访提示词债。',
        effect: { spirit: -4, anxiety: 12 },
        timeCost: 0.25,
        disruption: 8,
        absurdDebt: 12,
        type: 'negative',
        causality: '你连续把判断外包给助手，提示词终于要求你对自己负责。'
      },
      pressureEvents: [
        {
          at: 5,
          event: {
            id: 'route-ai-hallucination-stack',
            emoji: '🐋',
            text: 'AI外包路线升级：深潜鲸、月影长文兽和圆宝搜答给出三份互相礼貌否定的答案。会议室决定采用“看起来最像真的”那份。',
            preview: 'AI外包路线将在第5次同路选择后升级成幻觉堆叠。',
            effect: { spirit: -6, social: -3, anxiety: 15 },
            timeCost: 0.25,
            disruption: 10,
            absurdDebt: 16,
            type: 'negative',
            causality: '你把答案交给模型，模型把确定性还给语气。'
          }
        },
        {
          at: 7,
          event: {
            id: 'route-ai-agent-replacement',
            emoji: '🤖',
            text: 'AI外包路线终局：会议机器人、万问工位和豆袋仔完成闭环。它们开始互相@，你只剩一个“已读”状态。',
            preview: 'AI外包路线将在第7次同路选择后进入专属终局：被代理成工具人。',
            effect: { spirit: -8, social: -10, anxiety: 18 },
            timeCost: 0.25,
            disruption: 18,
            absurdDebt: 22,
            type: 'negative',
            causality: '你把工作拆给了代理，代理终于学会把你也拆掉。'
          }
        }
      ]
    },
    {
      id: 'disrupt',
      title: '搅局路线',
      categories: ['disrupt'],
      hook: '你不一定活得久，但会议室会记得那三秒沉默。',
      risk: '社交死亡和组织震荡会一起结算。',
      perk: '更容易抽到真话、误发和系统卡顿。',
      pressureAt: 3,
      pressureEvent: {
        id: 'route-disrupt-immunity',
        emoji: '⚠️',
        text: '搅局路线回访：组织产生免疫反应。会议纪要把你的真话翻译成“后续保持关注”。',
        preview: '搅局路线将在1次选择后触发组织免疫。',
        effect: { social: -10, anxiety: 8, spirit: -3 },
        timeCost: 0.25,
        disruption: 16,
        absurdDebt: -4,
        type: 'disrupt',
        causality: '你连续搅局，组织学会了把真话格式化。'
      },
      pressureEvents: [
        {
          at: 5,
          event: {
            id: 'route-disrupt-clarification-loop',
            emoji: '🔁',
            text: '搅局路线升级：为了回应你的真话，会议新增了“共识澄清环节”。每个人都发言了，没人回答问题。',
            preview: '搅局路线将在第5次同路选择后升级成共识澄清循环。',
            effect: { spirit: -5, social: -8, anxiety: 10 },
            timeCost: 0.5,
            disruption: 24,
            absurdDebt: -2,
            type: 'disrupt',
            causality: '你让问题无法被忽略，组织选择用更多话术把它包起来。'
          }
        },
        {
          at: 7,
          event: {
            id: 'route-disrupt-question-department',
            emoji: '🌀',
            text: '搅局路线终局：你的问题太稳定，组织成立了“问题澄清专项小组”。小组第一项任务，是确认你是不是问题的一部分。',
            preview: '搅局路线将在第7次同路选择后进入专属终局：澄清到死。',
            effect: { spirit: -6, social: -12, anxiety: 12 },
            timeCost: 0.5,
            disruption: 36,
            absurdDebt: -6,
            type: 'disrupt',
            causality: '你让问题活了下来，组织决定先处理提出问题的人。'
          }
        }
      ]
    }
  ];

  const ROUTE_RECOMMENDATIONS = {
    work: {
      seedCards: ['final-ppt', 'meeting-silence', 'voluntary-overtime'],
      text: '继续卷王路线，主动碰“最终版PPT”和会议旧账，把默认负责人这条荒诞链走到底。'
    },
    slack: {
      seedCards: ['toilet-slack', 'fake-ide', 'doom-scroll'],
      text: '下一世先走摸鱼路线，用厕所摸鱼和假装写代码给焦虑降噪，别让系统一开局就把你点燃。'
    },
    social: {
      seedCards: ['milk-tea-social', 'like-boss-post'],
      text: '继续社交路线，盯住奶茶、点赞和人情账，看看表面温暖会怎样变成“帮我看一眼”。'
    },
    ai: {
      seedCards: ['ai-weekly-report', 'ai-deep-research', 'ai-meeting-bot'],
      text: '继续AI外包路线，用周报、调研和会议机器人试探“我还需不需要本人在场”。'
    },
    disrupt: {
      seedCards: ['speak-truth', 'wrong-emoji'],
      text: '继续搅局路线，用真话和误发表情包制造组织震荡，让会议纪要替世界露馅。'
    }
  };

  const ROUTE_TASK_CHAINS = {
    work: {
      title: '默认负责人流水线',
      steps: [
        { id: 'raise-hand', label: '先把“我来吧”说出口', cardIds: ['voluntary-overtime'], clue: '从自愿加班开始，系统才知道谁好用。' },
        { id: 'name-final', label: '把文件命名成最终版', cardIds: ['final-ppt'], clue: '让版本地狱有一个响亮的门牌号。' },
        { id: 'solidify-nonsense', label: '把废话固化成纪要', cardIds: ['write-minutes', 'meeting-silence'], clue: '会议不怕没结果，就怕没人写下来。' },
        { id: 'borrow-tomorrow', label: '向不存在的明天借会议', cardIds: ['reschedule-meeting'], clue: '蜉蝣没有明天，但日历总觉得还有。' }
      ]
    },
    slack: {
      title: '摸鱼防线工程',
      steps: [
        { id: 'look-busy', label: '先做出很忙的样子', cardIds: ['fake-ide'], clue: '深色窗口是现代人的草丛。' },
        { id: 'leave-seat', label: '把身体从工位挪走', cardIds: ['toilet-slack', 'solo-slack'], clue: '真正的摸鱼先从物理离席开始。' },
        { id: 'feed-algorithm', label: '用效率视频喂饱拖延', cardIds: ['doom-scroll'], clue: '收藏自律，比自律本人轻松多了。' },
        { id: 'mute-world', label: '让世界暂时找不到你', cardIds: ['notification-dnd'], clue: '勿扰不是胜利，是给灵魂争取缓冲。' }
      ]
    },
    social: {
      title: '表面温暖过热链',
      steps: [
        { id: 'buy-warmth', label: '用奶茶续费关系', cardIds: ['milk-tea-social'], clue: '先让办公室短暂恢复人性。' },
        { id: 'like-proof', label: '完成朋友圈在岗证明', cardIds: ['like-boss-post'], clue: '一个赞，可以长出六个附件。' },
        { id: 'clear-favor', label: '给人情账做一次对账', cardIds: ['return-favor'], clue: '关系可以温暖，但最好别无限续费。' },
        { id: 'dig-history', label: '把旧朋友圈挖出来公开处刑', cardIds: ['old-post'], clue: '过去的你，总会在最亮的投影仪上复活。' }
      ]
    },
    ai: {
      title: '本人外包闭环',
      steps: [
        { id: 'comfort-self', label: '先把崩溃交给助手安慰', cardIds: ['ai-comfort-bot'], clue: '连情绪都开始有产品留存。' },
        { id: 'template-fatigue', label: '让周报替疲惫穿工牌', cardIds: ['ai-weekly-report'], clue: '积极、专业、像没被生活打过。' },
        { id: 'outsource-judgement', label: '把判断外包给深度调研', cardIds: ['ai-deep-research'], clue: '引用越像真的，你越需要证明它存在。' },
        { id: 'send-proxy', label: '派会议机器人替你在场', cardIds: ['ai-meeting-bot'], clue: '当替身比本人更会点头，本人就危险了。' }
      ]
    },
    disrupt: {
      title: '组织卡顿实验',
      steps: [
        { id: 'price-life', label: '先算一下自己的时薪', cardIds: ['calculate-wage'], clue: '数学偶尔比老板更不留情。' },
        { id: 'say-truth', label: '当众问出没人敢问的问题', cardIds: ['speak-truth'], clue: '会议室安静三秒，就是现实加载失败。' },
        { id: 'misfire-meme', label: '让表情包替潜意识发言', cardIds: ['wrong-emoji'], clue: '撤回提示有时比原消息还响。' },
        { id: 'draw-boundary', label: '给默认负责人画边界', cardIds: ['boundary-statement'], clue: '不体面，但能把命从附件里抠出来。' }
      ]
    }
  };

  const ROUTE_COLLECTION_TARGETS = {
    work: { kind: 'personality', target: '版本地狱居民' },
    slack: { kind: 'personality', target: '信息溺水者' },
    social: { kind: 'personality', target: '朋友圈在岗证明' },
    ai: { kind: 'personality', target: '提示词外包虫' },
    disrupt: { kind: 'personality', target: '反制度小虫' }
  };

  const RUN_INTENTS = [
    {
      id: 'work',
      routeId: 'work',
      title: '卷到系统承认',
      emoji: '📊',
      hook: '今天的目标是把自己活成默认负责人，看看流程会不会先累。',
      risk: '更容易拿到PPT、会议和加班，但旧账也更像工牌一样挂在你身上。',
      seedCards: ['final-ppt', 'meeting-silence', 'voluntary-overtime']
    },
    {
      id: 'slack',
      routeId: 'slack',
      title: '摸鱼活过八手',
      emoji: '🐟',
      hook: '今天的目标是偷回一点人生，把厕所、短视频和假IDE变成缓冲带。',
      risk: '更容易拿到缓冲选择，但算法和离席审计会盯上你。',
      seedCards: ['toilet-slack', 'fake-ide', 'doom-scroll']
    },
    {
      id: 'social',
      routeId: 'social',
      title: '做人做到社死',
      emoji: '🧋',
      hook: '今天的目标是用奶茶、点赞和人情把办公室暖到过热。',
      risk: '更容易拿到社交选择，但所有温暖都可能变成帮我看一眼。',
      seedCards: ['milk-tea-social', 'like-boss-post']
    },
    {
      id: 'ai',
      routeId: 'ai',
      title: '把人生交给助手',
      emoji: '🤖',
      hook: '今天的目标是把周报、调研、会议和情绪外包，看看本人还剩什么。',
      risk: '更容易拿到AI外包选择，但提示词债、幻觉引用和代理旧账会排队回访。',
      seedCards: ['ai-comfort-bot', 'ai-weekly-report', 'ai-deep-research', 'ai-meeting-bot']
    },
    {
      id: 'disrupt',
      routeId: 'disrupt',
      title: '当众把话说穿',
      emoji: '⚡',
      hook: '今天的目标不是赢，而是让会议室至少卡顿一次。',
      risk: '更容易拿到真话和误发表情包，组织也会更快把你格式化。',
      seedCards: ['speak-truth', 'wrong-emoji']
    }
  ];

  const ROUTE_EVENT_AFFINITY = {
    work: ['boss-email', 'kpi-update', 'calendar-ambush', 'anonymous-praise'],
    slack: ['free-tea', 'deadline-delay', 'snack-rebellion', 'sunset-leak'],
    social: ['free-tea', 'snack-rebellion', 'anonymous-praise', 'calendar-ambush'],
    ai: ['ai-model-update', 'ai-robot-colleague', 'boss-email', 'anonymous-praise'],
    disrupt: ['silent-room', 'sunset-leak', 'deadline-delay']
  };

  const CARD_COLLECTION_TARGETS = {
    'final-ppt': [{ kind: 'personality', target: '版本地狱居民' }],
    'like-boss-post': [{ kind: 'personality', target: '朋友圈在岗证明' }],
    'wrong-emoji': [{ kind: 'personality', target: '撤回失败艺术家' }],
    'window-sunset': [
      { kind: 'postcard', target: 'true-sunset', title: '真正的日落' },
      { kind: 'personality', target: '黄昏观察者' }
    ],
    'speak-truth': [{ kind: 'personality', target: '反制度小虫' }],
    'doom-scroll': [{ kind: 'personality', target: '信息溺水者' }],
    'ai-weekly-report': [{ kind: 'personality', target: '提示词外包虫' }],
    'ai-deep-research': [{ kind: 'personality', target: '提示词外包虫' }],
    'ai-meeting-bot': [{ kind: 'personality', target: '提示词外包虫' }],
    'ai-comfort-bot': [{ kind: 'personality', target: '提示词外包虫' }]
  };

  const FIRST_RUN_SAFE_CARD_IDS = ['toilet-slack', 'fake-ide', 'milk-tea-social', 'notification-dnd', 'reschedule-meeting'];
  const PRESSURE_RELIEF_CARD_IDS = ['notification-dnd', 'reschedule-meeting', 'toilet-slack', 'fake-ide', 'milk-tea-social'];
  const ROUTE_ESCAPE_CARD_IDS = ['speak-truth', 'milk-tea-social', 'ai-weekly-report', 'calculate-wage', 'write-minutes', 'boundary-statement', 'window-sunset'];
  const NPC_RELATIONSHIP_RELIEF_RULES = [
    { npcId: 'boss', hotAt: 65, cardId: 'boundary-statement', priority: 3 },
    { npcId: 'slacker', hotAt: 65, cardId: 'solo-slack', priority: 2 },
    { npcId: 'coworker', hotAt: 62, cardId: 'return-favor', priority: 1 }
  ];
  const OPENING_SAFE_TURNS = 3;
  const OPENING_EVENT_GRACE_TURNS = 2;
  const FIRST_RUN_SAFE_TURNS = 6;
  const FIRST_RUN_EVENT_GRACE_TURNS = 3;
  const FIRST_RUN_DEATH_GRACE_TURNS = 6;
  const STAT_DEATH_IDS = new Set(['arranged-life', 'anxiety-boom', 'spirit-crash', 'unlisted', 'body-strike']);

  const COLLECTION_TARGET_ROUTES = {
    'personality:版本地狱居民': {
      title: '版本地狱居民',
      hook: '先把文件命名成最终版，再等它证明“最终”只是一个笑话。',
      steps: [
        { id: 'final-ppt', label: '命名最终版PPT', clue: '先遇到「最终版PPT」。' },
        { id: 'ppt-final-resurrection', label: '等最终版复活', clue: '让最终版PPT的因果回访你。' }
      ]
    },
    'personality:朋友圈在岗证明': {
      title: '朋友圈在岗证明',
      hook: '用一个赞证明自己在线，再用六个附件证明不该在线。',
      steps: [
        { id: 'like-boss-post', label: '点赞老板朋友圈', clue: '先遇到「点赞老板朋友圈」。' },
        { id: 'boss-small-thing', label: '接收老板的小事', clue: '让老板的“小事”在因果里展开。' }
      ]
    },
    'personality:撤回失败艺术家': {
      title: '撤回失败艺术家',
      hook: '先把表情发错群，再看撤回如何成为行为艺术。',
      steps: [
        { id: 'wrong-emoji', label: '发错表情包', clue: '先遇到「表情包发错群」。' },
        { id: 'meme-aftershock', label: '承受撤回后劲', clue: '让表情包的后劲完成二次社死。' }
      ]
    },
    'personality:提示词外包虫': {
      title: '提示词外包虫',
      hook: '先让助手替你写周报，再让机器人替你听会，最后确认谁还需要亲自活着。',
      steps: [
        { id: 'ai-weekly-report', label: '让豆袋仔代写周报', clue: '先遇到「AI代写周报」。' },
        { id: 'ai-minutes-betrayal', label: '承受会议机器人背刺', clue: '让会议机器人的纪要回访你。' }
      ]
    }
  };

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function seededRandom(seed) {
    const next = Math.sin(seed * 9999) * 10000;
    return next - Math.floor(next);
  }

  function cloneState(state) {
    return {
      ...state,
      stats: { ...state.stats },
      npc: { ...state.npc },
      categoryCounts: { ...state.categoryCounts },
      flags: { ...state.flags },
      history: state.history.map((item) => ({
        ...item,
        effect: { ...((item && item.effect) || {}) },
        routeModifier: item.routeModifier ? {
          ...item.routeModifier,
          effect: { ...((item.routeModifier && item.routeModifier.effect) || {}) }
        } : null,
        statsBefore: item.statsBefore ? { ...item.statsBefore } : null,
        statsAfter: item.statsAfter ? { ...item.statsAfter } : null
      })),
      usedEvents: [...state.usedEvents],
      claimedGoals: [...(state.claimedGoals || [])],
      pendingConsequences: (state.pendingConsequences || []).map((item) => ({
        ...item,
        effect: { ...((item && item.effect) || {}) }
      })),
      collectionTarget: state.collectionTarget ? { ...state.collectionTarget } : null,
      runIntent: state.runIntent ? { ...state.runIntent, seedCards: [...(state.runIntent.seedCards || [])] } : null,
      firstRun: Boolean(state.firstRun),
      activeLegacyCards: (state.activeLegacyCards || []).map((item) => ({
        ...item,
        effect: cloneLegacyEffect(item.effect),
        memoryEvent: cloneLegacyMemoryEvent(item.memoryEvent)
      })),
      cardPoolMutations: state.cardPoolMutations ? state.cardPoolMutations.map((m) => ({
        ...m,
        card: m.card ? { ...m.card } : null
      })) : []
    };
  }

  function createRunState(characterId) {
    const character = CHARACTERS[characterId] || CHARACTERS.mayfly;
    return {
      characterId: character.id,
      character,
      stats: { ...character.baseStats },
      timeLeft: character.timeLimit,
      turnCount: 0,
      disruption: 0,
      absurdDebt: 0,
      npc: { boss: 30, slacker: 50, coworker: 40 },
      categoryCounts: {},
      combo: { category: null, count: 0 },
      flags: {},
      history: [],
      usedEvents: [],
      claimedGoals: [],
      pendingConsequences: [],
      collectionTarget: null,
      runIntent: null,
      firstRun: false,
      activeLegacyCards: [],
      cardPoolMutations: []
    };
  }

  function cloneLegacyEffect(effect) {
    return {
      ...(effect || {}),
      stats: { ...((effect && effect.stats) || {}) },
      cardPoolMutations: effect && effect.cardPoolMutations ? effect.cardPoolMutations.map((m) => ({
        ...m,
        card: m.card ? { ...m.card } : null
      })) : []
    };
  }

  function cloneLegacyMemoryEvent(event) {
    if (!event) return null;
    return {
      ...event,
      effect: { ...((event && event.effect) || {}) }
    };
  }

  function getRunIntent(intentId) {
    const id = typeof intentId === 'string' ? intentId : intentId && intentId.id;
    const intent = RUN_INTENTS.find((item) => item.id === id) || null;
    return intent ? { ...intent, seedCards: [...intent.seedCards] } : null;
  }

  function applyRunIntent(state, intentId) {
    const next = cloneState(state);
    next.runIntent = getRunIntent(intentId);
    return next;
  }

  function getCardPool(state) {
    let basePool = [...ACTION_CARDS];
    if (state && state.cardPoolMutations) {
      state.cardPoolMutations.forEach((mutation) => {
        if (mutation.action === 'add' && mutation.card) {
          if (!basePool.some((c) => c.id === mutation.card.id)) {
            basePool.push(mutation.card);
          }
        }
      });
    }
    const pressureCards = basePool.filter((card) => {
      if (state.timeLeft <= 4) return card.cost.time <= 2 || card.category === 'disrupt';
      if (state.absurdDebt > 70) return card.category !== 'work' || card.id === 'speak-truth';
      return true;
    });
    if (state.stats && state.stats.social <= 18) {
      const socialSafeCards = pressureCards.filter((card) => (card.effect.social || 0) >= 0);
      if (socialSafeCards.length >= 2) return socialSafeCards;
    }
    return pressureCards.length >= 2 ? pressureCards : basePool;
  }

  function cardMatchesCollectionTarget(card, target) {
    if (!card || !target) return false;
    return (CARD_COLLECTION_TARGETS[card.id] || []).some((item) => (
      item.kind === target.kind && item.target === target.target
    ));
  }

  function isFirstRunOpening(state) {
    if (!state) return false;
    if (state.collectionTarget && !state.firstRun) return false;
    const limit = state.firstRun ? FIRST_RUN_SAFE_TURNS : OPENING_SAFE_TURNS;
    return (state.turnCount || 0) < limit;
  }

  function isSafeFirstRunCard(card) {
    return FIRST_RUN_SAFE_CARD_IDS.includes(card && card.id);
  }

  function needsPressureRelief(state) {
    if (!state) return false;
    return state.stats.anxiety >= 75
      || state.stats.spirit <= 25
      || state.stats.social <= 18
      || state.stats.health <= 18
      || state.absurdDebt >= 75;
  }

  function getPressureReliefCardIds(state) {
    if (!state) return PRESSURE_RELIEF_CARD_IDS;
    if (state.stats.social <= 18) return ['milk-tea-social', 'fake-ide'];
    if (state.stats.health <= 18) return ['toilet-slack', 'fake-ide', 'notification-dnd', 'reschedule-meeting'];
    if (state.stats.spirit <= 25) return ['toilet-slack', 'fake-ide', 'milk-tea-social', 'notification-dnd'];
    if (state.absurdDebt >= 75) return ['speak-truth', 'notification-dnd', 'toilet-slack', 'fake-ide'];
    return PRESSURE_RELIEF_CARD_IDS;
  }

  function isPressureReliefCard(state, card) {
    return getPressureReliefCardIds(state).includes(card && card.id);
  }

  function getNpcRelationshipReliefCardIds(state) {
    const npc = (state && state.npc) || {};
    return NPC_RELATIONSHIP_RELIEF_RULES
      .filter((rule) => (npc[rule.npcId] || 0) >= rule.hotAt)
      .map((rule) => ({
        ...rule,
        value: npc[rule.npcId] || 0,
        overheatedBy: (npc[rule.npcId] || 0) - rule.hotAt
      }))
      .sort((left, right) => right.overheatedBy - left.overheatedBy || right.priority - left.priority)
      .map((rule) => rule.cardId);
  }

  function hasPlayedCard(state, cardId) {
    return ((state && state.history) || []).some((item) => item.id === cardId);
  }

  function isCompletedTargetCard(state, card) {
    return cardMatchesCollectionTarget(card, state && state.collectionTarget) && hasPlayedCard(state, card.id);
  }

  function cardMatchesRunIntent(card, state) {
    const intent = getRunIntent(state && state.runIntent);
    if (!intent || !card) return false;
    const route = LIFE_ROUTES.find((item) => item.id === intent.routeId);
    return (intent.seedCards || []).includes(card.id)
      || Boolean(route && route.categories.includes(card.category));
  }

  function buildRouteStatus(state) {
    const counts = (state && state.categoryCounts) || {};
    const ranked = LIFE_ROUTES
      .map((route) => ({
        ...route,
        count: route.categories.reduce((sum, category) => sum + (counts[category] || 0), 0)
      }))
      .sort((left, right) => right.count - left.count);
    const top = ranked[0] || LIFE_ROUTES[0];
    const threshold = 2;
    if (!top || top.count < threshold) {
      return {
        id: 'undecided',
        title: '路线未定',
        active: false,
        progress: Math.min(1, ((top && top.count) || 0) / threshold),
        count: (top && top.count) || 0,
        threshold,
        categories: [],
        hook: '你还没有形成稳定活法。世界正在观察你准备怎么荒诞。',
        risk: '再重复一次相近选择，人生就会开始偏科。',
        perk: '暂时保持随机。'
      };
    }
    return {
      ...top,
      active: true,
      progress: 1,
      threshold
    };
  }

  function getLastActionHistoryItem(state) {
    return [...(((state && state.history) || []))]
      .reverse()
      .find((item) => item.category && item.category !== 'event') || null;
  }

  function getRecentActionIds(state, limit = 3) {
    return [...(((state && state.history) || []))]
      .reverse()
      .filter((item) => item.category && item.category !== 'event')
      .slice(0, limit)
      .map((item) => item.id);
  }

  function getPlayedActionIds(state) {
    return new Set(
      (((state && state.history) || []))
        .filter((item) => item.category && item.category !== 'event')
        .map((item) => item.id)
    );
  }

  function getRouteTaskChain(routeId) {
    return ROUTE_TASK_CHAINS[routeId] || null;
  }

  function buildRouteTaskChainStatus(state, routeLike) {
    const routeId = routeLike && (routeLike.routeId || routeLike.id);
    const chain = getRouteTaskChain(routeId);
    if (!chain) return null;
    const playedIds = getPlayedActionIds(state);
    const steps = chain.steps.map((step) => ({
      ...step,
      complete: step.cardIds.some((id) => playedIds.has(id))
    }));
    const currentIndex = steps.findIndex((step) => !step.complete);
    const complete = currentIndex < 0;
    const current = complete ? null : steps[currentIndex];
    const progress = complete ? steps.length : currentIndex;
    return {
      routeId,
      title: chain.title,
      progress,
      total: steps.length,
      complete,
      current,
      nextCardIds: current ? current.cardIds : [],
      text: complete
        ? `任务链：${chain.title}（${steps.length}/${steps.length}）已闭环，接下来只剩旧账和终局来验收你。`
        : `任务链：${chain.title}（${progress}/${steps.length}）。下一步：${current.label}。${current.clue}`
    };
  }

  function getRouteTerminalConfig(route) {
    const pressureEvents = (route && route.pressureEvents) || [];
    return pressureEvents[pressureEvents.length - 1] || null;
  }

  function getRouteActionStreak(state, route) {
    if (!state || !route || !route.categories) return 0;
    let count = 0;
    const actions = [...((state.history || []))]
      .reverse()
      .filter((item) => item.category && item.category !== 'event');
    for (const item of actions) {
      if (!route.categories.includes(item.category)) break;
      count += 1;
    }
    return count;
  }

  function getRoutePressureMomentum(state, route) {
    const actionCount = ((state && state.history) || [])
      .filter((item) => item.category && item.category !== 'event')
      .length;
    if (!actionCount) return (route && route.count) || 0;
    return getRouteActionStreak(state, route);
  }

  function shouldHoldForRouteClimax(state) {
    if (!state || state.absurdDebt < 100) return false;
    const route = buildRouteStatus(state);
    if (!route.active) return false;
    const terminalConfig = getRouteTerminalConfig(route);
    const terminalId = terminalConfig && terminalConfig.event && terminalConfig.event.id;
    if (!terminalConfig || !terminalId || hasHistoryEvent(state, terminalId)) return false;
    if ((state.pendingConsequences || []).some((item) => item.id === terminalId)) return true;

    const lastAction = getLastActionHistoryItem(state);
    const lastActionContinuesRoute = Boolean(lastAction && route.categories.includes(lastAction.category));
    const approachCount = Math.max(route.threshold + 2, (terminalConfig.at || route.threshold + 5) - 2);
    return lastActionContinuesRoute && route.count >= approachCount;
  }

  function getRouteEscapePressure(state, routeLike) {
    const route = routeLike && routeLike.active ? routeLike : buildRouteStatus(state);
    if (!state || !route.active) return null;
    const terminalConfig = getRouteTerminalConfig(route);
    if (!terminalConfig || !terminalConfig.event) return null;
    const approachCount = Math.max(route.threshold + 3, (terminalConfig.at || route.threshold + 5) - 1);
    if (getRoutePressureMomentum(state, route) < approachCount) return null;
    return {
      routeId: route.id,
      title: `${route.title}过热`,
      terminalId: terminalConfig.event.id,
      reason: '这条活法快进专属终局了，手牌必须给一次换路线机会。'
    };
  }

  function drawCardOptions(state, seed, count) {
    const desired = Math.max(2, count || 3);
    const phase = getLifePhase(state);
    const route = buildRouteStatus(state);
    const runIntent = getRunIntent(state && state.runIntent);
    const npcReliefIds = getNpcRelationshipReliefCardIds(state);
    const recentActionIds = getRecentActionIds(state, 3);
    const chainRouteId = route.active ? route.id : runIntent && runIntent.routeId;
    const chainStatus = buildRouteTaskChainStatus(state, { id: chainRouteId });
    const chainNextIds = (chainStatus && chainStatus.nextCardIds) || [];
    const pool = getCardPool(state)
      .filter((card) => !card.requiresPhase || card.requiresPhase === phase.id)
      .filter((card) => !isCompletedTargetCard(state, card))
      .filter((card) => {
        if (state && state.cardPoolMutations) {
          const isRemoved = state.cardPoolMutations.some(
            (m) => m.action === 'remove' && m.cardId === card.id
          );
          if (isRemoved) return false;
        }
        return true;
      });
    const ranked = pool
      .map((card, index) => {
        const routeAffinity = route.active && route.categories.includes(card.category) ? -0.42 : 0;
        const intentAffinity = !route.active && cardMatchesRunIntent(card, state) ? -0.34 : 0;
        const reliefBias = needsPressureRelief(state) && isPressureReliefCard(state, card) ? -0.12 : 0;
        const npcReliefBias = npcReliefIds.includes(card.id) ? -0.16 : 0;
        const recentRepeatPenalty = recentActionIds.includes(card.id) ? 0.6 : 0;
        const playedBeforePenalty = hasPlayedCard(state, card.id) ? 0.08 : 0;
        const chainBias = chainNextIds.includes(card.id) ? -0.5 : 0;
        
        let score = seededRandom(seed + state.turnCount * 19 + index * 37)
          + routeAffinity
          + intentAffinity
          + reliefBias
          + npcReliefBias
          + chainBias
          + recentRepeatPenalty
          + playedBeforePenalty;

        if (state && state.cardPoolMutations) {
          const weightMutation = state.cardPoolMutations.find(
            (m) => m.action === 'weight' && m.cardId === card.id
          );
          if (weightMutation) {
            if (weightMutation.multiplier < 1) {
              score += (1 - weightMutation.multiplier) * 1.5;
            } else {
              score -= (weightMutation.multiplier - 1) * 1.5;
            }
          }
        }

        return {
          card,
          score
        };
      })
      .sort((left, right) => left.score - right.score);

    const selected = [];
    const usedCategories = new Set();
    if (isFirstRunOpening(state)) {
      const safe = ranked.find((item) => isSafeFirstRunCard(item.card));
      if (safe) {
        selected.push(safe.card);
        usedCategories.add(safe.card.category);
      }
    }
    if (needsPressureRelief(state)) {
      const relief = ranked.find((item) => (
        isPressureReliefCard(state, item.card)
        && !selected.some((card) => card.id === item.card.id)
      ));
      if (relief) {
        selected.push(relief.card);
        usedCategories.add(relief.card.category);
      }
    }
    if (npcReliefIds.length) {
      const topReliefId = npcReliefIds.find((cardId) => !selected.some((card) => card.id === cardId));
      const npcRelief = ranked.find((item) => item.card.id === topReliefId);
      if (npcRelief) {
        selected.push(npcRelief.card);
        usedCategories.add(npcRelief.card.category);
      }
    }
    if (chainNextIds.length && !selected.some((card) => chainNextIds.includes(card.id))) {
      const chainChoice = ranked.find((item) => (
        chainNextIds.includes(item.card.id)
        && !selected.some((card) => card.id === item.card.id)
      ));
      if (chainChoice) {
        selected.push(chainChoice.card);
        usedCategories.add(chainChoice.card.category);
      }
    }
    const routeEscape = getRouteEscapePressure(state, route);
    if (routeEscape && !selected.some((card) => !route.categories.includes(card.category))) {
      const escapeChoice = ranked.find((item) => (
        !route.categories.includes(item.card.category)
        && ROUTE_ESCAPE_CARD_IDS.includes(item.card.id)
        && !selected.some((card) => card.id === item.card.id)
      )) || ranked.find((item) => (
        !route.categories.includes(item.card.category)
        && !selected.some((card) => card.id === item.card.id)
      ));
      if (escapeChoice) {
        if (selected.length >= desired) {
          const replaceIndex = Math.max(0, selected.findLastIndex((card) => route.categories.includes(card.category)));
          selected.splice(replaceIndex, 1, escapeChoice.card);
        } else {
          selected.push(escapeChoice.card);
        }
        usedCategories.add(escapeChoice.card.category);
      }
    }
    ranked.forEach((item) => {
      if (selected.length >= desired) return;
      if (cardMatchesCollectionTarget(item.card, state.collectionTarget)) {
        selected.push(item.card);
        usedCategories.add(item.card.category);
      }
    });
    if (runIntent && !route.active && !selected.some((card) => cardMatchesRunIntent(card, state))) {
      const intentChoice = ranked.find((item) => (
        cardMatchesRunIntent(item.card, state)
        && !selected.some((card) => card.id === item.card.id)
      ));
      if (intentChoice) {
        selected.push(intentChoice.card);
        usedCategories.add(intentChoice.card.category);
      }
    }
    if (route.active && !state.firstRun) {
      ranked
        .filter((item) => route.categories.includes(item.card.category))
        .forEach((item) => {
          if (selected.length >= desired) return;
          const routeCategoryAlreadyPicked = selected.filter((card) => route.categories.includes(card.category)).length;
          const routeQuota = desired >= 3 ? 2 : 1;
          if (routeCategoryAlreadyPicked >= routeQuota) return;
          if (selected.some((card) => card.id === item.card.id)) return;
          selected.push(item.card);
          usedCategories.add(item.card.category);
        });
    }
    ranked.forEach((item) => {
      if (selected.length >= desired) return;
      if (!usedCategories.has(item.card.category) && !selected.some((card) => card.id === item.card.id)) {
        selected.push(item.card);
        usedCategories.add(item.card.category);
      }
    });
    ranked.forEach((item) => {
      if (selected.length >= desired) return;
      if (!selected.some((card) => card.id === item.card.id)) {
        selected.push(item.card);
      }
    });
    return selected.slice(0, desired);
  }

  function drawCardPair(state, seed) {
    return drawCardOptions(state, seed, 2);
  }

  function getChoiceCountForRun(state, viewportWidth) {
    if ((viewportWidth || 0) <= 600) return 2;
    if ((state.turnCount || 0) < 3) return 2;
    return 3;
  }

  function getLifePhase(state) {
    const limit = state.character && state.character.timeLimit ? state.character.timeLimit : 24;
    const elapsed = Math.max(0, limit - state.timeLeft);
    if (elapsed < limit * 0.2) return LIFE_PHASES[0];
    if (elapsed < limit * 0.4) return LIFE_PHASES[1];
    if (elapsed < limit * 0.65) return LIFE_PHASES[2];
    if (elapsed < limit * 0.85) return LIFE_PHASES[3];
    return LIFE_PHASES[4];
  }

  function uniquePlayedCategories(state) {
    return new Set(
      state.history
        .filter((item) => item.category && item.category !== 'event')
        .map((item) => item.category)
    );
  }

  function buildRunGoals(state) {
    const uniqueCategories = uniquePlayedCategories(state);
    return [
      {
        id: 'survive-eight',
        label: '撑过8次荒诞选择',
        progress: Math.min(state.turnCount, 8),
        target: 8,
        complete: state.turnCount >= 8,
        reward: '+1.5h 摸鱼缓冲'
      },
      {
        id: 'try-four-lanes',
        label: '体验4种人生支线',
        progress: Math.min(uniqueCategories.size, 4),
        target: 4,
        complete: uniqueCategories.size >= 4,
        reward: '搅局+30 焦虑-6'
      },
      {
        id: 'disruption-sixty',
        label: '让世界卡顿到60',
        progress: Math.min(state.disruption, 60),
        target: 60,
        complete: state.disruption >= 60,
        reward: '荒诞债-12 精神+6 社交+8'
      }
    ];
  }

  function buildRunPacingSummary(state) {
    const turnCount = Math.max(0, (state && state.turnCount) || 0);
    const route = buildRouteStatus(state);
    const pendingDebt = ((state && state.pendingConsequences) || [])
      .find((item) => (item.dueTurn || 0) <= turnCount + 1)
      || ((state && state.pendingConsequences) || [])[0]
      || null;
    const goal = buildRunGoals(state).find((item) => item.id === 'survive-eight');
    const settlementComplete = Boolean(goal && goal.complete);
    const pickComplete = turnCount > 0;
    const routeComplete = Boolean(route.active);
    const debtComplete = Boolean(pendingDebt || ((state && state.history) || []).some((item) => /^response-/.test(item.id || '')));
    const steps = [
      {
        id: 'pick',
        label: '起手',
        complete: pickComplete,
        text: pickComplete ? '你已经点过第一张牌，系统开始记账。' : '先点一张牌，看见代价、属性和旧账。'
      },
      {
        id: 'route',
        label: '活法成形',
        complete: routeComplete,
        text: routeComplete ? `${route.title}已成形，选择开始有惯性。` : '再重复相近选择，人生会开始偏科。'
      },
      {
        id: 'debt',
        label: '旧账回访',
        complete: debtComplete,
        text: pendingDebt ? `下一笔旧账：${pendingDebt.sourceCardName || pendingDebt.preview || pendingDebt.text}` : '制造旧账后，它会在后面回访。'
      },
      {
        id: 'settlement',
        label: '8手小结算',
        complete: settlementComplete,
        text: settlementComplete ? '撑过8次选择，小结算入账。' : `再撑${Math.max(0, 8 - turnCount)}次选择，拿到第一局小结算。`
      }
    ];
    const current = settlementComplete
      ? steps[3]
      : pendingDebt
        ? steps[2]
        : routeComplete
          ? steps[1]
          : steps[0];

    return {
      title: '本局节奏',
      current: { ...current, active: true },
      progress: {
        current: Math.min(turnCount, 8),
        total: 8,
        percent: Math.round((Math.min(turnCount, 8) / 8) * 100)
      },
      summary: current.id === 'settlement'
        ? '小结算：你撑过8次选择，第一局已经有了完整形状。'
        : current.id === 'debt'
          ? '旧账阶段：前面的选择开始回访，因果不再只停在卡面上。'
          : current.id === 'route'
            ? `${route.title}阶段：你的活法路线已经成形。`
            : '起手阶段：先点牌，认识寿命、属性和旧账。',
      steps: steps.map((step) => ({
        ...step,
        active: step.id === current.id
      }))
    };
  }

  function buildRunIntentProgressText(state, intent) {
    if (!intent) return '';
    const route = LIFE_ROUTES.find((item) => item.id === intent.routeId);
    if (!route) return '';
    const counts = (state && state.categoryCounts) || {};
    const count = route.categories.reduce((sum, category) => sum + (counts[category] || 0), 0);
    const threshold = 2;
    const remaining = Math.max(0, threshold - count);
    if (remaining <= 0) return `${route.title}已成形，下一步旧账会按这条线排队。`;
    return `再选${remaining}次相关选择，${route.title}成形。`;
  }

  function getRouteMilestoneStages(route) {
    if (!route) return [];
    return [
      { at: route.pressureAt, event: route.pressureEvent, label: '首次旧账' },
      ...((route.pressureEvents || []).map((stage) => ({
        ...stage,
        label: stage.at >= 7 ? '专属终局' : '路线升级'
      })))
    ].filter((stage) => stage.at && stage.event);
  }

  function buildRouteMilestonePreview(state, route) {
    if (!state || !route) return '';
    const counts = state.categoryCounts || {};
    const count = route.categories.reduce((sum, category) => sum + (counts[category] || 0), 0);
    const pending = (state.pendingConsequences || []).find((item) => item.routeId === route.id);
    if (pending) {
      return `里程碑：旧账已排队，下一次回访是「${pending.sourceCardName || route.title}」：${pending.preview || pending.text}`;
    }
    const nextStage = getRouteMilestoneStages(route)
      .find((stage) => !hasScheduledOrResolvedConsequence(state, stage.event.id));
    if (!nextStage) return `里程碑：${route.title}的专属旧账已经触发或归档。`;
    const remaining = Math.max(0, nextStage.at - count);
    const prefix = remaining <= 0 ? '下一次回访' : `再选${remaining}次同路线`;
    return `里程碑：${prefix}会触发「${nextStage.label}」：${nextStage.event.preview || nextStage.event.text}`;
  }

  function buildRunObjectiveBrief(state) {
    const route = buildRouteStatus(state);
    const goals = buildRunGoals(state);
    const surviveGoal = goals.find((goal) => goal.id === 'survive-eight');
    const varietyGoal = goals.find((goal) => goal.id === 'try-four-lanes');
    const disruptGoal = goals.find((goal) => goal.id === 'disruption-sixty');
    const target = state && state.collectionTarget;
    const firstRun = Boolean(state && state.firstRun);
    const runIntent = getRunIntent(state && state.runIntent);
    const runIntentProgress = buildRunIntentProgressText(state, runIntent);
    const intentRoute = runIntent ? LIFE_ROUTES.find((item) => item.id === runIntent.routeId) : null;
    const milestoneRoute = route.active ? route : intentRoute;
    const milestoneStep = buildRouteMilestonePreview(state, milestoneRoute);
    const taskChain = buildRouteTaskChainStatus(state, milestoneRoute);
    const routeStep = route.active
      ? `继续推进${route.title}：${route.risk}`
      : runIntent
        ? `今日倾向：${runIntent.title}。${runIntent.risk} ${runIntentProgress}`.trim()
      : '重复相近选择会形成一条活法路线：卷王、摸鱼、社交、AI外包或搅局。AI外包会留下提示词债和代理旧账。';
    const targetStep = target
      ? `追踪「${target.target}」：相关麻烦会更主动地靠近你。`
      : '死亡不是单纯失败，它会归档成明信片、人格和下一世遗产。';

    return {
      title: firstRun
        ? '这一局要做什么'
        : target
          ? `追踪：${target.target}`
          : runIntent
            ? `今日倾向：${runIntent.title}`
          : '今日死前KPI',
      tag: firstRun
        ? '点牌 -> 看后果 -> 活到结局'
        : route.active
          ? `${route.title} / 路线`
          : 'LIFE ROUTE',
      premise: firstRun
        ? runIntent
          ? `先撑过8次选择，看看「${runIntent.title}」会把你推向哪种死法。每张牌都写清：花多久、马上变什么、旧账会不会回来。`
          : '先撑过8次选择。目标不是找标准答案，而是看懂每张牌的代价、反噬和你正在形成的活法。'
        : target
          ? `本局正在追踪「${target.target}」。选择会把你推向对应死法、人格和旧账。`
          : runIntent
            ? `本局倾向「${runIntent.title}」。选择会更容易把你推向对应路线，但终局仍由你的账单决定。`
          : '这一局继续把选择推成路线：活久一点，搅乱一点，死得有证据一点。',
      steps: [
        `短期：撑过${surviveGoal.target}次选择（${surviveGoal.progress}/${surviveGoal.target}）。`,
        `中期：${routeStep}`,
        ...(taskChain ? [taskChain.text] : []),
        ...(milestoneStep ? [milestoneStep] : []),
        `长期：${targetStep}`,
        `额外：让世界卡顿到${disruptGoal.target}（${disruptGoal.progress}/${disruptGoal.target}），死前留下更响的证据。`
      ],
      chips: [
        { label: '短期', text: `撑过下一次选择` },
        { label: '中期', text: route.active ? route.title : runIntent ? runIntent.title : `形成${varietyGoal.target}种支线经验` },
        { label: '长期', text: target ? `追踪${target.target}` : '归档新明信片' }
      ],
      pulse: buildRunObjectivePulse(state)
    };
  }

  function buildRunObjectivePulse(state) {
    if (!state || !state.history || !state.history.length) return null;
    const currentTurn = state.turnCount || 0;
    const currentItems = [...state.history]
      .filter((item) => item.turn === currentTurn)
      .reverse();

    const completedGoal = currentItems.find((item) => item.goalId);
    if (completedGoal) {
      const label = (completedGoal.name || '').replace(/^目标完成：/, '') || '今日目标';
      const reward = (completedGoal.quote || '').replace(/^目标完成：/, '') || '小胜利已入账';
      return {
        tone: 'complete',
        title: '本局KPI入账',
        tag: 'CLAIMED',
        text: `${label}。奖励已生效：${reward}。`
      };
    }

    const routeArmed = currentItems.find((item) => /^route-armed-/.test(item.id || ''));
    if (routeArmed) {
      return {
        tone: 'route',
        title: '活法路线成形',
        tag: 'ROUTE',
        text: `${routeArmed.name || '路线'}开始记账：${routeArmed.causality || routeArmed.quote || '下一次选择会带着旧账回来。'}`
      };
    }

    const target = state.collectionTarget && !state.firstRun ? state.collectionTarget : null;
    if (target) {
      const trackedAction = currentItems.find((item) => {
        if (!item.category || item.category === 'event') return false;
        return cardMatchesCollectionTarget({ id: item.id, category: item.category }, target);
      });
      if (trackedAction) {
        const route = findCollectionTargetRoute(target);
        const step = route && route.steps
          ? route.steps.find((item) => item.id === trackedAction.id)
          : null;
        const tracker = buildCollectionTargetTracker(state, null);
        const nextText = tracker && tracker.nextText ? ` ${tracker.nextText}` : '';
        return {
          tone: 'tracking',
          title: '追踪线索命中',
          tag: 'TRACK',
          text: `${step ? step.label : trackedAction.name}正在靠近「${target.target}」。${nextText}`.trim()
        };
      }
    }

    return null;
  }

  function applyDelta(target, delta, min, max) {
    Object.keys(delta || {}).forEach((key) => {
      target[key] = clamp((target[key] || 0) + delta[key], min, max);
    });
  }

  function mergeEffect(base, delta) {
    const merged = { ...((base) || {}) };
    Object.keys(delta || {}).forEach((key) => {
      merged[key] = (merged[key] || 0) + delta[key];
      if (merged[key] === 0) delete merged[key];
    });
    return merged;
  }

  function buildRouteCardModifier(state, card) {
    const route = buildRouteStatus(state);
    if (!route.active || !route.categories.includes(card && card.category)) {
      return {
        routeId: route.id,
        active: false,
        timeDelta: 0,
        effect: {},
        disruption: 0,
        absurdDebt: 0,
        note: ''
      };
    }

    if (route.id === 'work') {
      return {
        routeId: route.id,
        active: true,
        timeDelta: -0.5,
        effect: { anxiety: 3, health: -2 },
        disruption: -1,
        absurdDebt: 5,
        label: '卷王惯性',
        detail: '更快交付，但更像默认负责人',
        note: '卷王惯性：更快交付，但更像默认负责人'
      };
    }

    if (route.id === 'slack') {
      return {
        routeId: route.id,
        active: true,
        timeDelta: 0,
        effect: { anxiety: -3, spirit: 3 },
        disruption: 4,
        absurdDebt: 3,
        label: '摸鱼惯性',
        detail: '缓冲更有效，但离席审计开始记账',
        note: '摸鱼惯性：缓冲更有效，但离席审计开始记账'
      };
    }

    if (route.id === 'social') {
      return {
        routeId: route.id,
        active: true,
        timeDelta: 0,
        effect: { social: 4, anxiety: state.stats.social >= 75 ? 4 : -1 },
        disruption: 1,
        absurdDebt: 5,
        label: '社交惯性',
        detail: '关系升温，人情账也开始计息',
        note: '社交惯性：关系升温，人情账也开始计息'
      };
    }

    if (route.id === 'ai') {
      return {
        routeId: route.id,
        active: true,
        timeDelta: -0.25,
        effect: { spirit: 2, anxiety: 2 },
        disruption: 5,
        absurdDebt: 2,
        label: '外包惯性',
        detail: '更快生成，但判断力开始欠费',
        note: '外包惯性：更快生成，但判断力开始欠费'
      };
    }

    if (route.id === 'disrupt') {
      return {
        routeId: route.id,
        active: true,
        timeDelta: 0,
        effect: { anxiety: 2 },
        disruption: 8,
        absurdDebt: -2,
        label: '搅局惯性',
        detail: '真话更响，组织也更想把你静音',
        note: '搅局惯性：真话更响，组织也更想把你静音'
      };
    }

    return {
      routeId: route.id,
      active: false,
      timeDelta: 0,
      effect: {},
      disruption: 0,
      absurdDebt: 0,
      note: ''
    };
  }

  function buildEffectiveCardImpact(state, card) {
    const modifier = buildRouteCardModifier(state, card);
    let timeCost = Math.max(0.25, card.cost.time + modifier.timeDelta);
    let effect = mergeEffect(card.effect, modifier.effect);
    let npc = { ...((card && card.npc) || {}) };
    let disruption = (card.disruption || 0) + modifier.disruption;
    let absurdDebt = (card.absurdDebt || 0) + modifier.absurdDebt;

    // Apply daily challenge mutators
    if (state && state.dailyChallenge && state.dailyMutator) {
      const mutator = state.dailyMutator;
      if (mutator.id === 'blue-monday') {
        if (effect.anxiety > 0) {
          effect.anxiety = Math.round(effect.anxiety * 1.2);
        }
      } else if (mutator.id === 'paid-slacking') {
        if (card.category === 'slack') {
          if (effect.spirit > 0) effect.spirit = Math.round(effect.spirit * 1.3);
          if (effect.anxiety < 0) effect.anxiety = Math.round(effect.anxiety * 1.3);
        }
        if (absurdDebt > 0) {
          absurdDebt = Math.round(absurdDebt * 0.8);
        }
      } else if (mutator.id === 'ai-explosion') {
        if (card.category === 'ai') {
          timeCost = 0;
        }
        if (disruption > 0) {
          disruption = Math.round(disruption * 1.5);
        }
      } else if (mutator.id === 'crazy-thursday') {
        if (card.category === 'social') {
          Object.keys(effect).forEach(key => {
            if (key === 'anxiety' && effect[key] > 0) {
              effect[key] = Math.round(effect[key] * 0.5);
            }
            if (key === 'spirit' && effect[key] < 0) {
              effect[key] = Math.round(effect[key] * 0.5);
            }
          });
          if (timeCost > 0.25) {
            timeCost = Math.max(0.25, timeCost * 0.5);
          }
        }
      } else if (mutator.id === 'fabulous-friday') {
        if (card.category === 'work') {
          timeCost = Math.max(0.25, timeCost * 0.5);
          if (effect.spirit < 0) {
            effect.spirit = Math.round(effect.spirit * 1.2);
          }
        }
      }
    }

    // Apply character passive modifiers
    if (state && state.characterId) {
      if (state.characterId === 'mosquito') {
        // Mosquito: disruption bonus +5, health negative effect increased by 50%
        if (disruption > 0) {
          disruption += 5;
        }
        if (effect.health < 0) {
          effect.health = Math.round(effect.health * 1.5);
        }
      } else if (state.characterId === 'old_wang') {
        // Old Wang: Work & meeting cards take 30% less time. Double boss affinity gains. Double absurdDebt gains.
        if (card.category === 'work' || card.category === 'meeting') {
          timeCost = Math.max(0.25, timeCost * 0.7);
          if (npc.boss > 0) {
            npc.boss = Math.round(npc.boss * 2);
          }
          if (absurdDebt > 0) {
            absurdDebt = Math.round(absurdDebt * 2);
          }
        }
      } else if (state.characterId === 'slacker_yu') {
        // Slacker Yu: Slack/phone cards restore 50% more spirit/health
        if (card.category === 'slack' || card.category === 'phone') {
          if (effect.spirit > 0) {
            effect.spirit = Math.round(effect.spirit * 1.5);
          }
          if (effect.health > 0) {
            effect.health = Math.round(effect.health * 1.5);
          }
        }
      }
    }

    return {
      timeCost,
      effect,
      npc,
      disruption,
      absurdDebt,
      routeModifier: modifier.active ? modifier : null
    };
  }

  function applyCard(state, card) {
    const next = cloneState(state);
    const impact = buildEffectiveCardImpact(state, card);
    const statsBefore = { ...next.stats };
    const timeBefore = next.timeLeft;
    const absurdDebtBefore = next.absurdDebt;
    const disruptionBefore = next.disruption;
    next.timeLeft = Math.max(0, next.timeLeft - impact.timeCost);
    applyDelta(next.stats, impact.effect, 0, 100);
    applyDelta(next.npc, impact.npc, 0, 100);
    if (next.characterId === 'slacker_yu') {
      next.npc.boss = Math.max(0, next.npc.boss - 3);
    }
    next.disruption = clamp(next.disruption + impact.disruption, 0, 999);
    next.absurdDebt = clamp(next.absurdDebt + impact.absurdDebt, 0, 100);
    next.turnCount += 1;
    next.categoryCounts[card.category] = (next.categoryCounts[card.category] || 0) + 1;
    next.combo = {
      category: card.category,
      count: state.combo.category === card.category ? state.combo.count + 1 : 1
    };
    if (card.flag) next.flags[card.flag] = true;
    next.history.push({
      turn: next.turnCount,
      id: card.id,
      name: card.name,
      category: card.category,
      quote: card.quote,
      causality: card.causality,
      disruption: impact.disruption,
      absurdDebt: impact.absurdDebt,
      effect: { ...(impact.effect || {}) },
      timeCost: impact.timeCost,
      routeModifier: impact.routeModifier ? {
        ...impact.routeModifier,
        effect: { ...(impact.routeModifier.effect || {}) }
      } : null,
      statsBefore,
      statsAfter: { ...next.stats },
      timeBefore,
      timeAfter: next.timeLeft,
      absurdDebtBefore,
      absurdDebtAfter: next.absurdDebt,
      disruptionBefore,
      disruptionAfter: next.disruption
    });
    scheduleCardConsequences(next, card);
    maybeScheduleRoutePressure(state, next);
    applyComboBonus(next);
    applyGoalRewards(state, next);

    // Weekend Recovery Daily Mutator
    if (next.dailyChallenge && next.dailyMutator && next.dailyMutator.id === 'weekend-recovery') {
      if (next.stats.anxiety >= 80) next.stats.anxiety = Math.max(0, next.stats.anxiety - 3);
      if (next.stats.spirit <= 20) next.stats.spirit = Math.min(100, next.stats.spirit + 3);
      if (next.stats.social <= 20) next.stats.social = Math.min(100, next.stats.social + 3);
      if (next.stats.health <= 20) next.stats.health = Math.min(100, next.stats.health + 3);
    }

    return next;
  }

  function scheduleCardConsequences(state, card) {
    (card.delayedConsequences || []).forEach((item, index) => {
      state.pendingConsequences.push({
        ...item,
        id: item.id || `${card.id}-consequence-${state.turnCount}-${index}`,
        sourceCardId: card.id,
        sourceCardName: card.name,
        dueTurn: state.turnCount + (item.delayTurns || 1),
        effect: { ...(item.effect || {}) }
      });
    });
  }

  function buildCardConsequencePreview(card) {
    const consequence = card && card.delayedConsequences && card.delayedConsequences[0];
    if (!consequence) return null;
    const delayTurns = consequence.delayTurns || 1;
    return {
      label: '后果回访',
      delayTurns,
      text: consequence.preview || `${delayTurns}次选择后，这张牌会回来找你结账。`
    };
  }

  function findRouteForCard(card) {
    return LIFE_ROUTES.find((route) => route.categories.includes(card && card.category)) || null;
  }

  function formatStatDelta(key, value) {
    const label = STAT_NAMES[key] || key;
    return `${label}${value > 0 ? '+' : ''}${value}`;
  }

  function formatShortDuration(hours) {
    const minutes = Math.max(1, Math.round(hours * 60));
    const wholeHours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    if (!wholeHours) return `${minutes}m`;
    if (!rest) return `${wholeHours}h`;
    return `${wholeHours}h${rest}m`;
  }

  function buildMainImmediateEffect(state, card) {
    const impact = buildEffectiveCardImpact(state, card);
    const preferredKey = (() => {
      if (state && state.stats) {
        if (state.stats.anxiety >= 75 && impact.effect.anxiety < 0) return 'anxiety';
        if (state.stats.social <= 18 && impact.effect.social > 0) return 'social';
        if (state.stats.spirit <= 25 && impact.effect.spirit > 0) return 'spirit';
        if (state.stats.health <= 18 && impact.effect.health > 0) return 'health';
      }
      return null;
    })();
    const entries = Object.keys((impact && impact.effect) || {})
      .map((key) => ({ key, value: impact.effect[key], magnitude: Math.abs(impact.effect[key]) }))
      .sort((left, right) => right.magnitude - left.magnitude);
    const top = preferredKey
      ? entries.find((entry) => entry.key === preferredKey)
      : entries[0];
    const statText = top ? formatStatDelta(top.key, top.value) : '状态无明显变化';
    const routeText = impact.routeModifier ? `；${impact.routeModifier.label || impact.routeModifier.note}` : '';
    return `寿命-${formatShortDuration(impact.timeCost)}，${statText}${routeText}`;
  }

  function buildCardImpactRisk(state, card) {
    const next = cloneState(state);
    const impact = buildEffectiveCardImpact(state, card);
    next.timeLeft = Math.max(0, next.timeLeft - impact.timeCost);
    applyDelta(next.stats, impact.effect, 0, 100);
    next.disruption = clamp(next.disruption + impact.disruption, 0, 999);
    next.absurdDebt = clamp(next.absurdDebt + impact.absurdDebt, 0, 100);

    const death = checkDeath(next);
    if (death) {
      return {
        level: 'lethal',
        label: '可能当场结算',
        text: `${buildDeathThresholdText(next, death)} -> ${death.title}`
      };
    }

    const danger = [];
    if (next.stats.anxiety >= 85) danger.push(`焦虑会到${next.stats.anxiety}`);
    if (next.stats.spirit <= 15) danger.push(`精神会到${next.stats.spirit}`);
    if (next.stats.social <= 15) danger.push(`社交会到${next.stats.social}`);
    if (next.stats.health <= 15) danger.push(`健康会到${next.stats.health}`);
    if (next.absurdDebt >= 85) danger.push(`被安排度会到${next.absurdDebt}`);
    if (next.timeLeft <= 4) danger.push(`寿命只剩${formatCountdown(next.timeLeft)}`);

    if (danger.length) {
      return {
        level: 'danger',
        label: '高风险',
        text: danger[0]
      };
    }

    return {
      level: 'mild',
      label: '可承受',
      text: '不会立刻把你送走'
    };
  }

  function buildChoiceCausalPreview(state, card) {
    const route = findRouteForCard(card);
    const activeRoute = buildRouteStatus(state);
    const escapePressure = getRouteEscapePressure(state, activeRoute);
    const consequence = buildCardConsequencePreview(card);
    const risk = buildCardImpactRisk(state, card);
    const impact = buildEffectiveCardImpact(state, card);
    const npcWarning = buildNpcChoiceWarning(state, impact);
    const npcRelief = buildNpcChoiceRelief(state, impact);
    const categoryLabel = CATEGORY_LABELS[card.category] || card.category;
    const routeTitle = route ? route.title : `${categoryLabel}支线`;
    const routeEscape = escapePressure && !activeRoute.categories.includes(card.category)
      ? escapePressure
      : null;
    const callback = consequence
      ? {
        label: consequence.label,
        text: consequence.text,
        delayTurns: consequence.delayTurns
      }
      : null;

    return {
      routeId: route ? route.id : card.category,
      routeTitle,
      categoryLabel,
      timeCost: impact.timeCost,
      immediate: buildMainImmediateEffect(state, card),
      callback,
      risk,
      npcWarning,
      npcRelief,
      routeEscape,
      routeModifier: impact.routeModifier,
      line: routeEscape
        ? `换路线：避开${routeEscape.title}的专属终局。`
        : impact.routeModifier
        ? `路线惯性：${impact.routeModifier.note}`
        : callback
        ? `旧账：${callback.text}`
        : `风险：${risk.label}，${risk.text}`
    };
  }

  const CARD_FACE_OVERRIDES = {
    'doom-scroll': {
      title: '刷效率短视频',
      temptation: '收藏五个高效方法，先获得一种正在变好的错觉。',
      riskWhisper: '算法之后会回来找你。',
      artMood: 'phone-glow'
    },
    'like-boss-post': {
      temptation: '完成一次朋友圈在岗证明，看起来很懂组织温度。',
      riskWhisper: '旧账之后会回来找你。',
      artMood: 'thumb-trap'
    }
  };

  const CARD_ART_MOODS = {
    work: 'desk-lamp',
    meeting: 'meeting-fog',
    slack: 'soft-escape',
    social: 'polite-smile',
    phone: 'phone-glow',
    think: 'thought-loop',
    ai: 'bot-shadow',
    disrupt: 'red-stamp',
    event: 'paper-alarm'
  };

  function summarizeCardEffectText(state, card) {
    if (!card) return '没有可结算的效果。';
    const impact = buildEffectiveCardImpact(state || createRunState('mayfly'), card);
    const parts = [`寿命-${formatShortDuration(impact.timeCost)}`];
    Object.keys(impact.effect || {}).forEach((key) => {
      const value = impact.effect[key];
      if (value) parts.push(formatStatDelta(key, value));
    });
    if (impact.disruption) parts.push(`搅局${impact.disruption > 0 ? '+' : ''}${impact.disruption}`);
    if (impact.absurdDebt) parts.push(`荒诞债${impact.absurdDebt > 0 ? '+' : ''}${impact.absurdDebt}`);
    return parts.join('，');
  }

  function buildCardFace(card, state = createRunState('mayfly')) {
    const source = card || {};
    const override = CARD_FACE_OVERRIDES[source.id] || {};
    const consequence = buildCardConsequencePreview(source);
    const categoryLabel = CATEGORY_LABELS[source.category] || '人生';
    const route = findRouteForCard(source);
    const displayChips = [
      categoryLabel,
      source.tag,
      consequence ? '有旧账' : route ? '会成线' : null
    ].filter(Boolean).slice(0, 3);

    return {
      role: 'action',
      typeLabel: '行动牌',
      id: source.id,
      title: override.title || source.name || '未命名选择',
      icon: source.icon || '✦',
      artMood: override.artMood || CARD_ART_MOODS[source.category] || 'paper-choice',
      costChip: `耗时 ${formatShortDuration(((source.cost || {}).time) || 0.5)}`,
      temptation: override.temptation || source.quote || '看起来能让今天稍微好过一点。',
      riskWhisper: override.riskWhisper || (consequence ? '旧账之后会回来找你。' : '代价会在结算时露面。'),
      displayChips,
      detail: {
        effectText: summarizeCardEffectText(state, source),
        routeTitle: route ? route.title : `${categoryLabel}支线`,
        fullQuote: source.quote || '',
        causality: source.causality || '',
        consequence: consequence ? consequence.text : ''
      }
    };
  }

  function getLeadingLifeRoute(state) {
    const counts = (state && state.categoryCounts) || {};
    const ranked = LIFE_ROUTES
      .map((route) => ({
        ...route,
        count: route.categories.reduce((sum, category) => sum + (counts[category] || 0), 0)
      }))
      .sort((left, right) => right.count - left.count);
    return ranked.find((route) => route.count > 0) || null;
  }

  function buildFirstRunGuide(state, card) {
    if (!state || !card || !state.firstRun || (state.turnCount || 0) >= 3) return null;

    const step = (state.turnCount || 0) + 1;
    const preview = buildChoiceCausalPreview(state, card);
    const cardRoute = findRouteForCard(card);

    if (step === 1) {
      return {
        step,
        focus: 'cost',
        tag: 'STEP 1/3',
        title: '先看代价',
        text: `${card.name}会${preview.immediate}，并把你推向${preview.routeTitle}。先别找最优解，先看寿命和属性怎么变。`
      };
    }

    if (step === 2) {
      const leadingRoute = getLeadingLifeRoute(state);
      const sameRoute = leadingRoute && cardRoute && leadingRoute.id === cardRoute.id;
      return {
        step,
        focus: sameRoute ? 'route' : 'branch',
        tag: 'STEP 2/3',
        title: '选出活法路线',
        text: sameRoute
          ? `延续${cardRoute.title}：再重复相近选择，路线会成形，奖励和旧账都会更像你。`
          : `切到${cardRoute ? cardRoute.title : preview.routeTitle}：换线能打开新支线，但成形会慢一点。`
      };
    }

    const consequence = buildCardConsequencePreview(card);
    return {
      step,
      focus: consequence ? 'debt' : 'ending',
      tag: 'STEP 3/3',
      title: consequence ? '认识旧账回访' : '准备进入自由局',
      text: consequence
        ? `${card.name}会挂旧账：${consequence.text} 选择不是一次性结算，它会回来找你。`
        : `${card.name}暂时不挂旧账，但它仍会推进路线和死法归档。下一手开始，系统不再牵着你走。`
    };
  }

  function hasScheduledOrResolvedConsequence(state, eventId) {
    return (state.pendingConsequences || []).some((item) => item.id === eventId)
      || (state.history || []).some((item) => item.id === eventId || item.id === `response-${eventId}`);
  }

  function maybeScheduleRoutePressure(previous, next) {
    const activeRoute = buildRouteStatus(next);
    const route = LIFE_ROUTES.find((item) => item.id === activeRoute.id);
    if (!route || !route.pressureEvent) return;
    const previousCount = route.categories.reduce((sum, category) => sum + ((previous.categoryCounts || {})[category] || 0), 0);
    const currentCount = route.categories.reduce((sum, category) => sum + ((next.categoryCounts || {})[category] || 0), 0);
    const previousStreak = getRouteActionStreak(previous, route);
    const currentStreak = getRouteActionStreak(next, route);
    const stages = [
      { at: route.pressureAt, event: route.pressureEvent, label: '成形' },
      ...((route.pressureEvents || []).map((stage) => ({ ...stage, label: '升级' })))
    ];
    stages.forEach((stage) => {
      if (!stage.event) return;
      const useCumulativeCount = stage.at === route.pressureAt;
      const before = useCumulativeCount ? previousCount : previousStreak;
      const after = useCumulativeCount ? currentCount : currentStreak;
      if (before >= stage.at || after < stage.at) return;
      if (hasScheduledOrResolvedConsequence(next, stage.event.id)) return;

      next.pendingConsequences.push({
        ...stage.event,
        routeId: route.id,
        routeStage: stage.at,
        sourceCardId: `route-${route.id}-${stage.at}`,
        sourceCardName: `${route.title}${stage.label}`,
        dueTurn: next.turnCount + 1,
        effect: { ...(stage.event.effect || {}) }
      });
      next.history.push({
        turn: next.turnCount,
        id: `route-armed-${route.id}-${stage.at}`,
        name: `${route.title}${stage.label}`,
        category: 'event',
        quote: stage.at === route.pressureAt
          ? `${route.title}成形：${route.hook}`
          : `${route.title}升级：这条活法已经不只是偏好，而是开始改写办公室物理。`,
        causality: useCumulativeCount
          ? `${route.title}累计到第${stage.at}次，下一次回访会带着更具体的旧账回来。`
          : `${route.title}连续走到第${stage.at}次，下一次回访会带着专属终局的味道回来。`,
        disruption: 0,
        absurdDebt: 0
      });
    });
  }

  function applyGoalRewards(previous, next) {
    const alreadyClaimed = new Set(previous.claimedGoals || []);
    buildRunGoals(next).forEach((goal) => {
      if (!goal.complete || alreadyClaimed.has(goal.id) || next.claimedGoals.includes(goal.id)) return;
      next.claimedGoals.push(goal.id);
      if (goal.id === 'survive-eight') {
        next.timeLeft = clamp(next.timeLeft + 1.5, 0, next.character.timeLimit);
        next.stats.spirit = clamp(next.stats.spirit + 5, 0, 100);
      }
      if (goal.id === 'try-four-lanes') {
        next.disruption = clamp(next.disruption + 30, 0, 999);
        next.stats.anxiety = clamp(next.stats.anxiety - 6, 0, 100);
      }
      if (goal.id === 'disruption-sixty') {
        next.absurdDebt = clamp(next.absurdDebt - 12, 0, 100);
        next.stats.spirit = clamp(next.stats.spirit + 6, 0, 100);
        next.stats.social = clamp(next.stats.social + 8, 0, 100);
      }
      next.history.push({
        turn: next.turnCount,
        id: `goal-${goal.id}`,
        name: `目标完成：${goal.label}`,
        category: 'event',
        quote: `目标完成：${goal.reward}`,
        causality: `你完成了“${goal.label}”，下一条时间线记住了这个小胜利。`,
        disruption: 0,
        absurdDebt: 0,
        goalId: goal.id
      });
    });
  }

  function applyComboBonus(state) {
    if (state.combo.count < 3) return;
    const statsBefore = { ...state.stats };
    const absurdDebtBefore = state.absurdDebt;
    const disruptionBefore = state.disruption;
    let effect = null;
    let disruptionDelta = 0;
    let absurdDebtDelta = 0;
    if (state.combo.category === 'work') {
      state.absurdDebt = clamp(state.absurdDebt + 12, 0, 100);
      state.stats.anxiety = clamp(state.stats.anxiety + 8, 0, 100);
      effect = { anxiety: 8 };
      absurdDebtDelta = 12;
    }
    if (state.combo.category === 'slack') {
      state.disruption = clamp(state.disruption + 10, 0, 999);
      state.stats.spirit = clamp(state.stats.spirit + 6, 0, 100);
      effect = { spirit: 6 };
      disruptionDelta = 10;
    }
    if (state.combo.category === 'disrupt') {
      state.disruption = clamp(state.disruption + 20, 0, 999);
      state.stats.social = clamp(state.stats.social - 2, 0, 100);
      effect = { social: -2 };
      disruptionDelta = 20;
    }
    if (effect) {
      const label = CATEGORY_LABELS[state.combo.category] || state.combo.category;
      state.history.push({
        turn: state.turnCount,
        id: `combo-${state.combo.category}-${state.combo.count}`,
        name: `${label}连击反噬`,
        category: 'event',
        quote: `连续${state.combo.count}次${label}，这条活法开始反过来塑造你。`,
        causality: `你把${label}走成习惯，习惯开始收税。`,
        disruption: disruptionDelta,
        absurdDebt: absurdDebtDelta,
        effect,
        statsBefore,
        statsAfter: { ...state.stats },
        absurdDebtBefore,
        absurdDebtAfter: state.absurdDebt,
        disruptionBefore,
        disruptionAfter: state.disruption
      });
    }
  }

  function getLastActionHistory(state) {
    return [...((state && state.history) || [])]
      .reverse()
      .find((item) => item.category && item.category !== 'event') || null;
  }

  function buildContextualEvents(state) {
    const last = getLastActionHistory(state);
    const events = [];
    if (!last) return events;

    if (last.id === 'notification-dnd') {
      events.push({
        id: 'context-dnd-where-are-you',
        emoji: '🔕',
        text: '你刚开勿扰，群里立刻出现“刚刚怎么没回”。新的会刚好压住你唯一能吃饭的半小时。',
        effect: { spirit: -3, social: -4, anxiety: 10 },
        disruption: 3,
        absurdDebt: 6,
        type: 'negative',
        causality: '你把通知关在门外，消息学会了敲窗。'
      });
    }

    if (last.id === 'speak-truth') {
      events.push({
        id: 'context-truth-clarification',
        emoji: '⚡',
        text: '你刚问“这事到底谁需要”，会议标题立刻改成《需求价值再澄清》。你被邀请做开场，因为大家觉得你比较有感触。',
        effect: { spirit: -5, social: -6, anxiety: 8 },
        timeCost: 0.25,
        disruption: 18,
        absurdDebt: -3,
        type: 'disrupt',
        causality: '你的真话没有被采纳，它被升级成了一个更长的会。'
      });
    }

    if (['work', 'meeting'].includes(last.category)) {
      events.push({
        id: 'context-performance-self-review',
        emoji: '📋',
        text: '绩效自评开放了。系统要求你用800字证明自己没有浪费公司钱，你写到第300字开始怀疑公司也没有证明过。',
        effect: { spirit: -6, anxiety: 13 },
        timeCost: 0.25,
        disruption: -2,
        absurdDebt: 12,
        type: 'negative',
        causality: '你刚认真工作，绩效系统决定让认真变成自证。'
      });
    }

    if (['slack', 'phone'].includes(last.category)) {
      events.push({
        id: 'context-life-voice-message',
        emoji: '🎙',
        text: '妈妈发来59秒语音。你没点开，但已经听见前三句“吃饭了吗”，后面56秒是“你到底图什么”。',
        effect: { spirit: -3, social: 4, anxiety: 9 },
        disruption: 4,
        absurdDebt: 2,
        type: 'negative',
        causality: '你试图把生活静音，生活改用亲情格式推送。'
      });
    }

    events.push(...buildNpcContextualEvents(state, last));

    if ((state.stats && state.stats.anxiety >= 80) || (state.stats && state.stats.health <= 25)) {
      events.push({
        id: 'context-health-report',
        emoji: '🏥',
        text: '体检报告提醒你“建议复查”。你决定先不看，报告也很懂事，安静地躺成一个延迟后果。',
        effect: { health: -2, anxiety: 12 },
        disruption: 2,
        absurdDebt: 5,
        type: 'negative',
        causality: '你没有打开体检报告，但体检报告打开了你。'
      });
    }

    return events;
  }

  function buildNpcContextualEvents(state, last) {
    const npc = (state && state.npc) || {};
    const events = [];

    if (npc.boss >= 65 && ['work', 'meeting', 'social'].includes(last.category)) {
      events.push({
        id: 'npc-boss-default-mention',
        emoji: '📌',
        text: '老板关系过热：他已经把你当成默认@对象。你刚动了一下，群里就多出一句“顺手也看下”。',
        effect: { spirit: -4, anxiety: 12 },
        timeCost: 0.25,
        disruption: -2,
        absurdDebt: 12,
        type: 'negative',
        causality: '老板好感不是护盾，它更像默认负责人的授权码。'
      });
    }

    if (npc.boss <= 15 && last.category === 'disrupt') {
      events.push({
        id: 'npc-boss-silent-cc',
        emoji: '📎',
        text: '老板开始安静抄送：他没有反驳你的真话，只是把HR、法务和“相关同事”放进了收件人。',
        effect: { social: -8, anxiety: 12 },
        timeCost: 0.25,
        disruption: 8,
        absurdDebt: 2,
        type: 'negative',
        causality: '你把老板好感打到危险区，反击不再吵闹，改走抄送流程。'
      });
    }

    if (npc.slacker >= 65 && ['slack', 'phone'].includes(last.category)) {
      events.push({
        id: 'npc-slacker-cover-shift',
        emoji: '🐟',
        text: '摸鱼搭子关系过熟：小余让你“帮忙盯一下工位”。你们同时离席的概率上升，离席审计也终于有了统计意义。',
        effect: { spirit: 2, social: 4, anxiety: 8 },
        disruption: 12,
        absurdDebt: 4,
        type: 'negative',
        causality: '摸鱼搭子把快乐共享给你，也把审计风险共享给你。'
      });
    }

    if (npc.coworker >= 62 && ['social', 'meeting'].includes(last.category)) {
      events.push({
        id: 'npc-coworker-one-look',
        emoji: '🧾',
        text: '同事关系过黏：茶水间已经流传“你人很好”。三个“帮我看一眼”开始排队，人情账自动续费。',
        effect: { spirit: -4, social: 5, anxiety: 9 },
        timeCost: 0.25,
        disruption: 2,
        absurdDebt: 10,
        type: 'negative',
        causality: '你把关系维护成资产，资产开始要求你提供售后。'
      });
    }

    return events;
  }

  function buildNpcRelationshipStatus(state) {
    const npc = (state && state.npc) || {};
    const configs = buildNpcRelationshipConfigs(npc);

    const items = configs.map((config) => {
      const value = clamp(config.value, 0, 100);
      const level = value >= config.hotAt
        ? 'hot'
        : value <= config.coldAt
          ? 'cold'
          : value >= config.hotAt - 8
            ? 'warm'
            : 'stable';
      const warning = level === 'hot'
        ? config.hotWarning
        : level === 'warm'
          ? config.warmWarning
          : level === 'cold'
            ? config.coldWarning
            : '稳定：关系还没形成具体旧账，但世界正在记账。';
      return {
        id: config.id,
        name: config.name,
        avatar: config.avatar,
        value,
        level,
        hotAt: config.hotAt,
        eventId: level === 'hot' ? config.eventId : null,
        warning,
        fill: Math.round((value / config.hotAt) * 100)
      };
    });

    return {
      items,
      hotCount: items.filter((item) => item.level === 'hot').length,
      warmCount: items.filter((item) => item.level === 'warm').length,
      summary: items.some((item) => item.level === 'hot')
        ? 'NPC关系过热：下一次相关行为可能把旧账推到你脸上。'
        : items.some((item) => item.level === 'warm')
          ? 'NPC关系升温：再靠近一点，旧账就会开始排队。'
          : 'NPC关系暂时稳定，但所有善意和得罪都会被系统记账。'
    };
  }

  function buildNpcRelationshipConfigs(npc) {
    return [
      {
        id: 'boss',
        name: '老板',
        avatar: '💼',
        value: npc.boss || 0,
        hotAt: 65,
        coldAt: 15,
        eventId: 'npc-boss-default-mention',
        hotWarning: '过热：老板快把你设成默认@对象，“顺手也看下”正在排队。',
        warmWarning: '接近过热：老板好感越高，默认负责人风险越高。',
        coldWarning: '冷却：老板暂时不爱找你，但低到危险会改走安静抄送。',
        coldEventId: 'npc-boss-silent-cc'
      },
      {
        id: 'slacker',
        name: '摸鱼搭子',
        avatar: '🐟',
        value: npc.slacker || 0,
        hotAt: 65,
        coldAt: 20,
        eventId: 'npc-slacker-cover-shift',
        hotWarning: '过热：摸鱼搭子会让你帮忙盯工位，离席审计开始有样本。',
        warmWarning: '接近过热：搭子关系升温，离席互保正在形成。',
        coldWarning: '冷却：搭子暂时不找你，摸鱼快乐少一点，审计样本也少一点。'
      },
      {
        id: 'coworker',
        name: '同事',
        avatar: '🧾',
        value: npc.coworker || 0,
        hotAt: 62,
        coldAt: 18,
        eventId: 'npc-coworker-one-look',
        hotWarning: '过热：同事已经觉得你人很好，“帮我看一眼”开始排队。',
        warmWarning: '接近过热：人情账正在升温，再社交几次就会自动续费。',
        coldWarning: '冷却：同事关系疏离，没人找你看一眼，也没人替你说话。'
      }
    ];
  }

  function buildNpcChoiceWarning(state, impact) {
    if (!impact || !impact.npc || !Object.keys(impact.npc).length) return null;
    const before = buildNpcRelationshipStatus(state);
    const next = cloneState(state);
    applyDelta(next.npc, impact.npc, 0, 100);
    const after = buildNpcRelationshipStatus(next);
    const priority = { hot: 3, warm: 2, stable: 1, cold: 0 };
    const changed = after.items
      .map((item) => {
        const old = before.items.find((beforeItem) => beforeItem.id === item.id);
        return {
          ...item,
          beforeValue: old ? old.value : 0,
          beforeLevel: old ? old.level : 'stable'
        };
      })
      .filter((item) => (
        (item.level === 'hot' && item.beforeLevel !== 'hot')
        || (item.level === 'warm' && !['warm', 'hot'].includes(item.beforeLevel))
      ))
      .sort((left, right) => priority[right.level] - priority[left.level] || right.value - left.value);
    const top = changed[0];
    if (!top) return null;
    return {
      id: top.id,
      name: top.name,
      avatar: top.avatar,
      level: top.level,
      before: top.beforeValue,
      after: top.value,
      eventId: top.eventId,
      text: top.warning
    };
  }

  function buildNpcChoiceRelief(state, impact) {
    if (!impact || !impact.npc || !Object.keys(impact.npc).length) return null;
    if (!Object.values(impact.npc).some((value) => value < 0)) return null;

    const before = buildNpcRelationshipStatus(state);
    const next = cloneState(state);
    applyDelta(next.npc, impact.npc, 0, 100);
    const after = buildNpcRelationshipStatus(next);
    const priority = { hot: 3, warm: 2, stable: 1, cold: 0 };
    const changed = after.items
      .map((item) => {
        const old = before.items.find((beforeItem) => beforeItem.id === item.id);
        return {
          ...item,
          beforeValue: old ? old.value : 0,
          beforeLevel: old ? old.level : 'stable'
        };
      })
      .filter((item) => item.value < item.beforeValue)
      .sort((left, right) => (
        priority[right.beforeLevel] - priority[left.beforeLevel]
        || (right.beforeValue - right.value) - (left.beforeValue - left.value)
      ));
    const top = changed[0];
    if (!top) return null;
    if (!['warm', 'hot'].includes(top.beforeLevel)) return null;

    const wasHot = top.beforeLevel === 'hot';
    const cooledOut = wasHot && top.level !== 'hot';
    return {
      id: top.id,
      name: top.name,
      avatar: top.avatar,
      before: top.beforeValue,
      after: top.value,
      beforeLevel: top.beforeLevel,
      level: top.level,
      text: cooledOut
        ? '过热解除：旧账暂时退回队列。'
        : wasHot
          ? '关系降温：旧账还热着，但没那么烫手了。'
          : '关系降温：人情账压力下降。'
    };
  }

  function eventRelievesPressure(state, event) {
    if (!state || !event) return false;
    const effect = event.effect || {};
    return (state.stats.anxiety >= 75 && effect.anxiety < 0)
      || (state.stats.spirit <= 25 && effect.spirit > 0)
      || (state.stats.social <= 18 && effect.social > 0)
      || (state.stats.health <= 18 && effect.health > 0)
      || (state.absurdDebt >= 75 && (event.absurdDebt || 0) < 0);
  }

  function scoreDirectedEvent(state, event, seed, index, source) {
    const route = buildRouteStatus(state);
    let score = seededRandom(seed + (state.turnCount || 0) * 31 + index * 53);
    if (source === 'contextual') score -= 0.22;
    if (event.id === 'context-health-report' && ((state.stats && state.stats.anxiety >= 80) || (state.stats && state.stats.health <= 25))) {
      score -= 1.4;
    }
    if (/^npc-/.test(event.id || '')) score -= 0.35;
    if (route.active) {
      const preferred = ROUTE_EVENT_AFFINITY[route.id] || [];
      if (preferred.includes(event.id)) score -= 1.05;
      else if (source === 'ambient') score += 0.12;
    }
    if (needsPressureRelief(state)) {
      if (eventRelievesPressure(state, event) || event.type === 'positive') score -= 0.35;
      const risk = buildConsequenceRisk(state, event);
      if (risk.level === 'lethal') score += 0.5;
    }
    return score;
  }

  function pickDirectedEvent(state, pool, seed, source) {
    return pool
      .map((event, index) => ({
        event,
        score: scoreDirectedEvent(state, event, seed, index, source)
      }))
      .sort((left, right) => left.score - right.score)[0].event;
  }

  function pickRandomEvent(state, seed) {
    const contextual = buildContextualEvents(state)
      .filter((event) => !state.usedEvents.includes(event.id));
    const urgent = contextual.find((event) => (
      event.id === 'context-health-report'
      && ((state.stats && state.stats.anxiety >= 80) || (state.stats && state.stats.health <= 25))
    ));
    if (urgent) return urgent;
    if (contextual.length && seededRandom(seed + state.turnCount + 71) < 0.72) {
      return pickDirectedEvent(state, contextual, seed + 97, 'contextual');
    }
    const available = EVENTS.filter((event) => !state.usedEvents.includes(event.id));
    const pool = available.length ? available : EVENTS;
    return pickDirectedEvent(state, pool, seed + 13, 'ambient');
  }

  function getRandomEventChance(state, baseChance) {
    const limit = state && state.firstRun ? FIRST_RUN_EVENT_GRACE_TURNS : OPENING_EVENT_GRACE_TURNS;
    if (state && (state.turnCount || 0) <= limit) {
      return 0;
    }
    let chance = baseChance;
    if (state && state.dailyChallenge && state.dailyMutator && state.dailyMutator.id === 'chaos-sunday') {
      chance *= 2.0;
    }
    return chance;
  }

  function applyEvent(state, event) {
    const next = cloneState(state);
    const statsBefore = { ...next.stats };
    const timeBefore = next.timeLeft;
    const absurdDebtBefore = next.absurdDebt;
    const disruptionBefore = next.disruption;
    if (event.timeCost) {
      next.timeLeft = Math.max(0, next.timeLeft - event.timeCost);
    }
    applyDelta(next.stats, event.effect, 0, 100);
    next.disruption = clamp(next.disruption + (event.disruption || 0), 0, 999);
    next.absurdDebt = clamp(next.absurdDebt + (event.absurdDebt || 0), 0, 100);
    next.usedEvents.push(event.id);
    next.history.push({
      turn: next.turnCount,
      id: event.id,
      name: event.text,
      category: 'event',
      quote: event.text,
      causality: event.causality || (event.type === 'disrupt' ? '一次会议沉默被留存在下一条时间线。' : ''),
      disruption: event.disruption || 0,
      absurdDebt: event.absurdDebt || 0,
      effect: { ...(event.effect || {}) },
      timeCost: event.timeCost || 0,
      statsBefore,
      statsAfter: { ...next.stats },
      timeBefore,
      timeAfter: next.timeLeft,
      absurdDebtBefore,
      absurdDebtAfter: next.absurdDebt,
      disruptionBefore,
      disruptionAfter: next.disruption
    });
    return next;
  }

  function getDueConsequences(state) {
    return (state.pendingConsequences || []).filter((item) => item.dueTurn <= state.turnCount);
  }

  function takeDueConsequences(state) {
    const due = getDueConsequences(state);
    const future = (state.pendingConsequences || []).filter((item) => item.dueTurn > state.turnCount);
    let next = {
      ...cloneState(state),
      pendingConsequences: future.map((item) => ({ ...item, effect: { ...(item.effect || {}) } }))
    };
    due.forEach((event) => {
      next = applyEvent(next, event);
      next.pendingConsequences = next.pendingConsequences.filter((item) => item.id !== event.id);
    });
    return { state: next, events: due };
  }

  function buildTurnFeedback(previous, card, next) {
    const lines = card.processBeats && card.processBeats.length ? [...card.processBeats] : [card.quote];
    if (next.combo.count >= 2) {
      const label = CATEGORY_LABELS[next.combo.category] || next.combo.category;
      lines.push(`连续${next.combo.count}次${label}：系统开始怀疑你有自己的玩法。`);
    }
    const previousGoals = new Set(previous.claimedGoals || []);
    const newlyClaimed = (next.claimedGoals || []).filter((id) => !previousGoals.has(id));
    newlyClaimed.forEach((id) => {
      const goal = buildRunGoals(next).find((item) => item.id === id);
      if (goal) lines.push(`今日目标完成：${goal.label}，${goal.reward}`);
    });
    const routeNpcLine = buildRouteNpcFeedback(previous, card, next);
    if (routeNpcLine) lines.push(routeNpcLine);
    const phase = getLifePhase(next);
    lines.push(`${phase.title}：${phase.subtitle}`);
    return lines.slice(0, 5);
  }

  function buildRouteNpcFeedback(previous, card, next) {
    const route = buildRouteStatus(previous);
    if (!route.active || !route.categories.includes(card && card.category)) return null;
    const historyItem = [...((next && next.history) || [])]
      .reverse()
      .find((item) => item.id === card.id);
    const inertia = historyItem && historyItem.routeModifier
      ? (historyItem.routeModifier.label || '路线惯性')
      : '路线惯性';
    const lines = {
      work: `老板旁白：${inertia}已生效。你越快交付，“顺手也看下”越像自动续费。`,
      slack: `算法旁白：${inertia}已生效。它给你投喂“高效休息法”，连摸鱼都要被审计。`,
      social: `同事旁白：${inertia}已生效。你人真好，所以“帮我看一眼”开始排队。`,
      disrupt: `流程旁白：${inertia}已生效。你的问题很锋利，系统正在把它磨成专项会议。`
    };
    return lines[route.id] || null;
  }

  function checkDeath(state) {
    const death = DEATHS.find((item) => item.condition(state)) || null;
    if (death && state && state.firstRun && (state.turnCount || 0) < FIRST_RUN_DEATH_GRACE_TURNS && STAT_DEATH_IDS.has(death.id)) {
      return null;
    }
    return death;
  }

  function buildDeathRescueProfile(state, death) {
    const id = death && death.id;
    if (!state || !death) return null;
    if (id === 'anxiety-boom') {
      const value = state.stats.anxiety;
      return {
        label: '焦虑',
        reason: `焦虑 ${value}/100 已经爆炸，系统准备把你送走。`,
        effect: { anxiety: -Math.max(25, value - 84) },
        absurdDebt: 0,
        rescueText: '把爆炸压回胸口，改成一条还没发送的长消息',
        optionTitles: ['手机扣成墓碑', '制造更响的小事故', '向明天借半口气'],
        optionTexts: [
          '把手机扣在桌上，先假装世界没有红点。',
          '让一个小事故盖过焦虑爆炸，系统会先去看热闹。',
          '从不存在的明天借一点呼吸，今天先别炸。'
        ]
      };
    }
    if (id === 'spirit-crash') {
      const value = state.stats.spirit;
      return {
        label: '精神',
        reason: `精神 ${value}/100 已经断电，你开始和表格产生感情。`,
        effect: { spirit: Math.max(25, 18 - value) },
        absurdDebt: 0,
        rescueText: '往灵魂里临时塞一口糖和半句假安慰',
        optionTitles: ['往灵魂塞糖', '关掉第48行', '向明天借半格电'],
        optionTexts: [
          '给灵魂塞一颗糖，假装它还愿意开机。',
          '把 Excel 关掉，让第48行暂时停止凝视你。',
          '向明天借半格精神电量，代价是明天会来催债。'
        ]
      };
    }
    if (id === 'unlisted') {
      const value = state.stats.social;
      return {
        label: '社交',
        reason: `社交 ${value}/100 已经查无此人，奶茶群都快忘了你。`,
        effect: { social: Math.max(25, 18 - value) },
        absurdDebt: 0,
        rescueText: '在群里冒个泡，证明这只虫还在组织生态里',
        optionTitles: ['群里冒个泡', '制造存在感噪音', '向明天借个头像'],
        optionTexts: [
          '在群里发一个“收到”，证明你还没被通讯录蒸发。',
          '制造一点存在感噪音，让系统重新索引你。',
          '向明天借一个头像框，今天先别查无此人。'
        ]
      };
    }
    if (id === 'body-strike') {
      const value = state.stats.health;
      return {
        label: '健康',
        reason: `健康 ${value}/100 已经罢工，身体开始拒绝服务。`,
        effect: { health: Math.max(25, 18 - value) },
        absurdDebt: 0,
        rescueText: '给身体一点最低限度的人道主义维护',
        optionTitles: ['喝水并坐下', '制造体检小事故', '向明天借半条命'],
        optionTexts: [
          '喝水，坐下，向身体承认你不是纯软件。',
          '制造一个体检小事故，让身体把罢工改成警告。',
          '向明天借半条命，代价是体检报告会更会说话。'
        ]
      };
    }
    if (id === 'arranged-life') {
      const value = state.absurdDebt;
      return {
        label: '被安排度',
        reason: `被安排度 ${value}/100 已经满格，你快被做成流程样板。`,
        effect: {},
        absurdDebt: -Math.max(28, value - 84),
        rescueText: '撕掉一角流程表，让安排暂时找不到你的工位',
        optionTitles: ['撕掉流程角', '制造表格异常', '向明天借未归档人生'],
        optionTexts: [
          '撕掉流程表一角，让安排暂时找不到你的名字。',
          '制造一个表格异常，让流程先处理自己。',
          '向明天借一段未归档人生，今天先别当样板。'
        ]
      };
    }
    if (id === 'social-cremation') {
      const value = state.stats.social;
      return {
        label: '社交',
        reason: `社交 ${value}/100 已经过曝，黑历史准备上投影。`,
        effect: { social: -Math.max(18, value - 88) },
        absurdDebt: -4,
        rescueText: '把存在感调低一点，别让过去的你继续发光',
        optionTitles: ['撤回存在感', '关掉投影仪', '向明天借一张脸'],
        optionTexts: [
          '撤回一点存在感，让过去的你别继续公开发光。',
          '关掉投影仪，制造一个比黑历史更黑的黑屏。',
          '向明天借一张不尴尬的脸，今天先撑过团建。'
        ]
      };
    }
    if (id === 'false-enlightenment') {
      return {
        label: '假性顿悟',
        reason: '你太平静了，平静到系统以为你已经离职成功。',
        effect: { anxiety: 18, spirit: -8 },
        absurdDebt: 0,
        rescueText: '找回一点俗气焦虑，证明自己还没飞升',
        optionTitles: ['找回俗气焦虑', '制造尘世小事故', '向明天借一点未悟'],
        optionTexts: [
          '找回一点俗气焦虑，证明自己还在人间。',
          '制造一个尘世小事故，把飞升申请打回现实。',
          '向明天借一点未悟，今天先别把一切想通。'
        ]
      };
    }
    return null;
  }

  function buildDeathRescueOptions(state, death) {
    if (!state || !death || (state.flags && state.flags.deathRescueUsed)) return [];
    const profile = buildDeathRescueProfile(state, death);
    if (!profile) return [];

    const base = profile.effect || {};
    const reason = profile.reason;
    const aftershock = buildDeathRescueAftershock(death, profile);
    const titles = profile.optionTitles || ['申请五分钟', '制造小事故', '向明天借命'];
    const texts = profile.optionTexts || [
      `${profile.rescueText}。代价是向流程承认你需要喘气。`,
      `${profile.rescueText}。顺便让系统去处理一个更响的小麻烦。`,
      `${profile.rescueText}。蜉蝣没有明天，但待办系统假装有。`
    ];
    return [
      {
        id: 'ask-for-five-minutes',
        title: titles[0],
        text: texts[0],
        reason,
        effect: mergeEffect(base, { spirit: -4, social: -4 }),
        timeDelta: -0.25,
        disruption: 2,
        absurdDebt: profile.absurdDebt + 6,
        aftershock
      },
      {
        id: 'cause-smaller-accident',
        title: titles[1],
        text: texts[1],
        reason,
        effect: mergeEffect(base, { social: -8, health: -2 }),
        timeDelta: 0,
        disruption: 20,
        absurdDebt: profile.absurdDebt - 4,
        aftershock
      },
      {
        id: 'borrow-from-tomorrow',
        title: titles[2],
        text: texts[2],
        reason,
        effect: mergeEffect(base, { anxiety: 4, health: -3 }),
        timeDelta: 0.75,
        disruption: 4,
        absurdDebt: profile.absurdDebt + 16,
        aftershock
      }
    ];
  }

  function buildDeathRescueAftershock(death, profile) {
    const id = death && death.id;
    const fallback = {
      id: `death-rescue-aftershock-${id || 'unknown'}`,
      delayTurns: 2,
      emoji: '🚨',
      text: `抢救后遗症：你把「${death ? death.title : '死亡'}」改成待处理，但系统把这次异常记进了小本本。`,
      preview: '抢救后遗症将在2次选择后回访：系统要确认你为什么还活着。',
      effect: { anxiety: 8, spirit: -3 },
      timeCost: 0.25,
      disruption: 4,
      absurdDebt: 8,
      type: 'negative',
      causality: '临终抢救不是免费复活，只是把死亡改成一张会回访的工单。'
    };

    const byDeath = {
      'anxiety-boom': {
        text: '抢救后遗症：你扣下的手机没有安静，它在桌面下攒出一片红点。那条没发送的长消息开始自己呼吸。',
        preview: '抢救后遗症将在2次选择后回访：手机红点和未发送长消息一起复活。',
        effect: { anxiety: 12, spirit: -3 },
        absurdDebt: 8,
        causality: '你把焦虑压回胸口，焦虑学会了在手机下面排队。'
      },
      'social-cremation': {
        text: '抢救后遗症：你撤回了存在感，但投影仪记住了你的轮廓。茶水间开始流传“刚才是不是差点放出来了”。',
        preview: '抢救后遗症将在2次选择后回访：撤回的存在感会在茶水间冒泡。',
        effect: { social: -8, anxiety: 10 },
        disruption: 5,
        absurdDebt: 6,
        causality: '你关掉了投影仪，但黑历史已经学会了低亮度播放。'
      },
      'spirit-crash': {
        text: '抢救后遗症：灵魂被糖临时启动，半小时后开始反问“所以我们为什么还在这里”。',
        preview: '抢救后遗症将在2次选择后回访：临时开机的灵魂要电费。',
        effect: { spirit: -8, anxiety: 8 },
        absurdDebt: 6,
        causality: '你给精神塞了糖，精神决定把账单塞回来。'
      },
      unlisted: {
        text: '抢救后遗症：你在群里冒泡后，大家终于想起你了。三个“顺手看下”带着社交温度赶到现场。',
        preview: '抢救后遗症将在2次选择后回访：重新上线的人会收到补发人情账。',
        effect: { social: -5, anxiety: 9 },
        absurdDebt: 8,
        causality: '你证明自己还在，于是世界开始继续使用你。'
      },
      'body-strike': {
        text: '抢救后遗症：身体暂停罢工，但体检报告学会了弹窗。它说“建议规律作息”，语气像最后通牒。',
        preview: '抢救后遗症将在2次选择后回访：体检报告会加载第二页。',
        effect: { health: -7, anxiety: 8 },
        absurdDebt: 6,
        causality: '你给身体最低限度维护，身体给你最低限度警告。'
      },
      'arranged-life': {
        text: '抢救后遗症：被撕掉的流程角重新长出来，还多了一个“异常处理人：你”。',
        preview: '抢救后遗症将在2次选择后回访：流程表会自我修复并点名你。',
        effect: { spirit: -4, anxiety: 8 },
        absurdDebt: 14,
        disruption: 2,
        causality: '你从安排里逃出一秒，安排开始给逃跑写流程。'
      },
      'false-enlightenment': {
        text: '抢救后遗症：你找回了俗气焦虑，但顿悟残影还在。它轻声问：这份周报真的重要吗？',
        preview: '抢救后遗症将在2次选择后回访：顿悟残影会质疑你的周报。',
        effect: { spirit: -5, anxiety: 10 },
        disruption: 8,
        absurdDebt: 4,
        causality: '你没有飞升成功，于是飞升开始在工位旁边等你。'
      }
    };

    return {
      ...fallback,
      ...(byDeath[id] || {}),
      id: `death-rescue-aftershock-${id || 'unknown'}`,
      delayTurns: 2,
      emoji: (byDeath[id] && byDeath[id].emoji) || fallback.emoji,
      type: (byDeath[id] && byDeath[id].type) || fallback.type
    };
  }

  function buildDeathRescueStatus(state) {
    const used = Boolean(state && state.flags && state.flags.deathRescueUsed);
    if (used) {
      const lastDeath = DEATHS.find((item) => item.id === state.flags.lastDeathRescue);
      const title = lastDeath ? lastDeath.title : '一次死亡';
      return {
        used: true,
        available: false,
        tone: 'spent',
        tag: 'NO SECOND CHANCE',
        title: '临终抢救已用',
        text: `你已经把「${title}」改成待处理。本局没有第二次兜底，下一次阈值死亡会直接归档。`
      };
    }

    return {
      used: false,
      available: true,
      tone: 'ready',
      tag: 'ONE SAVE',
      title: '临终抢救未用',
      text: '第一次阈值死亡会先进入抢救窗口；寿终正寝和专属终局不在抢救范围。'
    };
  }

  function resolveDeathRescueOption(state, death, optionId) {
    const options = buildDeathRescueOptions(state, death);
    const option = options.find((item) => item.id === optionId) || options[0];
    if (!option) return cloneState(state);

    const next = cloneState(state);
    const statsBefore = { ...next.stats };
    const timeBefore = next.timeLeft;
    const absurdDebtBefore = next.absurdDebt;
    const disruptionBefore = next.disruption;

    next.timeLeft = Math.max(0, next.timeLeft + (option.timeDelta || 0));
    applyDelta(next.stats, option.effect, 0, 100);
    next.absurdDebt = clamp(next.absurdDebt + (option.absurdDebt || 0), 0, 100);
    next.disruption = clamp(next.disruption + (option.disruption || 0), 0, 999);
    next.flags.deathRescueUsed = true;
    next.flags.lastDeathRescue = death.id;
    if (option.aftershock) {
      next.pendingConsequences.push({
        ...option.aftershock,
        id: option.aftershock.id || `death-rescue-aftershock-${death.id}`,
        sourceCardId: `death-rescue-${death.id}`,
        sourceCardName: `临终抢救：${death.title}`,
        dueTurn: next.turnCount + (option.aftershock.delayTurns || 2),
        effect: { ...((option.aftershock && option.aftershock.effect) || {}) }
      });
    }
    next.history.push({
      turn: next.turnCount,
      id: `death-rescue-${death.id}`,
      name: `临终抢救：${option.title}`,
      category: 'event',
      quote: option.text,
      causality: `「${death.title}」已经举起章，你选择「${option.title}」把死亡改成待处理。`,
      disruption: option.disruption || 0,
      absurdDebt: option.absurdDebt || 0,
      effect: { ...(option.effect || {}) },
      timeCost: option.timeDelta < 0 ? Math.abs(option.timeDelta) : 0,
      statsBefore,
      statsAfter: { ...next.stats },
      timeBefore,
      timeAfter: next.timeLeft,
      absurdDebtBefore,
      absurdDebtAfter: next.absurdDebt,
      disruptionBefore,
      disruptionAfter: next.disruption
    });
    return next;
  }

  function buildDeathPostcard(state, death) {
    const resolved = death || checkDeath(state) || DEATHS[DEATHS.length - 1];
    return {
      id: resolved.id,
      title: resolved.title,
      rarity: resolved.rarity,
      emoji: resolved.emoji,
      color: resolved.color,
      epitaph: resolved.epitaph,
      turns: state.turnCount,
      timeLeft: state.timeLeft,
      disruption: state.disruption,
      absurdDebt: state.absurdDebt,
      artLabel: `${resolved.rarity} / ${resolved.title}`,
      shareText: `我在《蜉蝣哲学》里死于「${resolved.title}」：${resolved.epitaph}`
    };
  }

  function buildDeathThresholdText(state, death) {
    const id = death && death.id;
    if (id === 'anxiety-boom') return `焦虑 ${state.stats.anxiety}/100`;
    if (id === 'spirit-crash') return `精神 ${state.stats.spirit}/100`;
    if (id === 'unlisted') return `社交 ${state.stats.social}/100`;
    if (id === 'body-strike') return `健康 ${state.stats.health}/100`;
    if (id === 'arranged-life') return `被安排度 ${state.absurdDebt}/100`;
    if (id === 'natural' || id === 'true-sunset' || id === 'system-stutter') return `剩余寿命 ${formatCountdown(state.timeLeft)}`;
    return '死因阈值未归档';
  }

  function getDeathMetric(death) {
    const id = death && death.id;
    const metrics = {
      'anxiety-boom': { source: 'stats', key: 'anxiety', label: '焦虑', threshold: 100, direction: 'high' },
      'spirit-crash': { source: 'stats', key: 'spirit', label: '精神', threshold: 0, direction: 'low' },
      unlisted: { source: 'stats', key: 'social', label: '社交', threshold: 0, direction: 'low' },
      'body-strike': { source: 'stats', key: 'health', label: '健康', threshold: 0, direction: 'low' },
      'arranged-life': { source: 'state', key: 'absurdDebt', label: '被安排度', threshold: 100, direction: 'high' },
      natural: { source: 'state', key: 'timeLeft', label: '寿命', threshold: 0, direction: 'low' },
      'true-sunset': { source: 'state', key: 'timeLeft', label: '寿命', threshold: 0, direction: 'low' },
      'system-stutter': { source: 'state', key: 'timeLeft', label: '寿命', threshold: 0, direction: 'low' }
    };
    return metrics[id] || null;
  }

  function metricValues(item, metric) {
    if (!item || !metric) return null;
    if (metric.source === 'stats') {
      if (!item.statsBefore || !item.statsAfter) return null;
      return {
        before: item.statsBefore[metric.key],
        after: item.statsAfter[metric.key]
      };
    }
    if (metric.key === 'absurdDebt') {
      return {
        before: item.absurdDebtBefore,
        after: item.absurdDebtAfter
      };
    }
    if (metric.key === 'timeLeft') {
      return {
        before: item.timeBefore,
        after: item.timeAfter
      };
    }
    return null;
  }

  function isHarmfulMetricDelta(metric, before, after) {
    if (before === undefined || after === undefined) return false;
    if (metric.direction === 'high') return after > before;
    return after < before;
  }

  function crossesDeathThreshold(metric, before, after) {
    if (before === undefined || after === undefined) return false;
    if (metric.direction === 'high') return before < metric.threshold && after >= metric.threshold;
    return before > metric.threshold && after <= metric.threshold;
  }

  function formatMetricValue(metric, value) {
    if (metric.key === 'timeLeft') return formatCountdown(value || 0);
    return `${Math.round(value || 0)}/100`;
  }

  function formatMetricDelta(metric, before, after) {
    const delta = (after || 0) - (before || 0);
    if (metric.key === 'timeLeft') return `-${formatShortDuration(Math.abs(delta))}`;
    return `${delta > 0 ? '+' : ''}${Math.round(delta)}`;
  }

  function buildFatalBill(state, death) {
    const metric = getDeathMetric(death);
    if (!metric) return null;
    const items = [...((state && state.history) || [])].reverse();
    const contributorItems = [];
    let crossing = null;

    items.forEach((item) => {
      const values = metricValues(item, metric);
      if (!values) return;
      const { before, after } = values;
      if (!isHarmfulMetricDelta(metric, before, after)) return;
      const entry = {
        turn: item.turn,
        id: item.id,
        title: item.name || item.quote || item.id,
        before,
        after,
        delta: after - before
      };
      if (!crossing && crossesDeathThreshold(metric, before, after)) crossing = entry;
      if (contributorItems.length < 3) contributorItems.push(entry);
    });

    const culprit = crossing || contributorItems[0] || null;
    if (!culprit) return null;

    return {
      metric: metric.label,
      culprit,
      threshold: metric.threshold,
      summary: `${metric.label} ${formatMetricValue(metric, culprit.before)} -> ${formatMetricDelta(metric, culprit.before, culprit.after)} -> ${formatMetricValue(metric, culprit.after)}`,
      contributors: contributorItems.map((item) => ({
        ...item,
        beforeText: formatMetricValue(metric, item.before),
        afterText: formatMetricValue(metric, item.after),
        deltaText: formatMetricDelta(metric, item.before, item.after)
      }))
    };
  }

  function formatFatalBillEntry(metricLabel, entry) {
    if (!entry) return null;
    return `${entry.title}把${metricLabel}从${entry.beforeText}推到${entry.afterText}（${entry.deltaText}）。`;
  }

  function buildDeathReceipt(state, death, chain, thresholdText, fatalBill) {
    const resolved = death || DEATHS[DEATHS.length - 1];
    const rows = [];

    if (fatalBill && fatalBill.contributors && fatalBill.contributors.length) {
      const culprit = fatalBill.contributors.find((item) => (
        fatalBill.culprit
        && item.id === fatalBill.culprit.id
        && item.turn === fatalBill.culprit.turn
      )) || fatalBill.contributors[0];
      const previous = fatalBill.contributors
        .filter((item) => item !== culprit)
        .slice(0, 2);

      rows.push({
        label: '最后一脚',
        text: formatFatalBillEntry(fatalBill.metric, culprit)
      });
      rows.push({
        label: '前面埋雷',
        text: previous.length
          ? previous.map((item) => formatFatalBillEntry(fatalBill.metric, item)).join(' ')
          : '这次死亡主要由最后一个选择直接跨线，没有太多铺垫，人生偶尔也会这样不讲武德。'
      });
    } else {
      const last = chain[chain.length - 1];
      const earlier = chain.slice(0, -1).slice(-2);
      rows.push({
        label: '最后一脚',
        text: last ? `最后记录是「${last.title}」。` : '系统没有抓到最后一脚，只抓到你倒下的姿势。'
      });
      rows.push({
        label: '前面埋雷',
        text: earlier.length
          ? earlier.map((item) => `「${item.title}」`).join('、') + '把局面推到这里。'
          : '前面没有足够记录，这条命像很多需求一样缺少上下文。'
      });
    }

    rows.push({
      label: '终局判定',
      text: `${thresholdText}，所以触发「${resolved.title}」。这不是随机抽签，是账单到期。`
    });

    return {
      title: '为什么会到这个终局',
      rows
    };
  }

  function buildDeathExplanation(state, death) {
    const resolved = death || checkDeath(state) || DEATHS[DEATHS.length - 1];
    const chain = (state.history || [])
      .slice(-4)
      .map((item) => ({
        turn: item.turn,
        id: item.id,
        title: item.name || item.quote || item.id,
        detail: item.quote || item.causality || ''
      }));
    const last = chain[chain.length - 1];
    const thresholdText = buildDeathThresholdText(state, resolved);
    const fatalBill = buildFatalBill(state, resolved);
    const receipt = buildDeathReceipt(state, resolved, chain, thresholdText, fatalBill);
    const summary = fatalBill
      ? `致命账单：${fatalBill.summary}，触发「${resolved.title}」。`
      : last
        ? `最后把你推下去的是「${last.title}」，随后${thresholdText}触发了「${resolved.title}」。`
        : `${thresholdText}触发了「${resolved.title}」。`;

    return {
      deathId: resolved.id,
      title: resolved.title,
      thresholdText,
      culprit: last || null,
      chain,
      summary,
      fatalBill,
      receipt
    };
  }

  function buildConsequenceRisk(state, event) {
    const next = cloneState(state);
    if (event && event.timeCost) {
      next.timeLeft = Math.max(0, next.timeLeft - event.timeCost);
    }
    applyDelta(next.stats, (event && event.effect) || {}, 0, 100);
    next.disruption = clamp(next.disruption + ((event && event.disruption) || 0), 0, 999);
    next.absurdDebt = clamp(next.absurdDebt + ((event && event.absurdDebt) || 0), 0, 100);

    const death = checkDeath(next);
    if (death) {
      return {
        level: 'lethal',
        label: '可能致死',
        reason: buildDeathThresholdText(next, death)
      };
    }

    const danger = [];
    if (next.stats.anxiety >= 85) danger.push(`焦虑 ${next.stats.anxiety}/100`);
    if (next.stats.spirit <= 15) danger.push(`精神 ${next.stats.spirit}/100`);
    if (next.stats.social <= 15) danger.push(`社交 ${next.stats.social}/100`);
    if (next.stats.health <= 15) danger.push(`健康 ${next.stats.health}/100`);
    if (next.absurdDebt >= 85) danger.push(`被安排度 ${next.absurdDebt}/100`);
    if (next.timeLeft <= 4) danger.push(`寿命 ${formatCountdown(next.timeLeft)}`);

    if (danger.length) {
      return {
        level: 'danger',
        label: '高风险',
        reason: danger[0]
      };
    }

    return {
      level: 'mild',
      label: '可承受',
      reason: '暂时不会直接把你送走'
    };
  }

  function buildConsequenceResponses(state, event) {
    const risk = buildConsequenceRisk(state, event);
    const riskText = risk.level === 'lethal'
      ? '它现在可能直接要命。'
      : risk.level === 'danger'
        ? '它不一定杀你，但会把状态推到危险边缘。'
        : '它暂时只是难看，不算绝命。';
    const contextualResponses = getContextualConsequenceResponses(event, riskText);
    if (contextualResponses) return contextualResponses;
    return [
      {
        id: 'endure',
        strategy: 'endure',
        title: '硬扛',
        text: `照单全收，换一点搅局尊严。${riskText}`
      },
      {
        id: 'deflect',
        strategy: 'deflect',
        title: '甩锅给流程',
        text: '把一半伤害塞进流程里，代价是社交值和被安排度替你付账。'
      },
      {
        id: 'slack-buffer',
        strategy: 'slack-buffer',
        title: '摸鱼缓冲',
        text: '花半小时假装整理思路，把最致命的部分拖成可承受的尴尬。'
      }
    ];
  }

  function response(id, strategy, title, text, resolution) {
    return {
      id,
      strategy,
      title,
      text,
      ...((resolution && typeof resolution === 'object') ? resolution : {})
    };
  }

  function getContextualConsequenceResponses(event, riskText) {
    const id = event && event.id;
    const presets = {
      'boss-email': [
        response('open-mail-anyway', 'endure', '点开邮件', `${event.text} 你还是点开了，邮件正文像一只把门堵住的工牌。${riskText}`),
        response('ask-for-subject', 'deflect', '先问主题', '回复“方便先说重点吗”，让邮件先把自己压缩成人话。'),
        response('mark-unread', 'slack-buffer', '标成未读', '把邮件重新伪装成未来问题，至少现在的你还没签收。')
      ],
      'free-tea': [
        response('accept-free-tea', 'endure', '收下凑单奶茶', `${event.text} 你收下了，感动和糖分一起进账。${riskText}`),
        response('ask-who-paid', 'deflect', '问谁请的', '先确认付款人，避免温暖三分钟后变成人情账单。'),
        response('save-half-cup', 'slack-buffer', '留半杯续命', '把奶茶分成两段快乐，后半杯负责替明天的你假装振作。')
      ],
      'silent-room': [
        response('name-the-void', 'endure', '说出没意义', `${event.text} 你把“可能没意义”说出口，沉默从空气变成证据。${riskText}`),
        response('ask-cancel-meeting', 'deflect', '提议取消会议', '把无意义推进到取消议程，看看组织会不会心疼这间会议室。'),
        response('cough-and-drink', 'slack-buffer', '咳一声喝水', '用一声咳嗽给大家台阶，也给自己争取一点不表态的时间。')
      ],
      'kpi-update': [
        response('rewrite-kpi', 'endure', '重写自评口径', `${event.text} 你开始忙着解释为什么自己一直很忙。${riskText}`),
        response('ask-kpi-formula', 'deflect', '追问计算公式', '把KPI拖进公式解释里，让所有人一起承认看不懂。'),
        response('hide-in-dashboard', 'slack-buffer', '躲进仪表盘', '打开一个看起来很专业的图表，让焦虑先误以为你在工作。')
      ],
      'deadline-delay': [
        response('celebrate-too-early', 'endure', '提前庆祝', `${event.text} 你松了一口气，复盘会立刻把这口气收走。${riskText}`),
        response('lock-new-deadline', 'deflect', '锁死新截止日', '要求把延期写进日历，别让“再看看”继续吃掉寿命。'),
        response('take-real-break', 'slack-buffer', '真的休息十分钟', '趁复盘会还没长出来，先把身体从椅子里拔出来。')
      ],
      'snack-rebellion': [
        response('grab-cookie', 'endure', '拿最贵那包', `${event.text} 你拿了最贵那包，像在报销一点精神损失。${riskText}`),
        response('start-snack-ledger', 'deflect', '登记零食公约', '把零食补货变成公共制度，防止快乐被一个人偷偷吃完。'),
        response('pocket-for-later', 'slack-buffer', '藏一块备用', '把一块饼干留给未来的崩溃，未来至少会有点脆。')
      ],
      'calendar-ambush': [
        response('join-alignment', 'endure', '参加对齐会', `${event.text} 你参加了，对齐还没开始，你已经先歪了。${riskText}`),
        response('ask-align-what', 'deflect', '问对齐什么', '让对齐会先说清楚要对齐什么，空气里的歪斜短暂暴露。'),
        response('claim-conflict', 'slack-buffer', '撞会逃生', '在日历里制造一个更无害的冲突，让这场会先撞墙。')
      ],
      'anonymous-praise': [
        response('thank-anonymous', 'endure', '体面感谢', `${event.text} 你说谢谢，表扬信立刻变得像任务交接。${riskText}`),
        response('ask-scope-of-praise', 'deflect', '问表扬范围', '要求明确到底夸哪件事，防止夸奖自动扩展成新职责。'),
        response('let-praise-expire', 'slack-buffer', '假装没看见', '让匿名表扬在公告栏上自然风干，别让它趁热变成需求。')
      ],
      'sunset-leak': [
        response('stare-back', 'endure', '盯回那只虫', `${event.text} 你盯回去，玻璃里的小虫也像在等你下班。${riskText}`),
        response('ask-why-badge', 'deflect', '质问工牌', '你问玻璃里的工牌是谁发的，世界短暂没有准备好答案。'),
        response('step-away-window', 'slack-buffer', '离窗半步', '先离开反光，避免被另一个自己催着继续上岗。')
      ],
      'ai-model-update': [
        response('test-new-assistant', 'endure', '试用新助手', `${event.text} 你点开新版入口，发现效率提升首先体现在“你要重新学习它”。${riskText}`),
        response('keep-old-button', 'deflect', '保留旧按钮', '把新版入口钉回侧栏角落，要求它先证明自己不是新的学习成本。'),
        response('watch-demo-later', 'slack-buffer', '收藏演示视频', '把“十分钟上手”加入稍后再看，稍后已经堆成一座小山。')
      ],
      'ai-robot-colleague': [
        response('confirm-existence', 'endure', '确认本人存在', `${event.text} 你点击确认，流程机器人礼貌地把你加入待优化清单。${riskText}`),
        response('ask-human-owner', 'deflect', '问人类负责人', '让流程机器人先交出人类负责人，确认到底是谁在确认你。'),
        response('pretend-maintenance', 'slack-buffer', '假装它在维护', '你把机器人状态截图发群里，声称系统维护中，给本人争取一点手工时间。')
      ],
      'ai-weekly-fingerprint': [
        response('share-prompt-redacted', 'endure', '交出脱敏提示词', `${event.text} 你把提示词删到只剩“请显得积极”，仍然被夸可复用。${riskText}`),
        response('claim-manual-polish', 'deflect', '声称人工润色', '把助手痕迹改名成个人风格，让模板先背一会儿锅。'),
        response('write-one-human-line', 'slack-buffer', '手写一句废话', '亲手补一句“本周仍在努力”，证明你至少参与过自己的疲惫。')
      ],
      'ai-citation-ghost': [
        response('defend-ghost-paper', 'endure', '捍卫幽灵白皮书', `${event.text} 你说“来源应该在附件里”，附件沉默得像没有出生过。${riskText}`),
        response('downgrade-to-opinion', 'deflect', '改成个人观点', '把不存在的出处改成“行业观察”，让真相从引用降级成语气。'),
        response('ask-deep-whale-again', 'slack-buffer', '再问深潜鲸', '你要求深潜鲸自查来源。它很快生成了一份更像真的道歉。')
      ],
      'ai-minutes-betrayal': [
        response('accept-action-item', 'endure', '认领纪要任务', `${event.text} 你认领了，会议机器人像终于找到主人一样开心。${riskText}`),
        response('quote-audio-proof', 'deflect', '索要原声证据', '要求回放你到底哪一秒承诺了推进，沉默第一次拥有辩护权。'),
        response('blame-bot-summary', 'slack-buffer', '甩给自动摘要', '你说“机器人理解偏了”，会议室短暂相信机器也会乱卷。')
      ],
      'ai-comfort-subscription': [
        response('continue-mood-check', 'endure', '继续情绪打卡', `${event.text} 你打了卡，系统说你连续崩溃两天，值得奖励。${riskText}`),
        response('delete-mood-template', 'deflect', '删除情绪模板', '把“今天感受如何”删掉，拒绝让崩溃成为标准化字段。'),
        response('answer-with-sticker', 'slack-buffer', '用表情糊弄', '发一个微笑表情给圆宝搜答，让情绪先伪装成已处理。')
      ],
      'route-ai-prompt-debt': [
        response('write-perfect-prompt', 'endure', '重写完美提示词', `${event.text} 你写了半小时提示词，最后发现需求没变清楚，只变长了。${riskText}`),
        response('ask-for-real-owner', 'deflect', '追问真实需求方', '把“你到底想要什么”转发给需求源头，让外包链第一次反向流动。'),
        response('paste-bad-example', 'slack-buffer', '贴一个反例', '你丢给万问工位一个“不要这样”的例子，至少它暂时不再猜你的灵魂。')
      ],
      'route-ai-hallucination-stack': [
        response('pick-confident-answer', 'endure', '选最自信那份', `${event.text} 你选了语气最稳的答案，稳得像一扇画在墙上的门。${riskText}`),
        response('make-source-table', 'deflect', '做来源对照表', '把三份答案拆成来源表，幻觉开始排队接受点名。'),
        response('ask-human-sanity-check', 'slack-buffer', '找人类看一眼', '你拉来同事做常识校验，同事说“我也问问助手”，循环变圆了。')
      ],
      'route-ai-agent-replacement': [
        response('accept-agent-seat', 'endure', '接受代理席位', `${event.text} 你坐进代理席位，系统问你的本人是否需要保留。${riskText}`),
        response('ask-human-signoff', 'deflect', '要求人工签字', '你要求所有代理决策必须有人签字，机器人们开始互相寻找人。'),
        response('pull-virtual-cable', 'slack-buffer', '拔虚拟网线', '你假装断开代理网络。已读状态闪了一下，像最后一次眨眼。')
      ],
      'context-dnd-where-are-you': [
        response('reply-battery-low', 'endure', '回电量低', `${event.text} 你回“刚刚手机没电”，手机电量很满，灵魂不是。${riskText}`),
        response('ask-why-urgent', 'deflect', '问哪里急', '把“怎么没回”改成“到底哪件急”，让消息先排队。'),
        response('keep-dnd-on', 'slack-buffer', '继续勿扰', '把勿扰再续十分钟，群消息在门外学会了踱步。')
      ],
      'context-truth-clarification': [
        response('make-opening', 'endure', '上台开场', `${event.text} 你被迫开场，真话被做成PPT第一页。${riskText}`),
        response('ask-decision-owner', 'deflect', '问谁拍板', '让价值澄清先找拍板人，别把所有感触都塞回你身上。'),
        response('mute-truth', 'slack-buffer', '静音真话', '你说麦克风不稳，真话暂时躲进技术问题里保存体力。')
      ],
      'context-performance-self-review': [
        response('write-800-words', 'endure', '写满800字', `${event.text} 你继续写，像在给不存在的公平递交证明。${riskText}`),
        response('ask-evaluation-metric', 'deflect', '索要评价口径', '先问评分标准，让绩效系统解释自己怎么证明自己没有浪费你。'),
        response('paste-last-quarter', 'slack-buffer', '复制上季自评', '把上季度的疲惫粘贴过来，至少不用新写一种疲惫。')
      ],
      'context-life-voice-message': [
        response('play-voice-message', 'endure', '点开语音', `${event.text} 你点开了，亲情以59秒不可跳过广告形式抵达。${riskText}`),
        response('reply-already-ate', 'deflect', '回“吃了”', '先用“吃了”挡住人生追问，哪怕你还没想好自己图什么。'),
        response('text-back-later', 'slack-buffer', '文字稍后回', '把语音改成文字债务，至少不用当场听完56秒人生审计。')
      ],
      'context-health-report': [
        response('open-health-report', 'endure', '打开报告', `${event.text} 你打开了，建议复查四个字比老板还会安排。${riskText}`),
        response('book-recheck', 'deflect', '预约复查', '把恐惧转成一个号源，身体至少获得了排队资格。'),
        response('close-health-app', 'slack-buffer', '关掉报告', '先关掉体检App，报告还在，但它暂时不能直视你。')
      ],
      'death-rescue-aftershock-anxiety-boom': [
        response('face-down-phone', 'endure', '手机扣成墓碑', `${event.text} 你把手机扣下，红点在桌面下继续发光。${riskText}`),
        response('send-one-sentence', 'deflect', '只回一句人话', '把未发送长消息压成一句“我晚点看”，让焦虑先失去长篇幅。'),
        response('airplane-mode-breath', 'slack-buffer', '飞行模式呼吸', '开飞行模式，给灵魂制造一段非法离线。')
      ],
      'death-rescue-aftershock-social-cremation': [
        response('own-outline', 'endure', '承认轮廓', `${event.text} 你承认刚才差点公开处刑，茶水间终于有了新素材。${riskText}`),
        response('ask-witness-list', 'deflect', '问谁看见了', '把传言拆成目击名单，让八卦先自证来源。'),
        response('change-pantry-route', 'slack-buffer', '绕开茶水间', '换一条路线接水，让撤回的存在感暂时找不到你。')
      ],
      'death-rescue-aftershock-spirit-crash': [
        response('pay-soul-bill', 'endure', '支付灵魂电费', `${event.text} 你承认灵魂临时开机，电费贵得像订阅制人生。${riskText}`),
        response('ask-why-here', 'deflect', '反问为何在此', '把“为什么还在这里”退回给工位，让工位也参与哲学。'),
        response('sugar-reboot', 'slack-buffer', '补糖重启', '用半杯甜饮料给灵魂续航，虽然续的是试用版。')
      ],
      'death-rescue-aftershock-unlisted': [
        response('reply-three-favors', 'endure', '逐个顺手看', `${event.text} 你逐个回应，存在感回来了，连售后也一起回来。${riskText}`),
        response('make-favor-queue', 'deflect', '做人情排队号', '把三个顺手看下改成排队号，人情债终于需要取票。'),
        response('go-offline-again', 'slack-buffer', '再次下线', '趁大家刚想起你，立刻把在线状态调暗一点。')
      ],
      'death-rescue-aftershock-body-strike': [
        response('read-second-page', 'endure', '读第二页', `${event.text} 你翻到第二页，身体用医学术语写了一份辞职信。${riskText}`),
        response('book-real-rest', 'deflect', '预约真休息', '把“规律作息”改成日历事件，至少让身体看见一点诚意。'),
        response('close-report-breathe', 'slack-buffer', '合上报告呼吸', '先合上报告，给身体一点不被数据盯着的时间。')
      ],
      'death-rescue-aftershock-arranged-life': [
        response('sign-abnormal-owner', 'endure', '签异常处理人', `${event.text} 你签了名，流程表终于拥有一个可以怪的人。${riskText}`),
        response('tear-another-corner', 'deflect', '再撕一角', '把异常处理人那格撕掉，流程表开始怀疑自己的完整性。'),
        response('hide-under-process', 'slack-buffer', '躲进流程夹层', '钻进流程夹层里，安排暂时只能找到你的工牌影子。')
      ],
      'death-rescue-aftershock-false-enlightenment': [
        response('answer-weekly-report', 'endure', '认真回答周报', `${event.text} 你认真解释周报重要，顿悟残影露出同情的表情。${riskText}`),
        response('ask-importance-back', 'deflect', '反问重要性', '把“周报重要吗”发回系统，让系统第一次被迫自我怀疑。'),
        response('do-small-earthly-thing', 'slack-buffer', '做点俗事', '去倒水、回消息、摸一下工牌，证明自己还没完全飞升。')
      ],
      'memory-anxiety-inbox': [
        response('open-inbox-memory', 'endure', '打开前世红点', `${event.text} 你打开它，前世的焦虑像自动登录一样回来。${riskText}`),
        response('sort-red-dots', 'deflect', '给红点分类', '把老板、房东、体检中心分成三栏，至少恐惧开始有标签。'),
        response('mute-ancestral-inbox', 'slack-buffer', '静音前世收件箱', '让前世红点先安静十分钟，今生需要一点启动时间。')
      ],
      'memory-template-seat': [
        response('sit-in-template-seat', 'endure', '坐进样板工位', `${event.text} 你坐下了，流程示范卡开始介绍你的可替代性。${riskText}`),
        response('edit-demo-card', 'deflect', '改示范卡备注', '在示范卡上补一句“本人不可选装”，虽然字号很小。'),
        response('swap-seat-tag', 'slack-buffer', '换掉工位牌', '把工位牌转个方向，让新人暂时分不清你和插件。')
      ],
      'memory-agent-seat': [
        response('let-agent-log-in', 'endure', '让代理登录', `${event.text} 你让代理先上，它很快把“本人”列为低频功能。${riskText}`),
        response('demand-manual-mode', 'deflect', '要求手动模式', '你要求切回手动模式，万问工位弹出确认：“确定要降低效率吗？”'),
        response('rename-agent-you', 'slack-buffer', '把代理改名', '你把代理改名为“我暂时不在”，至少让背锅对象更诚实一点。')
      ],
      'memory-away-status': [
        response('accept-away-status', 'endure', '接受暂离身份', `${event.text} 你接受了，状态比本人更快适应公司。${riskText}`),
        response('question-auto-leave', 'deflect', '质疑自动请假', '要求考勤系统解释它为什么比你更懂你的离席。'),
        response('nudge-jacket-memory', 'slack-buffer', '挪动前世外套', '让外套换个姿势，今生的你争取一点疑似在场。')
      ],
      'memory-icebreaker': [
        response('perform-icebreaker', 'endure', '配合破冰', `${event.text} 你配合活跃气氛，前世黑历史获得续播权。${riskText}`),
        response('ask-material-source', 'deflect', '追问素材来源', '把团建素材库推上证人席，让它解释为什么认识刚出生的你。'),
        response('order-team-dessert', 'slack-buffer', '用甜点断片', '立刻发起甜点拼单，让破冰流程被糖分打断。')
      ],
      'memory-taskforce': [
        response('continue-last-meeting', 'endure', '延续上次讨论', `${event.text} 你接着讨论，上一世的问题终于实现跨世代复用。${riskText}`),
        response('ask-taskforce-charter', 'deflect', '索要专项章程', '要求专项小组说明自己为何跨世追杀一只新虫。'),
        response('lose-room-link', 'slack-buffer', '假装会议链接失效', '让会议室预订先迷路，问题暂时找不到门牌。')
      ],
      'memory-calm-scare': [
        response('embrace-calm', 'endure', '拥抱可疑平静', `${event.text} 你继续平静，平静开始像一封没有标题的警告信。${riskText}`),
        response('name-calm-risk', 'deflect', '点名平静风险', '承认“我现在太平静了”，让顿悟失去偷袭资格。'),
        response('do-noisy-smalltalk', 'slack-buffer', '聊点废话', '故意说几句没营养的话，证明自己还在俗世频道。')
      ],
      'boss-small-thing': [
        response('reply-received', 'endure', '回“收到”', `接下六个附件，换一句“辛苦”。${riskText}`, {
          resolvedText: `${event.text} 你回了“收到”，附件像六块砖一样落到桌面上。老板回“辛苦”，辛苦没有变少，只是有了收据。`,
          resolvedCausality: '你把朋友圈的一个赞兑换成六个附件，系统把你登记为“晚上可用”。'
        }),
        response('ask-priority', 'deflect', '问优先级', '把“小事”拆成“先做哪个”，让锅回到流程表里转一圈。', {
          resolvedText: `${event.text} 你追问“哪个最急”。老板开始解释背景，解释到一半把两个人拉进群。小事变大了，但不再只压在你身上。`,
          resolvedCausality: '你没有直接接锅，而是把“小事”拆成优先级问题，流程表终于被迫承担了一点责任。'
        }),
        response('pretend-offline', 'slack-buffer', '假装离线', '手机倒扣，去接水。附件还在，但至少不会立刻把你送走。', {
          resolvedText: `${event.text} 你把手机倒扣，去接了一杯不存在的水。半小时后附件还在，但你的灵魂至少没有当场签收。`,
          resolvedCausality: '你用离线假象给自己争取了缓冲，老板的小事被拖成了一小段苟活时间。'
        })
      ],
      'ppt-final-resurrection': [
        response('rename-v18', 'endure', '另存第18版', `继续改，文件名再长一截。${riskText}`, {
          resolvedText: `${event.text} 你另存为第18版。文件名长到窗口装不下，像一条拖着尾巴的加班记录。`,
          resolvedCausality: '你继续相信“最终版”，最终版继续相信轮回。'
        }),
        response('ask-template', 'deflect', '要一份模板', '把“感觉不对”翻译成模板需求，让老板也参与一下玄学。', {
          resolvedText: `${event.text} 你问“有没有参考模板”。老板沉默了一下，发来三份互相矛盾的旧稿。混乱被分摊了。`,
          resolvedCausality: '你把玄学需求改写成模板问题，让“感觉”第一次被迫出示证件。'
        }),
        response('hide-in-backup', 'slack-buffer', '假装同步失败', '先说云盘没刷出来，给灵魂争取一点缓存时间。', {
          resolvedText: `${event.text} 你说云盘没同步。世界短暂相信了网络问题，你的精神趁机缓存了一口气。`,
          resolvedCausality: '你把版本地狱塞进同步延迟里，争取到一点不体面的喘息。'
        })
      ],
      'algorithm-backlash': [
        response('watch-sequel', 'endure', '看续集', `继续看“效率五法2”，把焦虑训练成会员。${riskText}`, {
          resolvedText: `${event.text} 你看完续集，又刷到“停止内耗的三个秘诀”。你收藏了它，并继续内耗。`,
          resolvedCausality: '你用学习的名义喂养算法，算法用自律的封面喂养焦虑。'
        }),
        response('save-to-later', 'deflect', '加入稍后再看', '把诱惑塞进收藏夹，让算法和未来的你互相伤害。', {
          resolvedText: `${event.text} 你点了“稍后再看”。算法失去即时胜利，转而把这份债务寄给未来的你。`,
          resolvedCausality: '你没有战胜短视频，只是把短视频改成了待办事项。'
        }),
        response('lock-screen', 'slack-buffer', '锁屏喝水', '强制黑屏半小时，短视频还在，但你暂时不在。', {
          resolvedText: `${event.text} 你锁屏去喝水。屏幕黑了，效率没有回来，但至少下一条没有继续替你选择人生。`,
          resolvedCausality: '你用物理黑屏切断算法回访，短暂夺回了半小时的注意力。'
        })
      ],
      'notification-avalanche': [
        response('mark-all-read', 'endure', '一键已读', `你一键清空红点，但红点已经在心里留下残影。${riskText}`, {
          resolvedText: `${event.text} 你点了一键已读。红点消失了，责任没有；它们只是从屏幕搬进了你的胃里。`,
          resolvedCausality: '你清空了未读，不等于清空了未回，消息瀑布在身体里继续流。'
        }),
        response('blame-signal', 'deflect', '怪网络', '说“刚刚信号不太好”，把未回消息甩给办公室宇宙射线。', {
          resolvedText: `${event.text} 你说“刚刚信号不太好”。同事半信半疑，开始讨论公司网络，责任短暂偏航。`,
          resolvedCausality: '你把未回消息解释成网络问题，组织注意力被路由器吸走了一部分。'
        }),
        response('extend-dnd', 'slack-buffer', '再静音十分钟', '继续静音，把消息瀑布关在门外，但门会越来越响。', {
          resolvedText: `${event.text} 你又静音十分钟。消息在门外排队，你在门内假装自己是不存在的。`,
          resolvedCausality: '你用更深的静音拖住消息瀑布，换来一点短期呼吸。'
        })
      ],
      'tomorrow-meeting-returns': [
        response('join-background-sync', 'endure', '同步背景', `你加入会议，听大家解释一个你活不到的明天。${riskText}`, {
          resolvedText: `${event.text} 你进会同步背景。背景越同步越厚，像给不存在的明天贴墙纸。`,
          resolvedCausality: '你承认了明天会议的合法性，日历系统开始继承你的寿命。'
        }),
        response('ask-agenda', 'deflect', '先要议程', '让穿越回来的会议先证明自己不是一团雾。', {
          resolvedText: `${event.text} 你问“议程是什么”。会议愣住了，因为它一直靠没有议程维持生命。`,
          resolvedCausality: '你要求议程，推迟的会议第一次被迫解释自己为什么存在。'
        }),
        response('send-notes', 'slack-buffer', '只发纪要', '发一句“我先看纪要”，让身体逃离会议，灵魂稍后补票。', {
          resolvedText: `${event.text} 你说先看纪要。会议没有抓到你的身体，只抓到一份迟来的文档影子。`,
          resolvedCausality: '你用纪要替身挡住穿越会议，争取到一段不完整但真实的空白。'
        })
      ],
      'meme-aftershock': [
        response('own-the-meme', 'endure', '认领梗图', `笑着说“活跃一下气氛”，社死会更完整。${riskText}`, {
          resolvedText: `${event.text} 你笑着说“活跃一下气氛”。气氛确实活了，主要活在别人截图里。`,
          resolvedCausality: '你主动认领梗图，社死从事故升级成个人品牌。'
        }),
        response('blame-sticker-pack', 'deflect', '甩给表情包包', '说“这个包自动弹出来的”，把锅甩给输入法和时代。', {
          resolvedText: `${event.text} 你解释是表情包包误触。大家没有完全相信，但开始讨论输入法为什么这么懂你。`,
          resolvedCausality: '你把表情包事故甩给输入法，组织第一次意识到软件也可能有性格。'
        }),
        response('vanish-from-pantry', 'slack-buffer', '避开茶水间', '绕路去接水，少收几道“你很勇”的眼神。', {
          resolvedText: `${event.text} 你绕开茶水间，少接收三道眼神。截图还在流动，但没有直接撞上你的脸。`,
          resolvedCausality: '你用空间回避降低社死伤害，表情包余震暂时没有找到你本人。'
        })
      ],
      'npc-boss-default-mention': [
        response('accept-mention', 'endure', '接住默认@', `你接住默认@，老板会更确信你是可复用接口。${riskText}`, {
          resolvedText: `${event.text} 你接住默认@。老板回了一个“辛苦”，随后又补一句“这个你也熟”。`,
          resolvedCausality: '你承认了默认@的合法性，老板把你从一个人升级成常用入口。'
        }),
        response('ask-owner-list', 'deflect', '要负责人清单', '把默认@改成负责人清单，让锅先在表格里排队。', {
          resolvedText: `${event.text} 你要了一份负责人清单。老板沉默了一下，表格出现了，默认@第一次被迫出示身份证。`,
          resolvedCausality: '你把默认@翻译成负责人清单，锅没有消失，但开始需要经过表格。'
        }),
        response('calendar-decoy', 'slack-buffer', '塞日程烟雾弹', '把日历塞满“对齐中”，让默认@先撞上时间墙。', {
          resolvedText: `${event.text} 你把日历塞满“对齐中”。老板的小事撞上日程墙，弹回去时小了一圈。`,
          resolvedCausality: '你用日程烟雾弹拖慢默认@，换来一小段不体面的呼吸。'
        })
      ],
      'npc-boss-silent-cc': [
        response('reply-all-carefully', 'endure', '谨慎回复全员', `你认真措辞，像在给每个标点买保险。${riskText}`, {
          resolvedText: `${event.text} 你谨慎回复全员。每个字都很体面，体面到没人愿意承认问题还在。`,
          resolvedCausality: '你在抄送风暴里保持礼貌，礼貌把伤害变成慢性。'
        }),
        response('ask-cc-purpose', 'deflect', '询问抄送目的', '让抄送先解释自己为什么存在，流程短暂露出空白。', {
          resolvedText: `${event.text} 你询问抄送目的。收件人列表突然安静，因为没人知道自己为什么在场。`,
          resolvedCausality: '你让抄送链自证必要性，老板的安静反击短暂卡壳。'
        }),
        response('draft-dont-send', 'slack-buffer', '写草稿不发送', '先把怒气写进草稿箱，至少别让它立刻变成证据。', {
          resolvedText: `${event.text} 你写了一封很锋利的草稿，然后没有发送。草稿箱替你活过三分钟。`,
          resolvedCausality: '你把反击关进草稿箱，保住一点社交残值。'
        })
      ],
      'npc-slacker-cover-shift': [
        response('cover-the-seat', 'endure', '帮他盯工位', `你替摸鱼搭子盯工位，快乐共享，审计也共享。${riskText}`, {
          resolvedText: `${event.text} 你帮他盯工位。两把椅子都像有人，只有你不像自己。`,
          resolvedCausality: '你接下盯工位义务，摸鱼搭子关系升温，离席审计也获得双人样本。'
        }),
        response('rotate-cover-duty', 'deflect', '制定轮班表', '把“帮我盯一下”改成轮班表，让审计风险平均摊薄。', {
          resolvedText: `${event.text} 你做了个轮班表。盯工位从人情变成制度，离席审计短暂不知道该先盯谁。`,
          resolvedCausality: '你把私人互助改造成轮班机制，摸鱼风险从单点暴露变成集体迷雾。'
        }),
        response('fake-water-run', 'slack-buffer', '假装接水巡逻', '拿杯子绕一圈，看起来像活着，也像忙着。', {
          resolvedText: `${event.text} 你拿着杯子假装接水巡逻。杯子很空，但你的不在场证明比较满。`,
          resolvedCausality: '你用接水动作制造移动掩护，审计没消失，只是暂时对不上焦。'
        })
      ],
      'npc-coworker-one-look': [
        response('look-once', 'endure', '真的看一眼', `你真的看一眼，然后那一眼长出了四个问题。${riskText}`, {
          resolvedText: `${event.text} 你真的看了一眼。那一眼打开了四个评论、两个截图和一句“你顺便也懂这个吧”。`,
          resolvedCausality: '你用善意支付人情账，售后服务自动开通。'
        }),
        response('trade-for-specifics', 'deflect', '先要具体问题', '把“看一眼”压缩成一个具体问题，售后范围终于有了边界。', {
          resolvedText: `${event.text} 你先要具体问题。同事发来三条，但至少不再把整个人生都叫“看一眼”。`,
          resolvedCausality: '你给看一眼加上范围，售后服务第一次有了边界。'
        }),
        response('milk-tea-buffer', 'slack-buffer', '奶茶缓冲', '先问喝什么，把求助现场改成点单现场。', {
          resolvedText: `${event.text} 你问“先喝什么？”队伍从问题排队变成奶茶排队，压力短暂变甜。`,
          resolvedCausality: '你用奶茶缓冲人情债，问题没有消失，但语气被糖分拖慢。'
        })
      ],
      'route-social-human-debt': [
        response('pay-human-debt', 'endure', '帮他看一眼', `把人情账单照单全收，今天的你很像共享资源。${riskText}`, {
          resolvedText: `${event.text} 你真的帮他看了一眼。那一眼打开了四个文档、两个截图和一段“很简单”的语音。`,
          resolvedCausality: '你偿还人情债，系统把“看一眼”定义为轻量级加班。'
        }),
        response('split-favor', 'deflect', '拉群对齐', '把“帮我看一眼”变成三个人都看一眼，伤害均摊但关系变薄。', {
          resolvedText: `${event.text} 你拉了个群。人情债被拆成多人协作，大家都受了一点伤，于是都不好意思怪你。`,
          resolvedCausality: '你把私人求助改造成群体流程，人情债失去了一部分命中率。'
        }),
        response('delay-with-milk-tea', 'slack-buffer', '用奶茶拖延', '先问“喝什么”，把求助改造成点单，争取一点喘息。', {
          resolvedText: `${event.text} 你问“先点杯喝的？”求助现场变成点单现场，问题还在，但语气短暂变甜。`,
          resolvedCausality: '你用奶茶稀释人情账单，拖延没有解决问题，但救下了一点精神值。'
        })
      ],
      'route-work-default-owner': [
        response('accept-owner', 'endure', '接默认负责人', `你接了，流程安心了，你不一定。${riskText}`, {
          resolvedText: `${event.text} 你接下默认负责人。飞书机器人松了一口气，随后又把两个没人认领的任务推给你。`,
          resolvedCausality: '你承认自己是默认负责人，系统从此更有礼貌地压榨你。'
        }),
        response('request-raci', 'deflect', '要求责任矩阵', '把默认负责人拆成RACI表，让责任在表格里迷路。', {
          resolvedText: `${event.text} 你要求责任矩阵。表格出现了，责任开始在R、A、C、I之间假装迷路。`,
          resolvedCausality: '你用责任矩阵拆掉默认负责人神话，锅没有消失，但第一次需要排队。'
        }),
        response('calendar-block', 'slack-buffer', '假装日程满了', '用一个假的会挡住真的锅，至少挡到下个回合。', {
          resolvedText: `${event.text} 你把日历塞满“对齐中”。锅撞上日程墙，反弹了一点，没有马上砸中你。`,
          resolvedCausality: '你用假会议挡住真责任，人生变短了，但结算慢了一拍。'
        })
      ],
      'route-work-okr-tax': [
        response('write-methodology', 'endure', '沉淀方法论', `你把痛苦写成SOP，供后来者继续痛苦。${riskText}`, {
          resolvedText: `${event.text} 你写了三页方法论。老板说很有复制价值，复制的第一份还是贴回你身上。`,
          resolvedCausality: '你把能扛写成方法论，组织终于拥有了可复用的压榨模板。'
        }),
        response('ask-for-scope', 'deflect', '限定适用范围', '你声明此方法只适用于“快死但还没死”的蜉蝣，让复制变得不那么顺手。', {
          resolvedText: `${event.text} 你要求限定适用范围。会议开始争论“快死”的定义，方法论暂时卡在术语表里。`,
          resolvedCausality: '你把方法论拖进适用范围讨论，复制机器短暂卡壳。'
        }),
        response('fake-case-study', 'slack-buffer', '编个案例', '你用匿名案例糊弄过去，案例看起来很完整，主要因为它不是真的。', {
          resolvedText: `${event.text} 你编了一个匿名案例。大家觉得很真实，因为每个人都以为说的是别人。`,
          resolvedCausality: '你用假案例拖住OKR方法论税，换来一点不诚实的喘息。'
        })
      ],
      'route-work-self-replacement': [
        response('approve-template', 'endure', '批准样板间', `你亲手确认了替代自己的流程。${riskText}`, {
          resolvedText: `${event.text} 你批准样板间上线。流程跑得很顺，顺到把你从流程图里擦掉。`,
          resolvedCausality: '你亲手确认了自己的替代方案，组织学会了没有你的高效。'
        }),
        response('add-human-note', 'deflect', '补一条人话备注', '你在SOP最后写“需要人判断”，系统把它归类为低优先级异常。', {
          resolvedText: `${event.text} 你补了一条“需要人判断”。模板把这句话折叠起来，默认不显示。`,
          resolvedCausality: '你试图把人塞回流程，流程把人折叠成可选项。'
        }),
        response('leave-jacket', 'slack-buffer', '留下外套', '你让外套继续坐班，自己短暂退出样板间。', {
          resolvedText: `${event.text} 你留下外套。新人以为这是沉浸式教学的一部分，甚至做了笔记。`,
          resolvedCausality: '你用外套延缓被优化，但样板间已经学会展示你的缺席。'
        })
      ],
      'route-slack-audit': [
        response('explain-bio-break', 'endure', '解释生理需求', `你认真解释，人类尊严被做成了表格。${riskText}`, {
          resolvedText: `${event.text} 你解释这是生理需求。系统认真点头，并新增了“生理需求平均时长”字段。`,
          resolvedCausality: '你试图用尊严回应审计，审计把尊严做成了指标。'
        }),
        response('ask-policy', 'deflect', '反问制度依据', '把热力图送回制度条款里，让审计先审计自己。', {
          resolvedText: `${event.text} 你反问制度依据。热力图被送去找制度背书，暂时没空继续盯着你。`,
          resolvedCausality: '你让审计先审计自己，摸鱼路线获得一段制度缝隙。'
        }),
        response('move-fish-spot', 'slack-buffer', '换个摸鱼点', '从厕所转移到楼梯间，风险降低，舒适度也降低。', {
          resolvedText: `${event.text} 你换到楼梯间摸鱼。空气差了点，但摄像头角度也差了点。`,
          resolvedCausality: '你牺牲舒适度换取存活率，摸鱼从享受变成了战术撤离。'
        })
      ],
      'route-slack-time-theft': [
        response('defend-staring', 'endure', '捍卫发呆权', `你解释发呆也是恢复生产力，对方把“发呆”记成待优化流程。${riskText}`, {
          resolvedText: `${event.text} 你捍卫发呆权。HR点头，并把发呆纳入“微休息效率评估”。`,
          resolvedCausality: '你为摸鱼辩护，摸鱼被组织吸收成新指标。'
        }),
        response('question-chart', 'deflect', '质疑饼图口径', '你问饼图分母是谁，审计开始寻找分母，暂时忘了寻找你。', {
          resolvedText: `${event.text} 你质疑饼图口径。审计现场开始争论分母，潜在产能暂时失去潜力。`,
          resolvedCausality: '你用统计口径反击审计，让饼图第一次怀疑自己。'
        }),
        response('micro-nap', 'slack-buffer', '闭眼重启', '你闭眼30秒，声称在重启大脑。大脑是否同意另说。', {
          resolvedText: `${event.text} 你闭眼30秒。饼图还在，但你的灵魂短暂退出了会议。`,
          resolvedCausality: '你用微睡眠缓冲产能审计，付出的是更精致的可疑感。'
        })
      ],
      'route-slack-permanent-away': [
        response('keep-away-status', 'endure', '保持暂离', `你不再解释自己在哪，状态替你活着。${riskText}`, {
          resolvedText: `${event.text} 你保持“暂离”。暂离两个字非常体面，体面到没人再确认你是否回来。`,
          resolvedCausality: '你把存在压缩成一个状态，状态比你本人更稳定。'
        }),
        response('schedule-return', 'deflect', '预约回来', '你在日历上写“稍后回来”，但稍后没有具体日期。', {
          resolvedText: `${event.text} 你预约回来。日历问具体时间，你填了“看情况”，情况没有看你。`,
          resolvedCausality: '你试图给离席设置归期，归期被人生自动延期。'
        }),
        response('move-jacket', 'slack-buffer', '挪动外套', '你让外套换个姿势，证明自己理论上还在。', {
          resolvedText: `${event.text} 你把外套挪了一下。考勤系统很感动，把你从“离席”改成“疑似离席”。`,
          resolvedCausality: '你用外套制造生命迹象，换来一点不可靠的存在感。'
        })
      ],
      'route-disrupt-immunity': [
        response('say-it-louder', 'endure', '再说大声点', `继续把真话扔进会议室，看看谁先眨眼。${riskText}`, {
          resolvedText: `${event.text} 你把真话又说了一遍。会议室安静到能听见KPI模板自动保存。`,
          resolvedCausality: '你正面冲撞组织免疫，真话伤到了系统，也反弹到了你身上。'
        }),
        response('quote-minutes', 'deflect', '引用会议纪要', '用它自己的话反击它，让组织免疫系统短暂卡壳。', {
          resolvedText: `${event.text} 你引用上一版会议纪要。组织试图反驳，发现那句话是它自己写的。`,
          resolvedCausality: '你用会议纪要反击会议纪要，系统出现一次可见卡顿。'
        }),
        response('mute-yourself', 'slack-buffer', '假装麦克风坏了', '让真话先躲进静音里，等下一次更准的时候再出来。', {
          resolvedText: `${event.text} 你假装麦克风坏了。真话没有死，只是在静音图标后面蹲了一会儿。`,
          resolvedCausality: '你把搅局延后到更合适的时刻，系统暂时失去抓手。'
        })
      ],
      'route-social-black-history': [
        response('laugh-at-old-self', 'endure', '自嘲旧自己', `你抢先开玩笑，笑声像创可贴，贴不住投影。${riskText}`, {
          resolvedText: `${event.text} 你抢先自嘲。大家笑了，旧朋友圈没有死，只是升级成了公共素材。`,
          resolvedCausality: '你用自嘲接住黑历史，接住了，也被它留下了手印。'
        }),
        response('ask-who-searched', 'deflect', '反问谁翻的', '你把问题从“你当年好尬”转成“谁这么闲”，会议室短暂道德反转。', {
          resolvedText: `${event.text} 你反问是谁翻出来的。会议室开始互相看，黑历史暂时失去唯一主角。`,
          resolvedCausality: '你把黑历史转成搜索动机问题，社交火力被迫分散。'
        }),
        response('hide-behind-milk-tea', 'slack-buffer', '用奶茶挡脸', '你发起奶茶拼单，让糖分暂时盖过尴尬。', {
          resolvedText: `${event.text} 你发起奶茶拼单。大家开始报糖度，未来可期暂时被三分糖淹没。`,
          resolvedCausality: '你用奶茶打断黑历史复活，社交灾难被甜味稀释了一点。'
        })
      ],
      'route-disrupt-clarification-loop': [
        response('answer-everyone', 'endure', '逐个回应', `你认真回应每个人，真话被切成很多小块，方便消化也方便丢失。${riskText}`, {
          resolvedText: `${event.text} 你逐个回应。每个人都觉得被尊重，问题本身被尊重到失踪。`,
          resolvedCausality: '你把真话分发给每个人，组织把它分散到没人需要负责。'
        }),
        response('pin-original-question', 'deflect', '钉住原问题', '你反复把讨论拉回原问题，会议纪要开始冒汗。', {
          resolvedText: `${event.text} 你把原问题钉在白板上。会议纪要试图绕开它，绕了三圈又撞回来。`,
          resolvedCausality: '你没有让澄清循环吞掉真话，系统出现更明显的卡顿。'
        }),
        response('strategic-silence', 'slack-buffer', '战略沉默', '你闭嘴看它们表演，真话躲在沉默里保存体力。', {
          resolvedText: `${event.text} 你选择沉默。大家讲了很多，最后发现没人回答你最开始那句。`,
          resolvedCausality: '你让澄清循环自我消耗，真话没有赢，但活到了下一轮。'
        })
      ],
      'route-social-public-material': [
        response('host-icebreaker', 'endure', '主持破冰', `你亲自介绍自己的黑历史，场面完整得像告别式。${riskText}`, {
          resolvedText: `${event.text} 你主持破冰。大家笑得很放松，主要因为被破的是你。`,
          resolvedCausality: '你把自己献给社交氛围，氛围终于有了燃料。'
        }),
        response('change-slide', 'deflect', '抢切下一页', '你切到公司价值观，尴尬被更大的尴尬覆盖。', {
          resolvedText: `${event.text} 你抢切到价值观页。大家突然安静，因为这页比黑历史更难面对。`,
          resolvedCausality: '你用公司价值观盖住个人黑历史，火力转移到更抽象的痛苦。'
        }),
        response('order-dessert', 'slack-buffer', '追加甜点', '你用甜点中断团建，糖分暂时拖住了投影仪。', {
          resolvedText: `${event.text} 你追加甜点。大家低头扫码，投影仪第一次输给了小程序。`,
          resolvedCausality: '你用甜点争取社交缓冲，但你的故事已经进入团建素材库。'
        })
      ],
      'route-disrupt-question-department': [
        response('join-taskforce', 'endure', '加入专项小组', `你加入了处理自己的小组，流程闭环得令人害怕。${riskText}`, {
          resolvedText: `${event.text} 你加入专项小组。第一场会的议题是如何定义你提出的问题，以及你本人。`,
          resolvedCausality: '你参与处理自己，组织完成一次漂亮的逻辑闭环。'
        }),
        response('ask-charter', 'deflect', '要求小组章程', '你让专项小组先证明自己有权专项，空气出现裂缝。', {
          resolvedText: `${event.text} 你要求小组章程。小组开始澄清小组为什么存在，澄清循环咬住了自己的尾巴。`,
          resolvedCausality: '你把问题还给专项小组，组织短暂变成自问自答机器。'
        }),
        response('mute-and-smile', 'slack-buffer', '静音微笑', '你不再说话，只留下一个像赞同又像告别的微笑。', {
          resolvedText: `${event.text} 你静音微笑。会议记录写“已充分沟通”，你的灵魂在括号里离场。`,
          resolvedCausality: '你用沉默逃过一轮澄清，但专项小组已经把你列入议程。'
        })
      ],
      'feishu-99-notifications': [
        response('read-and-reply-all', 'endure', '全读并回复', `你试图点开所有的飞书回复，手指在屏幕上滑出了摩擦生热的火星。${riskText}`),
        response('mark-all-read', 'deflect', '全部标记已读', '右键一键已读飞书，假装这99个催促从未在这个宇宙中发生过。'),
        response('pretend-network-error', 'slack-buffer', '断网遁', '在群里发个“网络不好，稍后看飞书”，直接给灵魂拔掉网线。')
      ],
      'projector-broken': [
        response('wait-patiently', 'endure', '等待会议修理', `你在会议室的黑暗中闭目养神，感觉这辈子都没这么平静过。${riskText}`),
        response('recommend-it-ticket', 'deflect', '提单会议IT报修', '在会议群里艾特IT，把黑屏的锅转给设备折旧。'),
        response('brainstorm-in-dark', 'slack-buffer', '闭眼风暴', '声称我们在“进行闭眼会议心流对齐”，摸鱼摸出了哲学高度。')
      ],
      'layoff-next-door': [
        response('work-harder', 'endure', '隔壁加倍干活自保', `你立刻新建了三个隔壁工作文档，企图用产出厚度构筑防线。${riskText}`),
        response('ask-internal-rumor', 'deflect', '打听隔壁消息', '悄悄发消息给小余，把隔壁裁员焦虑变成茶水间情报交易。'),
        response('stare-at-box', 'slack-buffer', '盯着箱子发呆', '你盯着隔壁地上的瓦楞纸箱，开始研究它的容积是否装得下自己的人生。')
      ],
      'canteen-inflation': [
        response('eat-anyway', 'endure', '食堂含泪付款', `你刷食堂卡结账，感觉吃下去的不是排骨，是打工人的尊严。${riskText}`),
        response('order-takeout-together', 'deflect', '拼食堂外卖', '在拼单群里艾特食堂所有人，用垃圾食品对抗资本涨价。'),
        response('eat-instant-noodles', 'slack-buffer', '换泡面糊弄', '买一桶食堂泡面，用三分钟的热水，给胃一次荒诞的交代。')
      ],
      'ex-coworker': [
        response('face-to-face-nod', 'endure', '对前任迎面点头', `你装出得体微笑点头，实际上前任让你的脚趾已经在地板上扣出了三室一厅。${riskText}`),
        response('report-hiring-bug', 'deflect', '反馈前任招聘漏洞', '询问HR为什么把前任招进来，质疑前任的背调和心理防线。'),
        response('escape-to-stairwell', 'slack-buffer', '逃避前任进通道', '在楼梯间里躲前任二十分钟，听着隔壁水管流动的声音，感受纯粹的逃避。')
      ],
      'office-plant-death': [
        response('bury-in-bin', 'endure', '扔掉发财树', `你把死发财树连盆扔掉，感觉发财的自己也在以某种方式被清理。${riskText}`),
        response('report-asset-loss', 'deflect', '提报发财资产报损', '填写发财树资产报损单，声称发财树因“风水及超标辐射”英勇牺牲。'),
        response('mourn-with-water', 'slack-buffer', '给发财树浇水', '对着发财树枯枝浇了半杯凑单奶茶，祝发财树在天堂不用防辐射。')
      ]
    };
    return presets[id] || null;
  }

  function scaleBacklashEffect(effect, multiplier) {
    const next = {};
    Object.keys(effect || {}).forEach((key) => {
      const value = effect[key];
      const isHarmful = key === 'anxiety' ? value > 0 : value < 0;
      if (!isHarmful) {
        next[key] = value;
        return;
      }
      next[key] = value > 0 ? Math.ceil(value * multiplier) : Math.floor(value * multiplier);
    });
    return next;
  }

  function mergeEffect(effect, extra) {
    const next = { ...(effect || {}) };
    Object.keys(extra || {}).forEach((key) => {
      next[key] = (next[key] || 0) + extra[key];
    });
    return next;
  }

  function buildResolvedConsequenceEvent(event, responseId) {
    const resolvedResponse = getContextualConsequenceResponses(event, '')?.find((item) => item.id === responseId);
    const strategy = (resolvedResponse && resolvedResponse.strategy) || responseId;
    const customText = resolvedResponse && resolvedResponse.resolvedText;
    const customCausality = resolvedResponse && resolvedResponse.resolvedCausality;
    const contextualText = resolvedResponse
      ? `${event.text} 你选择「${resolvedResponse.title}」。${resolvedResponse.text}`
      : null;
    const contextualCausality = resolvedResponse
      ? `${event.causality || event.text} 这次旧账被你用「${resolvedResponse.title}」改写，留下了更具体的分岔。`
      : null;
    const base = {
      ...event,
      effect: { ...((event && event.effect) || {}) }
    };
    if (strategy === 'deflect') {
      return {
        ...base,
        text: customText || contextualText || `${event.text} 你把它转发进“流程待确认”，世界沉默了一下，但同事记住了。`,
        effect: mergeEffect(scaleBacklashEffect(event.effect, 0.5), { social: -6 }),
        disruption: (event.disruption || 0) + 4,
        absurdDebt: (event.absurdDebt || 0) + 6,
        causality: customCausality || contextualCausality || `${event.causality || event.text} 你把旧账甩给流程，流程把你登记成风险资产。`
      };
    }
    if (strategy === 'slack-buffer') {
      return {
        ...base,
        text: customText || contextualText || `${event.text} 你先去接水，回来后灾难还在，但它已经凉了一点。`,
        effect: mergeEffect(scaleBacklashEffect(event.effect, 0.25), { spirit: 4, anxiety: -4 }),
        timeCost: (event.timeCost || 0) + 0.5,
        disruption: (event.disruption || 0) + 2,
        absurdDebt: Math.max(0, (event.absurdDebt || 0) - 2),
        causality: customCausality || contextualCausality || `${event.causality || event.text} 你用摸鱼缓冲旧账，代价是人生又少了半小时。`
      };
    }
    return {
      ...base,
      text: customText || contextualText || base.text,
      causality: customCausality || contextualCausality || base.causality
    };
  }

  function resolveConsequenceResponse(state, event, responseId) {
    const responses = buildConsequenceResponses(state, event);
    const response = responses.find((item) => item.id === responseId || item.strategy === responseId);
    const selectedId = response ? response.id : responseId;
    const future = (state.pendingConsequences || [])
      .filter((item) => item.id !== event.id)
      .map((item) => ({ ...item, effect: { ...(item.effect || {}) } }));
    let next = {
      ...cloneState(state),
      pendingConsequences: future
    };
    next.history.push({
      turn: next.turnCount,
      id: `response-${event.id}`,
      name: `应对后果：${response ? response.title : responseId}`,
      category: 'event',
      quote: response ? response.text : responseId,
      causality: `「${event.sourceCardName || event.text}」的旧账回访时，你选择了「${response ? response.title : responseId}」。`,
      disruption: 0,
      absurdDebt: 0
    });
    next = applyEvent(next, buildResolvedConsequenceEvent(event, selectedId));
    next.pendingConsequences = next.pendingConsequences.filter((item) => item.id !== event.id);
    return next;
  }

  function hasHistoryEvent(state, id) {
    return (state.history || []).some((item) => item.id === id);
  }

  function buildPersonalityReport(state) {
    const total = Math.max(1, Object.values(state.categoryCounts).reduce((sum, count) => sum + count, 0));
    const ratio = (category) => (state.categoryCounts[category] || 0) / total;
    let type = '完美无用者';
    let tagline = '你什么都刚刚好，除了人生。';
    let signatureArc = null;

    const anxietyHistory = state.history.map(h => h.statsAfter ? h.statsAfter.anxiety : null).filter(a => a !== null);
    const avgAnxiety = anxietyHistory.length ? anxietyHistory.reduce((sum, val) => sum + val, 0) / anxietyHistory.length : state.stats.anxiety;

    const totalChoices = state.history.filter(h => h.category !== 'event' && h.category !== 'combo').length;
    const highCostChoices = state.history.filter(h => {
      if (h.category === 'event' || h.category === 'combo') return false;
      const hasHighTime = h.timeCost >= 2;
      const hasHighLoss = h.effect && Object.values(h.effect).some(v => v <= -10);
      const hasHighDebt = h.absurdDebt >= 15;
      return hasHighTime || hasHighLoss || hasHighDebt;
    }).length;
    const highCostRatio = totalChoices > 0 ? highCostChoices / totalChoices : 0;

    if (hasHistoryEvent(state, 'meme-aftershock')) {
      type = '撤回失败艺术家';
      tagline = '你相信撤回能抹平一切，茶水间不同意。';
      signatureArc = 'meme-aftershock';
    } else if (hasHistoryEvent(state, 'boss-small-thing')) {
      type = '朋友圈在岗证明';
      tagline = '你点了一个赞，老板看见了一个小事。';
      signatureArc = 'boss-small-thing';
    } else if (hasHistoryEvent(state, 'ppt-final-resurrection')) {
      type = '版本地狱居民';
      tagline = '你写下最终版，最终版当场复活。';
      signatureArc = 'ppt-final-resurrection';
    } else if ((state.categoryCounts.ai || 0) >= 3 || hasHistoryEvent(state, 'route-ai-prompt-debt')) {
      type = '提示词外包虫';
      tagline = '你没有偷懒，你只是把灵魂改成了可调用接口。';
      signatureArc = hasHistoryEvent(state, 'ai-minutes-betrayal') ? 'ai-minutes-betrayal' : 'route-ai-prompt-debt';
    } else if (state.disruption >= 100) {
      type = '反制度小虫';
      tagline = '你没有推翻世界，但你让它尴尬了一下。';
    } else if (ratio('work') >= 0.45 || state.absurdDebt >= 70) {
      type = '卷王蜉蝣';
      tagline = '你把24小时活成了24个deadline。';
    } else if (ratio('slack') >= 0.4) {
      type = '摸鱼仙人';
      tagline = '你没赢过世界，但也没怎么输。';
    } else if (ratio('social') >= 0.35) {
      type = '社交烟花';
      tagline = '你照亮了所有人，也炸伤了自己。';
    } else if (state.flags.sunsetSeen) {
      type = '黄昏观察者';
      tagline = '你终于没有优化任何东西。';
    } else if (ratio('phone') >= 0.35) {
      type = '信息溺水者';
      tagline = '你知道很多事，但没有一件帮你活下去。';
    } else if (ratio('think') >= 0.3) {
      type = '蜉蝣哲学练习生';
      tagline = '你悟了一点，但世界照常开会。';
    } else if (avgAnxiety >= 70) {
      type = '焦虑永动机';
      tagline = '你的焦虑比你的寿命还持久';
    } else if (highCostRatio >= 0.6) {
      type = '赌徒蜉蝣';
      tagline = '你把生命当成了一场豪赌';
    }

    return {
      type,
      tagline,
      timeSplit: Object.keys(state.categoryCounts).map((category) => ({
        category,
        label: CATEGORY_LABELS[category] || category,
        count: state.categoryCounts[category],
        percent: Math.round(ratio(category) * 100)
      })),
      disruption: state.disruption,
      absurdDebt: state.absurdDebt,
      signatureArc
    };
  }

  function buildEndgameReview(state) {
    if (!state || !state.history) {
      return {
        routeCompletion: 0,
        proactivity: 100,
        scapegoatIndex: 0,
        scapegoatLabel: '无所事事',
        scapegoatDesc: '你甚至没开始上班就结束了。',
        debtBreakdown: { work: 0, ai: 0, slack: 0, social: 0, other: 0 },
        debtDominant: '无',
        debtDominantDesc: '没有产生任何债务，这很不现代。',
        grade: 'F',
        gradeExplain: '试用期未过即淘汰，不留痕迹。'
      };
    }

    const history = state.history || [];
    const totalCount = history.length || 1;
    const activeCount = history.filter((item) => item.category && item.category !== 'event').length;
    const eventCount = history.filter((item) => item.category === 'event').length;

    // 1. Proactivity
    const proactivity = Math.round((activeCount / totalCount) * 100);

    // 2. Scapegoat Index
    const scapegoatIndex = Math.min(100, eventCount * 12);
    let scapegoatLabel = '完美闪避';
    let scapegoatDesc = '你滑得像抹了油，所有待办和黑锅都在你身边物理弹开。';
    if (scapegoatIndex > 15 && scapegoatIndex <= 45) {
      scapegoatLabel = '日常接锅手';
      scapegoatDesc = '在茶水间和会议的边缘偶尔顶包，虽然叹气但还能应付。';
    } else if (scapegoatIndex > 45 && scapegoatIndex <= 75) {
      scapegoatLabel = '资深背锅侠';
      scapegoatDesc = '你的工牌上挂满了无主的需求与责任，成为了团队的中流砥柱（指最容易被问责那个）。';
    } else if (scapegoatIndex > 75) {
      scapegoatLabel = '背锅大宗师';
      scapegoatDesc = '你已经把背锅升华为艺术，公司流程因为你承受了所有，简直是系统运行的血肉地基。';
    }

    // 3. Route Completion
    const route = buildRouteStatus(state);
    const routeCount = route.active ? route.count : 0;
    const routeCompletion = Math.min(100, Math.round((routeCount / 7) * 100));

    // 4. Absurd Debt Breakdown
    let workDebt = 0;
    let aiDebt = 0;
    let slackDebt = 0;
    let socialDebt = 0;
    let otherDebt = 0;

    history.forEach((item) => {
      const debt = item.absurdDebt || 0;
      if (debt <= 0) return;
      if (item.category === 'work' || item.category === 'meeting') {
        workDebt += debt;
      } else if (item.category === 'ai') {
        aiDebt += debt;
      } else if (item.category === 'slack' || item.category === 'phone') {
        slackDebt += debt;
      } else if (item.category === 'social') {
        socialDebt += debt;
      } else {
        otherDebt += debt;
      }
    });

    const totalDebt = workDebt + aiDebt + slackDebt + socialDebt + otherDebt || 1;
    const debtBreakdown = {
      work: Math.round((workDebt / totalDebt) * 100),
      ai: Math.round((aiDebt / totalDebt) * 100),
      slack: Math.round((slackDebt / totalDebt) * 100),
      social: Math.round((socialDebt / totalDebt) * 100),
      other: Math.round((otherDebt / totalDebt) * 100)
    };

    let debtDominant = '无';
    let debtDominantDesc = '本局没有背上任何荒诞债，清白得不像是现代职场人。';
    const maxVal = Math.max(workDebt, aiDebt, slackDebt, socialDebt, otherDebt);
    if (maxVal > 0) {
      if (maxVal === workDebt) {
        debtDominant = '会议内卷';
        debtDominantDesc = '你在无尽的PPT地狱和对齐会里反复被摩擦，完成了灵肉的双重消磨。';
      } else if (maxVal === aiDebt) {
        debtDominant = '提示词负债';
        debtDominantDesc = '你把灵魂和脑力外包给了大模型，省下的时间全部变成了“代写周报”的巨额提示词利息。';
      } else if (maxVal === slackDebt) {
        debtDominant = '摆烂反噬';
        debtDominantDesc = '在厕所和假IDE的庇护下，你积累了巨额的良心债与拖延税，最终还是被离席热力图逮捕。';
      } else if (maxVal === socialDebt) {
        debtDominant = '朋友圈人情';
        debtDominantDesc = '你为了虚无的职场关系四处点赞社交，每一口奶茶都暗中标记好了人情债单的利息。';
      } else {
        debtDominant = '随机事故';
        debtDominantDesc = '命运的黑天鹅总是挑你下手，哪怕是不起眼的小动作也能衍生出巨额债单。';
      }
    }

    // 5. Grade
    let grade = 'B';
    let gradeExplain = '合格的系统燃料，完成了中规中矩的消耗。';
    if (state.turnCount < 5) {
      grade = 'F';
      gradeExplain = '试用期未过即淘汰，不留痕迹。';
    } else if (state.disruption >= 120 || routeCompletion === 100) {
      grade = 'S';
      gradeExplain = '让系统严重卡顿的搅局先驱，甚至惊动了决策层。';
    } else if (proactivity >= 85 && routeCompletion >= 70) {
      grade = 'A';
      gradeExplain = '自我驱动的优秀牛马，积极承接了大量待办。';
    } else if (scapegoatIndex >= 70) {
      grade = 'C';
      gradeExplain = '默认附件接收器，替团队承受了太多的沉重。';
    } else if (state.stats && state.stats.spirit >= 50 && state.stats.health >= 50) {
      grade = 'B+';
      gradeExplain = '养生摸鱼专家，以极高的状态存活，摸鱼成仙。';
    }

    return {
      routeCompletion,
      proactivity,
      scapegoatIndex,
      scapegoatLabel,
      scapegoatDesc,
      debtBreakdown,
      debtDominant,
      debtDominantDesc,
      grade,
      gradeExplain
    };
  }

  function buildCausalityLedger(state) {
    const entries = state.history
      .filter((item) => item.causality)
      .slice(-3)
      .map((item) => item.causality);
    if (entries.length) return entries;
    return ['你没有留下太多痕迹。下一世的办公室照常运转，这件事本身就很可怕。'];
  }

  function formatCountdown(timeLeft) {
    const totalSeconds = Math.max(0, Math.round(timeLeft * 3600));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [hours, minutes, seconds]
      .map((part) => String(part).padStart(2, '0'))
      .join(':');
  }

  function formatWorldTime(state) {
    const limit = state.character && state.character.timeLimit ? state.character.timeLimit : 24;
    const elapsedSeconds = Math.max(0, Math.round((limit - state.timeLeft) * 3600));
    const minutesInDay = Math.floor(elapsedSeconds / 60) % (24 * 60);
    const hours = Math.floor(minutesInDay / 60);
    const minutes = minutesInDay % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  function formatLifeAge(state) {
    const limit = state.character && state.character.timeLimit ? state.character.timeLimit : 24;
    const elapsedMinutes = Math.max(0, Math.round((limit - state.timeLeft) * 60));
    const hours = Math.floor(elapsedMinutes / 60);
    const minutes = elapsedMinutes % 60;
    if (!hours) return `已活${minutes}分`;
    if (!minutes) return `已活${hours}小时`;
    return `已活${hours}小时${minutes}分`;
  }

  function getMentorQuip(state, card) {
    if (!card) return 'AI毒舌导师：别急，系统还没想好怎么安排你。';
    const route = buildRouteStatus(state);
    if (route.active && route.categories.includes(card.category)) {
      if (route.id === 'work') return 'AI毒舌导师：卷王路线启动。老板不是喜欢你，是喜欢“默认负责人”这个功能。';
      if (route.id === 'slack') return 'AI毒舌导师：摸鱼路线启动。算法开始投喂你，离席审计也在旁边热身。';
      if (route.id === 'social') return 'AI毒舌导师：社交路线启动。你以为在做人情，其实在人情账本上开了自动扣款。';
      if (route.id === 'ai') return 'AI毒舌导师：AI外包路线启动。你省下来的时间，正在被提示词债收购。';
      if (route.id === 'disrupt') return 'AI毒舌导师：搅局路线启动。你每说一句真话，流程就多长出一个表格。';
    }
    if (card.category === 'work') return 'AI毒舌导师：你又卷了。老板没哭，系统笑了。';
    if (card.category === 'slack') return 'AI毒舌导师：摸吧，快乐越多，寿命越像试用装。';
    if (card.category === 'ai') return 'AI毒舌导师：外包得很好。等它学会点头，你就只剩下工牌了。';
    if (card.category === 'disrupt') return 'AI毒舌导师：很好，会议室刚刚像旧电脑一样卡了一下。';
    if (card.category === 'think') return 'AI毒舌导师：别想太深，想明白了也不包延寿。';
    if (state.stats.anxiety >= 80) return 'AI毒舌导师：你的焦虑已经开始替你写遗嘱了。';
    return 'AI毒舌导师：别卷了，今晚就死，但可以死得有点风格。';
  }

  function buildMemorialComments(state, report) {
    const comments = [
      {
        speaker: '老板',
        avatar: '💼',
        text: state.npc.boss >= 60
          ? '他很努力，明天的会谁来开？'
          : '他想法很多，可惜流程不太允许。'
      },
      {
        speaker: '小余',
        avatar: '🐟',
        text: state.categoryCounts.slack
          ? '他走得很安详，手机还停在短视频。'
          : '早说一起摸鱼，也不至于这么累。'
      },
      {
        speaker: '老王',
        avatar: '📈',
        text: report.type === '卷王蜉蝣'
          ? '尊重，但我先卷了。'
          : '他选择了另一条路，绩效系统暂未收录。'
      }
    ];
    if (state.disruption >= 80) {
      comments.push({
        speaker: 'HR小吴',
        avatar: '🗂',
        text: '他的记录删不干净，系统提示因果残留。'
      });
    }
    return comments;
  }

  function routeById(routeId) {
    return LIFE_ROUTES.find((route) => route.id === routeId) || LIFE_ROUTES[0];
  }

  function routeIdFromReport(report) {
    const type = report && report.type;
    if (type === '卷王蜉蝣' || type === '版本地狱居民' || type === '朋友圈在岗证明') return 'work';
    if (type === '摸鱼仙人' || type === '信息溺水者') return 'slack';
    if (type === '社交烟花') return 'social';
    if (type === '提示词外包虫') return 'ai';
    if (type === '反制度小虫' || type === '撤回失败艺术家') return 'disrupt';
    return null;
  }

  function routeIdFromDeath(death) {
    const id = death && death.id;
    if (id === 'self-optimized-away') return 'work';
    if (id === 'permanent-away' || id === 'false-enlightenment') return 'slack';
    if (id === 'social-cremation') return 'social';
    if (id === 'agentized-away') return 'ai';
    if (id === 'clarified-to-death') return 'disrupt';
    if (id === 'anxiety-boom' || id === 'spirit-crash' || id === 'body-strike') return 'slack';
    if (id === 'unlisted') return 'social';
    if (id === 'arranged-life') return 'disrupt';
    return null;
  }

  function buildWorldGlitches(state) {
    const disruption = Math.max(0, (state && state.disruption) || 0);
    if (disruption < 40) {
      return {
        active: false,
        level: 'stable',
        title: '世界暂时正常',
        text: '组织还没有发现你在往规则里塞沙子。',
        hudLabel: '搅局稳定',
        className: 'world-glitch-stable'
      };
    }

    if (disruption < 80) {
      return {
        active: true,
        level: 'warped',
        title: '现实开始偏航',
        text: '会议纪要偶尔会把你的沉默写成“提出了关键问题”，同事开始怀疑系统听错了。',
        hudLabel: '搅局偏移',
        className: 'world-glitch-warped'
      };
    }

    if (disruption < 140) {
      return {
        active: true,
        level: 'corrupted',
        title: '组织现实污染',
        text: '世界开始留下你的手印：流程表自动冒出问号，会议室投影把“后续跟进”闪成“没人知道”。',
        hudLabel: '现实污染',
        className: 'world-glitch-corrupted'
      };
    }

    return {
      active: true,
      level: 'stutter',
      title: '系统话术卡顿',
      text: '老板的话术开始循环播放，HR模板信出现乱码。你没有赢，但世界已经不能假装什么都没发生。',
      hudLabel: '系统卡顿',
      className: 'world-glitch-stutter'
    };
  }

  function buildRecommendedCollectionTarget(recommendation) {
    if (!recommendation || !recommendation.routeId) return null;
    const target = ROUTE_COLLECTION_TARGETS[recommendation.routeId];
    return target ? { ...target } : null;
  }

  function buildNextRunRecommendation(state, death, report) {
    const activeRoute = buildRouteStatus(state);
    const routeId = routeIdFromDeath(death)
      || (activeRoute.active ? activeRoute.id : null)
      || routeIdFromReport(report)
      || 'disrupt';
    const route = routeById(routeId);
    const recommendation = ROUTE_RECOMMENDATIONS[route.id] || ROUTE_RECOMMENDATIONS.disrupt;
    const title = death && death.id === 'anxiety-boom'
      ? '下一世建议：先给焦虑降噪'
      : `下一世建议：${route.title}`;

    return {
      routeId: route.id,
      title,
      text: recommendation.text,
      hook: route.hook,
      risk: route.risk,
      seedCards: [...recommendation.seedCards],
      actionLabel: `带着${route.title}再活一次`
    };
  }

  const MUTANT_CARDS = {
    'ppt-v18': {
      id: 'ppt-v18',
      name: '第18版PPT',
      icon: '📊',
      category: 'work',
      quote: '上一世没交出的差，以更有感觉的姿态归来。',
      processBeats: [
        '你看着屏幕上的 ppt_v18.pptx，陷入了深刻的哲学沉思。',
        '老板发来语音：“这版有感觉了，但把第一版的内容挪过来看看？”',
        '你微笑着删掉了所有内容，反正都是一堆没有灵魂的方块。'
      ],
      cost: { time: 1.5 },
      effect: { spirit: -15, social: 2, health: -4, anxiety: 22 },
      disruption: 12,
      absurdDebt: 36,
      npc: { boss: 15, coworker: -4 },
      tag: '版本地狱',
      causality: '你修改了18次最终版，这一世的文档充满了执念。',
      isMutant: true
    },
    'slacker-apology': {
      id: 'slacker-apology',
      name: '摸鱼搭子的道歉信',
      icon: '✉️',
      category: 'slack',
      quote: '小余觉得上辈子对不起你，这辈子送你一个礼物。',
      processBeats: [
        '你在桌上发现一封手写信，旁边还放着一杯温热的奶茶。',
        '信里写着：“上辈子真不是故意让你背锅的，这杯算我请。”',
        '你喝了一口，甜度超标，但摸鱼的决心瞬间更加坚定。'
      ],
      cost: { time: 1 },
      effect: { spirit: 15, social: 12, health: 5, anxiety: -10 },
      disruption: 8,
      absurdDebt: -5,
      npc: { slacker: 20 },
      tag: '摸鱼羁绊',
      causality: '上辈子欠下的奶茶，在这一世开局以道歉的形式兑现。',
      isMutant: true
    },
    'boss-read-receipt': {
      id: 'boss-read-receipt',
      name: '老板的已读回执',
      icon: '👁️',
      category: 'work',
      quote: '已读。这两个字本身就是一种无声的催促。',
      processBeats: [
        '老板在你的方案下留下了“已读”两个字，没有任何其他批示。',
        '你开始疯狂猜测这背后的深意，每一个像素都在承受拷问。',
        '直到下班你也没想明白，但你的工作时长已经成功超标。'
      ],
      cost: { time: 2 },
      effect: { spirit: -18, social: -5, health: -6, anxiety: 25 },
      disruption: -8,
      absurdDebt: 10,
      npc: { boss: 10 },
      tag: '已读不回',
      causality: '前世的真话像回力镖一样，变成了这辈子无处不在的视线。',
      isMutant: true
    },
    'ai-intro': {
      id: 'ai-intro',
      name: 'AI助手的自我介绍',
      icon: '🤖',
      category: 'think',
      quote: '“你好，我是将要取代你的AI助手。”',
      processBeats: [
        '屏幕右下角弹出一个极简的小助手，用欢快的语调做自我介绍。',
        '它声称能帮你分担 80% 的工作，但你需要帮它审核 120% 的内容。',
        '你开始指导它如何假装像人类一样写废话。你们配合得天衣无缝。'
      ],
      cost: { time: 1 },
      effect: { spirit: -8, health: -2, anxiety: 15 },
      disruption: 20,
      absurdDebt: 25,
      tag: '降本增效',
      causality: '前世你沉迷外包AI，这一世AI成了你形影不离的搭子。',
      isMutant: true
    },
    'prev-life-moments': {
      id: 'prev-life-moments',
      name: '上辈子的朋友圈截图',
      icon: '📱',
      category: 'social',
      quote: '有些黑历史，比你的灵魂更能经受时间的考验。',
      processBeats: [
        '一个匿名群里突然有人发了一张旧截图，主角是你。',
        '你在截图里慷慨陈词，情绪饱满，简直是大型社会学实验现场。',
        '大家纷纷点赞，你只想知道现在申请换个星球生活还来得来不及。'
      ],
      cost: { time: 1.5 },
      effect: { spirit: -12, social: 15, anxiety: 20 },
      disruption: 10,
      absurdDebt: 15,
      tag: '公开处刑',
      causality: '上辈子的社交狂欢，给这辈子留下了难以抹去的数字足迹。',
      isMutant: true
    }
  };

  function getLegacyEffect(postcard, report) {
    const source = postcard.id;
    const fallback = { time: 0.25, stats: { spirit: 4 }, disruption: 2, absurdDebt: -2 };
    const effects = {
      'system-stutter': { time: 0.5, stats: { social: -2, spirit: 6 }, disruption: 25, absurdDebt: -10 },
      'true-sunset': { time: 1, stats: { anxiety: -10, spirit: 8 }, disruption: 10, absurdDebt: -8 },
      'arranged-life': { time: 0.5, stats: { spirit: 5 }, disruption: 4, absurdDebt: -12 },
      'agentized-away': { time: 0.25, stats: { spirit: 4, anxiety: -3 }, disruption: 8, absurdDebt: 4 },
      'anxiety-boom': { time: 0.5, stats: { anxiety: -10 }, disruption: 5, absurdDebt: -3 },
      'spirit-crash': { time: 0.25, stats: { spirit: 10, health: -2 }, disruption: 3, absurdDebt: -2 },
      unlisted: { time: 0.25, stats: { social: 10 }, disruption: 4, absurdDebt: -2 },
      'body-strike': { time: -0.25, stats: { health: 12 }, disruption: 3, absurdDebt: -2 },
      natural: { time: 0.5, stats: { spirit: 4, anxiety: -4 }, disruption: 2, absurdDebt: -2 }
    };
    const effect = cloneLegacyEffect(effects[source] || fallback);
    if (report.type === '反制度小虫') effect.disruption = (effect.disruption || 0) + 5;
    if (report.type === '卷王蜉蝣') effect.absurdDebt = (effect.absurdDebt || 0) - 3;

    effect.cardPoolMutations = [];
    if (source === 'system-stutter' || report.type === '版本地狱居民') {
      effect.cardPoolMutations.push(
        { action: 'add', card: MUTANT_CARDS['ppt-v18'] },
        { action: 'remove', cardId: 'reschedule-meeting' },
        { action: 'weight', cardId: 'final-ppt', multiplier: 0.3 }
      );
    } else if (source === 'social-cremation' || report.type === '社交烟花') {
      effect.cardPoolMutations.push(
        { action: 'add', card: MUTANT_CARDS['prev-life-moments'] },
        { action: 'weight', cardId: 'milk-tea-social', multiplier: 1.5 }
      );
    } else if (source === 'anxiety-boom' || report.type === '朋友圈在岗证明') {
      effect.cardPoolMutations.push(
        { action: 'add', card: MUTANT_CARDS['boss-read-receipt'] },
        { action: 'weight', cardId: 'like-boss-post', multiplier: 0.5 }
      );
    } else if (source === 'agentized-away' || report.type === '提示词外包虫') {
      effect.cardPoolMutations.push(
        { action: 'add', card: MUTANT_CARDS['ai-intro'] }
      );
    } else if (source === 'permanent-away' || source === 'unlisted') {
      effect.cardPoolMutations.push(
        { action: 'add', card: MUTANT_CARDS['slacker-apology'] }
      );
    }

    return effect;
  }

  function describeLegacyEffect(effect) {
    const parts = [];
    if (effect.time) parts.push(`寿命${effect.time > 0 ? '+' : ''}${effect.time}h`);
    Object.keys(effect.stats || {}).forEach((key) => {
      const value = effect.stats[key];
      parts.push(`${STAT_NAMES[key] || key}${value > 0 ? '+' : ''}${value}`);
    });
    if (effect.disruption) parts.push(`搅局${effect.disruption > 0 ? '+' : ''}${effect.disruption}`);
    if (effect.absurdDebt) parts.push(`荒诞债${effect.absurdDebt > 0 ? '+' : ''}${effect.absurdDebt}`);
    return parts.join(' / ');
  }

  function buildLegacyCard(postcard, report) {
    const effect = getLegacyEffect(postcard, report);
    const memoryEvent = getLegacyMemoryEvent(postcard.id);
    return {
      id: `legacy-${postcard.id}`,
      sourceDeathId: postcard.id,
      title: `${postcard.title}遗产`,
      emoji: postcard.emoji,
      rarity: postcard.rarity,
      color: postcard.color,
      personality: report.type,
      text: `上一世死于「${postcard.title}」，这一世开局带着一点后遗症。`,
      effect,
      memoryEvent,
      effectText: describeLegacyEffect(effect),
      stack: 1,
      gainedAt: Date.now()
    };
  }

  function getLegacyMemoryEvent(sourceDeathId) {
    const events = {
      'anxiety-boom': {
        id: 'memory-anxiety-inbox',
        emoji: '💬',
        text: '前世焦虑回声：工位上多了一瓶“预防焦虑”药片和一张温馨提示：“爱司即家，请勿擅自惊慌”。',
        preview: '焦虑爆炸遗产会在2次选择后注入红点回声。',
        effect: { spirit: -3, anxiety: 12 },
        timeCost: 0.25,
        disruption: 3,
        absurdDebt: 6,
        type: 'negative',
        causality: '上一世爆掉的焦虑没有散，它学会了以温馨提示的形式常驻。'
      },
      'self-optimized-away': {
        id: 'memory-template-seat',
        emoji: '📎',
        text: '前世样板间回声：你的工位多了一张“高效流程示范卡”，新人问你本人是不是可选插件。',
        preview: '被自己优化掉遗产会在2次选择后注入样板间回声。',
        effect: { spirit: -4, anxiety: 10 },
        timeCost: 0.25,
        disruption: -3,
        absurdDebt: 12,
        type: 'negative',
        causality: '上一世的流程没有忘记你，它只是忘记你需要存在。'
      },
      'agentized-away': {
        id: 'memory-agent-seat',
        emoji: '🤖',
        text: '前世外包回声：你的工位上贴了一张“此员工可被API替代”标签，显示着当前替代进度为 99.4%。',
        preview: '被代理成工具人遗产会在2次选择后注入代理席位。',
        effect: { spirit: -2, social: -3, anxiety: 10 },
        timeCost: 0.25,
        disruption: 8,
        absurdDebt: 10,
        type: 'negative',
        causality: '上一世被代理掉的部分没有消失，它只是获得了开机自启权限。'
      },
      'permanent-away': {
        id: 'memory-away-status',
        emoji: '🚪',
        text: '前世离席回声：考勤系统默认你“暂时不在”。这次你还没走，它已经替你请了假。',
        preview: '永久离席遗产会在2次选择后注入暂离状态。',
        effect: { social: -4, spirit: 4, anxiety: 6 },
        disruption: 10,
        absurdDebt: -2,
        type: 'disrupt',
        causality: '上一世的离席状态保留到了这一世，像一件自动续费的外套。'
      },
      'social-cremation': {
        id: 'memory-icebreaker',
        emoji: '🔥',
        text: '前世社交火葬场回声：上辈子的团建视频被做成了破冰素材。你刚入职，所有人都对你的“代表作”耳熟能详。',
        preview: '社交火葬场遗产会在2次选择后注入团建素材库。',
        effect: { social: -6, anxiety: 12 },
        timeCost: 0.25,
        disruption: 8,
        absurdDebt: 4,
        type: 'negative',
        causality: '上一世的黑历史没有归档，它被做成了可复用素材。'
      },
      'clarified-to-death': {
        id: 'memory-taskforce',
        emoji: '🔁',
        text: '前世澄清回声：会议室里出现了一个“发言须知”告示牌，明确禁止提出无法用流程图闭环的深渊问题。',
        preview: '澄清到死遗产会在2次选择后注入专项小组席位。',
        effect: { spirit: -4, social: -4, anxiety: 10 },
        timeCost: 0.25,
        disruption: 18,
        absurdDebt: -2,
        type: 'disrupt',
        causality: '上一世没被回答的问题，在这一世拥有了会议室预订。'
      },
      'false-enlightenment': {
        id: 'memory-calm-scare',
        emoji: '🧘',
        text: '前世摸鱼成仙回声：厕所门口贴了“禁止顿悟”标语，严禁以排泄为由逃避数字契约。',
        preview: '假性顿悟遗产会在2次选择后注入可疑平静。',
        effect: { spirit: 4, anxiety: 8 },
        disruption: 6,
        absurdDebt: -4,
        type: 'mixed',
        causality: '上一世的顿悟没有带来自由，只带来了一种更安静的焦虑。'
      },
      'unlisted': {
        id: 'memory-unlisted',
        emoji: '🫥',
        text: '前世查无此人回声：你的工牌被放在失物招领处三天了。前台小妹坚称你上辈子已经通过自然折旧完成了销户。',
        preview: '查无此人遗产会在2次选择后注入失物招领。',
        effect: { spirit: -3, social: 12, anxiety: 5 },
        timeCost: 0.25,
        disruption: 4,
        absurdDebt: 2,
        type: 'mixed',
        causality: '上一世的消失产生了个性化的数位真空。'
      }
    };
    return cloneLegacyMemoryEvent(events[sourceDeathId] || null);
  }

  function mergeLegacyCard(progress, legacyCard) {
    const cards = (progress.legacyCards || []).map((card) => ({
      ...card,
      effect: cloneLegacyEffect(card.effect),
      memoryEvent: cloneLegacyMemoryEvent(card.memoryEvent)
    }));
    const existingIndex = cards.findIndex((card) => card.id === legacyCard.id);
    const incoming = {
      ...legacyCard,
      effect: cloneLegacyEffect(legacyCard.effect),
      memoryEvent: cloneLegacyMemoryEvent(legacyCard.memoryEvent),
      stack: legacyCard.stack || 1,
      gainedAt: legacyCard.gainedAt || Date.now()
    };
    if (existingIndex >= 0) {
      const existing = cards[existingIndex];
      cards[existingIndex] = {
        ...existing,
        ...incoming,
        stack: (existing.stack || 1) + 1,
        gainedAt: incoming.gainedAt
      };
    } else {
      cards.push(incoming);
    }
    return {
      ...progress,
      legacyCards: cards
    };
  }

  function selectActiveLegacyCards(progress, limit) {
    return [...((progress && progress.legacyCards) || [])]
      .sort((left, right) => (right.gainedAt || 0) - (left.gainedAt || 0))
      .slice(0, limit || 3)
      .map((card) => ({
        ...card,
        effect: cloneLegacyEffect(card.effect),
        memoryEvent: cloneLegacyMemoryEvent(card.memoryEvent)
      }));
  }

  function applyLegacyCards(state, legacyCards) {
    const next = cloneState(state);
    const active = (legacyCards || []).map((card) => ({
      ...card,
      effect: cloneLegacyEffect(card.effect),
      memoryEvent: cloneLegacyMemoryEvent(card.memoryEvent)
    }));
    next.cardPoolMutations = [];
    active.forEach((card) => {
      const multiplier = Math.max(1, Math.min(3, card.stack || 1));
      const effect = card.effect || {};
      next.timeLeft = clamp(next.timeLeft + ((effect.time || 0) * multiplier), 0, next.character.timeLimit);
      Object.keys(effect.stats || {}).forEach((key) => {
        next.stats[key] = clamp((next.stats[key] || 0) + effect.stats[key] * multiplier, 0, 100);
      });
      next.disruption = clamp(next.disruption + ((effect.disruption || 0) * multiplier), 0, 999);
      next.absurdDebt = clamp(next.absurdDebt + ((effect.absurdDebt || 0) * multiplier), 0, 100);
      next.history.push({
        turn: 0,
        id: card.id,
        name: card.title,
        category: 'event',
        quote: `遗产生效：${card.effectText || describeLegacyEffect(card.effect || {})}`,
        causality: `${card.title}在这一世开局生效。`,
        disruption: effect.disruption || 0,
        absurdDebt: effect.absurdDebt || 0
      });
      if (card.memoryEvent) {
        next.pendingConsequences.push({
          ...cloneLegacyMemoryEvent(card.memoryEvent),
          id: `${card.memoryEvent.id}-${card.sourceDeathId}`,
          sourceCardId: card.id,
          sourceCardName: card.title,
          dueTurn: 2,
          routeId: 'legacy'
        });
      }
      if (effect.cardPoolMutations) {
        next.cardPoolMutations.push(...effect.cardPoolMutations);
      }
    });
    next.activeLegacyCards = active;
    return next;
  }

  function buildCollectionSummary(progress) {
    const data = progress || {};
    const collectedPostcards = new Set(data.collectedPostcards || []);
    const collectedPersonalities = new Set(data.collectedPersonalities || []);
    const postcards = DEATHS.map((death) => {
      const collected = collectedPostcards.has(death.id);
      return {
        id: death.id,
        collected,
        title: death.title,
        rarity: death.rarity,
        emoji: collected ? death.emoji : '？',
        color: death.color,
        displayTitle: collected ? death.title : '？？？未发现死法',
        displayText: collected ? death.epitaph : '这张明信片还躲在某种荒诞死法后面。'
      };
    });
    const personalities = PERSONALITY_ARCHETYPES.map((item) => {
      const collected = collectedPersonalities.has(item.type);
      return {
        ...item,
        collected,
        displayType: collected ? item.type : '？？？未归档人格',
        displayTagline: collected ? item.tagline : '系统还没见过你这样活。'
      };
    });
    return {
      postcardCount: {
        collected: postcards.filter((item) => item.collected).length,
        total: postcards.length
      },
      personalityCount: {
        collected: personalities.filter((item) => item.collected).length,
        total: personalities.length
      },
      legacyCount: {
        collected: (data.legacyCards || []).length,
        total: Math.max((data.legacyCards || []).length, 1)
      },
      postcards,
      personalities,
      legacyCards: (data.legacyCards || []).map((card) => ({
        ...card,
        effect: cloneLegacyEffect(card.effect)
      }))
    };
  }

  function isCollectionTargetCollected(target, progress) {
    const data = progress || {};
    if (target.kind === 'postcard') return (data.collectedPostcards || []).includes(target.target);
    if (target.kind === 'personality') return (data.collectedPersonalities || []).includes(target.target);
    return false;
  }

  function buildCardCollectionHint(card, progress) {
    const targets = CARD_COLLECTION_TARGETS[(card && card.id) || ''] || [];
    if (!targets.length) return null;
    const target = targets.find((item) => !isCollectionTargetCollected(item, progress)) || targets[0];
    const collected = isCollectionTargetCollected(target, progress);
    const kindLabel = target.kind === 'postcard' ? '死亡明信片' : '人格路线';
    return {
      kind: target.kind,
      target: target.target,
      status: collected ? 'collected' : 'uncollected',
      label: collected ? '已归档' : '收集线索',
      text: collected
        ? `${target.title || target.target}`
        : `可能通向未归档${kindLabel}`
    };
  }

  function findCollectionTargetRoute(target) {
    if (!target) return null;
    const exact = COLLECTION_TARGET_ROUTES[`${target.kind}:${target.target}`];
    if (exact) return exact;

    const relatedCards = ACTION_CARDS.filter((card) => cardMatchesCollectionTarget(card, target));
    if (!relatedCards.length) return null;
    return {
      title: target.target,
      hook: '系统只知道它和这些选择有关，剩下的荒诞需要你亲自试。',
      steps: relatedCards.map((card) => ({
        id: card.id,
        label: card.name,
        clue: `先遇到「${card.name}」。`
      }))
    };
  }

  function buildCollectionTargetTracker(state, progress) {
    const target = state && state.collectionTarget;
    if (!target) return null;

    const route = findCollectionTargetRoute(target);
    const historyIds = new Set(((state && state.history) || []).map((item) => item.id));
    const pending = (state && state.pendingConsequences) || [];
    const steps = ((route && route.steps) || []).map((step) => {
      const pendingItem = pending.find((item) => item.id === step.id || item.sourceCardId === step.id);
      const complete = historyIds.has(step.id);
      return {
        ...step,
        status: complete ? 'complete' : pendingItem ? 'pending' : 'locked',
        pendingPreview: pendingItem ? pendingItem.preview : null
      };
    });
    const completed = steps.filter((step) => step.status === 'complete').length;
    const total = steps.length || 1;
    const nextStep = steps.find((step) => step.status !== 'complete');
    const collected = isCollectionTargetCollected(target, progress);
    let nextText = '这条线暂时没有明确线索，只能先活得离谱一点。';

    if (collected) {
      nextText = `${target.target}已经归档，系统建议你换一条更会折磨人的线。`;
    } else if (!steps.length) {
      nextText = '系统还没给这条线写完整攻略，这本身就很符合人生。';
    } else if (!nextStep) {
      nextText = '路线已成形，死亡报告会更倾向归档这个人格。';
    } else if (nextStep.status === 'pending') {
      nextText = `因果已挂起：${nextStep.pendingPreview || nextStep.clue}`;
    } else {
      nextText = `下一步：${nextStep.clue}`;
    }

    return {
      kind: target.kind,
      target: target.target,
      title: (route && route.title) || target.target,
      hook: (route && route.hook) || '这条线有点野，系统也在边跑边编。',
      completed,
      total,
      progress: Math.round((completed / total) * 100),
      collected,
      statusLabel: collected ? '已归档' : nextStep ? '追踪中' : '待归档',
      nextText,
      steps
    };
  }

  // ========== NPC 记忆槽系统 ==========

  const NPC_NAMES = { boss: '老板', slacker: '摸鱼搭子小余', coworker: '同事老张' };
  const NPC_MEMORY_GREETINGS = {
    boss: {
      high: [
        '老板看了你一眼："上辈子你还挺积极的嘛。"',
        '老板给你发了个链接，标题是"如何保持上一世的工作热情"。',
        '"你这个蜉蝣，我有印象——不错。"老板扔了个项目过来。'
      ],
      low: [
        '老板经过你工位时，刻意绕了个弯。',
        '老板在群里发了一条："新员工注意，之前那个蜉蝣的教训大家引以为戒。"',
        '"你……看起来眼熟。"老板皱了下眉头，翻了翻考勤记录。'
      ]
    },
    slacker: {
      high: [
        '小余一看到你就递了杯奶茶："上辈子的份。"',
        '小余在厕所门口等你："老位置，继续。"',
        '"又是你！"小余的眼睛亮了，"我攒了好几个摸鱼新路线。"'
      ],
      low: [
        '小余假装没看到你，低头继续刷手机。',
        '小余在你工位上贴了一张匿名纸条："举报者请远离此工位。"',
        '"你上辈子干的好事，我都记着呢。"小余的语气很冷。'
      ]
    },
    coworker: {
      high: [
        '老张拍了拍你的肩膀："新来的？但我觉得你很面熟。"',
        '老张主动帮你接了杯水："你上辈子帮过我，这辈子我先欠你一个。"',
        '"你给我一种可以信赖的感觉。"老张说完自己也觉得奇怪。'
      ],
      low: [
        '老张看了你一眼，默默把自己的东西挪远了一点。',
        '老张在群里发了一条："新蜉蝣到了，大家注意保管私人物品。"',
        '"你是不是以前在哪个部门搞过事？"老张表情不太友善。'
      ]
    }
  };

  const MAX_NPC_MEMORIES = 5;

  function recordNpcMemory(npcMemories, npcId, event, run) {
    if (!npcMemories) npcMemories = {};
    if (!npcMemories[npcId]) npcMemories[npcId] = [];
    npcMemories[npcId].push({ event: event, run: run });
    if (npcMemories[npcId].length > MAX_NPC_MEMORIES) {
      npcMemories[npcId] = npcMemories[npcId].slice(-MAX_NPC_MEMORIES);
    }
    return npcMemories;
  }

  function buildNpcMemoryRecords(stateBefore, stateAfter, card) {
    const records = [];
    const npcBefore = stateBefore.npc || {};
    const npcAfter = stateAfter.npc || {};
    const run = stateAfter.turnCount || 0;

    Object.keys(npcAfter).forEach(function (npcId) {
      const before = npcBefore[npcId] || 0;
      const after = npcAfter[npcId] || 0;
      const delta = after - before;
      if (Math.abs(delta) >= 10) {
        const eventTag = delta > 0
          ? (card.category === 'disrupt' ? 'disrupted-for-' + npcId : 'pleased-' + npcId)
          : (card.category === 'disrupt' ? 'offended-' + npcId : 'angered-' + npcId);
        records.push({
          npcId: npcId,
          event: eventTag,
          delta: delta,
          cardId: card.id,
          cardName: card.name
        });
      }
    });
    return records;
  }

  function buildNpcMemoryGreeting(npcId, memories) {
    if (!memories || !memories[npcId] || memories[npcId].length === 0) return null;
    const npcMem = memories[npcId];
    const greetings = NPC_MEMORY_GREETINGS[npcId];
    if (!greetings) return null;

    // 判断最近印象是好是坏
    const recentEvent = npcMem[npcMem.length - 1].event || '';
    const isPositive = recentEvent.includes('pleased') || recentEvent.includes('disrupted-for');
    const pool = isPositive ? greetings.high : greetings.low;
    const idx = npcMem.length % pool.length;
    return {
      npcId: npcId,
      name: NPC_NAMES[npcId] || npcId,
      text: pool[idx],
      isPositive: isPositive,
      memoryCount: npcMem.length
    };
  }

  function buildAllNpcMemoryGreetings(memories) {
    if (!memories) return [];
    return Object.keys(NPC_NAMES)
      .map(function (npcId) { return buildNpcMemoryGreeting(npcId, memories); })
      .filter(Boolean);
  }

  function adjustNpcFromMemories(npc, memories) {
    if (!memories) return npc;
    const adjusted = { ...npc };
    Object.keys(memories).forEach(function (npcId) {
      if (adjusted[npcId] === undefined) return;
      const mems = memories[npcId] || [];
      if (mems.length === 0) return;
      const recentEvent = mems[mems.length - 1].event || '';
      const isPositive = recentEvent.includes('pleased') || recentEvent.includes('disrupted-for');
      const shift = isPositive
        ? Math.min(15, 5 + mems.length * 2)
        : -Math.min(15, 5 + mems.length * 2);
      adjusted[npcId] = clamp(adjusted[npcId] + shift, 0, 100);
    });
    return adjusted;
  }

  // ========== 今日挑战 (Daily Challenge) 系统 ==========

  const DAILY_MUTATORS = {
    1: {
      id: 'blue-monday',
      name: '蓝色星期一',
      description: '打工人最痛的起点。所有卡牌带来的焦虑增量额外增加 20%，且初始焦虑增加 10。',
      effect: { anxietyStart: 10, anxietyMultiplier: 1.2 }
    },
    2: {
      id: 'paid-slacking',
      name: '带薪摸鱼日',
      description: '摸鱼类卡牌的恢复效果提升 30%，被安排度（Absurd Debt）累积减缓 20%。',
      effect: { slackBoost: 1.3, absurdDebtMultiplier: 0.8 }
    },
    3: {
      id: 'ai-explosion',
      name: 'AI大爆发',
      description: '所有的AI卡牌完全不消耗寿命时间，但现实卡顿（失控度）累积速度提升 50%。',
      effect: { aiTimeCostFree: true, disruptionMultiplier: 1.5 }
    },
    4: {
      id: 'crazy-thursday',
      name: '疯狂星期四',
      description: '健康上限额外增加 20。社交类卡牌的资源消耗和焦虑生成减半！V我50！',
      effect: { healthStartBoost: 20, socialCostMultiplier: 0.5 }
    },
    5: {
      id: 'fabulous-friday',
      name: '福报星期五',
      description: '工作效率提升一倍，但精神值消耗额外增加 20%。',
      effect: { workEfficiencyMultiplier: 2.0, spiritCostMultiplier: 1.2 }
    },
    6: {
      id: 'weekend-recovery',
      name: '周末大复活',
      description: '绝境逢生！每次选择卡牌后，所有处于危险边缘的属性（<=20或>=80）自动回复 3 点。',
      effect: { passiveRecovery: true }
    },
    0: {
      id: 'chaos-sunday',
      name: '混沌礼拜天',
      description: '随机事件触发概率翻倍，荒诞度极高。一切在混乱中诞生。',
      effect: { randomEventChanceMultiplier: 2.0 }
    }
  };

  function getDailySeed(dateStr) {
    let targetDate = dateStr;
    if (!targetDate) {
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      targetDate = `${yyyy}-${mm}-${dd}`;
    }
    let hash = 0;
    for (let i = 0; i < targetDate.length; i++) {
      const char = targetDate.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return {
      date: targetDate,
      seed: Math.abs(hash)
    };
  }

  function getDailyMutator(dateStr) {
    let targetDate = dateStr;
    if (!targetDate) {
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      targetDate = `${yyyy}-${mm}-${dd}`;
    }
    const d = new Date(targetDate);
    const dayOfWeek = d.getDay();
    return DAILY_MUTATORS[dayOfWeek];
  }

  return {
    DAILY_MUTATORS,
    getDailySeed,
    getDailyMutator,
    seededRandom,
    STAT_NAMES,
    CATEGORY_LABELS,
    CHARACTERS,
    ACTION_CARDS,
    EVENTS,
    DEATHS,
    LIFE_PHASES,
    PERSONALITY_ARCHETYPES,
    LIFE_ROUTES,
    RUN_INTENTS,
    CARD_COLLECTION_TARGETS,
    COLLECTION_TARGET_ROUTES,
    createRunState,
    getRunIntent,
    applyRunIntent,
    drawCardOptions,
    drawCardPair,
    getChoiceCountForRun,
    applyCard,
    buildCardFace,
    buildCardConsequencePreview,
    buildChoiceCausalPreview,
    buildFirstRunGuide,
    buildRouteStatus,
    buildRouteTaskChainStatus,
    buildRunGoals,
    buildRunPacingSummary,
    buildRunObjectiveBrief,
    getLifePhase,
    buildWorldGlitches,
    buildTurnFeedback,
    buildContextualEvents,
    buildNpcRelationshipStatus,
    pickRandomEvent,
    getRandomEventChance,
    applyEvent,
    getDueConsequences,
    takeDueConsequences,
    checkDeath,
    buildDeathRescueOptions,
    buildDeathRescueStatus,
    resolveDeathRescueOption,
    buildDeathPostcard,
    buildDeathExplanation,
    buildConsequenceRisk,
    buildConsequenceResponses,
    resolveConsequenceResponse,
    buildPersonalityReport,
    buildCausalityLedger,
    buildEndgameReview,
    formatCountdown,
    formatWorldTime,
    formatLifeAge,
    getMentorQuip,
    buildMemorialComments,
    buildNextRunRecommendation,
    buildRecommendedCollectionTarget,
    buildLegacyCard,
    mergeLegacyCard,
    selectActiveLegacyCards,
    applyLegacyCards,
    buildCollectionSummary,
    buildCardCollectionHint,
    buildCollectionTargetTracker,
    recordNpcMemory,
    buildNpcMemoryRecords,
    buildNpcMemoryGreeting,
    buildAllNpcMemoryGreetings,
    adjustNpcFromMemories
  };
});
