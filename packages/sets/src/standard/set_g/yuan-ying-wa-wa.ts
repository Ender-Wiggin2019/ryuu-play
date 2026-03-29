import {
  AttackEffect,
  CardType,
  CoinFlipPrompt,
  Effect,
  EndTurnEffect,
  GameError,
  GameMessage,
  PokemonCard,
  Stage,
  State,
  StateUtils,
  StoreLike,
  TrainerEffect,
  TrainerType,
} from '@ptcg/common';

function* useShadowCircle(
  next: Function,
  store: StoreLike,
  state: State,
  effect: AttackEffect,
): IterableIterator<State> {
  effect.damage = 10;

  let heads = false;
  yield store.prompt(state, new CoinFlipPrompt(effect.player.id, GameMessage.COIN_FLIP), result => {
    heads = result === true;
    next();
  });

  if (heads) {
    effect.opponent.marker.addMarker('YUAN_YING_WA_WA_ITEM_LOCK_MARKER', effect.player.active.getPokemonCard()!);
  }

  return state;
}

export class YuanYingWaWa extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 11880,
      name: '怨影娃娃',
      yorenCode: 'Y1448',
      cardType: '1',
      commodityCode: 'CSV8C',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '053/127',
        rarityLabel: 'C',
        cardTypeLabel: '宝可梦',
        attributeLabel: '超',
        hp: 60,
        evolveText: '基础',
        weakness: '恶 ×2',
        retreatCost: 1,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/497.png',
      ruleLines: [],
      attacks: [
        {
          id: 1,
          name: '阴影包围',
          text: '抛掷1次硬币如果为正面，则在下一个对手的回合，对手无法从手牌使出物品。',
          cost: ['超'],
          damage: '10',
        },
      ],
      features: [],
      illustratorNames: ['Shin Nagasawa'],
    },
    collection: {
      id: 458,
      commodityCode: 'CSV8C',
      name: '补充包 璀璨诡幻',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/497.png',
  };

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.PSYCHIC];

  public hp: number = 60;

  public weakness = [{ type: CardType.DARK }];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: '阴影包围',
      cost: [CardType.PSYCHIC],
      damage: '10',
      text: '抛掷1次硬币如果为正面，则在下一个对手的回合，对手无法从手牌使出物品。',
    },
  ];

  public set: string = 'set_g';

  public name: string = '怨影娃娃';

  public fullName: string = '怨影娃娃 053/127';

  public readonly ITEM_LOCK_MARKER = 'YUAN_YING_WA_WA_ITEM_LOCK_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && (effect.attack === this.attacks[0] || effect.attack.name === this.attacks[0].name)) {
      const generator = useShadowCircle(() => generator.next(), store, state, effect);
      return generator.next().value;
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
