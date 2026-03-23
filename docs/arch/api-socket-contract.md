# Ryuu Play API 与 Socket 协议清单（独立文档）

本文档汇总当前项目 `server <-> play` 的接口契约：

- REST API（Express controllers）
- Socket 事件（Socket.IO）
- 认证、错误与编码约定

适用版本：`apiVersion = 4`（见 `/v1/login/info`）

---

## 1. 通用约定

## 1.1 REST 基础

- Base URL：`http://<host>:<port>`（开发默认 `http://localhost:12021`）
- 统一前缀：`/v1/...`
- 鉴权 header：`Auth-Token: <token>`（受保护接口需携带）
- 典型响应：
  - 成功：`{ ok: true, ... }`
  - 失败：`{ error: <ApiErrorEnum>, ... }`

## 1.2 Socket 基础

- 连接：`socket.io-client` 连接同一 API 地址
- 鉴权：连接 query 带 `token`（`auth-middleware` 校验）
- request/response 统一 envelope（ack）：
  - 成功：`{ message: "ok", data?: any }`
  - 失败：`{ message: "error", data?: ApiErrorEnum | string }`

## 1.3 状态数据编码

- 对局状态 `stateData` 编码：`Base64( StateSerializer.serialize(state) )`
- 回放 `replayData` 传输也使用 Base64

---

## 2. REST API 清单

以下按 controller 分组。`Auth` 列说明是否需要 `Auth-Token`。

## 2.1 Login (`/v1/login`)

| Method | Path | Auth | 说明 |
|---|---|---|---|
| `POST` | `/v1/login` | No | 用户名密码登录，返回 token + server config |
| `POST` | `/v1/login/register` | No | 注册 |
| `GET` | `/v1/login/refreshToken` | Yes | 刷新 token |
| `GET` | `/v1/login/logout` | Yes | 登出（服务端无状态） |
| `GET` | `/v1/login/info` | No | 获取 server config 与 apiVersion |

---

## 2.2 Cards (`/v1/cards`)

| Method | Path | Auth | 说明 |
|---|---|---|---|
| `GET` | `/v1/cards/info` | No | 获取 cardsInfo（含 hash、formats、总数） |
| `GET` | `/v1/cards/get/:page` | No | 分页获取卡定义（每页 `cardsPerRequest`） |

---

## 2.3 Decks (`/v1/decks`)

| Method | Path | Auth | 说明 |
|---|---|---|---|
| `GET` | `/v1/decks/list` | Yes | 当前用户牌组列表 |
| `GET` | `/v1/decks/get/:id` | Yes | 获取牌组详情 |
| `POST` | `/v1/decks/save` | Yes | 新建/更新牌组（含合法性分析） |
| `POST` | `/v1/decks/delete` | Yes | 删除牌组 |
| `POST` | `/v1/decks/rename` | Yes | 重命名牌组 |
| `POST` | `/v1/decks/duplicate` | Yes | 复制牌组 |

---

## 2.4 Game REST (`/v1/game`)

| Method | Path | Auth | 说明 |
|---|---|---|---|
| `GET` | `/v1/game/:id/logs` | Yes | 获取该局日志 |
| `GET` | `/v1/game/:id/playerStats` | Yes | 获取该局双方计时/统计 |

> 说明：对局动作不走 REST，统一走 Socket（见第 3 章）。

---

## 2.5 Messages (`/v1/messages`)

| Method | Path | Auth | 说明 |
|---|---|---|---|
| `GET` | `/v1/messages/list` | Yes | 会话列表（含最后一条消息） |
| `GET` | `/v1/messages/get/:id` | Yes | 与某用户的消息分页 |
| `POST` | `/v1/messages/deleteMessages` | Yes | 删除与某用户会话（逻辑删除） |

---

## 2.6 Profile (`/v1/profile`)

| Method | Path | Auth | 说明 |
|---|---|---|---|
| `GET` | `/v1/profile/me` | Yes | 当前用户资料 |
| `GET` | `/v1/profile/get/:id` | Yes | 指定用户资料 |
| `GET` | `/v1/profile/matchHistory/:userId/:page?/:pageSize?` | Yes | 对局历史 |
| `POST` | `/v1/profile/changePassword` | Yes | 修改密码 |
| `POST` | `/v1/profile/changeEmail` | Yes | 修改邮箱 |

---

## 2.7 Ranking (`/v1/ranking`)

| Method | Path | Auth | 说明 |
|---|---|---|---|
| `GET` | `/v1/ranking/list/:page?/:pageSize?` | Yes | 排行分页 |
| `POST` | `/v1/ranking/list/:page?/:pageSize?` | Yes | 排行搜索（query） |

---

## 2.8 Replays (`/v1/replays`)

| Method | Path | Auth | 说明 |
|---|---|---|---|
| `GET` | `/v1/replays/list/:page?/:pageSize?` | Yes | 回放分页 |
| `POST` | `/v1/replays/list/:page?/:pageSize?` | Yes | 回放搜索 |
| `GET` | `/v1/replays/match/:id` | Yes | 获取 match 的 replayData |
| `GET` | `/v1/replays/get/:id` | Yes | 获取用户已保存 replayData |
| `POST` | `/v1/replays/save` | Yes | 将 Match 保存为 Replay |
| `POST` | `/v1/replays/delete` | Yes | 删除 Replay |
| `POST` | `/v1/replays/rename` | Yes | 重命名 Replay |
| `POST` | `/v1/replays/import` | Yes | 导入 Replay |

