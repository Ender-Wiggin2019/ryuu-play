# RyuuPlay 二开开发手册

本文件是 RyuuPlay 的二次开发规范，主要服务 Codex、Claude 等 AI 代理，其次服务人类工程师。它不是通用 TypeScript 规范，也不是 README 的重复版；它只回答一件事：在这个仓库里，如何以高级全栈工程师的标准稳定改代码。

默认原则：

- 先理解分层边界，再做最小正确改动，再做验证。
- 优先沿用现有模式，不额外发明第二套体系。
- 任何结论都要尽量由代码、测试、构建或回归结果支撑，而不是主观判断。

默认开发环境：

- Node 默认版本：22
- 默认测试账号：`easygod3780`
- 默认测试密码：`pass123`

## 1. 项目定位

RyuuPlay 是一个基于 TypeScript 的 Pokemon TCG 模拟器单仓项目，采用 npm workspaces 管理。当前仓库已经存在大量二次开发，不应按“原始上游 demo 项目”思路处理，而应按长期维护的全栈业务仓来开发。

默认读者模型：

- AI 代理负责快速实现、验证、回归与输出。
- 人类工程师负责审阅、补充决策与最终把关。

默认工作目标：

- 保持规则层、服务层、前端层职责清晰。
- 对复杂卡效和调试能力优先保留可重复验证路径。
- 避免把短期调试修复演变成长期架构债务。

## 2. 仓库蓝图

### 顶层结构

- `packages/common`
  - 规则引擎、状态机、共享接口、序列化
  - 任何“规则定义”“Prompt 语义”“状态变迁约束”优先落这里
- `packages/sets`
  - 卡牌实现、卡池接入、通用卡牌 helper
  - 新卡、卡效修复、卡牌公共逻辑优先落这里
- `packages/server`
  - REST、Socket、存储、Bot、Scenario Lab 服务编排
  - 后端入口、测试控制器、在线对局生命周期在这里
- `packages/play`
  - Angular Web 客户端
  - UI、路由、交互、dialog、i18n、前端 API 类型在这里
- `packages/cordova`
  - Android 包装层
  - 只做移动端兼容与打包，不承接主业务逻辑
- `scripts`
  - 调试脚本、回归脚本、重启脚本、示例场景
- `plugins`
  - repo-local 插件层，给高频工作提供结构化能力，不直接替代 skill
- `init.js` / `start.js`
  - 启动配置与系统启动入口

### 核心边界

- 不允许把规则逻辑塞进 `packages/play` 或 `packages/server` 来规避 `common/sets` 分层。
- 不允许把仅 UI 层问题回写到规则层。
- 不允许把卡牌专属逻辑散落到 controller、component、脚本里。
- 不允许在已有服务/组件模式足够时，引入第二套平行抽象。
- 插件负责“能力和结构化输入输出”，skill 负责“工作流编排与落地实现”。

## 3. 分层职责与改动入口

### 改什么，先去哪里

| 需求类型 | 默认入口 |
| --- | --- |
| 改卡牌效果 | `packages/sets`，必要时补 `packages/common` |
| 改规则限制、Action、Prompt、State | `packages/common` |
| 改测试实验室、Scenario Lab API、后端调试能力 | `packages/server` |
| 改棋盘、页面、弹窗、i18n、前端 API 类型 | `packages/play` |
| 改回归脚本、调试脚本、重启脚本 | `scripts` |
| 改启动配置、format、bot 注册 | `init.js`、`start.js` |
| 改安卓兼容或打包 | `packages/cordova` |

### 默认工程决策

- 优先最小变更面，不做无关重构。
- 新功能优先复用现有组件、服务、状态模型、dialog 模式。
- 接口变更时，必须同步前端类型、调用层和必要的测试。
- 涉及 Scenario Lab 时，优先保留 REST / CLI 可编程验证能力。
- 涉及 i18n 的 Angular 页面或弹窗，默认接入翻译键，不留英文硬编码。
- 新增卡牌时，默认数据源是 `http://localhost:3000` 的逻辑卡 API 和 `/Users/easygod/code/PTCG-CHS-Datasets/README.md`。
- 卡图默认来源是 R2 `r2.dev`，不是旧的本地图片兼容接口。

## 4. 开发工作流

默认执行顺序：

1. 先读相关层的现有实现与测试。
2. 确认改动应落的 package。
3. 小步实现，避免跨层乱改。
4. 补最接近问题层的测试。
5. 运行最小必要验证。
6. 如涉及前后端联动，再做端到端验证。
7. 输出变更摘要、验证结果、剩余风险。

### 常用命令

```bash
npm --workspace @ptcg/server run compile
npm --workspace @ptcg/play run build
npm --workspace @ptcg/server run test -- <spec-or-path>
npm --workspace @ptcg/sets run test -- <spec-or-path>
npm run scenario:debug -- <scenario-file>
npm run restart:app
```

### 重启规则

- 任何需要“编译前后端并重启服务”的场景，默认用 `npm run restart:app`。
- 不要手工零散重启，除非只验证单一 package 的纯编译问题。
- 验证线上入口或本地页面行为前，优先确认当前服务是否由最新构建产物启动。

## 5. 测试与验证规范

### `packages/common`

- 规则、Action、Prompt、State 变更必须优先有单测。
- 如果只改了规则层却没有最小复现测试，默认视为验证不足。

