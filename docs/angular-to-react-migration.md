# RyuuPlay 前端迁移执行文档（Angular -> React）

## 1. 目的与范围

本文件用于指导 `packages/play` 从 **Angular + Angular Material** 迁移到 **React + Vite + Tailwind + shadcn/ui**，并作为后续迭代的统一执行基线。

本次迁移只重构前端代码，不调整后端服务配置与端口策略。

## 2. 必须满足的约束（来自需求）

1. 保持端口不变。
2. 仅重构代码，不改线上/本地访问入口语义。
3. UI 先使用 shadcn 默认组件样式。
4. 必须预留主题调整空间（后续可快速换肤、改色、改密度）。
5. 第一阶段尽量保持现有页面尺寸/布局一致（重点是 `height/width/spacing`），视觉细化后续再做。
6. 逐步替换 Angular + Material，不保留第二套长期并行 UI 体系。

## 3. 参考规范（skills）

迁移过程必须参考并落地以下 skill：

1. `.agents/skills/vercel-react-best-practices/SKILL.md`
2. `.agents/skills/frontend-design/SKILL.md`

### 3.1 vercel-react-best-practices 落地重点

1. 路由级与功能级代码拆分，控制首屏包体积。
2. 避免请求瀑布，独立请求并行化。
3. 减少无意义重渲染，稳定依赖与回调引用。
4. 第三方依赖按需引入，避免 barrel import 引起额外打包。
5. 高成本视图（表格、日志、卡片列表）优先做渲染与交互性能控制。

### 3.2 frontend-design 落地重点

1. 当前阶段不追求重设计，先保持布局一致性与信息层级。
2. shadcn 组件先采用默认风格，但统一走主题变量，不写死颜色。
3. 所有新样式优先沉淀为 token，避免后续全局改肤困难。

## 4. 现状基线（迁移前）

1. 前端工程路径：`packages/play`。
2. 运行形态：
   - Angular 开发：默认 `ng serve`（当前生态默认 `4200`）。
   - 生产静态目录：`packages/play/dist/ptcg-play`。
3. 后端静态托管目录绑定：
   - `config.backend.webUiDir = __dirname + '/packages/play/dist/ptcg-play'`（见 `init.js`）。
4. 前端路由基线（必须保持路径不变）：
   - `/games`
   - `/deck`
   - `/deck/:deckId`
   - `/login`
   - `/register`
   - `/message/:userId`
   - `/ranking`
   - `/replays`
   - `/profile/:userId`
   - `/reset-password`
   - `/reset-password/:token`
   - `/table/:gameId`
   - `/testing`
   - `/scenario`

## 5. 迁移策略

采用“分阶段替换 + 明确验收闸门”的策略，不做一次性 Big Bang 重写。

### 阶段 0：冻结与清单

目标：建立可对齐的迁移基线，防止边迁边漂移。

1. 冻结 Angular UI 新需求（仅允许 bugfix）。
2. 输出组件与路由清单、Material 依赖清单、关键尺寸 token 清单。
3. 确认第一批迁移页面优先级（低风险页先行）。

验收：

1. 有清单文档可追踪。
2. 已标记高风险模块（`table/prompt/scenario`）。

### 阶段 1：React 基座落地

目标：建立新前端运行骨架，但不改业务语义。

1. 在 `packages/play` 内切到 React + Vite 工程结构。
2. 配置 Vite：
   - 开发端口固定 `4200`，`strictPort: true`。
   - `build.outDir` 对齐 `dist/ptcg-play`。
3. 接入 Tailwind 与 shadcn/ui 基础。
4. 建立 React Router 路由框架，路径与原 Angular 保持一致。
5. 建立 i18n 基础层（沿用现有词条资源文件）。

验收：

1. `npm --workspace @ptcg/play run build` 通过。
2. 静态产物目录不变。
3. `npm run restart:app` 后可由后端正常托管。

### 阶段 2：设计 token 与布局对齐层

目标：先复用“尺寸/布局语义”，再替换页面内容。

1. 将现有尺寸常量映射为 CSS Variables + Tailwind theme 扩展。
2. 建立页面壳层（顶栏、侧栏、主区域）并对齐原布局宽高。
3. 规定新样式禁止直接写死主题色，统一引用 token。

验收：

1. App shell 尺寸对齐通过。
2. Token 可支持后续主题切换，无大规模重构需求。

### 阶段 3：低风险页面迁移

目标：先建立稳定迁移节奏。

建议顺序：

1. `login/register/reset-password`
2. `games/ranking/replays`
3. `messages/profile`

要求：

1. API 入参/出参契约保持不变。
2. i18n key 名不改，避免翻译链路回归。
3. 关键 UI 尺寸（容器宽高、表格行高、弹窗尺寸）与原页面对齐。

### 阶段 4：中风险页面迁移

目标：处理交互更多的编辑页面。

建议顺序：

1. `deck`
2. `deck/:deckId`
3. 通用弹窗/选择器/文件输入等共享组件

要求：

