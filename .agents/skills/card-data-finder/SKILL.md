---
name: card-data-finder
description: 在新增卡牌时，从 PTCG-CHS 数据集中检索卡牌对象与 GitHub 图床链接。只要用户提到"查卡图""查卡牌数据""从 ptcg_chs_infos.json 匹配卡牌""多个候选让我选"，都应使用此 skill。
---

# Card Data Finder

这个 skill 用于通过脚本更新远程数据集并检索卡牌，返回：

1) 匹配到的原始卡牌对象（JSON）
2) 对应 GitHub 图床 URL（`raw.githubusercontent.com`）

## 数据来源

### PTCG-CHS 数据集（中文卡图）
- 元数据：`https://raw.githubusercontent.com/duanxr/PTCG-CHS-Datasets/main/ptcg_chs_infos.json`
- 图片路径来源于对象中的 `image` 字段，最终 URL 规则：
  - `https://raw.githubusercontent.com/duanxr/PTCG-CHS-Datasets/main/<image>`

### pokemon-tcg-data（英文卡数据）
- 数据源：仓库 `pokemon-tcg-data/cards/en/*.json`
- **英文关键词检索必须优先走 pokemon-tcg-data**
- 返回结果仍保持与中文数据集一致的候选结构（含 `index/name/collection_name/collection_number/image_url/card/score`）
- 当英文关键词在中文数据集无命中时，也要返回英文候选（`source: "pokemon-tcg-data"`）

## 脚本入口

- `scripts/resolve_card.py`

常用命令：

```bash
# 1) 更新本地缓存数据
python3 .agents/skills/card-data-finder/scripts/resolve_card.py update

# 2) 搜索卡牌（返回候选，支持中英文名）
python3 .agents/skills/card-data-finder/scripts/resolve_card.py search "charizard"

# 3) 直接选择某个候选并返回对象
python3 .agents/skills/card-data-finder/scripts/resolve_card.py search "charizard" --select 1
```

## 检索策略

1. **英文关键词**：优先用 `pokemon-tcg-data` 搜索并返回英文候选。
2. **中文关键词**：继续用 `ptcg_chs_infos.json` 搜索并返回中文候选。
3. **混合兼容**：同一次 `search` 支持中英文并合并排序，用户可统一用 `--select <index>` 选择。
4. **如果不确定英文名**：可以询问用户是否知道英文名称。

## 标准流程

1. 执行 `update`，确保本地缓存是最新。
2. 执行 `search <query>` 获取候选。
3. 若 `total_matches == 0`：告知用户未命中，并建议补充关键信息（系列、编号、中文名/英文名）。
4. 若 `total_matches == 1`：直接返回 `selected.card` 与 `selected.image_url`。
5. 若 `total_matches > 1`：
   - 先把候选提炼成编号列表给用户选（至少展示 index、name、collection_name、collection_number、image_url）。
   - 用户选择后，再返回对应 `card` 对象与 `image_url`。

## 输出要求

- 不下载图片文件。
- 必须给出可直接访问的 GitHub 图床 URL。
- 返回对象要来自数据集记录（可带额外字段用于上下文，但不要伪造原字段）。

## 参考文档

- `references/workflow.md`：对话交互流程与返回格式
- `references/fields.md`：关键字段说明和展示建议
