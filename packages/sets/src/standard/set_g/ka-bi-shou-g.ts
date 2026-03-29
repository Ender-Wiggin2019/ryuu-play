import {
  AttackEffect,
  CardType,
  ChooseCardsPrompt,
  Effect,
  EndTurnEffect,
  GameError,
  GameMessage,
  PokemonCard,
  PowerEffect,
  PowerType,
  PutDamageEffect,
  ShowCardsPrompt,
  Stage,
  State,
  StateUtils,
  StoreLike,
  SuperType,
} from '@ptcg/common';

function* useGluttony(
  next: Function,
  store: StoreLike,
  state: State,
  self: KaBiShouG,
  effect: PowerEffect,
): IterableIterator<State> {
  const player = effect.player;
  const slot = StateUtils.findPokemonSlot(state, self);
  const opponent = StateUtils.getOpponent(state, player);

  if (slot === undefined) {
    throw new GameError(GameMessage.CANNOT_USE_POWER);
  }

  if (player.marker.hasMarker(self.GLUTTONY_MARKER, self)) {
    throw new GameError(GameMessage.POWER_ALREADY_USED);
  }

  const leftovers = player.discard.cards.filter(card => card.superType === SuperType.TRAINER && card.name === '吃剩的东西');
  if (leftovers.length === 0) {
    throw new GameError(GameMessage.CANNOT_USE_POWER);
  }

  let selected: any[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_HAND,
      player.discard,
      { superType: SuperType.TRAINER, name: '吃剩的东西' },
      { min: 1, max: 2, allowCancel: false },
    ),
    cards => {
      selected = cards || [];
      next();
    },
  );

  if (selected.length === 0) {
    return state;
  }

  player.discard.moveCardsTo(selected, player.hand);
  yield store.prompt(state, new ShowCardsPrompt(opponent.id, GameMessage.CARDS_SHOWED_BY_THE_OPPONENT, selected), () =>
    next());
  player.marker.addMarker(self.GLUTTONY_MARKER, self);
  return state;
}

export class KaBiShouG extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 12563,
      name: '卡比兽',
      yorenCode: 'Y1460',
      cardType: '1',
      commodityCode: 'CSV8C',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '093/177',
        rarityLabel: 'U',
        cardTypeLabel: '宝可梦',
        attributeLabel: '无色',
        hp: 150,
        evolveText: '基础',
        weakness: '斗 ×2',
        retreatCost: 4,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/258/96.png',
      ruleLines: [],
      attacks: [
        {
          id: 1,
          name: '厚重压制',
          text: '给这只宝可梦也造成30伤害。',
          cost: ['无色', '无色', '无色'],
          damage: '130',
        },
      ],
      features: [
        {
          id: 1,
          name: '贪嘴',
          text: '在自己的回合可以使用1次。选择自己弃牌区中最多2张「吃剩的东西」，在给对手看过之后，加入手牌。',
        },
      ],
      illustratorNames: ['Miki Tanaka'],
    },
    collection: {
      id: 258,
      commodityCode: 'CSV7C',
      name: '对战派对 共梦 下',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/258/96.png',
  };

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.COLORLESS];

  public hp: number = 150;

  public weakness = [{ type: CardType.FIGHTING }];

  public retreat = [
    CardType.COLORLESS,
    CardType.COLORLESS,
    CardType.COLORLESS,
    CardType.COLORLESS,
  ];

  public powers = [
    {
      name: '贪嘴',
      useWhenInPlay: true,
      powerType: PowerType.ABILITY,
      text: '在自己的回合可以使用1次。选择自己弃牌区中最多2张「吃剩的东西」，在给对手看过之后，加入手牌。',
    },
  ];

  public attacks = [
    {
      name: '厚重压制',
      cost: [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS],
      damage: '130',
      text: '给这只宝可梦也造成30伤害。',
    },
  ];

  public set: string = 'set_g';

  public name: string = '卡比兽';

  public fullName: string = '卡比兽 093/177';

  public readonly GLUTTONY_MARKER = 'GLUTTONY_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const generator = useGluttony(() => generator.next(), store, state, this, effect);
      return generator.next().value;
    }

    if (effect instanceof AttackEffect && (effect.attack === this.attacks[0] || effect.attack.name === this.attacks[0].name)) {
      effect.damage = 130;
      const selfDamage = new PutDamageEffect(effect, 30);
      selfDamage.target = effect.player.active;
      store.reduceEffect(state, selfDamage);
      return state;
    }

    if (effect instanceof EndTurnEffect) {
      effect.player.marker.removeMarker(this.GLUTTONY_MARKER, this);
    }

    return state;
  }
}
