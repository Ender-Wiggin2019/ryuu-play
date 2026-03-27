import {
  AttackEffect,
  Card,
  CardTag,
  ChooseCardsPrompt,
  Effect,
  GameError,
  GameMessage,
  PokemonCard,
  SelectPrompt,
  Stage,
  State,
  StateUtils,
  StoreLike,
  CardType,
} from '@ptcg/common';

function* useReadWind(
  next: Function,
  store: StoreLike,
  state: State,
  effect: AttackEffect
): IterableIterator<State> {
  const player = effect.player;

  if (player.hand.cards.length === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  let selected: Card[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_DISCARD,
      player.hand,
      {},
      { min: 1, max: 1, allowCancel: false }
    ),
    cards => {
      selected = cards || [];
      next();
    }
  );

  if (selected.length > 0) {
    player.hand.moveCardsTo(selected, player.discard);
  }

  player.deck.moveTo(player.hand, Math.min(3, player.deck.cards.length));
  return state;
}

function* useCycloneDive(
  next: Function,
  store: StoreLike,
  state: State,
  effect: AttackEffect
): IterableIterator<State> {
  const stadium = StateUtils.getStadiumCard(state);
  if (stadium !== undefined) {
    let choice = 0;
    yield store.prompt(
      state,
      new SelectPrompt(effect.player.id, GameMessage.CHOOSE_OPTION, ['不弃置', '弃置场地'], { allowCancel: false }),
      result => {
        choice = result ?? 0;
        next();
      }
    );

    if (choice === 1) {
      const stadiumList = StateUtils.findCardList(state, stadium);
      const owner = StateUtils.findOwner(state, stadiumList);
      stadiumList.moveTo(owner.discard);
    }
  }

  return state;
}

export class LuoJiYaV extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 11354,
      name: '洛奇亚V',
      yorenCode: 'Y1128',
      cardType: '1',
      commodityCode: 'PROMO3',
      details: {
        regulationMarkText: 'F',
        collectionNumber: '217/S-P',
        rarityLabel: '无标记',
        cardTypeLabel: '宝可梦',
        attributeLabel: '无色',
        trainerTypeLabel: null,
        energyTypeLabel: null,
        pokemonTypeLabel: '宝可梦V',
        specialCardLabel: null,
        hp: 220,
        evolveText: '基础',
        weakness: '雷 ×2',
        resistance: '斗 -30',
        retreatCost: 2,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/32/207.png',
      ruleLines: ['当宝可梦V【昏厥】时，对手将拿取2张奖赏卡。'],
      attacks: [
        {
          id: 14700,
          name: '读风',
          text: '将自己的1张手牌放于弃牌区。然后，从自己牌库上方抽取3张卡牌。',
          cost: ['COLORLESS'],
          damage: '',
        },
        {
          id: 14701,
          name: '气旋俯冲',
          text: '若希望，可将场上的竞技场放于弃牌区。',
          cost: ['COLORLESS', 'COLORLESS', 'COLORLESS', 'COLORLESS'],
          damage: '130',
        },
      ],
      features: [],
      illustratorNames: ['PLANETA Mochizuki'],
      pokemonCategory: null,
      pokedexCode: null,
      pokedexText: null,
      height: null,
      weight: null,
      deckRuleLimit: null,
    },
    collection: {
      id: 32,
      commodityCode: 'PROMO3',
      name: '特典卡·剑&盾',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/32/207.png',
  };

  public tags = [CardTag.POKEMON_V];

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.COLORLESS];

  public hp: number = 220;

  public weakness = [{ type: CardType.LIGHTNING }];

  public resistance = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: '读风',
      cost: [CardType.COLORLESS],
      damage: '',
      text: '将自己的1张手牌放于弃牌区。然后，从自己牌库上方抽取3张卡牌。',
    },
    {
      name: '气旋俯冲',
      cost: [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS],
      damage: '130',
      text: '若希望，可将场上的竞技场放于弃牌区。',
    },
  ];

  public set: string = 'set_f';

  public name: string = '洛奇亚V';

  public fullName: string = '洛奇亚V 217/S-P#11354';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const generator = useReadWind(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const generator = useCycloneDive(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}