1. 迁移共享组件时优先做 shadcn 封装，避免重复造轮子。
2. 列表与编辑交互保持操作路径一致。

### 阶段 5：高风险核心页面迁移

目标：处理最复杂的对局与调试链路。

模块：

1. `table/:gameId`
2. `prompt` 相关组件族
3. `testing` 与 `scenario`

要求：

1. 先保证行为一致，再优化视觉。
2. 对复杂交互（提示流、拖拽、回放、日志）增加针对性回归用例。

当前状态判定（2026-03-30）：

1. React 已经是默认运行入口，但阶段 5 不应判定为已完成。
2. 在阶段 5 明确验收前，不应执行阶段 6 的删除 Angular/Material 收口动作。
3. 依据当前代码现状，Angular 旧实现仍承担 React 侧尚未覆盖的功能补位作用。

未完成依据：

1. `table/:gameId` 尚未达到“行为一致”。
   - React 入口为 `packages/play/src/pages/table-page.tsx`，目前覆盖基础牌桌、手牌、少量动作和简化版 `PromptHost`。
   - Angular 旧实现位于 `packages/play/src/app/table`，仍包含 React 侧未覆盖的重要能力：
     - `table-sidebar/game-logs`
     - `table-sidebar/replay-controls`
     - `table-sidebar/player-actions`
     - 更完整的 `prompt-*` 组件族
2. `testing` 与 `scenario` 现有 React 页面只能视为“入口已存在”，不能视为“迁移完成”。
   - React 入口为 `packages/play/src/pages/testing-page.tsx` 与 `packages/play/src/pages/scenario-page.tsx`。
   - Angular 旧版 `packages/play/src/app/testing/scenario-lab.component.ts` 仍具备更完整的沙盘编辑链路，包括 editor、zone/slot/board 编辑、导出模板和更成熟的本地态联动。
   - 当前 React `scenario` 更接近 API 控制台，尚未达到“先保证行为一致”的阶段目标。
3. 阶段 5 的测试要求尚未满足。
   - React 侧目前缺少围绕 `table/testing/scenario/prompt` 的针对性回归用例。
   - `packages/play/e2e` 中现存内容不足以覆盖牌桌、提示流、回放、日志等核心高风险交互。

阶段 5 差距清单（必须补齐后，才允许进入阶段 6）：

1. `table/:gameId` 行为补齐
   - 为 React 牌桌补齐可替代 Angular `table-sidebar` 的侧边栏能力。
   - 最低必须覆盖：
     - 对局日志展示
     - 回放控制
     - 玩家操作区
     - 与旧版一致的关键状态展示
   - 补齐 React `PromptHost`，覆盖当前 Angular 仍存在的关键 `prompt-*` 组件族，至少包括常见对局主流程会触发的提示类型。
   - 对拖拽交互补齐与旧版一致的主要行为路径，包括手牌操作、bench 重排、目标选择与提示流联动。
   - 完成标准：
     - 常见真实对局路径无需回退到 Angular 页面或缺失关键交互。
     - 不再存在“只能在 Angular table 完成”的核心对局动作。

2. `testing` 页能力补齐
   - React `testing` 不能只停留在建局表单。
   - 需要对齐旧版 Testing Lab 的核心使用路径，至少覆盖：
     - 测试对局创建
     - 常见调试入口跳转
     - 与牌桌/Scenario Lab 的联动入口
   - 完成标准：
     - 日常用于卡效验证的 Testing Lab 主链路可完全在 React 页面完成。

3. `scenario` 页能力补齐
   - React `scenario` 需要从“API 控制台”提升到“可替代旧版 Scenario Lab 的调试页面”。
   - 最低必须覆盖：
     - board editor
     - zone editor
     - pokemon slot editor
     - 导出模板/导出结果辅助
     - 本地态与服务端状态的清晰同步反馈
   - 应保留结构化调试路径，不允许为了 UI 迁移而削弱可编程性。
   - 完成标准：
     - 常见构局、patch、action、prompt resolve、assert 操作无需再依赖 Angular 旧版弹窗和编辑器。

4. 阶段 5 回归测试补齐
   - 为 React `table/testing/scenario/prompt` 增加针对性测试，而不是只保留旧 Angular 示例。
   - 最低必须补三类：
     - 牌桌关键交互回归：进入牌桌、接收状态更新、执行核心动作、处理 prompt
     - 调试链路回归：Testing 建局、Scenario 创建/加载/删除/执行 action
     - 高风险辅助能力回归：日志、回放控制、关键 prompt 分支
   - 验收不要求一次性建立完整大而全的 e2e 体系，但必须有能阻止行为回退的实际用例。

5. 阶段 5 完成判定
   - 只有同时满足以下条件，阶段 5 才能标记完成：
     - `table/:gameId` 已达到可替代 Angular 旧牌桌的行为一致性
     - `testing` 与 `scenario` 已达到可支撑日常调试工作的功能一致性
     - React 侧已具备覆盖复杂交互的针对性回归用例
   - 任何一项未满足，都应继续停留在阶段 5，不得推进阶段 6。

建议执行顺序：

