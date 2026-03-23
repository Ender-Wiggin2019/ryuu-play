# Deck Build Plan

- Generated at: 2026-03-23 15:47:51
- Implemented unique cards: 13
- Missing unique cards: 14

## Missing Cards Plan

### 4. Boss's Orders (x1)
- English description: Type: Trainer | Subtypes: Supporter | Rule: Switch in 1 of your opponent's Benched Pokémon to the Active Spot. | Rule: You may play only 1 Supporter card during your turn.
- 中文描述: 选择对手的1只备战宝可梦，将其与战斗宝可梦互换。|在自己的回合只可以使用1张支援者卡。
- 来源建议: card-data-finder: 老大的指令 活动奖赏包 第一弹 219/SV-P
- 实现动作: 在 `packages/sets/src/standard/set_g/` 新增卡牌并接入 set index。

### 5. Bravery Charm (x2)
- English description: Type: Trainer | Subtypes: Pokémon Tool | Rule: The Basic Pokémon this card is attached to gets +50 HP. | Rule: Attach a Pokémon Tool to 1 of your Pokémon that doesn't already have a Pokémon Tool attached.
- 中文描述: 身上放有这张卡牌的【基础】宝可梦的最大HP「+50」。|在自己的回合可以将任意张宝可梦道具卡，放于自己的宝可梦身上。每只宝可梦身上只可以放1张宝可梦道具卡，并保持附加状态。
- 来源建议: card-data-finder: 勇气护符 补充包 璀璨诡幻 260/207
- 实现动作: 在 `packages/sets/src/standard/set_g/` 新增卡牌并接入 set index。

### 6. Judge (x1)
- English description: Type: Trainer | Subtypes: Supporter | Rule: You can play only one Supporter card each turn. When you play this card, put it next to your Active Pokémon. When your turn ends, discard this card. | Rule: Each player shuffles his or her hand into his or her deck and draws 4 cards.
- 中文描述: 双方玩家，各将所有手牌放回牌库并重洗牌库。然后，各从牌库上方抽取4张卡牌。|在自己的回合只可以使用1张支援者卡。
- 来源建议: card-data-finder: 裁判 勇魅群星 V起始卡组 141/153
- 实现动作: 在 `packages/sets/src/standard/set_e/` 新增卡牌并接入 set index。

### 7. Pal Pad (x1)
- English description: Type: Trainer | Subtypes: Item | Rule: Shuffle up to 2 Supporter cards from your discard pile into your deck. | Rule: You may play any number of Item cards during your turn.
- 中文描述: 选择自己弃牌区中最多2张支援者，在给对手看过之后，放回牌库并重洗牌库。|在自己的回合可以使用任意张物品卡。
- 来源建议: card-data-finder: 朋友手册 补充包 真实玄虚 163/128
- 实现动作: 在 `packages/sets/src/standard/set_g/` 新增卡牌并接入 set index。

### 8. Prime Catcher (x1)
- English description: Type: Trainer | Subtypes: Item, ACE SPEC | Rule: You can't have more than 1 ACE SPEC card in your deck. | Rule: Switch in 1 of your opponent's Benched Pokémon to the Active Spot. If you do, switch your Active Pokémon with 1 of your Benched Pokémon. | Rule: You may play any number of Item cards during your turn.
- 中文描述: 选择对手的1只备战宝可梦，将其与战斗宝可梦互换。然后，将自己的战斗宝可梦与备战宝可梦互换。|在自己的回合可以使用任意张物品卡。
- 来源建议: card-data-finder: 顶尖捕捉器 补充包 利刃猛醒 180/204
- 实现动作: 在 `packages/sets/src/standard/set_h/` 新增卡牌并接入 set index。

### 9. Professor Sada's Vitality (x4)
- English description: Type: Trainer | Subtypes: Supporter, Ancient | Rule: Choose up to 2 of your Ancient Pokémon and attach a Basic Energy card from your discard pile to each of them. If you attached any Energy in this way, draw 3 cards. | Rule: You may play only 1 Supporter card during your turn.
- 中文描述: 选择自己最多2只「古代」宝可梦，各附着1张弃牌区中的基本能量。然后，从自己牌库上方抽取3张卡牌。|在自己的回合只可以使用1张支援者卡。
- 来源建议: card-data-finder: 奥琳博士的气魄 活动奖赏包 第二弹 238/SV-P
- 实现动作: 在 `packages/sets/src/standard/set_g/` 新增卡牌并接入 set index。

