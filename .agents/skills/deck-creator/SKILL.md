---
name: deck-creator
description: 解析用户提供的完整 deck 列表，自动识别“已实现卡牌/未实现卡牌”，并生成 missing TODO 文档与落地实现计划。只要用户提到“给你一套 deck”“按 deck 补卡”“先盘点缺卡再排计划”“把 deck 解析成待实现清单”，都应立即使用此 skill；需要补卡资料时必须联动 card-data-finder。
---

# Deck Creator

用于把一份 deck 文本快速拆解成工程可执行的补卡任务清单。

## 何时使用

当用户出现以下需求时，直接触发本 skill：

- 贴一份 deck，希望先分析缺什么卡
- 想知道哪些卡在 `packages/sets` 已经实现
- 想自动生成 TODO 文档和实现计划
- 想先拿到每张缺卡的英文描述 + 中文描述再开始开发

## 输入约定

支持如下 deck 行格式（只关注 `NAME`，稀有度可忽略）：

`{NUMBER} {NAME} {稀有度/集合信息}`

例如：

- `3 Teal Mask Ogerpon ex SVP 166`
- `1 Boss's Orders ASC 256`
- `3 Basic Lightning Energy SVE 12`

详细规则见 `references/deck-format.md`。

## 实现判定规则

- 只要在 `packages/sets/src` 中已经存在对应卡牌实现，即视为“已实现”。
- **同名但 set 不同也算已实现**（例如 deck 写 `ASC 256`，代码中已存在该卡其他版本，也归为已实现）。
- 对常见命名差异（如 `Basic Fire Energy` vs `Fire Energy`）应做等价匹配后再判定是否缺卡。

## 执行流程

1. 让用户提供完整 deck 文本，保存到本地文件（例如 `/tmp/deck.txt`）。
1. 让用户提供 deck 名称（用于目录 `docs/decks/<name>`）。
1. 如果用户没有提供名称，先询问名称，再继续执行。
1. 运行解析脚本：

```bash
python3 .agents/skills/deck-creator/scripts/analyze_deck.py \
  --deck-file /tmp/deck.txt \
  --deck-name raging-bolt-ogerpon
```

1. 脚本会自动完成：
   - 解析 deck 行并汇总数量
   - 扫描 `packages/sets/src/**/*.ts` 的 `public name` 判断是否已实现（同名跨 set 也算已实现）
   - 生成缺卡 TODO 文档
   - 生成缺卡实现计划（含英文描述、中文描述、来源提示）
1. 对未命中的中文描述，必须继续使用 `card-data-finder` 手动检索候选并补全。
1. 将结果返回给用户，先给缺卡列表与计划，再进入卡牌实现阶段（通常交给 `card-creator`）。

## 输出文件

脚本默认输出到 `docs/decks/<deck-name>/`：

- `analysis_report.json`：机器可读总报告
- `deck_todo.md`：未实现卡牌 TODO（可直接打勾追踪）
- `deck_plan.md`：缺卡计划（含 EN/CN 描述）

### 输出内容要求（新增）

- `deck_todo.md` 与 `deck_plan.md` 的每张缺卡都要包含**中文名**，用于后续 `card-data-finder` 检索。
- 若命中中文数据集，优先写入命中的中文卡名；若未命中，至少写入可检索的中文别名（若有）。
- 当中文名存在同音/异体字差异时，可同时保留常见别名，避免检索失败。

## 与 card-data-finder 的协作规则

- 对每张缺卡，优先从 `pokemon-tcg-data` 抽英文描述（attack/ability/rules）。
- 中文描述必须优先尝试 `card-data-finder`（`resolve_card.py search`）。
- 若自动检索失败，明确标记“需手动候选选择”，再让用户确认目标卡。
- 当需要用户确认候选卡时，优先使用反馈增强 MCP 做结构化选择。

## 返回给用户的建议格式

- 已实现：`N` 张（按卡名列出）
- 未实现：`M` 张（按卡名 + 数量列出）
- TODO 文档路径：`.../deck_todo.md`
- 计划文档路径：`.../deck_plan.md`
- 下一步：先逐张补卡（优先核心引擎卡），再补测试
