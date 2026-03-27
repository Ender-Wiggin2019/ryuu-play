import {
  AttackEffect,
  CardTag,
  CardType,
  CheckHpEffect,
  ChoosePokemonPrompt,
  Effect,
  EndTurnEffect,
  GameError,
  GameMessage,
  PlayerType,
  PokemonCard,
  PowerEffect,
  PowerType,
  SelectPrompt,
  SlotType,
  Stage,
  State,
  StateUtils,
  StoreLike,
} from '@ptcg/common';

function* usePainfulSpoons(
  next: Function,
  store: StoreLike,
  state: State,
  self: RadiantAlakazam,
  effect: PowerEffect
): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);

  if (player.marker.hasMarker(self.PAINFUL_SPOONS_MARKER, self)) {
    throw new GameError(GameMessage.POWER_ALREADY_USED);
  }

  const sources = opponent.active.damage > 0
    || opponent.bench.some(b => b.damage > 0 && b.pokemons.cards.length > 0);
  const targets = opponent.active.pokemons.cards.length > 0
    || opponent.bench.some(b => b.pokemons.cards.length > 0);

  if (!sources || !targets) {
    throw new GameError(GameMessage.CANNOT_USE_POWER);
  }

  let source = null as any;
  yield store.prompt(
    state,
    new ChoosePokemonPrompt(
      player.id,
      GameMessage.CHOOSE_POKEMON_TO_DAMAGE,
      PlayerType.TOP_PLAYER,
      [SlotType.ACTIVE, SlotType.BENCH],
      { min: 1, max: 1, allowCancel: true }
    ),
    selected => {
      const chosen = selected || [];
      source = chosen[0];
      next();
    }
  );

  if (source === null || source.damage === 0) {
    return state;
  }

  const blockedTarget = source === opponent.active
    ? [{ player: PlayerType.TOP_PLAYER, slot: SlotType.ACTIVE, index: 0 }]
    : [{ player: PlayerType.TOP_PLAYER, slot: SlotType.BENCH, index: opponent.bench.indexOf(source) }];

  let target = null as any;
  yield store.prompt(
    state,
    new ChoosePokemonPrompt(
      player.id,
      GameMessage.CHOOSE_POKEMON_TO_DAMAGE,
      PlayerType.TOP_PLAYER,
      [SlotType.ACTIVE, SlotType.BENCH],
      { min: 1, max: 1, allowCancel: true, blocked: blockedTarget }
    ),
    selected => {
      const chosen = selected || [];
      target = chosen[0];
      next();
    }
  );

  if (target === null) {
    return state;
  }

  const sourceOwner = StateUtils.findOwner(state, source);
  const checkHpEffect = new CheckHpEffect(sourceOwner, source);
  store.reduceEffect(state, checkHpEffect);

  const maxCounters = Math.min(2, Math.floor(source.damage / 10));
  if (maxCounters <= 0) {
    throw new GameError(GameMessage.CANNOT_USE_POWER);
  }

  let countersToMove = 0;
  yield store.prompt(
    state,
    new SelectPrompt(
      player.id,
      GameMessage.CHOOSE_OPTION,
      Array.from({ length: maxCounters + 1 }, (_, index) => String(index)),
      { allowCancel: false }
    ),
    result => {
      countersToMove = result ?? 0;
      next();
    }
  );

  if (countersToMove === 0) {
    return state;
  }

  source.damage -= countersToMove * 10;
  target.damage += countersToMove * 10;
  player.marker.addMarker(self.PAINFUL_SPOONS_MARKER, self);

  return state;
}

export class RadiantAlakazam extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 10331,
      name: '光辉胡地',
      yorenCode: 'Y1088',
      cardType: '1',
      commodityCode: 'CS6bC',
      details: {
        regulationMarkText: 'F',
        collectionNumber: '028/131',
        rarityLabel: 'K',
        cardTypeLabel: '宝可梦',
        attributeLabel: '超',
        pokemonTypeLabel: '光辉宝可梦',
        hp: 130,
        evolveText: '基础',
        weakness: '恶 ×2',
        resistance: '斗 -30',
        retreatCost: 2,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/206/51.png',
      ruleLines: ['1副卡组中只能放入1张光辉宝可梦卡。'],
      attacks: [
        {
          id: 8781,
          name: '意志控制者',
          text: '造成对手手牌张数×20点伤害。',
          cost: ['PSYCHIC', 'COLORLESS'],
          damage: '20×',
        },
      ],
      features: [
        {
          id: 1153,
          name: '伤痛汤匙',
          text: '在自己的回合可以使用1次。选择对手场上1只宝可梦身上放置的最多2个伤害指示物，转放于对手1只其他宝可梦身上。',
        },
      ],
      deckRuleLimit: 1,
    },
    collection: {
      id: 206,
      commodityCode: 'CS6bC',
      name: '补充包 碧海暗影 逐',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/206/51.png',
  };

  public tags = [CardTag.RADIANT];

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.PSYCHIC];

  public hp: number = 130;

  public weakness = [{ type: CardType.DARK }];

  public resistance = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public powers = [
    {
      name: '伤痛汤匙',
      useWhenInPlay: true,
      powerType: PowerType.ABILITY,
      text: '在自己的回合可以使用1次。选择对手场上1只宝可梦身上放置的最多2个伤害指示物，转放于对手1只其他宝可梦身上。',
    },
  ];

  public attacks = [
    {
      name: '意志控制者',
      cost: [CardType.PSYCHIC, CardType.COLORLESS],
      damage: '20×',
      text: '造成对手手牌张数×20点伤害。',
    },
  ];

  public set: string = 'set_f';

  public name: string = '光辉胡地';

  public fullName: string = '光辉胡地 CS6bC';

  public readonly PAINFUL_SPOONS_MARKER = 'PAINFUL_SPOONS_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const generator = usePainfulSpoons(() => generator.next(), store, state, this, effect);
      return generator.next().value;
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      effect.damage = effect.opponent.hand.cards.length * 20;
      return state;
    }

    if (effect instanceof EndTurnEffect) {
      effect.player.marker.removeMarker(this.PAINFUL_SPOONS_MARKER, this);
      return state;
    }

    return state;
  }
}
