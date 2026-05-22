// ========== 蜉蝣哲学 · 分享海报引擎 ==========
// Canvas 2D 生成分享图 + Web Share API 集成
// 依赖：无外部库

(function () {
  'use strict';

  // ===== 配色常量 =====
  const COLORS = {
    bg1: '#1a1520',
    bg2: '#2d1f3d',
    bg3: '#12100b',
    gold: '#d9a431',
    paper: '#ead8b0',
    muted: 'rgba(234,216,176,0.6)',
    dimmed: 'rgba(234,216,176,0.35)',
    pink: '#b34a3c',
    cyan: '#5cb8b2',
    purple: '#7b5c91',
    green: '#7fa07a',
    divider: 'rgba(217,164,49,0.4)'
  };

  const CATEGORY_COLORS = {
    work: '#c35b4d',
    meeting: '#d9a431',
    slack: '#5cb8b2',
    phone: '#7b5c91',
    social: '#ddb0a3',
    ai: '#5cb8b2',
    disrupt: '#b34a3c',
    think: '#7fa07a'
  };

  const CATEGORY_NAMES = {
    work: '工作', meeting: '会议', slack: '摸鱼', phone: '手机',
    social: '社交', ai: 'AI外包', disrupt: '搅局', think: '思考'
  };

  const RARITY_COLORS = {
    N: '#888888',
    R: '#5cb8b2',
    SR: '#d9a431'
  };

  // ===== 工具函数 =====

  function wrapText(ctx, text, maxWidth) {
    const lines = [];
    let current = '';
    for (const char of text) {
      const test = current + char;
      if (ctx.measureText(test).width > maxWidth && current) {
        lines.push(current);
        current = char;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);
    return lines;
  }

  function drawRoundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }

  function fillRoundRect(ctx, x, y, w, h, r, color) {
    ctx.fillStyle = color;
    drawRoundRect(ctx, x, y, w, h, r);
    ctx.fill();
  }

  // ===== 主函数：生成分享海报 =====

  async function generateSharePoster(opts) {
    const W = 1080;
    const H = 1920;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    // — 背景渐变 —
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, COLORS.bg1);
    bgGrad.addColorStop(0.5, COLORS.bg2);
    bgGrad.addColorStop(1, COLORS.bg3);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // 网格纹理
    ctx.strokeStyle = 'rgba(234,216,176,0.03)';
    ctx.lineWidth = 1;
    for (let y = 0; y < H; y += 24) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    for (let x = 0; x < W; x += 24) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }

    let curY = 60;

    // — 顶部：游戏标题 —
    ctx.font = '42px "ZCOOL QingKe HuangYou", sans-serif';
    ctx.fillStyle = COLORS.paper;
    ctx.textAlign = 'center';
    ctx.fillText('蜉蝣哲学', W / 2, curY + 42);

    ctx.font = '24px "ZCOOL KuaiLe", sans-serif';
    ctx.fillStyle = COLORS.muted;
    ctx.fillText('· 蜉蝣人格报告 ·', W / 2, curY + 82);
    curY += 130;

    // — 分隔线 —
    ctx.strokeStyle = COLORS.divider;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(120, curY); ctx.lineTo(W - 120, curY);
    ctx.stroke();
    curY += 50;

    // — 死亡 Emoji —
    ctx.font = '120px serif';
    ctx.textAlign = 'center';
    ctx.fillText(opts.deathEmoji || '🪰', W / 2, curY + 110);
    curY += 150;

    // — 人格类型名 —
    ctx.font = '64px "ZCOOL QingKe HuangYou", sans-serif';
    ctx.fillStyle = COLORS.gold;
    ctx.fillText(opts.personalityType || '蜉蝣哲学练习生', W / 2, curY + 60);
    curY += 90;

    // — 标签语 —
    ctx.font = '28px "ZCOOL KuaiLe", sans-serif';
    ctx.fillStyle = COLORS.muted;
    const tagLines = wrapText(ctx, opts.personalityTagline || '', W - 200);
    tagLines.forEach((line, i) => {
      ctx.fillText(line, W / 2, curY + 32 + i * 40);
    });
    curY += 32 + tagLines.length * 40 + 30;

    // — 分隔线 —
    ctx.strokeStyle = COLORS.divider;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(160, curY); ctx.lineTo(W - 160, curY);
    ctx.stroke();
    curY += 40;

    // — 死亡信息卡 —
    fillRoundRect(ctx, 80, curY, W - 160, 220, 12, 'rgba(179,74,60,0.15)');
    ctx.strokeStyle = 'rgba(179,74,60,0.4)';
    drawRoundRect(ctx, 80, curY, W - 160, 220, 12);
    ctx.stroke();

    // 稀有度徽章
    const rarityColor = RARITY_COLORS[opts.deathRarity] || RARITY_COLORS.N;
    fillRoundRect(ctx, 110, curY + 18, 48, 28, 6, rarityColor);
    ctx.font = '16px "Press Start 2P", monospace';
    ctx.fillStyle = '#12100b';
    ctx.textAlign = 'center';
    ctx.fillText(opts.deathRarity || 'N', 134, curY + 39);

    // 死法名
    ctx.font = '36px "ZCOOL QingKe HuangYou", sans-serif';
    ctx.fillStyle = COLORS.paper;
    ctx.textAlign = 'left';
    ctx.fillText(opts.deathTitle || '寿终正寝', 175, curY + 45);

    // 路线标签
    if (opts.routeTitle) {
      ctx.font = '22px "ZCOOL KuaiLe", sans-serif';
      ctx.fillStyle = COLORS.cyan;
      ctx.textAlign = 'right';
      ctx.fillText(opts.routeTitle, W - 110, curY + 45);
    }

    // 墓志铭
    ctx.font = '22px "ZCOOL KuaiLe", sans-serif';
    ctx.fillStyle = COLORS.muted;
    ctx.textAlign = 'left';
    const epitaphLines = wrapText(ctx, opts.deathEpitaph || '', W - 260);
    epitaphLines.slice(0, 4).forEach((line, i) => {
      ctx.fillText(line, 110, curY + 90 + i * 34);
    });

    // 存活信息
    ctx.font = '20px "ZCOOL KuaiLe", sans-serif';
    ctx.fillStyle = COLORS.dimmed;
    ctx.textAlign = 'right';
    ctx.fillText(`${opts.timeAlive || ''} · 第${opts.survivalTurns || 0}回合`, W - 110, curY + 200);

    curY += 260;

    // — 行为分布图 —
    const counts = opts.categoryCounts || {};
    const entries = Object.entries(counts).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
    const total = entries.reduce((s, [, v]) => s + v, 0) || 1;

    if (entries.length > 0) {
      ctx.font = '24px "ZCOOL KuaiLe", sans-serif';
      ctx.fillStyle = COLORS.paper;
      ctx.textAlign = 'left';
      ctx.fillText('行为轨迹', 100, curY + 30);
      curY += 55;

      // 总条
      const barX = 100;
      const barW = W - 200;
      const barH = 32;
      fillRoundRect(ctx, barX, curY, barW, barH, 8, 'rgba(0,0,0,0.3)');

      let offsetX = barX;
      entries.forEach(([cat, count]) => {
        const segW = (count / total) * barW;
        const color = CATEGORY_COLORS[cat] || '#888';
        fillRoundRect(ctx, offsetX, curY, Math.max(segW, 4), barH, offsetX === barX ? 8 : 0, color);
        offsetX += segW;
      });
      curY += barH + 20;

      // 图例
      let legendX = 100;
      ctx.font = '20px "ZCOOL KuaiLe", sans-serif';
      entries.forEach(([cat, count]) => {
        const label = `${CATEGORY_NAMES[cat] || cat} ×${count}`;
        const color = CATEGORY_COLORS[cat] || '#888';
        fillRoundRect(ctx, legendX, curY, 14, 14, 3, color);
        ctx.fillStyle = COLORS.muted;
        ctx.textAlign = 'left';
        ctx.fillText(label, legendX + 22, curY + 13);
        legendX += ctx.measureText(label).width + 50;
        if (legendX > W - 200) {
          legendX = 100;
          curY += 30;
        }
      });
      curY += 50;
    }

    // — 底部 —
    curY = Math.max(curY + 40, H - 320);

    // 分隔线
    ctx.strokeStyle = COLORS.divider;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(200, curY); ctx.lineTo(W - 200, curY);
    ctx.stroke();
    curY += 50;

    ctx.font = '26px "ZCOOL KuaiLe", sans-serif';
    ctx.fillStyle = COLORS.paper;
    ctx.textAlign = 'center';
    ctx.fillText('扫码测测你是哪种蜉蝣', W / 2, curY + 26);
    curY += 60;

    // 二维码占位区
    ctx.strokeStyle = COLORS.dimmed;
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    drawRoundRect(ctx, (W - 180) / 2, curY, 180, 180, 12);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = '18px "ZCOOL KuaiLe", sans-serif';
    ctx.fillStyle = COLORS.dimmed;
    ctx.fillText('二维码位置', W / 2, curY + 100);
    curY += 210;

    // 版本号
    ctx.font = '14px "Press Start 2P", monospace';
    ctx.fillStyle = 'rgba(234,216,176,0.2)';
    ctx.fillText('MAYFLY PHILOSOPHY v0.2', W / 2, H - 30);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/png');
    });
  }

  // ===== 主函数：生成明信片图 =====

  async function generatePostcardImage(opts) {
    const W = 1023;
    const H = 1537;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    // 背景
    ctx.fillStyle = '#1a1218';
    ctx.fillRect(0, 0, W, H);

    // 纸质纹理
    ctx.strokeStyle = 'rgba(234,216,176,0.02)';
    ctx.lineWidth = 1;
    for (let y = 0; y < H; y += 18) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // 边框（双线）
    ctx.strokeStyle = 'rgba(217,164,49,0.3)';
    ctx.lineWidth = 3;
    drawRoundRect(ctx, 20, 20, W - 40, H - 40, 16);
    ctx.stroke();
    ctx.lineWidth = 1;
    drawRoundRect(ctx, 32, 32, W - 64, H - 64, 12);
    ctx.stroke();

    let curY = 80;

    // 稀有度徽章
    const rarityColor = RARITY_COLORS[opts.deathRarity] || RARITY_COLORS.N;
    fillRoundRect(ctx, 70, curY, 64, 36, 8, rarityColor);
    ctx.font = '20px "Press Start 2P", monospace';
    ctx.fillStyle = '#12100b';
    ctx.textAlign = 'center';
    ctx.fillText(opts.deathRarity || 'N', 102, curY + 26);

    // 邮票区域
    ctx.strokeStyle = 'rgba(179,74,60,0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(W - 140, curY, 80, 100);
    ctx.font = '48px serif';
    ctx.fillText(opts.deathEmoji || '🪰', W - 100, curY + 68);
    curY += 140;

    // 死法名
    ctx.font = '72px "ZCOOL QingKe HuangYou", sans-serif';
    ctx.fillStyle = opts.deathColor || COLORS.gold;
    ctx.textAlign = 'center';
    ctx.fillText(opts.deathTitle || '寿终正寝', W / 2, curY + 72);
    curY += 120;

    // Emoji 大图
    ctx.font = '200px serif';
    ctx.fillText(opts.deathEmoji || '🪰', W / 2, curY + 200);
    curY += 260;

    // 分隔线
    ctx.strokeStyle = COLORS.divider;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(100, curY); ctx.lineTo(W - 100, curY);
    ctx.stroke();
    curY += 50;

    // 墓志铭引用块
    fillRoundRect(ctx, 60, curY, W - 120, 240, 10, 'rgba(217,164,49,0.06)');
    ctx.strokeStyle = 'rgba(217,164,49,0.2)';
    drawRoundRect(ctx, 60, curY, W - 120, 240, 10);
    ctx.stroke();

    // 引用标记
    ctx.font = '72px "ZCOOL QingKe HuangYou", sans-serif';
    ctx.fillStyle = 'rgba(217,164,49,0.15)';
    ctx.textAlign = 'left';
    ctx.fillText('"', 80, curY + 60);

    // 墓志铭文字
    ctx.font = '26px "ZCOOL KuaiLe", sans-serif';
    ctx.fillStyle = COLORS.paper;
    ctx.textAlign = 'left';
    const epiLines = wrapText(ctx, opts.deathEpitaph || '', W - 200);
    epiLines.slice(0, 5).forEach((line, i) => {
      ctx.fillText(line, 100, curY + 70 + i * 38);
    });
    curY += 280;

    // 底部标签
    ctx.textAlign = 'center';

    if (opts.personalityType) {
      fillRoundRect(ctx, W / 2 - 130, curY, 260, 40, 8, 'rgba(92,184,178,0.15)');
      ctx.font = '22px "ZCOOL KuaiLe", sans-serif';
      ctx.fillStyle = COLORS.cyan;
      ctx.fillText(`人格：${opts.personalityType}`, W / 2, curY + 28);
      curY += 55;
    }

    if (opts.routeTitle) {
      fillRoundRect(ctx, W / 2 - 100, curY, 200, 36, 8, 'rgba(217,164,49,0.12)');
      ctx.font = '20px "ZCOOL KuaiLe", sans-serif';
      ctx.fillStyle = COLORS.gold;
      ctx.fillText(`路线：${opts.routeTitle}`, W / 2, curY + 25);
      curY += 50;
    }

    // 底部版本
    ctx.font = '12px "Press Start 2P", monospace';
    ctx.fillStyle = 'rgba(234,216,176,0.15)';
    ctx.fillText('MAYFLY PHILOSOPHY', W / 2, H - 50);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/png');
    });
  }

  // ===== 分享/下载 =====

  async function sharePoster(blob, title, text) {
    const file = new File([blob], 'mayfly-report.png', { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: title, text: text });
        return;
      } catch (e) {
        if (e.name === 'AbortError') return; // 用户取消
      }
    }
    // 降级：下载图片
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mayfly-report.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  // ===== 导出 =====
  window.MayflyPoster = {
    generateSharePoster: generateSharePoster,
    generatePostcardImage: generatePostcardImage,
    sharePoster: sharePoster
  };
})();
