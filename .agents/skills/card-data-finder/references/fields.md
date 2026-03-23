# 关键字段说明

脚本返回的候选项里，建议优先向用户展示这些字段：

- `index`：候选编号（用于用户选择）
- `name`：卡名
- `collection_name`：所属补充包/集合名
- `collection_number`：卡牌编号（来自 `details.collectionNumber`）
- `yoren_code`：卡牌代码（如存在）
- `card_type`：卡牌类型（来自原对象）
- `regulation_mark_text`：标记（如 `H`、`G`）
- `set_version`：从 `regulationMarkText` 映射出的 set 版本（如 `set_h`、`set_g`）
- `image`：仓库内相对图片路径
- `image_url`：最终可访问 URL
- `score`：检索匹配分数（越高越相关）
- `source`：候选来源（`ptcg-chs` 或 `pokemon-tcg-data`）

## image_url 规则

如果卡对象里 `image = "img/458/0.png"`，则：

`image_url = "https://raw.githubusercontent.com/duanxr/PTCG-CHS-Datasets/main/img/458/0.png"`

## 返回对象约定

`selected.card` 中保留：

- `raw_card`：原始卡对象
- `collection`：该卡所属集合对象（用于补充上下文）

这样既有原始信息，也便于用户后续实现新卡时复制关键字段。
