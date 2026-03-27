import {
  CardTarget,
  CardTag,
  ChooseCardsPrompt,
  ChoosePokemonPrompt,
  Effect,
  EnergyCard,
  EnergyType,
  GameError,
  GameMessage,
  PlayerType,
  PokemonCard,
  PowerEffect,
  PowerType,
  Stage,
  State,
  StoreLike,
  SuperType,
  AttackEffect,
  CardType,
  EndTurnEffect,
  SlotType,
} from '@ptcg/common';

function* useHighTechTurbo(
  next: Function,
  store: StoreLike,
  state: State,
  effect: AttackEffect
): IterableIterator<State> {
  const player = effect.player;
  const playerType = state.players[0] === player ? PlayerType.BOTTOM_PLAYER : PlayerType.TOP_PLAYER;
  const blockedTargets: CardTarget[] = [];
  let hasTarget = false;

  player.bench.forEach((slot, index) => {
    if (slot.pokemons.cards.length === 0) {
      blockedTargets.push({ player: playerType, slot: SlotType.BENCH, index });
      return;
    }
    hasTarget = true;
  });

  const basicLightning = player.discard.cards.filter((card): card is EnergyCard => {
    return card instanceof EnergyCard
      && card.energyType === EnergyType.BASIC
      && card.provides.includes(CardType.LIGHTNING);
  });

  if (basicLightning.length === 0 || !hasTarget) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  let selectedEnergy: EnergyCard[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_HAND,
      player.discard,
      { superType: SuperType.ENERGY, energyType: EnergyType.BASIC, provides: [CardType.LIGHTNING] },
      { min: 1, max: 1, allowCancel: false }
    ),
    cards => {
      selectedEnergy = (cards || []) as EnergyCard[];
      next();
    }
  );

  if (selectedEnergy.length === 0) {
    return state;
  }

  let targets: any[] = [];
  yield store.prompt(
    state,
    new ChoosePokemonPrompt(
      player.id,
      GameMessage.CHOOSE_POKEMON_TO_ATTACH_CARDS,
      playerType,
      [SlotType.BENCH],
      { allowCancel: false, blocked: blockedTargets }
    ),
    result => {
      targets = result || [];
      next();
    }
  );

  if (targets.length === 0) {
    return state;
  }

  player.discard.moveCardTo(selectedEnergy[0], targets[0].energies);
  return state;
}

export class MiraidonEx extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 17288,
      name: '密勒顿ex',
      yorenCode: 'Y1196',
      cardType: '1',
      commodityCode: 'PROMOSVEVENT02',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '182/SV-P',
        rarityLabel: '无标记',
        cardTypeLabel: '宝可梦',
        attributeLabel: '雷',
        pokemonTypeLabel: '宝可梦ex',
        specialCardLabel: null,
        hp: 220,
        evolveText: '基础',
        weakness: '斗 ×2',
        resistance: null,
        retreatCost: 0,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/453/27.png',
      ruleLines: ['当宝可梦ex【昏厥】时，对手将拿取2张奖赏卡。'],
      attacks: [
        {
          id: 802,
          name: '快速抽取',
          text: '从自己牌库上方抽取2张卡牌。',
          cost: ['LIGHTNING'],
          damage: '20',
        },
        {
          id: 803,
          name: '高科技涡轮',
          text: '选择自己弃牌区中的1张「基本【雷】能量」，附着于备战宝可梦身上。',
          cost: ['LIGHTNING', 'LIGHTNING', 'LIGHTNING'],
          damage: '150',
        },
      ],
      features: [
        {
          id: 1201,
          name: '快速抽取',
          text: '在自己的回合可以使用1次。如果这只宝可梦在战斗场上的话，则从自己的牌库上方抽取1张卡牌。',
        },
      ],
      illustratorNames: ['5ban Graphics'],
      pokemonCategory: null,
      pokedexCode: null,
      pokedexText: null,
      height: null,
      weight: null,
      deckRuleLimit: null,
    },
    collection: {
      id: 453,
      commodityCode: 'PROMOSVEVENT02',
      name: '活动特别包 第二弹',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/453/27.png',
  };

  public tags = [CardTag.POKEMON_EX];

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.LIGHTNING];

  public hp: number = 220;

  public weakness = [{ type: CardType.FIGHTING }];

  public retreat = [];

  public powers = [
    {
      name: '快速抽取',
      useWhenInPlay: true,
      powerType: PowerType.ABILITY,
      text: '在自己的回合可以使用1次。如果这只宝可梦在战斗场上的话，则从自己的牌库上方抽取1张卡牌。',
    },
  ];

  public attacks = [
    {
      name: '快速抽取',
      cost: [CardType.LIGHTNING],
      damage: '20',
      text: '从自己牌库上方抽取2张卡牌。',
    },
    {
      name: '高科技涡轮',
      cost: [CardType.LIGHTNING, CardType.LIGHTNING, CardType.LIGHTNING],
      damage: '150',
      text: '选择自己弃牌区中的1张「基本【雷】能量」，附着于备战宝可梦身上。',
    },
  ];

  public set: string = 'set_h';

  public name: string = '密勒顿ex';

  public fullName: string = '密勒顿ex PROMOSVEVENT02';

  public readonly QUICK_EXTRACTION_MARKER = 'QUICK_EXTRACTION_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const player = effect.player;

      if (player.active.getPokemonCard() !== this) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      if (player.marker.hasMarker(this.QUICK_EXTRACTION_MARKER, this)) {
        throw new GameError(GameMessage.POWER_ALREADY_USED);
      }

      if (player.deck.cards.length === 0) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      player.deck.moveTo(player.hand, 1);
      player.marker.addMarker(this.QUICK_EXTRACTION_MARKER, this);
      return state;
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      effect.player.deck.moveTo(effect.player.hand, Math.min(2, effect.player.deck.cards.length));
      return state;
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const generator = useHighTechTurbo(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    if (effect instanceof EndTurnEffect) {
      effect.player.marker.removeMarker(this.QUICK_EXTRACTION_MARKER, this);
      return state;
    }

    return state;
  }
}
