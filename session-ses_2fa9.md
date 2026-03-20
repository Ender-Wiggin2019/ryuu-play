# 为 card-creator 增加“秘密箱”卡牌

**Session ID:** ses_2fa9996a2ffe6dxtOHPGuw23vL
**Created:** 3/19/2026, 5:21:30 PM
**Updated:** 3/19/2026, 5:40:50 PM

---

## User

@.agents/skills/card-creator/ 我现在希望增加一张卡牌：秘密箱

---

## Assistant

已帮你把「秘密箱（Secret Box）」加进卡池并实现效果了，按新 set `CSV8C` 接入了 Standard 格式。

- 新增卡牌实现：`packages/sets/src/standard/set-csv8c/secret-box.ts`
  - `trainerType = ITEM`，带 `CardTag.ACE_SPEC`
  - 使用条件：手牌里（除自己外）必须可弃 3 张，且牌库里必须各有 1 张 `ITEM / TOOL / SUPPORTER / STADIUM`
  - 效果流程：弃 3 → 依次检索 4 类 Trainer 各 1 → 给对手展示 → 洗牌
- 新增 set 入口：`packages/sets/src/standard/set-csv8c/index.ts`
- 导出 set：`packages/sets/src/standard/index.ts`
- 接入对局格式：`init.js:28`（`standardSets.setCsv8c` 已加入 `Standard`）

另外我补了最小可用测试，覆盖核心行为：

- `packages/sets/tests/standard/set-csv8c/secret-box.spec.ts`
  - 可正常打出并拿到 4 个不同 Trainer 子类型
  - 当牌库缺少任一子类型时不可打出

已执行验证：

- 在 `packages/sets` 下运行 `npm test`，结果 `9 specs, 0 failures`

如果你希望我把卡面显示名改成中文 `秘密箱`（当前是 `Secret Box`），我可以直接再改一版。

---

## User

没有必须要求牌库里必须各有 1 张 ITEM / TOOL / SUPPORTER / STADIUM。可以不选择或部分选择

---

## Assistant

对，你这个规则更合理，我已经按你说的改了：`秘密箱` 现在**不再要求牌库必须同时有 4 种 Trainer**，可以不选或部分选择。

- 已更新逻辑：`packages/sets/src/standard/set-csv8c/secret-box.ts`
  - 仍然必须先弃 3 才能使用
  - 对 `ITEM / TOOL / SUPPORTER / STADIUM` 四类改为“最多各选 1”
  - 某一类牌库里没有时会直接跳过该类，不会报错
  - 某一类有牌时也允许不选（取消）
  - 只有实际选到牌才展示给对手；最后仍会洗牌
- 已更新测试：`packages/sets/tests/standard/set-csv8c/secret-box.spec.ts`
  - 保留“完整选 4 类”测试
  - 原“缺类型时报错”改成“缺类型也可正常使用并部分检索”

我也跑过测试了：

- `npx jasmine-ts tests/standard/set-csv8c/secret-box.spec.ts --random=false` 通过
- `npm test`（`packages/sets`）通过，`9 specs, 0 failures`

---