### `packages/sets`

- 卡牌效果修复必须补对应 spec。
- 复杂卡效除了单测，还应至少做一次真实链路验证：
  - 测试实验室
  - Scenario Lab
  - 或真实对局链路

### `packages/server`

- 控制器、Scenario、调试接口改动至少要有 API 层测试或 smoke test。
- 如果 controller 输入输出结构变了，必须验证成功路径与典型错误路径。

### `packages/play`

- UI 改动至少要过构建。
- 涉及复杂交互、弹窗、沙盘编辑、路由切换时，应补组件级或集成级验证。
- 前端如果为了“看起来能跑”硬编码规则判断，视为错误实现。

### Scenario / 调试链路

- 能复现的卡效问题，优先沉淀成 `scenario:debug` 回归脚本。
- Scenario Lab 默认同时考虑两条链路：
  - UI 人测
  - CLI / LLM 可编程回归

### 验收要求

- 不能只说“逻辑看起来对”。
- 必须说明跑了哪些命令、哪些通过、哪些没跑。
- 如果没法验证，必须写出原因和剩余风险。

## 6. 前后端联动规范

- REST 或 Socket 结构变更时，先确认共享类型是否应进入 `common`，否则至少同步 `play` 的接口定义。
- 后端新增调试能力时，优先给出稳定、可脚本化的输入输出，而不是只做页面按钮。
- 前端展示层不应自行推导服务端已经明确给出的规则结果。
- 页面级新功能默认优先复用现有布局、Material dialog、service 封装和 i18n 命名空间。

## 7. 卡牌与规则开发规范

### 卡牌实现

- 单卡逻辑优先写在 `packages/sets`。
- 多张卡共享的攻击、marker、训练家逻辑，优先抽到 `packages/sets/src/common`。
- 只有当卡牌效果要求新规则抽象、Prompt 类型或状态能力时，才改 `packages/common`。

### 规则改动

- 如果改动会影响多张卡、多个 Prompt 或基础流程，必须先确认是否属于规则层职责。
- 不要为了修一张卡，在 UI 或 controller 中写临时特判。

### 卡牌验证

- 单测验证“规则是否正确”。
- Scenario 或真实链路验证“系统集成后是否正确”。
- 两者都缺一不可，尤其是复杂卡效、连锁 Prompt、伤害移动、能量附着、状态变化。
- 新增卡牌或批量补卡时，默认完成条件不是“代码写完”或“编译通过”，而是：
  - 已定位目标逻辑卡与需要接入的 printings
  - 已完成实现
  - 已通过 `scenario-lab-testing` 的终端回归

## 8. Scenario Lab / 调试规范

Scenario Lab 是无卡组构局、资源编辑、脚本回归和结构化断言的主要入口。

默认原则：

- `patch` 是 debug 注入。
- `action` / `prompt/resolve` 是严格规则链路。
- UI 方便人测，CLI 方便 LLM 和回归。

默认做法：

1. 先确定测试目标。
2. 用 Scenario 构局或 patch 造局。
3. 用严格动作链执行真实效果。
4. 用 `export` / `assert` 看结果。
5. 可复用问题沉淀成 `scenario:debug` 脚本。

要求：

- 不要把“预期结果”直接 patch 出来冒充测试。
- 不要只保留 UI 手测步骤而不留回归脚本。
- 导出优先用最小 scope，不默认全量 `full`。
- 对新增卡牌流程，默认优先使用 CLI / API 路径完成回归，不要求浏览器人工点击。

### 新增卡牌的默认闭环

当任务是“输入一个宝可梦列表并新增卡牌”时，默认闭环如下：

1. 从本地逻辑卡数据库查询目标卡。
2. 读取逻辑卡详情和 `printings[]`。
3. 默认选择最多 10 张最高稀有度 printings 作为 variant 输入。
4. 在 `packages/sets` 实现卡牌逻辑，必要时扩展 `packages/common`。
5. 使用 `scenario-lab-testing` 生成终端回归场景并执行。
6. 只有回归测试通过，才算这张卡真正完成。

## 9. 禁止事项

- 不擅自修改无关文件。
- 不在脏工作区里回滚别人的改动。
- 不使用破坏性 git 命令，如 `reset --hard`、`checkout --`。
- 不把调试临时逻辑留在正式链路。
- 不在前端硬编码规则判断替代引擎。
- 不新增与现有风格冲突的第二套模式。
- 不把 README 式说明文写成开发规范，避免空泛原则。
- 不在没有验证的情况下声称“已经修复”。

## 10. 输出与交付要求

默认最终汇报必须包含：

1. 改了什么
2. 为什么这样改
3. 怎么验证
4. 剩余风险 / 未验证项

如果用户要 review：

- 优先输出 findings
- 按严重度排序
- 附文件位置
- 摘要放在后面

如果用户要实现：

- 直接执行，不停留在泛泛方案
- 除非存在高风险不确定项，否则不要把明显可落地的工作推回给用户决策

## 11. 与现有文档的关系

- `README.md`：面向项目介绍、启动、基础使用
- `ARCHITECTURE.md`：面向整体架构解释
- `AGENTS.md`：面向实际开发决策、执行规范、验证要求
- `plugins/*`：面向高频任务的结构化能力层
- `.agents/skills/*`：面向代理的工作流编排层

三者职责不同，不应互相复制。
