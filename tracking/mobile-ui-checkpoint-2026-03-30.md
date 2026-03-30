# Mobile UI Checkpoint

日期：2026-03-30

## 本轮已完成

### 统一日间 / 夜间主题
- 新增前端主题状态服务，支持：
  - 跟随系统
  - 手动切换日间模式
  - 手动切换夜间模式
  - 刷新后保留用户选择
- 大厅 `/games`、对战页 `/table/:gameId`、卡牌详情弹窗、卡牌列表查看器均已切到同一套语义 token，不再出现大厅亮色、战场深色的割裂。
- 相关文件：
  - `packages/play/src/app/main/theme-preference.service.ts`
  - `packages/play/src/app/main/toolbar/toolbar.component.ts`
  - `packages/play/src/app/main/toolbar/toolbar.component.html`
  - `packages/play/src/app/main/toolbar/toolbar.component.scss`
  - `packages/play/src/app/app.component.ts`
  - `packages/play/src/theme/global.scss`

### 主页 `/games`
- 将原来的桌面表格页重构为跨端统一的快速开局大厅。
- 新增 Hero 区，突出“快速创建对局”和“管理卡组”。
- 新增“继续当前对局”卡片带。
- 将在线玩家、活跃牌桌、最近战绩重组为移动优先的内容面板。
- `games-table` 与 `match-table` 已各自加入手机卡片流，桌面表格保留为桌面视图。
- 相关文件：
  - `packages/play/src/app/games/games.component.ts`
  - `packages/play/src/app/games/games.component.html`
  - `packages/play/src/app/games/games.component.scss`
  - `packages/play/src/app/games/games-table/games-table.component.html`
  - `packages/play/src/app/games/games-table/games-table.component.scss`
  - `packages/play/src/app/games/match-table/match-table.component.html`
  - `packages/play/src/app/games/match-table/match-table.component.scss`

### 对战页 `/table/:gameId`
- 将原来的“棋盘 + 常驻右侧侧栏 + 底部手牌”布局改为：
  - 桌面：棋盘主区域 + 右侧信息栏
  - 手机：`战场 / 手牌 / 玩家 / 记录` 四个焦点切换页
- 将顶部区域改成移动端可读的 Battle Header。
- 新增手机专用战场组件，使用竖向战场布局，不再直接缩放桌面 `ptcg-board`。
- 保留现有 `ptcg-board`、`ptcg-game-logs`、`ptcg-player-actions` 等业务组件，不改规则链路。
- 相关文件：
  - `packages/play/src/app/table/board/mobile-board/mobile-board.component.ts`
  - `packages/play/src/app/table/board/mobile-board/mobile-board.component.html`
  - `packages/play/src/app/table/board/mobile-board/mobile-board.component.scss`
  - `packages/play/src/app/table/board/board.module.ts`
  - `packages/play/src/app/table/table.component.html`
  - `packages/play/src/app/table/table.component.scss`
  - `packages/play/src/app/table/table.component.ts`

### 手牌查看
- 手牌改为“横向牌带 + 聚焦卡”模型。
- 支持在高数量手牌下先聚焦，再查看详情，降低手机误触。
- 保留拖拽排序能力。
- 本轮继续优化为更适合手机扫读的版本：
  - 顶部新增状态 chip：`当前 x / 总数`、`状态`、`支持拖拽排序`
  - `查看详情` 按钮在手机下拉满整行，更容易点按
  - rail header 补充交互提示文案
  - 移动端 rail 间距缩到 `8px`
  - 移动端卡宽缩到 `66px`
- 相关文件：
  - `packages/play/src/app/table/hand/hand.component.html`
  - `packages/play/src/app/table/hand/hand.component.scss`
  - `packages/play/src/app/table/hand/hand.component.ts`

### 牌库 / 弃牌区 / 放逐区 / 奖赏卡查看器
- 将卡牌详情和卡牌列表弹窗统一调整为移动优先的全屏/近全屏模式。
- 卡堆列表改为更适合手机的自适应网格。
- 卡牌列表查看器进一步改为纵向 flex 容器，底部动作栏稳定贴底，不再出现上半段列表、下半段大块空白的布局问题。
- 相关文件：
  - `packages/play/src/app/shared/cards/card-info-popup/card-info-popup.component.scss`
  - `packages/play/src/app/shared/cards/card-info-list-popup/card-info-list-popup.component.scss`
  - `packages/play/src/app/shared/cards/card-list-pane/card-list-pane.component.scss`
  - `packages/play/src/app/shared/cards/cards-base.service.ts`
  - `packages/play/src/theme/global.scss`

