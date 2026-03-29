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
  ShowCardsPrompt,
  Stage,
  State,
  StateUtils,
  StoreLike,
  SuperType,
  TrainerType,
} from '@ptcg/common';

function* useContributionDoll(
  next: Function,
  store: StoreLike,
  state: State,
  self: ZuZhouWaWa,
  effect: PowerEffect,
): IterableIterator<State> {
  const player = effect.player;
  const slot = StateUtils.findPokemonSlot(state, self);
  const opponent = StateUtils.getOpponent(state, player);

  if (slot === undefined) {
    throw new GameError(GameMessage.CANNOT_USE_POWER);
  }

  if (player.marker.hasMarker(self.CONTRIBUTION_DOLL_MARKER, self)) {
    throw new GameError(GameMessage.POWER_ALREADY_USED);
  }

  const available = player.discard.cards.filter(
    card => card.superType === SuperType.TRAINER && (card as any).trainerType === TrainerType.SUPPORTER
  );
  if (available.length === 0) {
    throw new GameError(GameMessage.CANNOT_USE_POWER);
  }

  let selected: any[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_HAND,
      player.discard,
      { superType: SuperType.TRAINER, trainerType: TrainerType.SUPPORTER },
      { min: 1, max: 1, allowCancel: false },
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
  player.marker.addMarker(self.CONTRIBUTION_DOLL_MARKER, self);
  slot.moveTo(player.lostzone);
  slot.clearEffects();

  return state;
}

export class ZuZhouWaWa extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 15351,
      name: '诅咒娃娃',
      yorenCode: 'Y1454',
      cardType: '1',
      commodityCode: 'CSV8C',
      details: {
        regulationMarkText: 'F',
        collectionNumber: '039/131',
        rarityLabel: 'U',
        cardTypeLabel: '宝可梦',
        attributeLabel: '超',
        hp: 100,
        evolveText: '1阶进化',
        weakness: '恶 ×2',
        retreatCost: 1,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/206/163.png',
      ruleLines: [],
      attacks: [
        {
          id: 1,
          name: '幽魂射击',
          text: '',
          cost: ['超', '无色'],
          damage: '50',
        },
      ],
      features: [
        {
          id: 1,
          name: '贡献玩偶',
          text:
            '在自己的回合可以使用1次。选择自己弃牌区中的1张支援者，在给对手看过之后，加入手牌。然后，将这只宝可梦放于放逐区。（除宝可梦以外的卡牌，全部放于弃牌区。）',
        },
      ],
      illustratorNames: ['5ban Graphics'],
    },
    collection: {
      id: 206,
      commodityCode: 'CSV8C',
      name: '补充包 碧海暗影 逐',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/206/163.png',
  };

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom = '怨影娃娃';

  public cardTypes: CardType[] = [CardType.PSYCHIC];

  public hp: number = 100;

  public weakness = [{ type: CardType.DARK }];

  public retreat = [CardType.COLORLESS];

  public powers = [
    {
      name: '贡献玩偶',
      useWhenInPlay: true,
      powerType: PowerType.ABILITY,
      text:
        '在自己的回合可以使用1次。选择自己弃牌区中的1张支援者，在给对手看过之后，加入手牌。然后，将这只宝可梦放于放逐区。（除宝可梦以外的卡牌，全部放于弃牌区。）',
    },
  ];

  public attacks = [
    {
      name: '幽魂射击',
      cost: [CardType.PSYCHIC, CardType.COLORLESS],
      damage: '50',
      text: '',
    },
  ];

  public set: string = 'set_f';

  public name: string = '诅咒娃娃';

  public fullName: string = '诅咒娃娃 039/131';

  public readonly CONTRIBUTION_DOLL_MARKER = 'CONTRIBUTION_DOLL_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const generator = useContributionDoll(() => generator.next(), store, state, this, effect);
      return generator.next().value;
    }

    if (effect instanceof AttackEffect && (effect.attack === this.attacks[0] || effect.attack.name === this.attacks[0].name)) {
      return state;
    }

    if (effect instanceof EndTurnEffect) {
      effect.player.marker.removeMarker(this.CONTRIBUTION_DOLL_MARKER, this);
    }

    return state;
  }
}
