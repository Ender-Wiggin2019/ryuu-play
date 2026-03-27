import {
  AttackEffect,
  CardType,
  Effect,
  PlayerType,
  PokemonCard,
  Stage,
  State,
  StoreLike,
} from '@ptcg/common';

export class ShaTiePi extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 16714,
      name: '沙铁皮',
      yorenCode: 'P0989',
      cardType: '1',
      commodityCode: 'CSV7C',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '132/204',
        rarityLabel: 'C★★★',
        cardTypeLabel: '宝可梦',
        attributeLabel: '斗',
        specialCardLabel: '古代',
        hp: 120,
        evolveText: '基础',
        weakness: '草 ×2',
        resistance: null,
        retreatCost: 2,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/363.png',
      ruleLines: [],
      attacks: [
        {
          id: 2203,
          name: '磁场炸裂',
          text: '如果自己场上有3个及以上能量的话，则追加造成70伤害。这个招式的伤害不计算弱点。',
          cost: ['斗'],
          damage: '20+',
        },
        {
          id: 2204,
          name: '力量宝石',
          text: '',
          cost: ['斗', '无色'],
          damage: '60',
        },
      ],
      features: [],
      illustratorNames: ['DOM'],
      pokemonCategory: '悖谬宝可梦',
      pokedexCode: '0989',
      pokedexText: '没有捕获记录。资料不足。其特征与某本探险记中所记载的生物一致。',
      height: 2.3,
      weight: 60,
      deckRuleLimit: null,
    },
    collection: {
      id: 324,
      commodityCode: 'CSV7C',
      name: '补充包 利刃猛醒',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/363.png',
  };

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.FIGHTING];

  public hp: number = 120;

  public weakness = [{ type: CardType.GRASS }];

  public resistance = [];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: '磁场炸裂',
      cost: [CardType.FIGHTING],
      damage: '20+',
      text: '如果自己场上有3个及以上能量的话，则追加造成70伤害。这个招式的伤害不计算弱点。',
    },
    {
      name: '力量宝石',
      cost: [CardType.FIGHTING, CardType.COLORLESS],
      damage: '60',
      text: '',
    },
  ];

  public set: string = 'set_h';

  public name: string = '沙铁皮';

  public fullName: string = '沙铁皮 CSV7C';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && (effect.attack === this.attacks[0] || effect.attack.name === this.attacks[0].name)) {
      let energyCount = 0;
      effect.player.forEachPokemon(PlayerType.BOTTOM_PLAYER, pokemonSlot => {
        energyCount += pokemonSlot.energies.cards.length;
      });

      if (energyCount >= 3) {
        effect.damage += 70;
      }

      effect.ignoreWeakness = true;
    }

    return state;
  }
}