## 已验证

- `npm --workspace @ptcg/play run build` 通过。
- 为确保站点始终可访问，当前使用 `node start.js` 前台起服验证：`http://127.0.0.1:12021`
- `npm run restart:app` 仍会触发既有问题：
  - `init.js:41`
  - `TypeError: Cannot read properties of undefined (reading 'setBase')`
  - 该错误不是本轮手机 UI 改动引入，而是仓库里现存的启动链路问题。

## 本轮追加验证

### Chrome MCP 实机访问
- Chrome DevTools MCP 已恢复可用，已在手机视口 `390x844` 下实际访问站点。
- 本轮验证账号：`easygod3780`
- 实测站点：`http://127.0.0.1:12021`
- 创建测试对局成功，实际进入：`/table/1`

### `/games` 手机大厅
- Hero 区、主 CTA、统计卡片在手机视口下首屏可读。
- 页面无横向溢出：
  - `window.innerWidth = 390`
  - `document.documentElement.scrollWidth = 390`
- Console 未出现 error / warn。
- `进行中的牌桌` 与 `最近战绩` 已切成移动卡片流，不再显示桌面表头。
- `在线玩家` 区改成移动卡片 + 直接动作按钮，桌面 `mat-nav-list` 仅在大屏显示。
- 主题切换已在大厅页生效，浅色和深色模式都实测通过。
- `最近战绩` 手机分页已进一步压缩为每页 12 条：
  - 实测分页文案：`1 – 12 of 118`
  - 明显短于之前的 `1 – 50 of 118`
- 对局卡新增左右玩家分栏和 `VS` 视觉锚点，手机纵向扫读更稳定。
- `最近战绩` 已继续摘要化为两层结构：
  - 上层 `3` 条重点回放卡
  - 下层 `9` 条紧凑记录行
  - 其余记录通过底部分页继续查看
- Chrome 实测 DOM 数量：
  - `featured = 3`
  - `compact = 9`
  - `totalMobile = 12`

### `/table/1` 手机对战页
- 顶部 Battle Header 正常显示：
  - `STANDARD`
  - `牌桌 #1 · 第 0 回合`
- 四个焦点页签实测可切换：
  - `战场`
  - `手牌`
  - `玩家`
  - `记录`
- `战场` 已切到新的手机专用竖向战场：
  - 上方对手区，下方己方区
  - Active / Bench / Deck / Discard / Prize 为紧凑布局
  - 主战场无横向溢出：
    - `window.innerWidth = 390`
    - `document.documentElement.scrollWidth = 390`
- 备战区横滑带已继续微调：
  - 小屏卡槽缩到 `minmax(58px, 72px)`
  - 启用横向 `scroll-snap`
  - 更适合 4 / 8 槽时的连续浏览
- `手牌` 页签已切到新的聚焦模型：
  - 默认聚焦单卡
  - 显示 `共 7 张手牌`
  - `查看详情` 可打开卡牌详情弹窗
- 当前实测手牌状态：
  - `当前 1 / 7`
  - `状态 可操作`
  - `支持拖拽排序`
- 手牌页无横向溢出：
  - `window.innerWidth = 390`
  - `document.documentElement.scrollWidth = 390`
- `玩家` 页签能正确显示双方牌库 / 手牌 / 弃牌区 / 放逐区统计，并保留 `离开` / `结束你的回合` 按钮。
- `玩家` 页签已继续收成摘要卡样式：
  - 顶部保留头像、名称、段位
  - 当前行动方显示 `当前回合` 标签
  - `牌库 / 手牌 / 弃牌 / 放逐` 改为 2x2 统计 chip
  - 页面仍无横向溢出：
    - `window.innerWidth = 390`
    - `document.documentElement.scrollWidth = 390`
- `记录` 页签能显示完整日志时间线与输入框。
- 手机 prompt 已按底部抽屉模型实测通过：
  - 猜硬币 prompt
  - 先后手选择 prompt
  - 选起始宝可梦 prompt
- prompt 最小化按钮可用，最小化后不阻塞四个页签切换。

