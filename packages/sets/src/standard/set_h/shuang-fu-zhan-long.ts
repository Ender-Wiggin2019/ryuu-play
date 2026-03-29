import {
  AttackEffect,
  CardType,
  Effect,
  EnergyCard,
  EnergyType,
  PokemonCard,
  Stage,
  State,
  StoreLike,
} from '@ptcg/common';

export class ShuangFuZhanLong extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 17530,
      name: '双斧战龙',
      yorenCode: 'P612',
      cardType: '1',
      commodityCode: 'CSV8C',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '153/207',
        rarityLabel: 'R',
        cardTypeLabel: '宝可梦',
        attributeLabel: '龙',
        pokemonTypeLabel: null,
        specialCardLabel: null,
        hp: 170,
        evolveText: '2阶进化',
        weakness: null,
        resistance: null,
        retreatCost: 2,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/418.png',
      ruleLines: [],
      attacks: [
        {
          id: 234,
          name: '巨斧劈落',
          text: '如果对手的战斗宝可梦身上附着了特殊能量的话，则令那只宝可梦【昏厥】。',
          cost: ['斗'],
          damage: '',
        },
        {
          id: 235,
          name: '龙之波动',
          text: '将自己牌库上方3张卡牌放于弃牌区。',
          cost: ['斗', '钢'],
          damage: '230',
        },
      ],
      features: [],
      illustratorNames: ['Tsuyoshi Nagano'],
      pokemonCategory: '颚斧宝可梦',
      pokedexCode: '0612',
      pokedexText: '会以自傲的牙齿来压制敌人。獠牙的锋利程度无与伦比，就连铁塔都能一斩而断。',
      height: 1.8,
      weight: 105.5,
      deckRuleLimit: null,
    },
    collection: {
      id: 458,
      commodityCode: 'CSV8C',
      name: '补充包 璀璨诡幻',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/418.png',
  };

  public stage: Stage = Stage.STAGE_2;

  public evolvesFrom = '斧牙龙';

  public cardTypes: CardType[] = [CardType.DRAGON];

  public hp = 170;

  public weakness: { type: CardType }[] = [];

  public resistance: { type: CardType; value: number }[] = [];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: '巨斧劈落',
      cost: [CardType.FIGHTING],
      damage: '',
      text: '如果对手的战斗宝可梦身上附着了特殊能量的话，则令那只宝可梦【昏厥】。',
    },
    {
      name: '龙之波动',
      cost: [CardType.FIGHTING, CardType.METAL],
      damage: '230',
      text: '将自己牌库上方3张卡牌放于弃牌区。',
    },
  ];

  public set = 'set_h';

  public name = '双斧战龙';

  public fullName = '双斧战龙 153/207#17530';

  public reduceEffect(_store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && (effect.attack === this.attacks[0] || effect.attack.name === this.attacks[0].name)) {
      effect.damage = 0;
      const defending = effect.opponent.active.getPokemonCard();
      const hasSpecialEnergy = effect.opponent.active.energies.cards.some((card): card is EnergyCard => {
        return card instanceof EnergyCard && card.energyType === EnergyType.SPECIAL;
      });

      if (defending !== undefined && hasSpecialEnergy) {
        effect.opponent.active.damage += defending.hp;
      }

      return state;
    }

    if (effect instanceof AttackEffect && (effect.attack === this.attacks[1] || effect.attack.name === this.attacks[1].name)) {
      const cards = effect.player.deck.cards.slice(0, 3);
      effect.player.deck.moveCardsTo(cards, effect.player.discard);
      return state;
    }

    return state;
  }
}
