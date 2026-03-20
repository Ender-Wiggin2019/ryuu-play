---
name: card-creator
description: 为 Ryuu Play 新增或修改卡牌实现（Pokemon/Trainer/Energy）与 set 接入流程。只要用户提到“加卡”“实现卡牌效果”“新增卡池/set”“按现有结构接入格式”“补充 ability/attack 逻辑”，都应优先使用此 skill；涉及新卡资料检索时必须联动 card-data-finder。
---

# Card Creator

用于在 `packages/sets` 中新增卡牌与 set，并确保实现符合项目约定、可被 format 加载。

## 何时使用

当用户出现以下需求时，直接使用本 skill：

- 新增某张 Pokemon / Trainer / Energy
- 在已有 set 中加卡
- 新增一个 set 并接入项目
- 实现或修复 ability / attack / trainer effect / special energy 逻辑
- 生成“如何新增卡牌”的项目内指引

## 工作流程

1. 获取用户给出的卡牌名称（必要时补充关键词：系列、编号、中文名）。
2. 调用 `card-data-finder` 检索卡牌数据与图床 URL。
3. 如果有多个候选，先展示候选列表并让用户选择具体对象。
4. 根据用户想实现的功能（attack/ability/trainer effect/energy effect）解析需求。
5. 先查项目内是否有类似实现（优先读 references + 搜索现有卡牌）。
6. 有类似实现则复用模式；没有就从头实现。
7. 若实现依赖当前项目没有的底层能力（例如缺少 effect/prompt 支撑），先给用户说明并确认再继续扩展底层。
8. 完成卡牌与 set 接入（必要时更新 `init.js` format）。
9. 至少补一个单测覆盖核心行为，并执行相关测试验证。

## 强约束

- `fullName` 必须全局唯一，否则 `CardManager` 会报重复。
- `set` 版本统一使用 card-data 的 `details.regulationMarkText` 映射：`H -> set_h`、`G -> set_g`（其余同理）。
- `standard` 目录分组也按 regulation mark 走：放到 `packages/sets/src/standard/set_<regulationMarkText 小写>/`（如 `set_g/`、`set_h/`）。
- 不再维护“缺失扫描图下载”逻辑；遇到缺图时默认使用 `card-data-finder` 返回的 `image_url`（GitHub 图床）。
- 未命中 effect 分支时，`reduceEffect` 需返回原 `state`。
- 复杂交互优先沿用已有 prompt/generator 模式，不重复发明流程。
- 只要检索新卡资料，必须优先使用 `card-data-finder`，不要手工拼接来源数据。
- 如果要新增引擎能力（而非仅卡牌层代码），必须先与用户确认再动手。
- 代码完成后必须补最小可用单测并跑测试；若测试无法运行，明确说明阻塞原因。

## 参考文档（按需读取）

- `references/set.md`：set 目录结构、已有/新增 set 的接入步骤
- `references/pokemon.md`：Pokemon 字段约束、attack 与 ability 常见实现
- `references/trainer.md`：Trainer 四种类型实现套路与常见坑
- `references/energy.md`：基础/特殊能量实现与 effect 钩子
- `card-data-finder`：检索卡牌对象与图床 URL（多候选时用于用户选择）

如果用户要“完整新增流程文档”，优先基于这些 references 组织输出，而不是临时从零总结。