### 弹窗 / 查看器
- 手牌详情弹窗可打开，文案和关闭按钮可见。
- 牌库 / 弃牌区查看器可打开为全屏移动查看器。
- 最新实测中，卡牌列表查看器已修正为：
  - 整个 dialog 高度贴合 `390x844` 视口
  - 卡片列表在内容区内纵向滚动
  - 底部动作栏稳定贴底
  - 无横向溢出
- 量化结果：
  - `dialogRect.height = 844`
  - `actionRect.top = 794.8`
  - `document.documentElement.scrollWidth = 390`

### Prompt 选择器
- 手机端 `Choose cards` 选择面板已从桌面式固定容器改成横滑选择器：
  - 不再锁定初始宽高
  - 容器 `minWidth = 0`
  - 容器 `minHeight = 0`
  - 卡牌列表 `flex-wrap = nowrap`
  - `overflow-x = auto`
  - `scroll-snap-type = x`
- 本轮同时清掉了 `choose-cards-panes` 里的调试 `console.log` 噪音。
- `Choose pokemon` 面板也已补上同样的手机横滑模式，用于后续更复杂 prompt 场景。

## 证据产物

- `/games` 深色大厅截图：
  - `tracking/artifacts/mobile-games-dark-2026-03-30.png`
- `/games` 重构后大厅截图：
  - `tracking/artifacts/mobile-games-redesign-2026-03-30.png`
- `/games` 最近战绩降密度后截图：
  - `tracking/artifacts/mobile-games-match-density-2026-03-30.png`
- `/games` 最近战绩摘要化后截图：
  - `tracking/artifacts/mobile-games-recent-summary-fixed-2026-03-30.png`
- `/testing` 手机测试实验室截图：
  - `tracking/artifacts/mobile-testing-lab-2026-03-30.png`
- `/table/1` 新手机战场截图：
  - `tracking/artifacts/mobile-table-board-redesign-2026-03-30.png`
- `/table/1` 手牌页截图：
  - `tracking/artifacts/mobile-table-hand-redesign-2026-03-30.png`
- `/table/1` 手优化后截图：
  - `tracking/artifacts/mobile-table-hand-optimized-2026-03-30.png`
- `/table/1` 玩家页截图：
  - `tracking/artifacts/mobile-table-players-redesign-2026-03-30.png`
- `/table/1` 玩家摘要卡优化后截图：
  - `tracking/artifacts/mobile-table-players-summary-card-2026-03-30.png`
- `/table/1` 记录页截图：
  - `tracking/artifacts/mobile-table-logs-redesign-2026-03-30.png`
- `/table/1` 选起始宝可梦 prompt 截图：
  - `tracking/artifacts/mobile-table-prompt-choose-cards-2026-03-30.png`
- `/table/1` 优化后的选卡 prompt 截图：
  - `tracking/artifacts/mobile-prompt-choose-cards-optimized-2026-03-30.png`
- `/table/1` 修复后的牌库查看器截图：
  - `tracking/artifacts/mobile-table-deck-viewer-fixed-2026-03-30.png`
- `/table/1` 日间主题截图：
  - `tracking/artifacts/mobile-table-light-theme-2026-03-30.png`

## 下一步建议

### 优先做
1. 继续把 `/games` 的 `最近战绩` 从“3 条重点 + 9 条紧凑”再往“真正的分段加载或展开更多”推进，减少对底部分页的依赖。
2. 补一次高手牌数量场景，验证横向牌带的滑动、聚焦切换与误触率。
3. 继续看 `备战区 4 / 8 槽` 在真机尺寸下的视觉密度。
4. 继续验证 `Choose pokemon / Choose prize / Move energy` 等更复杂 prompt 在手机端的实际布局表现。
5. 如需回归，优先沿用 `/testing -> 创建测试对局 -> /table/1` 这条 Chrome MCP 路径继续采证。

### 第二轮应继续优化
1. `match-table` 虽然已卡片化，但当前分页数据量仍偏大，后续最好继续做分段加载或摘要化。
2. 备战区目前已适配移动壳层，但尚未针对 4 / 8 槽做真实视觉微调。
3. 手机战场现在已经是独立布局，但视觉细节仍可以进一步向 live 风格靠近。

## 注意事项

- 工作区里仍有与本任务无关的已有改动和运行产物，例如：
  - `.DS_Store`
  - `logs/app.log`
  - `run/app.pid`
- 本轮没有回滚这些文件。