---

## 2.9 Avatars (`/v1/avatars`)

| Method | Path | Auth | 说明 |
|---|---|---|---|
| `GET` | `/v1/avatars/list/:id?` | Yes | 用户头像列表 |
| `GET` | `/v1/avatars/get/:id` | Yes | 头像详情 |
| `POST` | `/v1/avatars/find` | Yes | 按用户+名字找头像 |
| `POST` | `/v1/avatars/add` | Yes | 上传头像（base64） |
| `POST` | `/v1/avatars/delete` | Yes | 删除头像 |
| `POST` | `/v1/avatars/rename` | Yes | 重命名头像 |
| `POST` | `/v1/avatars/markAsDefault` | Yes | 设为默认头像 |

---

## 2.10 Reset Password (`/v1/resetPassword`)

| Method | Path | Auth | 说明 |
|---|---|---|---|
| `POST` | `/v1/resetPassword/sendMail` | No | 发送重置密码邮件 |
| `POST` | `/v1/resetPassword/changePassword` | No | 使用一次性 token 改密码 |

---

## 3. Socket 事件清单

## 3.1 Client -> Server

### Core 级

| Event | Payload | Ack `data` |
|---|---|---|
| `core:getInfo` | `void` | `CoreInfo` |
| `core:createGame` | `{ deck: string[], gameSettings: GameSettings, clientId?: number }` | `GameState` |

### Game 级

| Event | Payload | Ack |
|---|---|---|
| `game:join` | `gameId: number` | `GameState` |
| `game:leave` | `gameId: number` | `void` |
| `game:getStatus` | `gameId: number` | `GameState` |
| `game:action:ability` | `{ gameId, ability, target }` | `void` |
| `game:action:attack` | `{ gameId, attack }` | `void` |
| `game:action:stadium` | `{ gameId }` | `void` |
| `game:action:trainer` | `{ gameId, cardName, target }` | `void` |
| `game:action:play` | `{ gameId, deck: string[] }` | `void` |
| `game:action:playCard` | `{ gameId, handIndex, target }` | `void` |
| `game:action:resolvePrompt` | `{ gameId, id, result }` | `void` |
| `game:action:retreat` | `{ gameId, to }` | `void` |
| `game:action:reorderBench` | `{ gameId, from, to }` | `void` |
| `game:action:reorderHand` | `{ gameId, order: number[] }` | `void` |
| `game:action:passTurn` | `{ gameId }` | `void` |
| `game:action:appendLog` | `{ gameId, message }` | `void` |
| `game:action:changeAvatar` | `{ gameId, avatarName }` | `void` |

### Message 级

| Event | Payload | Ack `data` |
|---|---|---|
| `message:send` | `{ userId, text }` | `{ message: MessageInfo, user: UserInfo }` |
| `message:read` | `{ userId }` | `void` |

---

## 3.2 Server -> Client

### Core 广播

| Event | Payload | 触发时机 |
|---|---|---|
| `core:join` | `{ clientId, user }` | 有客户端连接 |
| `core:leave` | `clientId` | 客户端断开 |
| `core:createGame` | `GameInfo` | 新游戏创建 |
| `core:deleteGame` | `gameId` | 游戏删除 |
| `core:gameInfo` | `GameInfo` | 游戏摘要变化（phase/turn/players 等） |
| `core:usersInfo` | `UserInfo[]` | 用户资料/排行变更 |

### Game 频道广播

| Event | Payload | 说明 |
|---|---|---|
| `game[<id>]:join` | `{ clientId }` | 有客户端加入该局 |
| `game[<id>]:leave` | `{ clientId }` | 有客户端离开该局 |
| `game[<id>]:stateChange` | `{ stateData, playerStats }` | 该局状态变化推送 |

### Message 广播

| Event | Payload | 说明 |
|---|---|---|
| `message:received` | `{ message, user }` | 收到新消息 |
| `message:read` | `{ user }` | 对端已读通知 |

---

## 4. 常见错误码来源

错误码主要来自 `ApiErrorEnum`，常见触发：

- `AUTH_TOKEN_INVALID`：token 无效/过期（REST 或 Socket 握手）
- `REQUESTS_LIMIT_REACHED`：限流触发
- `VALIDATION_INVALID_PARAM`：参数校验失败
- `GAME_INVALID_ID` / `PROMPT_INVALID_ID`：对局/Prompt 不存在
- `SOCKET_ERROR`：客户端对 socket ack 的错误封装

前端 `ApiInterceptor` 与 `SocketService` 会把这些错误统一转成 `ApiError`。

---

## 5. 联调检查清单

- 登录后先拿到 token，再启用 socket（query token）
- action 前确保已 `game:join` 并在本地有对应 `LocalGameState`
- `resolvePrompt` 必须先用服务器下发 prompt 的 `id`，并通过 prompt decode/validate
- 对局渲染使用 `stateData` 解码后的 `State`，不要直接信任 UI 本地推导
- 回放导入导出统一走 Base64 的 `replayData`

---

## 6. 参考实现位置（快速索引）

- REST 控制器：`packages/server/src/backend/controllers/*`
- Socket 入口：`packages/server/src/backend/socket/websocket-server.ts`
- Socket 处理：`core-socket.ts` / `game-socket.ts` / `message-socket.ts`
- 前端 API：`packages/play/src/app/api/services/*`
- 前端 socket 封装：`packages/play/src/app/api/socket.service.ts`
- 前端会话状态：`packages/play/src/app/shared/session/session.service.ts`
