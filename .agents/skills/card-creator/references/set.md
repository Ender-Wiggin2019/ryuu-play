# Set 与目录结构

## 1) 先判断是“已有 set”还是“新增 set”

### 已有 set

只需要做三件事：

1. 在目标目录新增卡牌文件。
2. 在该 set 的 `index.ts` 添加 import。
3. 在 `setXxx: Card[]` 中 `new` 你的卡牌类。

参考：`packages/sets/src/standard/set-black-and-white-3/index.ts`

### 新增 set

按以下顺序接入：

1. 在对应分组下新建目录（示例：`packages/sets/src/standard/set_g/` 或 `set_h/`）。
2. 在新目录建立 `index.ts`，导出 `setG: Card[]` / `setH: Card[]`（按目录命名）。
3. 在分组入口导出新 set：
   - `packages/sets/src/standard/index.ts`（或 `base-sets/index.ts` / `ex-sets/index.ts`）
4. 若是新分组（极少见），还要更新 `packages/sets/src/index.ts`。
5. 在根目录 `init.js` 的 `cardManager.defineFormat(...)` 中，把新 set 挂到正确 format。

> 只有完成第 5 步，服务端卡池才会真正包含新 set。

## 2) set 目录结构建议

建议沿用当前结构（按 regulation mark 分组）：

```
set_g/
  index.ts
  card-a.ts
  card-b.ts
  ...
```

`index.ts` 最小模板：

```ts
import { Card } from '@ptcg/common';
import { CardA } from './card-a';

export const setG: Card[] = [
  new CardA(),
];
```

## 3) 命名与唯一性

- `set`：统一使用 `set_<regulationMarkText 小写>`（如 `set_h`、`set_g`），从 card-data 的 `details.regulationMarkText` 推导。
- 目录：`packages/sets/src/standard/set_<regulationMarkText 小写>/`（如 `set_g/`、`set_h/`）。
- `name`：卡牌展示名。
- `fullName`：必须全局唯一（推荐 `"<name> <set-code>"` 风格）。

如果 `fullName` 重复，`CardManager` 在注册 format 时会报错（见 `packages/common/src/game/cards/card-manager.ts`）。

## 4) 新增 set 的检查清单

- 新目录和 `index.ts` 已创建
- 分组入口 `index.ts` 已导出
- `init.js` 已加入对应 `defineFormat`
- 每张卡都已被 set 数组引用（避免“实现了但没进卡池”）
