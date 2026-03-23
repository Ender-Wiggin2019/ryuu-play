import {
  AttackEffect,
  CardTag,
  CardType,
  ChoosePokemonPrompt,
  Effect,
  GameMessage,
  PlayerType,
  PokemonCard,
  PutDamageEffect,
  SlotType,
  Stage,
  State,
  StoreLike,
} from '@ptcg/common';

export class ScreamTail extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 16908,
      yorenCode: 'P0985',
      cardType: '1',
      nameSamePokemonId: 2805,
      details: {
        id: 16908,
        evolveText: '基础',
        cardName: '吼叫尾',
        regulationMarkText: 'G',
        collectionNumber: '011/033',
        rarity: '10',
        rarityText: '无标记',
        hp: 90,
        attribute: '5',
        yorenCode: 'P0985',
        cardType: '1',
        cardTypeText: '宝可梦',
        featureFlag: '2',
        abilityItemList: [
          {
            abilityName: '巴掌',
            abilityText: 'none',
            abilityCost: '5',
            abilityDamage: '30',
          },
          {
            abilityName: '凶暴吼叫',
            abilityText: '给对手的1只宝可梦，造成这只宝可梦身上放置的伤害指示物数量×20伤害。[备战宝可梦不计算弱点、抗性。]',
            abilityCost: '5,11',
            abilityDamage: 'none',
          },
        ],
        pokemonCategory: '悖谬宝可梦',
        weaknessType: '7',
        weaknessFormula: '×2',
        resistanceType: '6',
        resistanceFormula: '-30',
        retreatCost: 1,
        pokedexCode: '0985',
        pokedexText: '过去只有１次目击纪录。这只宝可梦与古老的探险记所记载的神秘生物长得很像。',
        height: 1.2,
        weight: 8.0,
        illustratorName: ['Ryota Murayama'],
        commodityList: [
          {
            commodityName: '大师战略卡组构筑套装 沙奈朵ex',
            commodityCode: 'CSVM1bC',
          },
        ],
        collectionFlag: 0,
        special_shiny_type: 0,
      },
      name: '吼叫尾',
      image: 'img\\329\\10.png',
      hash: '6d46fd704b5ae5bff4a716f7eb05a856',
    },
    collection: {
      id: 329,
      name: '大师战略卡组构筑套装 沙奈朵ex',
      commodityCode: 'CSVM1bC',
      salesDate: '2026-01-16',
      series: '3',
      seriesText: '朱&紫',
      goodsType: '3',
      linkType: 0,
      image: 'img/329/cover.png',
    },
    image_url: 'https://raw.githubusercontent.com/duanxr/PTCG-CHS-Datasets/main/img/329/10.png',
  };

  public tags = [CardTag.ANCIENT];

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.PSYCHIC];

  public hp: number = 90;

  public weakness = [{ type: CardType.DARK }];

  public resistance = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: 'Slap',
      cost: [CardType.PSYCHIC],
      damage: '30',
      text: '',
    },
    {
      name: 'Roaring Scream',
      cost: [CardType.PSYCHIC, CardType.COLORLESS],
      damage: '',
      text:
        'This attack does 20 damage to 1 of your opponent\'s Pokemon for each damage counter on this Pokemon. ' +
        '(Don\'t apply Weakness and Resistance for Benched Pokemon.)',
    },
  ];

  public set: string = 'set_g';

  public name: string = 'Scream Tail';

  public fullName: string = 'Scream Tail CSVM1bC';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const damage = Math.floor(effect.player.active.damage / 10) * 20;

      return store.prompt(
        state,
        new ChoosePokemonPrompt(
          effect.player.id,
          GameMessage.CHOOSE_POKEMON_TO_DAMAGE,
          PlayerType.TOP_PLAYER,
          [SlotType.ACTIVE, SlotType.BENCH],
          { allowCancel: false }
        ),
        targets => {
          if (!targets || targets.length === 0 || damage === 0) {
            return;
          }

          const putDamageEffect = new PutDamageEffect(effect, damage);
          putDamageEffect.target = targets[0];
          store.reduceEffect(state, putDamageEffect);
        }
      );
    }

    return state;
  }
}
