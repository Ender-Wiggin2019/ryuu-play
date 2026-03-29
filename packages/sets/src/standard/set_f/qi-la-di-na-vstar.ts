import {
  AttackEffect,
  CardList,
  CardTag,
  CardType,
  ChooseCardsPrompt,
  Effect,
  EnergyCard,
  GameError,
  GameMessage,
  PlayerType,
  PokemonCard,
  Stage,
  State,
  StateUtils,
  StoreLike,
  SuperType,
} from '@ptcg/common';

function getAttachedEnergies(player: any, playerType: PlayerType): CardList<EnergyCard> {
  const attached = new CardList<EnergyCard>();

  player.forEachPokemon(playerType, (pokemonSlot: any) => {
    pokemonSlot.energies.cards.forEach((card: unknown) => {
      if (card instanceof EnergyCard) {
        attached.cards.push(card);
      }
    });
  });

  return attached;
}

function* useLostImpact(
  next: Function,
  store: StoreLike,
  state: State,
  effect: AttackEffect
): IterableIterator<State> {
  const player = effect.player;
  const playerType = state.players[0] === player ? PlayerType.BOTTOM_PLAYER : PlayerType.TOP_PLAYER;
  const attachedEnergies = getAttachedEnergies(player, playerType);

  if (attachedEnergies.cards.length < 2) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  let selectedCards: EnergyCard[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_DISCARD,
      attachedEnergies,
      { superType: SuperType.ENERGY },
      { min: 2, max: 2, allowCancel: false }
    ),
    cards => {
      selectedCards = (cards || []) as EnergyCard[];
      next();
    }
  );

  if (selectedCards.length !== 2) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  selectedCards.forEach(card => {
    const source = StateUtils.findCardList(state, card);
    source.moveCardTo(card, player.lostzone);
  });

  return state;
}

export class GiratinaVSTAR extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 1953,
      name: '骑拉帝纳VSTAR',
      yorenCode: 'Y1099',
      cardType: '1',
      commodityCode: 'CS6.1C',
      details: {
        regulationMarkText: 'F',
        collectionNumber: '023/004',
        rarityLabel: '无标记',
        cardTypeLabel: '宝可梦',
        attributeLabel: '龙',
        trainerTypeLabel: null,
        energyTypeLabel: null,
        pokemonTypeLabel: '1|3',
        specialCardLabel: null,
        hp: 280,
        evolveText: 'V进化',
        weakness: null,
        resistance: null,
        retreatCost: 2,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/210/22.png',
      ruleLines: ['当宝可梦VSTAR【昏厥】时，对手将拿取2张奖赏卡。'],
      attacks: [
        {
          id: 2558,
          name: '放逐冲击',
          text: '选择附着于自己场上宝可梦身上的2个能量，放于放逐区。',
          cost: ['草', '超', '无色'],
          damage: '280',
        },
      ],
      features: [],
      illustratorNames: ['AKIRA EGAWA'],
      pokemonCategory: null,
      pokedexCode: null,
      pokedexText: null,
      height: null,
      weight: null,
      deckRuleLimit: null,
    },
    collection: {
      id: 210,
      commodityCode: 'CS6.1C',
      name: '专题包 辉耀能量 第三弹',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/210/22.png',
  };

  public tags = [CardTag.POKEMON_VSTAR];

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom = '骑拉帝纳V';

  public cardTypes: CardType[] = [CardType.DRAGON];

  public hp: number = 280;

  public weakness = [];

  public resistance = [];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: '放逐冲击',
      cost: [CardType.GRASS, CardType.PSYCHIC, CardType.COLORLESS],
      damage: '280',
      text: '选择附着于自己场上宝可梦身上的2个能量，放于放逐区。',
    },
  ];

  public set: string = 'set_f';

  public name: string = '骑拉帝纳VSTAR';

  public fullName: string = '骑拉帝纳VSTAR CS6.1C';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && (effect.attack === this.attacks[0] || effect.attack.name === this.attacks[0].name)) {
      effect.damage = 280;
      const generator = useLostImpact(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}
