---
name: scenario-lab-testing
description: 使用 Ryuu Play 的 Scenario Lab 沙盘做场面构建、资源编辑、人测验证，以及用 CLI/API 做可复现回归。只要用户提到“沙盘”“Scenario Lab”“构局”“编辑场面”“验证卡效是否符合预期”“导出战场状态”“做回归脚本”，就优先使用这个 skill；默认先给终端回归方案，若用户明显在做人测，再补沙盘 UI 路径。
---

# Scenario Lab Testing

用于把卡牌验证拆成两条互补链路：

1. 沙盘 UI：给人快速造局、编辑资源、观察 prompt 和战场变化。
2. 终端回归：给 LLM 或脚本稳定执行、导出、断言和复测。

如果用户只是想在旧 `/testing` 页面开一局测试对战，用 `card-testing`。如果用户要的是“无卡组构局”“直接改 active/bench/discard/prize”“导出局部状态”“让终端自动判断卡效是否正确”，应直接用本 skill。

## 入口

### 沙盘 UI
- 页面：`/scenario`
- 目标：用棋盘视图直接编辑局面，不把底层 API 暴露成主交互

### 底层能力
- 控制器：`packages/server/src/backend/controllers/testing.ts`
- 服务：`packages/server/src/backend/services/scenario-lab.ts`
- CLI：`scripts/scenario-debug.js`
- 重启：`scripts/restart-app.sh`
- 真实页面观测：Chrome DevTools MCP / `chrome-card-testing`

### API
- `POST /v1/testing/scenario/create`
- `GET /v1/testing/scenario/:id/state`
- `POST /v1/testing/scenario/:id/action`
- `POST /v1/testing/scenario/:id/prompt/resolve`
- `POST /v1/testing/scenario/:id/patch`
- `POST /v1/testing/scenario/:id/export`
- `POST /v1/testing/scenario/:id/assert`

认证 header 使用 `Auth-Token`。

## 什么时候用哪条路径

### 优先给人的路径：沙盘 UI
适用：
- 用户要快速构一个指定场面
- 用户想肉眼看棋盘、卡区、伤害和 prompt
- 用户在描述“点一下哪里能改”“把后排换成某张卡”“看看伤害后局面”

做法：
1. 启动服务，优先执行 `npm run restart:app`
2. 默认账号：`easygod3780 / pass123`
3. 打开 `/scenario`
4. 创建沙盘
5. 通过棋盘点位编辑 active、bench、deck、discard、lostzone、prize、hand、supporter、stadium
6. 执行严格动作
7. 导出或断言结果

### 默认自动化路径：CLI / API
适用：
- 用户要留回归脚本
- 用户要让 LLM 直接判定 pass/fail
- 需要多次复跑同一个卡效

做法：
1. 先在沙盘或脑内把场面定义清楚
2. 写 `scenario.json` 或 `scenario.yaml`
3. 执行 `npm run scenario:debug -- <scenario-file>`
4. 读取结构化 `lastExport` / `lastAssert`

不要默认把用户带到手写 JSON 面板；只有当用户明确要调试底层请求时，才直接展开 API 细节。

## 标准流程

1. 先读目标卡实现与相关规则代码，确认：
   - 招式/特性名称
   - 需要的资源前置
   - 是否会生成 prompt
   - 预期的卡区、伤害、状态变化
2. 判断先走哪条链路：
   - 用户在做人测：先给沙盘 UI 路径
   - 用户在做回归：直接给 CLI/API 路径
3. 创建 scenario：
   - 默认可无卡组建局
   - 不要为了“合法开局”浪费时间，除非用户明确要求完整开局链路
4. 造局：
   - UI：通过点位编辑器改棋盘
   - 自动化：通过 `patch` 完成资源注入
5. 执行真实规则动作：
   - `action` 只做真实引擎动作
   - `prompt/resolve` 只解决引擎发出的 prompt
6. 导出或断言：
   - `export` 看状态
   - `assert` 给结构化结论
7. 如果行为不对，明确失败发生在：
   - 造局
   - 动作执行
   - prompt 结算
   - 导出/断言
8. 如果这次验证具有复用价值，沉淀成 CLI 场景脚本。

## 造局原则

`patch` 是 debug 注入；`action` 和 `prompt/resolve` 是严格规则链路。

推荐分工：
- `patch` 负责把场面改到可测状态
- `action` 负责执行招式/特性/训练家等真实行为
- `export` / `assert` 负责验收

不要把“想验证的结果”直接 patch 出来，否则没有测试意义。

## 常用编辑 / patch 模式

### 资源编辑
- `setZoneCards`
- `moveCard`
- `setDamage`
- `setSpecialCondition`
- `setTurnMarker`

### 稳定化
- `clearPrompts`
- `setState`

当场面来自强行注入，而不是完整对局流程时，优先做一次稳定化再执行动作。否则常见问题是：
- `ACTION_IN_PROGRESS`
- `NOT_YOUR_TURN`
- 首回合限制误伤测试结果

## Prompt 与动作

优先原则：

1. 先读 `state.prompts`，不要猜 prompt 是否存在。
2. `promptId` 必须来自当前 state。
3. `actor` 必须与 `prompt.playerId` 对应。
4. 如果一个动作后没出现预期 prompt，先检查 phase / turn / actor / 目标卡区，而不是先怀疑 prompt 组件。

如果用户是在沙盘 UI 里人测，说明下一步时应优先用“点击棋盘 -> 执行动作 -> 看结果”的表述；不要把答案退化成一串裸 API。

## 导出与断言

### 导出
优先用最小 scope：
- `active`
- `bench`
- `player`
- `board`
- `full`

只有在定位困难时才默认上 `full`。

### 断言 DSL
首选：
- `zoneCount`
- `cardInZone`
- `damage`
- `specialCondition`
- `energyAttached`
- `prizeRemaining`
- `turnMarker`
- `promptPending`

结果应优先返回结构化结论，而不是自然语言长篇解释。

## CLI 场景脚本建议

脚本命名尽量表达业务意图，例如：
- `scenario-hou-jiao-wei-bench-ko.json`
- `scenario-gardevoir-psycho-embrace-limit.json`
- `scenario-supporter-once-per-turn.json`

推荐结构：

```json
{
  "create": {
    "formatName": "Standard"
  },
  "steps": [
    {
      "type": "patch",
      "operations": []
    },
    {
      "type": "action",
      "actor": "PLAYER_1",
      "actionType": "attack",
      "payload": {
        "attack": "凶暴吼叫"
      }
    },
    {
      "type": "assert",
      "checks": []
    }
  ]
}
```

如果用户已经先在沙盘 UI 里构好局面，建议把那次复现压缩成一份最小 CLI 脚本，作为回归资产留存。

## 推荐输出格式

每次测试结束，按这个顺序汇报：

1. 测试目标
2. 使用路径
   - 沙盘 UI 或 CLI/API
3. 造局方式
4. 严格执行的动作链
5. 导出范围
6. 断言结果
7. 最终结论

如果失败，再补：
1. 卡在哪一步
2. 当前 prompt / phase / actor
3. 是引擎 bug、脚本 bug、还是构局不完整

## 与其他 skill 的协作

- 改卡或加卡后回归：先用 `card-creator`，再用本 skill。
- 查卡牌原文、编号、图片、多 variant：联动 `card-data-finder`。
- 需要真实前端页面观测、截图、console 或网络证据时，联动 `chrome-card-testing`。
- 旧 `/testing` 或真实对局手工复现：回退到 `card-testing`。
