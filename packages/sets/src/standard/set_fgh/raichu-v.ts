import {
  AttackEffect,
  Card,
  CardList,
  CardTag,
  CardType,
  ChooseCardsPrompt,
  Effect,
  EndTurnEffect,
  EnergyCard,
  EnergyType,
  GameError,
  GameMessage,
  PlayerType,
  PokemonCard,
  PowerEffect,
  PowerType,
  ShuffleDeckPrompt,
  Stage,
  State,
  StateUtils,
  StoreLike,
  SuperType,
} from '@ptcg/common';

function isLightningBasicEnergy(card: Card): card is EnergyCard {
  return card instanceof EnergyCard
    && card.energyType === EnergyType.BASIC
    && card.provides.includes(CardType.LIGHTNING);
}

function* useFastCharge(
  next: Function,
  store: StoreLike,
  state: State,
  effect: AttackEffect
): IterableIterator<State> {
  const player = effect.player;
  const lightningEnergy = player.deck.cards.find(isLightningBasicEnergy);

  if (lightningEnergy === undefined) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  let selected: Card[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_HAND,
      player.deck,
      { superType: SuperType.ENERGY, energyType: EnergyType.BASIC, provides: [CardType.LIGHTNING] },
      { min: 1, max: 1, allowCancel: false }
    ),
    cards => {
      selected = cards || [];
      next();
    }
  );

  if (selected.length === 0 || !(selected[0] instanceof EnergyCard)) {
    return state;
  }

  player.deck.moveCardTo(selected[0], player.active.energies);
  yield store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
    player.deck.applyOrder(order);
    next();
  });

  return state;
}

function* useStrongElectricity(
  next: Function,
  store: StoreLike,
  state: State,
  effect: AttackEffect
): IterableIterator<State> {
  const player = effect.player;
  const attachedLightning = new CardList();

  player.forEachPokemon(PlayerType.BOTTOM_PLAYER, (pokemonSlot) => {
    pokemonSlot.energies.cards.forEach(card => {
      if (isLightningBasicEnergy(card)) {
        attachedLightning.cards.push(card);
      }
    });
  });

  effect.damage = 0;
  if (attachedLightning.cards.length === 0) {
    return state;
  }

  let selected: Card[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_DISCARD,
      attachedLightning,
      { superType: SuperType.ENERGY, energyType: EnergyType.BASIC, provides: [CardType.LIGHTNING] },
      { min: 0, max: attachedLightning.cards.length, allowCancel: false }
    ),
    cards => {
      selected = cards || [];
      next();
    }
  );

  for (const card of selected) {
    const source = StateUtils.findCardList(state, card);
    source.moveCardTo(card, player.discard);
  }

  effect.damage = selected.length * 60;
  return state;
}

export class RaichuV extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 9918,
      name: '雷丘V',
      yorenCode: 'Y1001',
      cardType: '1',
      commodityCode: 'CS5aC',
      details: {
        regulationMarkText: 'F',
        collectionNumber: '134/127',
        rarityLabel: 'SR',
        cardTypeLabel: '宝可梦',
        attributeLabel: '雷',
        pokemonTypeLabel: '宝可梦V',
        specialCardLabel: null,
        hp: 200,
        evolveText: '基础',
        weakness: '斗 ×2',
        resistance: null,
        retreatCost: 1,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/183/232.png',
      ruleLines: ['当宝可梦V【昏厥】时，对手将拿取2张奖赏卡。'],
      attacks: [
        {
          id: 9500,
          name: '快速充能',
          text: '这个招式，即使是先攻玩家的最初回合也可以使用。选择自己牌库中的1张【雷】能量，附着于这只宝可梦身上。并重洗牌库。',
          cost: ['LIGHTNING'],
          damage: '20',
        },
        {
          id: 9501,
          name: '强劲电光',
          text: '将附着于自己场上宝可梦身上任意数量的【雷】能量放于弃牌区，造成其张数×60点伤害。',
          cost: ['LIGHTNING', 'LIGHTNING'],
          damage: '60×',
        },
      ],
      features: [
        {
          id: 1289,
          name: '瞬步',
          text: '如果这只宝可梦在战斗场上的话，则在自己的回合可以使用1次。从自己的牌库上方抽取1张卡牌。',
        },
      ],
      illustratorNames: ['MUGENUP'],
      pokemonCategory: null,
      pokedexCode: null,
      pokedexText: '',
      height: null,
      weight: null,
      deckRuleLimit: null,
    },
    collection: {
      id: 183,
      commodityCode: 'CS5aC',
      name: '补充包 勇魅群星 魅',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/183/232.png',
  };

  public tags = [CardTag.POKEMON_V];

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.LIGHTNING];

  public hp: number = 200;

  public weakness = [{ type: CardType.FIGHTING }];

  public retreat = [CardType.COLORLESS];

  public powers = [
    {
      name: '瞬步',
      useWhenInPlay: true,
      powerType: PowerType.ABILITY,
      text: '如果这只宝可梦在战斗场上的话，则在自己的回合可以使用1次。从自己的牌库上方抽取1张卡牌。',
    },
  ];

  public attacks = [
    {
      name: '快速充能',
      cost: [CardType.LIGHTNING],
      damage: '20',
      text: '这个招式，即使是先攻玩家的最初回合也可以使用。选择自己牌库中的1张【雷】能量，附着于这只宝可梦身上。并重洗牌库。',
    },
    {
      name: '强劲电光',
      cost: [CardType.LIGHTNING, CardType.LIGHTNING],
      damage: '60×',
      text: '将附着于自己场上宝可梦身上任意数量的【雷】能量放于弃牌区，造成其张数×60点伤害。',
    },
  ];

  public set: string = 'set_f';

  public name: string = '雷丘V';

  public fullName: string = '雷丘V CS5aC';

  public readonly INSTANT_STEP_MARKER = 'INSTANT_STEP_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const player = effect.player;

      if (player.active.getPokemonCard() !== this) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      if (player.marker.hasMarker(this.INSTANT_STEP_MARKER, this)) {
        throw new GameError(GameMessage.POWER_ALREADY_USED);
      }

      if (player.deck.cards.length === 0) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      player.deck.moveTo(player.hand, 1);
      player.marker.addMarker(this.INSTANT_STEP_MARKER, this);
      return state;
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const generator = useFastCharge(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const generator = useStrongElectricity(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    if (effect instanceof EndTurnEffect) {
      effect.player.marker.removeMarker(this.INSTANT_STEP_MARKER, this);
      return state;
    }

    return state;
  }
}
