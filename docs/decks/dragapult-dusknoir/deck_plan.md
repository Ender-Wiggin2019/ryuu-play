# Deck Build Plan

- Generated at: 2026-03-23 16:44:08
- Implemented unique cards: 25
- Missing unique cards: 7

## Missing Cards Plan

### 1. Forest Seal Stone (x1)
- 中文名: 森林封印石
- English description: Type: Trainer | Subtypes: Item, Pokémon Tool | Ability - Star Alchemy: During your turn, you may search your deck for a card and put it into your hand. Then, shuffle your deck. (You can't use more than 1 VSTAR Power in a game.) | Rule: The Pokémon V this card is attached to can use the VSTAR Power on this card. | Rule: You may play any number of Item cards during your turn. | Rule: Attach a Pokémon Tool to 1 of your Pokémon that doesn't already have a Pokémon Tool attached.
- 中文描述: 宝可梦道具可以附着在自己的宝可梦身上。每只宝可梦身上只可以附着1张宝可梦道具，并保持附加状态。|身上放有这张卡牌的「宝可梦V」，可以使用这个【VSTAR】力量。 

[特性] 星耀炼金术
在自己的回合可以使用。选择自己牌库中任意1张卡牌，加入手牌。并重洗牌库。[对战中，己方的【VSTAR】力量只能使用1次。]|在自己的回合可以使用任意张物品卡。
- 来源建议: card-data-finder: 森林封印石 大师战略卡组构筑套装 喷火龙ex 022/033
- 实现动作: 在 `packages/sets/src/standard/set_f/` 新增卡牌并接入 set index。

### 2. Hisuian Heavy Ball (x1)
- 中文名: 洗翠的沉重球
- English description: Type: Trainer | Subtypes: Item | Rule: Look at your face-down Prize cards. You may reveal a Basic Pokémon you find there, put it into your hand, and put this Hisuian Heavy Ball in its place as a face-down Prize card. (If you don't reveal a Basic Pokémon, put this card in the discard pile.) Then, shuffle your face-down Prize cards. | Rule: You may play any number of Item cards during your turn.
- 中文描述: 查看自己所有反面朝上的奖赏卡。选择其中1张【基础】宝可梦，在给对手看过之后，与这张「洗翠的沉重球」互换，加入手牌。将查看过的奖赏卡及被换入的卡牌反面朝上重洗过后，作为奖赏卡放置。|在自己的回合可以使用任意张物品卡。
- 来源建议: card-data-finder: 洗翠的沉重球 对战派对 耀梦 下 157/207
- 实现动作: 在 `packages/sets/src/standard/set_f/` 新增卡牌并接入 set index。

### 3. Mela (x1)
- 中文名: 梅洛可
- English description: Type: Trainer | Subtypes: Supporter | Rule: You can use this card only if any of your Pokémon were Knocked Out during your opponent's last turn.    Attach a Basic Fire Energy card from your discard pile to 1 of your Pokémon. If you do, draw cards until you have 6 cards in your hand. | Rule: You may play only 1 Supporter card during your turn.
- 中文描述: 这张卡牌，只有在上一个对手的回合，自己的宝可梦【昏厥】时才可使用。

选择自己弃牌区中的1张「基本【火】能量」，附着于自己的宝可梦身上。然后，从牌库上方抽取卡牌，直到自己的手牌变为6张为止。|在自己的回合只可以使用1张支援者卡。
- 来源建议: card-data-finder: 梅洛可 嗨皮卡组 七夕青鸟&拉帝欧斯&烈焰猴&一家鼠 060/064
- 实现动作: 在 `packages/sets/src/standard/set_g/` 新增卡牌并接入 set index。

### 4. Radiant Alakazam (x1)
- 中文名: 光辉胡地
- English description: Type: Pokémon | Subtypes: Basic, Radiant | Ability - Painful Spoons: Once during your turn, you may move up to 2 damage counters from 1 of your opponent's Pokémon to another of their Pokémon. | Attack - Mind Ruler (20×): This attack does 20 damage for each card in your opponent's hand. | Rule: Radiant Pokémon Rule: You can't have more than 1 Radiant Pokémon in your deck.
- 中文描述: 意志控制者：造成对手手牌张数×20点伤害。 | 拥有非常高的智力。据说它记得从生到死发生过的所有事情。 | 1副卡组中只能放入1张光辉宝可梦卡。
- 来源建议: card-data-finder: 光辉胡地 对战派对 耀梦 上 奖赏包 004/024
- 实现动作: 在 `packages/sets/src/standard/set_f/` 新增卡牌并接入 set index。

### 5. Rescue Board (x1)
- 中文名: 紧急滑板
- English description: Type: Trainer | Subtypes: Pokémon Tool | Rule: The Retreat Cost of the Pokémon this card is attached to is Colorless less. If that Pokémon's remaining HP is 30 or less, it has no Retreat Cost. | Rule: You may attach any number of Pokémon Tools to your Pokémon during your turn. You may attach only 1 Pokémon Tool to each Pokémon, and it stays attached.
- 中文描述: 身上放有这张卡牌的宝可梦，【撤退】所需能量减少1个。如果那只宝可梦的剩余HP在「30」及以下的话，则【撤退】所需能量，全部消除。|在自己的回合可以将任意张宝可梦道具卡，放于自己的宝可梦身上。每只宝可梦身上只可以放1张宝可梦道具卡，并保持附加状态。
- 来源建议: card-data-finder: 紧急滑板 活动特别包 第二弹 197/SV-P
- 实现动作: 在 `packages/sets/src/standard/set_h/` 新增卡牌并接入 set index。

### 6. Roxanne (x1)
- 中文名: 杜娟
- English description: Type: Trainer | Subtypes: Supporter | Rule: You can use this card only if your opponent has 3 or fewer Prize cards remaining. Each player shuffles their hand into their deck. Then, you draw 6 cards, and your opponent draws 2 cards. | Rule: You may play only 1 Supporter card during your turn.
- 中文描述: 这张卡牌，只有在对手的剩余奖赏卡张数在3张以下（包含3张）时才可使用。

双方玩家，各将所有手牌放回牌库并重洗牌库。然后，自己从牌库上方抽取6张卡牌，对手从牌库上方抽取2张卡牌。|在自己的回合只可以使用1张支援者卡。
- 来源建议: card-data-finder: 杜娟 对战派对 耀梦 下 185/207
- 实现动作: 在 `packages/sets/src/standard/set_f/` 新增卡牌并接入 set index。

### 7. Technical Machine: Evolution (x1)
- 中文名: 招式学习器 进化
- English description: Type: Trainer | Subtypes: Pokémon Tool | Attack - Evolution: Choose up to 2 of your Benched Pokémon. For each of those Pokémon, search your deck for a card that evolves from that Pokémon and put it onto that Pokémon to evolve it. Then, shuffle your deck. | Rule: The Pokémon this card is attached to can use the attack on this card. (You still need the necessary Energy to use this attack.) If this card is attached to 1 of your Pokémon, discard it at the end of your turn. | Rule: You may attach any number of Pokémon Tools to your Pokémon during your turn. You may attach only 1 Pokémon Tool to each Pokémon, and it stays attached.
- 中文描述: 身上放有这张卡牌的宝可梦，可以使用这张卡牌上的招式。[需要满足使用招式所需能量。]
放于宝可梦身上的这张卡牌，将在自己的回合结束时被放于弃牌区。|选择自己最多2只备战宝可梦，从自己牌库中选择从该宝可梦进化而来的卡牌各1张，各放于其身上进行进化。并重洗牌库。|在自己的回合可以将任意张宝可梦道具卡，放于自己的宝可梦身上。每只宝可梦身上只可以放1张宝可梦道具卡，并保持附加状态。
- 来源建议: card-data-finder: 招式学习器 进化 大师战略卡组构筑套装 沙奈朵ex 025/033
- 实现动作: 在 `packages/sets/src/standard/set_g/` 新增卡牌并接入 set index。

