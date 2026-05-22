/**
 * 蜉蝣哲学 - 轻量级 Web Audio API 合成音效引擎
 * 纯代码合成，免去外部音效文件加载，提供纸张撕裂、梳齿鸣响、悲伤死亡和弦等音效。
 */

(function () {
  let audioCtx = null;
  let isMuted = localStorage.getItem('mayfly-muted') === 'true';

  // 懒加载初始化 AudioContext
  function initAudioContext() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  // 辅助函数：创建白噪声缓冲
  let noiseBuffer = null;
  function getNoiseBuffer(ctx) {
    if (noiseBuffer) return noiseBuffer;
    const bufferSize = ctx.sampleRate * 1.5; // 1.5秒噪声
    noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return noiseBuffer;
  }

  // 辅助函数：创建主音量节点与目标输出
  function createSourceNodes(ctx, duration) {
    const gainNode = ctx.createGain();
    gainNode.connect(ctx.destination);
    
    // 自动清理
    const now = ctx.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    
    return { gainNode, now };
  }

  const MayflyAudio = {
    /**
     * 切换静音状态
     */
    toggleMute() {
      isMuted = !isMuted;
      localStorage.setItem('mayfly-muted', String(isMuted));
      return isMuted;
    },

    /**
     * 获取静音状态
     */
    isMuted() {
      return isMuted;
    },

    /**
     * 卡牌悬停音效：极轻微的微小频率滑动
     */
    playCardHover() {
      if (isMuted) return;
      try {
        const ctx = initAudioContext();
        const { gainNode, now } = createSourceNodes(ctx);

        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(420, now + 0.08);

        gainNode.gain.setValueAtTime(0.001, now);
        gainNode.gain.linearRampToValueAtTime(0.015, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.09);
      } catch (e) {
        console.warn('Play card-hover failed:', e);
      }
    },

    /**
     * 抽牌音效：纸张滑动的摩擦声（白噪声带通滤波 + 缓升缓降包络）
     */
    playCardDraw() {
      if (isMuted) return;
      try {
        const ctx = initAudioContext();
        const { gainNode, now } = createSourceNodes(ctx);

        // 噪声源
        const noise = ctx.createBufferSource();
        noise.buffer = getNoiseBuffer(ctx);

        // 滤波器：模拟纸张摩擦的高频沙沙声
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1200, now);
        filter.frequency.exponentialRampToValueAtTime(800, now + 0.25);
        filter.Q.setValueAtTime(2.0, now);

        // 包络
        gainNode.gain.setValueAtTime(0.001, now);
        gainNode.gain.linearRampToValueAtTime(0.08, now + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

        noise.connect(filter);
        filter.connect(gainNode);

        noise.start(now);
        noise.stop(now + 0.3);
      } catch (e) {
        console.warn('Play card-draw failed:', e);
      }
    },

    /**
     * 出牌音效：撕裂与物理打击感的融合
     */
    playCardPlay() {
      if (isMuted) return;
      try {
        const ctx = initAudioContext();
        const { gainNode, now } = createSourceNodes(ctx);

        // 撕裂沙沙声部分
        const noise = ctx.createBufferSource();
        noise.buffer = getNoiseBuffer(ctx);

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(2000, now);
        noiseFilter.frequency.exponentialRampToValueAtTime(600, now + 0.15);
        noiseFilter.Q.setValueAtTime(4.0, now);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.12, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(gainNode);

        // 主频基音（水滴/物理弹奏感衰减）
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.18);

        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(0.18, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(oscGain);
        oscGain.connect(gainNode);

        // 总音量包络
        gainNode.gain.setValueAtTime(1.0, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        noise.start(now);
        noise.stop(now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } catch (e) {
        console.warn('Play card-play failed:', e);
      }
    },

    /**
     * 里程碑达成音效：上升的和谐共鸣排钟和弦
     */
    playComboMilestone() {
      if (isMuted) return;
      try {
        const ctx = initAudioContext();
        const { gainNode, now } = createSourceNodes(ctx);

        // 大三和弦琶音 C5 -> E5 -> G5 -> C6
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);

          const oscGain = ctx.createGain();
          oscGain.gain.setValueAtTime(0.001, now + idx * 0.08);
          oscGain.gain.linearRampToValueAtTime(0.06, now + idx * 0.08 + 0.02);
          oscGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.6);

          osc.connect(oscGain);
          oscGain.connect(gainNode);

          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.65);
        });

        gainNode.gain.setValueAtTime(1.0, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      } catch (e) {
        console.warn('Play combo-milestone failed:', e);
      }
    },

    /**
     * 死亡音效：沉重下降的方波和弦（模拟大限将至的荒诞悲凉）
     */
    playDeath() {
      if (isMuted) return;
      try {
        const ctx = initAudioContext();
        const { gainNode, now } = createSourceNodes(ctx);

        // 沉重的减三和弦，模拟生命走向终结
        // C3 (130.81Hz) -> E-flat3 (155.56Hz) -> F-sharp3 (185.00Hz)
        const notes = [130.81, 155.56, 185.00];
        notes.forEach((freq) => {
          const osc = ctx.createOscillator();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now);
          osc.frequency.linearRampToValueAtTime(freq * 0.6, now + 1.8);

          // 滤波器减弱锯齿波的尖锐感
          const lpFilter = ctx.createBiquadFilter();
          lpFilter.type = 'lowpass';
          lpFilter.frequency.setValueAtTime(450, now);
          lpFilter.frequency.exponentialRampToValueAtTime(80, now + 1.6);

          const oscGain = ctx.createGain();
          oscGain.gain.setValueAtTime(0.08, now);
          oscGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

          osc.connect(lpFilter);
          lpFilter.connect(oscGain);
          oscGain.connect(gainNode);

          osc.start(now);
          osc.stop(now + 1.9);
        });

        // 震荡深沉低音
        const subOsc = ctx.createOscillator();
        subOsc.type = 'triangle';
        subOsc.frequency.setValueAtTime(65.4, now); // C2
        subOsc.frequency.linearRampToValueAtTime(45, now + 1.8);

        const subGain = ctx.createGain();
        subGain.gain.setValueAtTime(0.15, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

        subOsc.connect(subGain);
        subGain.connect(gainNode);

        gainNode.gain.setValueAtTime(1.0, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

        subOsc.start(now);
        subOsc.stop(now + 2.0);
      } catch (e) {
        console.warn('Play death failed:', e);
      }
    },

    /**
     * 蜉蝣时刻音效：微风掠过的哨音（高频正弦波渐低渐弱）
     */
    playMayflyMoment() {
      if (isMuted) return;
      try {
        const ctx = initAudioContext();
        const { gainNode, now } = createSourceNodes(ctx);
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 2.5);
        gainNode.gain.setValueAtTime(0.001, now);
        gainNode.gain.linearRampToValueAtTime(0.04, now + 0.5);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 2.5);
        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + 2.6);
      } catch (e) {
        console.warn('Play mayfly-moment failed:', e);
      }
    }
  };

  window.MayflyAudio = MayflyAudio;
})();
