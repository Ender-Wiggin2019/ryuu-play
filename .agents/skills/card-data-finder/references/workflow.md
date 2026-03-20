# Workflow

## 1) 更新数据

每次正式检索前执行：

```bash
python3 .agents/skills/card-data-finder/scripts/resolve_card.py update
```

这一步会从远端下载最新 `ptcg_chs_infos.json` 到本地缓存：

- `.agents/skills/card-data-finder/assets/ptcg_chs_infos.json`

## 2) 搜索候选

```bash
python3 .agents/skills/card-data-finder/scripts/resolve_card.py search "<关键词>"
```

脚本会按名称、编码、编号等字段进行打分排序并返回 JSON。

## 3) 多候选处理

当 `total_matches > 1` 时：

- 向用户展示编号列表（`index`）
- 等用户确认要哪个
- 使用 `--select <index>` 返回最终对象

```bash
python3 .agents/skills/card-data-finder/scripts/resolve_card.py search "<关键词>" --select <index>
```

## 4) 最终对外返回

至少包含：

- `card`：数据集对象（原始对象 + 可选上下文字段）
- `image_url`：GitHub 图床 URL
- `set_version`：由 `details.regulationMarkText` 推导（如 `set_h`、`set_g`）

`set_version` 可直接用于卡牌实现目录分组：`packages/sets/src/standard/<set_version>/`。

不要下载图片到本地。
