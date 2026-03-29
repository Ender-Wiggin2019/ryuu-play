import {
  AttackEffect,
  CardTag,
  CardType,
  Effect,
  GameError,
  GameMessage,
  PokemonCard,
  PowerEffect,
  PowerType,
  Stage,
  State,
  StateUtils,
  StoreLike,
} from '@ptcg/common';

function isBasicV(card: PokemonCard | undefined): boolean {
  return card !== undefined
    && card.stage === Stage.BASIC
    && card.tags.includes(CardTag.POKEMON_V);
}

export class HuaYanGuai extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 13954,
      name: '花岩怪',
      yorenCode: 'Y1450',
      cardType: '1',
      commodityCode: 'CSV8C',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '027/049',
        rarityLabel: '无标记',
        cardTypeLabel: '宝可梦',
        attributeLabel: '超',
        hp: 60,
        evolveText: '基础',
        weakness: '恶 ×2',
        retreatCost: 1,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/480.png',
      ruleLines: [],
      attacks: [
        {
          id: 1,
          name: '瞬间消失',
          text: '将这只宝可梦，以及放于其身上的所有卡牌，放回手牌。',
          cost: ['超'],
          damage: '10',
        },
      ],
      features: [
        {
          id: 1,
          name: '漆黑灾祸',
          text: '只要这只宝可梦在场上，双方场上【基础】宝可梦的「宝可梦【V】」的特性，全部消除。',
        },
      ],
      illustratorNames: ['Yuu Nishida'],
    },
    collection: {
      id: 458,
      commodityCode: 'CSV8C',
      name: '补充包 璀璨诡幻',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/480.png',
  };

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.PSYCHIC];

  public hp: number = 60;

  public weakness = [{ type: CardType.DARK }];

  public retreat = [CardType.COLORLESS];

  public powers = [
    {
      name: '漆黑灾祸',
      powerType: PowerType.ABILITY,
      text: '只要这只宝可梦在场上，双方场上【基础】宝可梦的「宝可梦【V】」的特性，全部消除。',
    },
  ];

  public attacks = [
    {
      name: '瞬间消失',
      cost: [CardType.PSYCHIC],
      damage: '10',
      text: '将这只宝可梦，以及放于其身上的所有卡牌，放回手牌。',
    },
  ];

  public set: string = 'set_g';

  public name: string = '花岩怪';

  public fullName: string = '花岩怪 027/049';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PowerEffect) {
      const slot = StateUtils.findPokemonSlot(state, this);
      if (slot === undefined) {
        return state;
      }

      if (isBasicV(effect.card as PokemonCard | undefined)) {
        throw new GameError(GameMessage.BLOCKED_BY_ABILITY);
      }
    }

    if (effect instanceof AttackEffect && (effect.attack === this.attacks[0] || effect.attack.name === this.attacks[0].name)) {
      const player = effect.player;
      const pokemonSlot = StateUtils.findPokemonSlot(state, this);
      if (pokemonSlot === undefined) {
        return state;
      }

      effect.damage = 10;
      pokemonSlot.moveTo(player.hand);
      pokemonSlot.clearEffects();
    }

    return state;
  }
}
