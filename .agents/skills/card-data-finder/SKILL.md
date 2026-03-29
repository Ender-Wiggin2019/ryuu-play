---
name: card-data-finder
description: 在新增卡牌时，从本地 PTCG 简中数据库逻辑卡 API 检索卡牌对象、中文描述、多印次和 R2 图片地址。只要用户提到"查卡图""查卡牌数据""从本地数据库匹配卡牌""多个候选让我选"，都应使用此 skill。
---

# Card Data Finder

这个 skill 用于通过脚本同步本地数据库索引并检索逻辑卡，返回：

1) 匹配到的逻辑卡对象（JSON）
2) 对应 R2 图片 URL
3) 同逻辑多卡图 `printings[]` 候选，用于补充 variant 卡面
4) 最多 10 张最高稀有度 printings 列表

## 数据来源

### 本地 PTCG 简中数据库 API
- 文档入口：`http://127.0.0.1:3000/api/docs`
- 卡牌列表：`http://localhost:3000/api/v1/cards`
- 卡牌详情：`http://localhost:3000/api/v1/cards/:id`
- 图片地址：逻辑卡详情和 `printings[]` 里的 `imageUrl`，默认是 `r2.dev`

说明：
- `search` 走本地缓存索引。
- `--select` 会进一步拉取详情接口，拿到攻击、特性、规则文本、弱点、抗性、撤退等字段。
- skill 返回的 `selectedLogicalCard`、`selectedPrintings`、`r2ImageUrls` 已整理成适合 `packages/sets` 使用的结构。

## 脚本入口

- `scripts/resolve_card.py`

常用命令：

```bash
# 1) 更新本地缓存数据
python3 .agents/skills/card-data-finder/scripts/resolve_card.py update

# 2) 搜索卡牌（返回候选，支持中文名 / yorenCode / 编号 / id）
python3 .agents/skills/card-data-finder/scripts/resolve_card.py search "败露球菇ex"

# 3) 直接选择某个候选并返回对象
python3 .agents/skills/card-data-finder/scripts/resolve_card.py search "Y1441" --select 1
```

## 检索策略

1. **优先本地中文数据**：用户提交名称时，直接按中文名、`yorenCode`、编号、本地 id 检索。
2. **模糊匹配**：支持中文名、卡牌编号、`yorenCode`、合集名等多种匹配方式。
3. **variant 匹配**：如果用户要“补卡图”“补同逻辑多印次”，优先读取详情里的 `printings[]`，按稀有度排序后默认保留前 10 张。
4. **只有在需要类名 / 文件名时**，再由实现者自行决定英文转写，不依赖外部英文数据源。

### 同逻辑卡图匹配规则

给 `Pokemon / Trainer / Energy` 补卡图时，优先按以下规则匹配：

1. 同一 `regulationMarkText`
2. 同名
3. 若有 `yorenCode`，优先使用同一 `yorenCode`
4. 若 `yorenCode` 缺失，再按逻辑字段比对：
   - `Pokemon`：`hp`、`evolveText`、`attributeLabel`、`ruleLines`、`features`、`attacks`
   - `Trainer`：`trainerType`、`text`
   - `Energy`：`energyType`、`text`

如果命中了多张同逻辑卡：
- 必须把所有候选的 `id / collection_number / rarity_label / image_url` 整理出来
- 供 `card-creator` 作为多卡图 variant seed 使用
- 不要把它们当成多张不同逻辑卡

## 标准流程

1. 执行 `update`，确保本地 API 索引缓存是最新。
2. 执行 `search <query>` 获取候选。
3. 若 `total_matches == 0`：告知用户未命中，并建议补充关键信息（系列、编号、中文名/英文名）。
4. 若 `total_matches == 1`：直接返回 `selectedLogicalCard`、`selectedPrintings` 与 `r2ImageUrls`。
5. 若 `total_matches > 1`：
   - 先把候选提炼成编号列表给用户选。
   - 至少展示：`index`、`name`、`collection_name`、`collection_number`、`regulation_mark_text`、`image_url`。
   - 用户选择后，再返回对应 `selected.api_card`、`selected.card` 与 `image_url`。
6. 若用户明确要“补卡图”：
   - 不只返回 1 张
   - 还要把同逻辑 variant 一并列出
   - 明确标出哪些是 `RR / SR / SAR / UR / AR / C★ / C★★` 等版本

## 输出要求

- 不下载图片文件。
- 必须给出可直接访问的 R2 图片 URL。
- 返回对象要来自本地逻辑卡 API；允许额外补一个 `rawDataSeed` 作为 `packages/sets` 适配结构。
- 若任务是“补卡图”，输出里必须包含 `selectedPrintings`，而不是只给基础版本。

## 参考文档

- `references/workflow.md`：对话交互流程与返回格式
- `references/fields.md`：关键字段说明和展示建议
