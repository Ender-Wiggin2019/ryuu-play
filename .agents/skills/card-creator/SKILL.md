---
name: card-creator
description: 为 Ryuu Play 新增或修改卡牌实现（Pokemon/Trainer/Energy）与 set 接入流程。只要用户提到“加卡”“实现卡牌效果”“新增卡池/set”“按现有结构接入格式”“补充 ability/attack 逻辑”，都应优先使用此 skill；新增卡资料优先通过 add-card-plugin 与 card-data-finder 获取。
---

# Card Creator

用于在 `packages/sets` 中新增卡牌与 set，并确保实现符合项目约定、可被 format 加载。

## 何时使用

当用户出现以下需求时，直接使用本 skill：

- 新增某张 Pokemon / Trainer / Energy
- 在已有 set 中加卡
- 新增一个 set 并接入项目
- 实现或修复 ability / attack / trainer effect / special energy 逻辑
- 给现有逻辑卡补多卡图 / variant 卡面
- 生成“如何新增卡牌”的项目内指引

## 工作流程

1. 获取用户给出的卡牌名称或任务范围。
2. 优先使用 `plugins/add-card-plugin` 获取逻辑卡详情、printings、R2 图片和 scaffold 建议；必要时联动 `card-data-finder`。
3. 如果有多个候选，先区分：
   - 哪些是不同逻辑卡
   - 哪些只是同逻辑多卡图 variant
4. 根据任务类型选择路径：
   - 新卡逻辑：实现 `reduceEffect` / `attack` / `ability`
   - 补卡图：保留现有逻辑，只补 `rawData/fullName/image_url` 变体接线
5. 先查项目内是否有类似实现，优先复用现有模式。
6. 若实现依赖当前项目没有的底层能力（例如缺少 effect/prompt 支撑），先说明并确认再扩展 `packages/common`。
7. 完成卡牌与 set 接入，必要时同步 `init.js` 或 set `index.ts`。
8. 如是同逻辑多卡图：
   - 保持逻辑卡只实现一次
   - 通过唯一 `fullName` 接入多个 variant
   - 让前端按逻辑卡分组、按卡图选择版本
9. 至少补一个单测覆盖核心行为。
10. 用测试实验室或 `/v1/testing/create` 做一次真实链路验证。

## 强约束

- `fullName` 必须全局唯一，否则 `CardManager` 会报重复。
- `set` 版本统一使用 card-data 的 `details.regulationMarkText` 映射：`H -> set_h`、`G -> set_g`（其余同理）。
- `standard` 目录分组也按 regulation mark 走：放到 `packages/sets/src/standard/set_<regulationMarkText 小写>/`（如 `set_g/`、`set_h/`）。
- 字段语言约定：`rawData` 保持本地 API 返回的中文原始字段（用于卡图和来源追溯）；`public powers/attacks/text/name` 等可执行逻辑字段在当前仓库默认也使用中文，避免前端详情弹窗出现英文描述。
- 图片来源默认使用逻辑卡详情或 printings 返回的 R2 `imageUrl`。
- 默认导入同逻辑最多 10 张最高稀有度 printings；如不足 10 张则返回全部。
- 不再使用旧的 `/api/v1/cards/:id/image` 兼容接口作为主来源。
- 未命中 effect 分支时，`reduceEffect` 需返回原 `state`。
- 复杂交互优先沿用已有 prompt/generator 模式，不重复发明流程。
- 只要检索新卡资料，必须优先使用 `card-data-finder`，不要手工拼接来源数据。
- 如果要新增引擎能力（而非仅卡牌层代码），必须先与用户确认再动手。
- 代码完成后必须补最小可用单测并跑测试；若测试无法运行，明确说明阻塞原因。
- 启动与手工验证统一使用根目录 `npm start`，不要再依赖旧的 `dev:*` 脚本。

## 现行创建卡牌流程

### A. 新增或修复逻辑卡

1. 用 `add-card-plugin` 或 `card-data-finder` 从本地 `3000` 逻辑卡 API 取卡牌对象。
2. 确认归属 workspace：
   - 底层规则能力改 `packages/common`
   - 单卡逻辑改 `packages/sets`
   - 前端交互适配改 `packages/play`
3. 在对应 `set_<regulation>` 目录中新增或修改实现文件。
4. 接到对应 `index.ts` 或 format 注册点。
5. 跑最小单测与 workspace 编译。
6. 通过测试实验室或浏览器真实对局验证 prompt、伤害、卡区变化和日志。

### B. 只补卡图 variant

1. 用 `add-card-plugin` 查同逻辑 variant 列表，默认取最高稀有度前 10 张。
2. 保留单一逻辑实现，不复制 `reduceEffect`。
3. 用 variant seed 方式补：
   - `rawData.raw_card.id`
   - `collectionNumber`
   - `rarityLabel`
   - `image_url`
   - 唯一 `fullName`
4. 确保前端仍折叠为一张逻辑卡。
5. 用浏览器确认左侧牌库不重复、卡图选择变多。

## 参考文档（按需读取）

- `references/set.md`：set 目录结构、已有/新增 set 的接入步骤
- `references/pokemon.md`：Pokemon 字段约束、attack 与 ability 常见实现
- `references/trainer.md`：Trainer 四种类型实现套路与常见坑
- `references/energy.md`：基础/特殊能量实现与 effect 钩子
- `plugins/add-card-plugin`：检索逻辑卡、筛 printings、输出新增卡牌 scaffold
- `card-data-finder`：检索逻辑卡对象与 R2 图片 URL（多候选时用于用户选择）
- 新增测试流程时，联动 `card-testing`

如果用户要“完整新增流程文档”，优先基于这些 references 组织输出，而不是临时从零总结。
