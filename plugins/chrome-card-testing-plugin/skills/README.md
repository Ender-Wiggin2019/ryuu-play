# Chrome Card Testing Plugin

这个插件为 Ryuu Play 的真实页面测试提供结构化会话模板，不直接替代 Chrome DevTools MCP。

## 默认环境

- Node 22
- 站点：`http://127.0.0.1:12021/`
- 账号：`easygod3780`
- 密码：`pass123`
- 启动前：`npm run restart:app`

## 支持模式

- `testing`
- `scenario`
- `table`

## 默认输出

- `steps[]`
- `observations[]`
- `screenshots[]`
- `networkFindings[]`
- `assertionSummary`

## 设计边界

- 插件只提供结构化测试会话模板和证据采集清单
- 实际页面操作由 Chrome DevTools MCP 和 skill 编排完成
