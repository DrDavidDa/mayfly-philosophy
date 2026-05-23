# 蜉蝣哲学：活不过一天也要搅局

一款黑色幽默的 24 小时压缩人生小游戏。玩家扮演一只寿命极短的蜉蝣，在加班、摸鱼、社交、AI 外包和当众搅局之间选择自己的荒诞路线。

## 在线试玩

正式入口：

```text
https://drdavidda.github.io/mayfly-philosophy/
```

兼容旧入口：

```text
https://drdavidda.github.io/mayfly-philosophy/AI%20Game/mayfly-philosophy-work/index.html
```

## 试玩反馈

Phase 9 的重点是验证首局体验和二刷意愿。发给玩家时建议附上：

- 试玩链接：`https://drdavidda.github.io/mayfly-philosophy/`
- 反馈清单：`docs/playtest-feedback.md`
- 目标：先完整玩 1 局，再回答“哪里爽、哪里懵、是否愿意再来一局”

## 本地试玩

游戏是纯静态页面，可以直接打开 `index.html`。如果要模拟线上环境和 Service Worker，建议在当前目录启动静态服务器：

```bash
python3 -m http.server 8766
```

然后访问：

```text
http://127.0.0.1:8766/index.html
```

## 发布说明

这是一个 PWA 离线化静态网页游戏，核心文件为：

- `index.html`
- `src/game-core.js`
- `src/share-poster.js`
- `manifest.json`
- `sw.js`

字体、视觉资源和 GSAP 已本地化，部署后可离线缓存。GitHub Pages 使用 `gh-pages` 分支根目录发布；该分支由 `AI Game/mayfly-philosophy-work` 生成，方便玩家使用短链接试玩，同时避免主仓库根目录里的其他项目影响上线内容。
