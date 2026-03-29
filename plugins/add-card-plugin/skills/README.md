# Add Card Plugin

这个插件为“新增卡牌”提供结构化能力，但它的完成条件不是“查到卡牌”或“产出 scaffold”，而是：

1. 输入一个宝可梦列表
2. 从本地逻辑卡数据库中定位目标卡
3. 给出实现落点与代码实现建议
4. 通过 `scenario-lab-testing` 的终端回归验证卡效
5. 回归通过后才算完成

## 默认输入

- `pokemonQueries[]`
- 可选 `regulationMark`
- 可选 `limitPrintings`，默认 10

## 默认输出

- `cards[]`
  - `query`
  - `logicalCandidates[]`
  - `selectedLogicalCard`
  - `selectedPrintings[]`
  - `r2ImageUrls[]`
  - `setTarget`
  - `rawDataSeed`
  - `implementationHints`
- `workflow`
  - `search`
  - `implement`
  - `regression`
- `regressionPlan`
  - `skill`: `scenario-lab-testing`
  - `path`: `terminal`
  - `successCondition`: 回归测试通过
- `terminalCondition`
  - 只有 Scenario Lab 终端回归通过才返回 `done`

## 数据源

- `/Users/easygod/code/PTCG-CHS-Datasets/README.md`
- `http://localhost:3000/api/docs`
- `http://localhost:3000/api/openapi.json`

## 默认规则

- 逻辑卡详情来自 `GET /api/v1/cards/:id`
- 多卡图来自 `printings[]`
- 默认最多导入 10 张最高稀有度 printings
- 卡图默认使用 `r2.dev` 图片 URL
- 先定位卡，再输出实现建议，再要求走 `scenario-lab-testing`
- 默认不依赖浏览器；回归路径是 CLI / API / scenario debug
