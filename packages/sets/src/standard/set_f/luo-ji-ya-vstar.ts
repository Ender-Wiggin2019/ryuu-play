import {
  AttackEffect,
  Card,
  CardType,
  ChooseCardsPrompt,
  Effect,
  GameError,
  GameMessage,
  PokemonCard,
  PokemonSlot,
  PowerEffect,
  PowerType,
  SelectPrompt,
  Stage,
  State,
  StateUtils,
  StoreLike,
  CardTag,
  SuperType,
} from '@ptcg/common';

function* useStormDive(
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

function hasRuleBox(card: PokemonCard): boolean {
  return card.tags.includes(CardTag.POKEMON_EX)
    || card.tags.includes(CardTag.POKEMON_V)
    || card.tags.includes(CardTag.POKEMON_VSTAR)
    || card.tags.includes(CardTag.POKEMON_GX)
    || card.tags.includes(CardTag.POKEMON_LV_X)
    || card.tags.includes(CardTag.RADIANT);
}

function* useSummoningStar(
  next: Function,
  store: StoreLike,
  state: State,
  effect: PowerEffect
): IterableIterator<State> {
  const player = effect.player;
  const slots: PokemonSlot[] = player.bench.filter(slot => slot.pokemons.cards.length === 0);
  const max = Math.min(2, slots.length);

  if (max === 0) {
    throw new GameError(GameMessage.CANNOT_USE_POWER);
  }

  const blocked: number[] = [];
  let available = 0;
  player.discard.cards.forEach((card, index) => {
    if (!(card instanceof PokemonCard) || !card.cardTypes.includes(CardType.COLORLESS) || hasRuleBox(card)) {
      blocked.push(index);
      return;
    }
    available += 1;
  });

  if (available === 0) {
    throw new GameError(GameMessage.CANNOT_USE_POWER);
  }

  let selected: Card[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_PUT_ONTO_BENCH,
      player.discard,
      { superType: SuperType.POKEMON },
      { min: 1, max, allowCancel: true, blocked }
    ),
    cards => {
      selected = cards || [];
      next();
    }
  );

  if (selected.length > slots.length) {
    selected.length = slots.length;
  }

  selected.forEach((card, index) => {
    player.discard.moveCardTo(card, slots[index].pokemons);
    slots[index].pokemonPlayedTurn = state.turn;
  });

  return state;
}

export class LuoJiYaVSTAR extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 10752,
      name: '洛奇亚VSTAR',
      yorenCode: 'Y1129',
      cardType: '1',
      commodityCode: 'CS6aC',
      details: {
        regulationMarkText: 'F',
        collectionNumber: '167/131',
        rarityLabel: 'UR',
        cardTypeLabel: '宝可梦',
        attributeLabel: '无色',
        trainerTypeLabel: null,
        energyTypeLabel: null,
        pokemonTypeLabel: '1|3',
        specialCardLabel: null,
        hp: 280,
        evolveText: 'V进化',
        weakness: '雷 ×2',
        resistance: '斗 -30',
        retreatCost: 2,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/208/274.png',
      ruleLines: ['当宝可梦VSTAR【昏厥】时，对手将拿取2张奖赏卡。'],
      attacks: [
        {
          id: 8580,
          name: '风暴俯冲',
          text: '若希望，可将场上的竞技场放于弃牌区。',
          cost: ['COLORLESS', 'COLORLESS', 'COLORLESS', 'COLORLESS'],
          damage: '220',
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
      id: 208,
      commodityCode: 'CS6aC',
      name: '补充包 碧海暗影 啸',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/208/274.png',
  };

  public tags = [CardTag.POKEMON_VSTAR];

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom = '洛奇亚V';

  public cardTypes: CardType[] = [CardType.COLORLESS];

  public hp: number = 280;

  public weakness = [{ type: CardType.LIGHTNING }];

  public resistance = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: '风暴俯冲',
      cost: [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS],
      damage: '220',
      text: '若希望，可将场上的竞技场放于弃牌区。',
    },
  ];

  public set: string = 'set_f';

  public name: string = '洛奇亚VSTAR';

  public fullName: string = '洛奇亚VSTAR 167/131#10752';

  public powers = [
    {
      name: '召唤之星',
      useWhenInPlay: true,
      useVSTARPower: true,
      powerType: PowerType.ABILITY,
      text: '在自己的回合可使用1次。选择自己弃牌区中的最多2张【无】宝可梦（「拥有规则的宝可梦」除外），放于备战区。',
    },
  ];

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const generator = useSummoningStar(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const generator = useStormDive(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}