### 10. Sandy Shocks (x1)
- English description: Type: Pokémon | Subtypes: Basic, Ancient | Attack - Magnetic Burst (20+): If you have 3 or more Energy in play, this attack does 70 more damage. This attack's damage isn't affected by Weakness. | Attack - Power Gem (60)
- 中文描述: 磁场炸裂：如果自己场上有3个及以上能量的话，则追加造成70伤害。这个招式的伤害不计算弱点。 | 力量宝石：none | 没有捕获记录。资料不足。其特征与某本探险记中所记载的生物一致。
- 来源建议: card-data-finder: 沙铁皮 补充包 利刃猛醒 132/204
- 实现动作: 在 `packages/sets/src/standard/set_h/` 新增卡牌并接入 set index。

### 11. Slither Wing (x1)
- English description: Type: Pokémon | Subtypes: Basic, Ancient | Attack - Stomp Off: Discard the top card of your opponent's deck. | Attack - Burning Turbulence (120): This Pokémon also does 90 damage to itself. Your opponent's Active Pokémon is now Burned.
- 中文描述: 碎铁：如果对手场上有「未来」宝可梦的话，则追加造成120伤害。 | 粉碎之翼：选择这只宝可梦身上附着的2个能量，放于弃牌区。 | 这只神秘的宝可梦与古老的书中介绍的名为爬地翅的生物有相似点。
- 来源建议: card-data-finder: 爬地翅 补充包 璀璨诡幻 119/207
- 实现动作: 在 `packages/sets/src/standard/set_h/` 新增卡牌并接入 set index。

### 12. Squawkabilly ex (x1)
- English description: Type: Pokémon | Subtypes: Basic, ex | Ability - Squawk and Seize: Once during your first turn, you may discard your hand and draw 6 cards. You can't use more than 1 Squawk and Seize Ability during your turn. | Attack - Motivate (20): Attach up to 2 Basic Energy cards from your discard pile to 1 of your Benched Pokémon. | Rule: Pokémon ex rule: When your Pokémon ex is Knocked Out, your opponent takes 2 Prize cards.
- 中文描述: 鼓足干劲：选择自己弃牌区中最多2张基本能量，附着于1只备战宝可梦身上。 | 当宝可梦ex【昏厥】时，对手将拿取2张奖赏卡。
- 来源建议: card-data-finder: 怒鹦哥ex 大师战略卡组构筑套装 沙奈朵ex 014/033
- 实现动作: 在 `packages/sets/src/standard/set_g/` 新增卡牌并接入 set index。

### 13. Switch Cart (x2)
- English description: Type: Trainer | Subtypes: Item | Rule: Switch your Active Basic Pokémon with 1 of your Benched Pokémon. If you do, heal 30 damage from the Pokémon you moved to your Bench. | Rule: You may play any number of Item cards during your turn.
- 中文描述: 将自己战斗场上的【基础】宝可梦与备战宝可梦互换。然后，回复被换入备战区的宝可梦「30」点HP。|在自己的回合可以使用任意张物品卡。
- 来源建议: card-data-finder: 交替推车 补充包 勇魅群星 勇 116/128
- 实现动作: 在 `packages/sets/src/standard/set_f/` 新增卡牌并接入 set index。

### 14. Trekking Shoes (x4)
- English description: Type: Trainer | Subtypes: Item | Rule: Look at the top card of your deck. You may put that card into your hand. If you don't, discard that card and draw a card. | Rule: You may play any number of Item cards during your turn.
- 中文描述: 查看自己牌库上方1张卡牌，将那张卡牌加入手牌。或者，将那张卡牌放于弃牌区，从自己牌库上方抽取1张卡牌。|在自己的回合可以使用任意张物品卡。
- 来源建议: card-data-finder: 健行鞋 对战派对 耀梦 下 152/207
- 实现动作: 在 `packages/sets/src/standard/set_f/` 新增卡牌并接入 set index。

