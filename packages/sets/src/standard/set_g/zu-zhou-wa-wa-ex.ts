import {
  AttackEffect,
  CardTag,
  CardType,
  Effect,
  EndTurnEffect,
  GameError,
  GameMessage,
  PokemonCard,
  Stage,
  State,
  StateUtils,
  StoreLike,
  SuperType,
  TrainerEffect,
  TrainerType,
} from '@ptcg/common';

export class ZuZhouWaWaEx extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 11881,
      name: '诅咒娃娃ex',
      yorenCode: 'Y1449',
      cardType: '1',
      commodityCode: 'CSV8C',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '054/127',
        rarityLabel: 'RR',
        cardTypeLabel: '宝可梦',
        attributeLabel: '超',
        pokemonTypeLabel: '宝可梦ex',
        hp: 250,
        evolveText: '1阶进化',
        weakness: '恶 ×2',
        retreatCost: 2,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/498.png',
      ruleLines: ['当宝可梦ex【昏厥】时，对手将拿取2张奖赏卡。'],
      attacks: [
        {
          id: 1,
          name: '暗夜难明',
          text: '在下一个对手的回合，对手无法从手牌使出物品。',
          cost: ['超', '无色'],
          damage: '30',
        },
        {
          id: 2,
          name: '灵骚',
          text: '查看对手的手牌，造成其中训练家张数×60伤害。',
          cost: ['超', '超', '无色'],
          damage: '60×',
        },
      ],
      features: [],
      illustratorNames: ['5ban Graphics'],
    },
    collection: {
      id: 458,
      commodityCode: 'CSV8C',
      name: '补充包 璀璨诡幻',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/498.png',
  };

  public tags = [CardTag.POKEMON_EX];

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom = '怨影娃娃';

  public cardTypes: CardType[] = [CardType.PSYCHIC];

  public hp: number = 250;

  public weakness = [{ type: CardType.DARK }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: '暗夜难明',
      cost: [CardType.PSYCHIC, CardType.COLORLESS],
      damage: '30',
      text: '在下一个对手的回合，对手无法从手牌使出物品。',
    },
    {
      name: '灵骚',
      cost: [CardType.PSYCHIC, CardType.PSYCHIC, CardType.COLORLESS],
      damage: '60×',
      text: '查看对手的手牌，造成其中训练家张数×60伤害。',
    },
  ];

  public set: string = 'set_g';

  public name: string = '诅咒娃娃ex';

  public fullName: string = '诅咒娃娃ex 054/127';

  public readonly ITEM_LOCK_MARKER = 'ZU_ZHOU_WA_WA_EX_ITEM_LOCK_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && (effect.attack === this.attacks[0] || effect.attack.name === this.attacks[0].name)) {
      effect.opponent.marker.addMarker(this.ITEM_LOCK_MARKER, this);
      return state;
    }

    if (effect instanceof AttackEffect && (effect.attack === this.attacks[1] || effect.attack.name === this.attacks[1].name)) {
      effect.damage = effect.opponent.hand.cards.filter(card => card.superType === SuperType.TRAINER).length * 60;
      return state;
    }

    if (effect instanceof TrainerEffect && effect.player.marker.hasMarker(this.ITEM_LOCK_MARKER, this)) {
      if (effect.trainerCard.trainerType === TrainerType.ITEM) {
        throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
      }
    }

    if (effect instanceof EndTurnEffect) {
      const slot = StateUtils.findPokemonSlot(state, this);
      if (slot === undefined) {
        state.players.forEach(player => player.marker.removeMarker(this.ITEM_LOCK_MARKER, this));
        return state;
      }

      const owner = StateUtils.findOwner(state, slot);
      if (owner !== undefined && owner === effect.player) {
        owner.marker.removeMarker(this.ITEM_LOCK_MARKER, this);
      }
    }

    return state;
  }
}