1. 先补 `table/:gameId` 的 sidebar + prompt 缺口，因为这是最直接阻塞“行为一致”的页面。
2. 再补 `scenario` 的 editor/模板/本地态联动，因为它直接影响调试链路替代能力。
3. 再补 `testing` 与 `scenario` 的联动打磨，收口 React 调试主路径。
4. 最后补阶段 5 的 React 针对性回归，作为进入阶段 6 前的闸门。

### 阶段 6：清理与收口

目标：彻底去除 Angular + Material 遗留。

1. 删除 Angular 专属依赖与配置文件（在 React 全量替换完成后）。
2. 清理无用样式与无引用资源。
3. 更新 README/开发命令说明。

验收：

1. 前端依赖树中无 Angular/Material 运行时依赖。
2. 构建、启动、核心路由回归通过。

## 6. 主题预留设计（必须）

1. 定义语义化主题 token：
   - `--color-bg`, `--color-surface`, `--color-text`, `--color-border`, `--color-primary` 等。
2. Tailwind `theme.extend` 与 token 对齐，不直接散写色值。
3. shadcn 组件走统一 token（通过 CSS variables 驱动）。
4. 主题切换机制最少预留：
   - `data-theme` 或等价方式。
   - 明暗主题可扩展，不阻塞当前默认主题。

## 7. 验证与回归要求

每个阶段至少执行：

1. 构建验证：`npm --workspace @ptcg/play run build`
2. 整体重启验证：`npm run restart:app`
3. 路由可达性 smoke test（至少覆盖 `/games`、`/deck`、`/table/:gameId`、`/scenario`）。
4. 尺寸/布局对齐检查（关键容器 width/height 与主要间距）。

如果某项未验证，必须记录原因和风险，不可直接宣称“已完成迁移”。

## 8. 风险与规避

1. 风险：组件体量大（大量页面与 Material 控件），一次性迁移失败概率高。  
   规避：按阶段拆分并设置验收闸门。
2. 风险：样式迁移后布局漂移。  
   规避：先迁 token 与壳层，再迁页面内容。
3. 风险：复杂对局交互回归（table/prompt/scenario）。  
   规避：最后迁移 + 强化回归。
4. 风险：主题写死导致后续改版成本高。  
   规避：所有颜色/圆角/间距均走 token。

## 9. 完成定义（Definition of Done）

满足以下全部条件才视为迁移完成：

1. React + Vite + Tailwind + shadcn 已完整替代 Angular + Material。
2. 端口与访问入口行为保持原状。
3. 主要页面的尺寸/布局与旧版一致性达标。
4. 构建、重启、核心流程验证通过并有记录。
5. 主题 token 机制可支持后续 UI 精细化迭代。

## 10. 阶段 5/6 代办清单（可执行）

### 10.1 `table/:gameId` 行为一致性

- [ ] 补齐 React 侧边栏能力与旧版 `table-sidebar` 对齐（日志/回放/玩家操作/关键状态）。
- [ ] 清点并补齐 `PromptHost` 未覆盖的高频 `prompt-*` 类型，逐项移除手动 JSON fallback 依赖。
- [ ] 补齐拖拽主路径一致性（手牌操作、bench 重排、目标选择、与 prompt 联动）。
- [ ] 以真实对局路径验收：常见操作无需回退 Angular 牌桌。

### 10.2 `testing` 调试主链路

- [ ] 补齐 Testing Lab 主链路（建局、跳转、联动）并与日常卡效验证流程对齐。
- [ ] 增加失败态提示与可恢复路径（请求失败、参数不合法、无可用 deck）。
- [ ] 验收：从 `testing` 完成建局并进入 `table` / `scenario` 的完整闭环。

### 10.3 `scenario` 调试页面能力

- [ ] 继续对齐旧版 Scenario Lab 编辑能力（board/zone/slot editor 与状态反馈一致性）。
- [ ] 强化导出模板、导出结果和 assert 模板的可复用性，保留结构化调试路径。
- [ ] 验收：常见 `create/load/patch/action/prompt resolve/assert` 无需依赖 Angular 弹窗。

### 10.4 阶段 5 回归测试闸门

- [ ] 建立 React 牌桌关键交互回归（进入牌桌、状态更新、核心动作、prompt 处理）。
- [ ] 建立调试链路回归（Testing 建局、Scenario 创建/加载/删除/执行 action）。
- [ ] 建立高风险辅助能力回归（日志、回放控制、关键 prompt 分支）。
- [ ] 客户端测试文件统一放在 `packages/play/src/__tests__`，不与业务实现文件混放。

### 10.5 阶段 6 收口（仅在阶段 5 完成后执行）

- [ ] 删除 Angular/Material 运行时与构建配置（`angular.json`、`src/app/**`、`karma/protractor` 等遗留）。
- [ ] 清理无引用样式、资源和旧测试基建。
- [ ] 更新 README 与开发命令，统一 React/Vite 工作流说明。
- [ ] 验收：依赖树无 Angular/Material 运行时，构建与核心路由回归通过。
