import {
  AttackEffect,
  CardType,
  Effect,
  PlayerType,
  PokemonCard,
  Stage,
  State,
  StateUtils,
  StoreLike,
} from '@ptcg/common';

function hasLabel(card: PokemonCard | undefined, label: string): boolean {
  if (card === undefined) {
    return false;
  }

  const rawData = card as any;
  const labels = [
    rawData.rawData?.raw_card?.details?.specialCardLabel,
    rawData.rawData?.api_card?.specialCardLabel,
  ];

  return labels.some((item: unknown) => item === label);
}

function isFuturePokemon(card: PokemonCard | undefined): boolean {
  return hasLabel(card, '未来');
}

export class SandyShocks extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 17924,
      name: '爬地翅',
      yorenCode: 'P0988',
      cardType: '1',
      commodityCode: 'CSV8C',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '119/207',
        rarityLabel: 'U★★',
        cardTypeLabel: '宝可梦',
        attributeLabel: '斗',
        specialCardLabel: '古代',
        hp: 140,
        evolveText: '基础',
        weakness: '超 ×2',
        resistance: null,
        retreatCost: 3,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/332.png',
      ruleLines: [],
      attacks: [
        {
          id: 708,
          name: '碎铁',
          text: '如果对手场上有「未来」宝可梦的话，则追加造成120伤害。',
          cost: ['斗', '无色'],
          damage: '20+',
        },
        {
          id: 709,
          name: '粉碎之翼',
          text: '选择这只宝可梦身上附着的2个能量，放于弃牌区。',
          cost: ['斗', '斗', '无色'],
          damage: '130',
        },
      ],
      features: [],
      illustratorNames: ['Shinji Kanda'],
      pokemonCategory: '悖谬宝可梦',
      pokedexCode: '0988',
      pokedexText: '这只神秘的宝可梦与古老的书中介绍的名为爬地翅的生物有相似点。',
      height: 3.2,
      weight: 92,
      deckRuleLimit: null,
    },
    collection: {
      id: 458,
      commodityCode: 'CSV8C',
      name: '补充包 璀璨诡幻',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/332.png',
  };

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.FIGHTING];

  public hp: number = 140;

  public weakness = [{ type: CardType.PSYCHIC }];

  public resistance = [];

  public retreat = [
    CardType.COLORLESS,
    CardType.COLORLESS,
    CardType.COLORLESS,
  ];

  public attacks = [
    {
      name: '碎铁',
      cost: [CardType.FIGHTING, CardType.COLORLESS],
      damage: '20+',
      text: '如果对手场上有「未来」宝可梦的话，则追加造成120伤害。',
    },
    {
      name: '粉碎之翼',
      cost: [CardType.FIGHTING, CardType.FIGHTING, CardType.COLORLESS],
      damage: '130',
      text: '选择这只宝可梦身上附着的2个能量，放于弃牌区。',
    },
  ];

  public set: string = 'set_h';

  public name: string = '爬地翅';

  public fullName: string = '爬地翅 CSV8C';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && (effect.attack === this.attacks[0] || effect.attack.name === this.attacks[0].name)) {
      const opponent = StateUtils.getOpponent(state, effect.player);
      let hasFuturePokemon = false;

      opponent.forEachPokemon(PlayerType.TOP_PLAYER, (_slot, card) => {
        if (isFuturePokemon(card)) {
          hasFuturePokemon = true;
        }
      });

      if (hasFuturePokemon) {
        effect.damage += 120;
      }

      effect.ignoreWeakness = true;
    }

    if (effect instanceof AttackEffect && (effect.attack === this.attacks[1] || effect.attack.name === this.attacks[1].name)) {
      const attachedEnergyCount = effect.player.active.energies.cards.length;
      const amount = Math.min(2, attachedEnergyCount);

      if (amount === 0) {
        return state;
      }

      const selected = effect.player.active.energies.cards.slice(0, amount);
      effect.player.active.energies.moveCardsTo(selected, effect.player.discard);
      return state;
    }

    return state;
  }
}
