---
name: chrome-card-testing
description: 使用 Chrome DevTools MCP 在 Ryuu Play 的 `/testing`、`/scenario`、`/table/:id` 上做真实页面测试、采集 prompt/UI/截图/网络证据。只要用户提到“Chrome MCP”“实际打开页面测试”“看 UI prompt 是否正确”“浏览器复现卡牌问题”，就优先使用此 skill。
---

# Chrome Card Testing

这个 skill 用于真实打开 Ryuu Play 页面，验证卡牌效果是否在浏览器 UI 中按预期表现，而不是只依赖单测或接口返回。

## 默认环境

- Node 22
- 默认站点：`http://127.0.0.1:12021/`
- 默认账号：`easygod3780`
- 默认密码：`pass123`
- 启动前优先执行：`npm run restart:app`

## 什么时候用

- 用户明确要求用 Chrome MCP 做实际页面测试
- 需要观察 prompt、弹窗、卡区、日志、截图
- 需要确认前端 UI 与规则引擎是否一致
- 需要保留结构化浏览器证据

## 页面选择

- `/testing`
  - 适合旧测试实验室、最小牌组复现
- `/scenario`
  - 适合无卡组构局、沙盘编辑、人测 + 观测
- `/table/:id`
  - 适合真实对局链路和复杂手工复现

## 标准流程

1. 执行 `npm run restart:app`
2. 打开登录页并用默认账号登录
3. 根据任务选择 `/testing`、`/scenario` 或 `/table/:id`
4. 执行复现步骤
5. 采集证据：
   - 文本快照
   - 截图
   - console
   - network
   - 页面状态文字
6. 输出结构化结论

## 证据采集重点

- prompt 是否出现、是否缺失、是否重复
- 卡区是否变化正确
- 伤害、状态、能量附着是否与规则一致
- 日志是否反映真实结算
- 前端是否显示错误卡图或错误 variant

## 推荐输出格式

1. 测试目标
2. 测试页面
3. 复现步骤
4. 观察结果
5. 证据类型
6. 最终结论
7. 如果失败，指出是规则、前端、脚本还是构局问题
