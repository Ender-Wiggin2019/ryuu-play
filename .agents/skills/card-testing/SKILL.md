---
name: card-testing
description: 在 Ryuu Play 中验证卡牌效果、Prompt 流程与真实对局链路。只要用户提到“测试实验室”“旧 /testing 页面”“最小牌组复现”“真实对局复现”“用 Chrome MCP 在牌桌上复现卡牌问题”，就优先使用此 skill。凡是沙盘 / Scenario Lab / 无卡组构局 / 场面直接编辑 / 终端回归脚本，一律改用 scenario-lab-testing。
---

# Card Testing

用于验证卡牌在真实运行链路中的表现，而不是只看单测是否通过。

这个 skill 只覆盖两类场景：

1. 旧 `/testing` 页面和 `POST /v1/testing/create` 的测试实验室链路
2. 真实牌桌 `/table/:id` 上的手工复现

如果用户要的是以下能力，不要继续用本 skill，直接切到 `scenario-lab-testing`：
- Scenario Lab
- 沙盘
- 无卡组构局
- 直接编辑 active / bench / discard / prize / damage / 状态
- 导出局部战场状态
- CLI 回归脚本
- 结构化 assert

## 依赖的现有能力

### 前端测试入口
- 页面：`/testing`
- 组件：`packages/play/src/app/testing/testing.component.ts`

### 后端测试接口
- 创建测试局：`POST /v1/testing/create`
- 控制器：`packages/server/src/backend/controllers/testing.ts`

### 真实对局页面
- 牌桌：`/table/:id`
- 创建后会直接进入真实规则引擎，不是 mock 页面

## 标准流程

1. 确认服务已启动。
2. 确认目标卡已经接入当前 format，且牌组有效。
3. 选择一种测试方式：
   - 快速人工验证：打开 `/testing`
   - 接口验证：调用 `POST /v1/testing/create`
   - 复杂复现：创建专用测试牌组，再用 Chrome MCP 进入 `/table/:id`
4. 默认环境：
   - Node 22
   - 账号 `easygod3780`
   - 密码 `pass123`
   - 页面验证前优先执行 `npm run restart:app`
5. 创建测试对局，至少指定：
   - `playerDeckId`
   - `botDeckId`
   - `formatName`
6. 进入牌桌后重点观察：
   - prompt 是否多出或缺失
   - 卡牌是否进入正确卡区
   - 伤害 / 指示物 / 异常状态是否正确
   - 能量支付与减费是否正确
   - 日志是否与效果一致
   - 前后端是否出现不同步或重复提交
7. 如果行为不对：
   - 先判断问题在 `common`、`sets` 还是 `play`
   - 修完后重新走同一条测试链路复测

## 重点断言清单

### 规则侧
- 招式/特性/道具是否只执行一次
- 使用限制是否生效
- 目标选择是否合法
- 伤害与指示物是否符合文本
- 弃牌区 / 放逐区 / 手牌 / 牌库 / 备战区变化是否正确

### 前端侧
- prompt 是否出现多一次或少一次
- 点击 `OK/Cancel` 是否会重复提交
- 选择窗口关闭时机是否正确
- 详情弹窗、牌区显示、日志文案是否与规则一致

### 数据侧
- 卡图是否来自 R2 `r2.dev`
- 同逻辑多卡图是否折叠为一张逻辑卡
- 选卡图时是否能看到数据库返回的 variant 列表

## 推荐输出格式

每次测试结束，至少记录：

1. 测试入口
   - `/testing`
   - `POST /v1/testing/create`
   - `/table/:id`
2. 使用牌组
3. 复现步骤
4. 预期结果
5. 实际结果
6. 定位层级
   - `packages/common`
   - `packages/sets`
   - `packages/play`
7. 修复后验证结果

## 注意事项

- 本 skill 用于“验证真实行为”，不是替代 `packages/sets/tests/**` 单测。
- 复杂卡牌至少要做两层验证：
  - 单测
  - 测试实验室或真实牌桌链路
- 如果用户一开始就在描述“构一个指定场面再验证”，说明他们真正要的是 `scenario-lab-testing`，不要硬留在这里。
- 如果用户明确要“打开浏览器实际点页面并采证”，优先联动 `chrome-card-testing`。
