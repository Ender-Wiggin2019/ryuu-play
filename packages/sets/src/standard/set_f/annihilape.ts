import {
  AttackEffect,
  CardTarget,
  CardType,
  CheckProvidedEnergyEffect,
  ChoosePokemonPrompt,
  Effect,
  GameError,
  GameMessage,
  PlayerType,
  PokemonCard,
  PowerEffect,
  PowerType,
  SelectPrompt,
  SpecialCondition,
  Stage,
  State,
  StateUtils,
  StoreLike,
  AddSpecialConditionsEffect,
  EndTurnEffect,
  SlotType,
} from '@ptcg/common';

function* useFrenziedMind(
  next: Function,
  store: StoreLike,
  state: State,
  self: Annihilape,
  effect: PowerEffect
): IterableIterator<State> {
  const player = effect.player;
  const pokemonSlot = StateUtils.findPokemonSlot(state, self);

  if (!pokemonSlot) {
    throw new GameError(GameMessage.CANNOT_USE_POWER);
  }

  const checkProvidedEnergy = new CheckProvidedEnergyEffect(player, pokemonSlot);
  store.reduceEffect(state, checkProvidedEnergy);

  const hasDarkEnergy = checkProvidedEnergy.energyMap.some(item => item.provides.includes(CardType.DARK));
  if (!hasDarkEnergy) {
    throw new GameError(GameMessage.CANNOT_USE_POWER);
  }

  if (player.marker.hasMarker(self.FRENZIED_MIND_MARKER, self)) {
    throw new GameError(GameMessage.POWER_ALREADY_USED);
  }

  const blockedSource: CardTarget[] = [];
  let hasDamageSource = false;
  player.forEachPokemon(PlayerType.BOTTOM_PLAYER, (pokemonSlot, pokemonCard, target) => {
    if (pokemonCard === undefined || pokemonSlot.damage === 0) {
      blockedSource.push(target);
      return;
    }

    hasDamageSource = true;
  });

  if (!hasDamageSource) {
    throw new GameError(GameMessage.CANNOT_USE_POWER);
  }

  const opponent = StateUtils.getOpponent(state, player);
  const hasTarget = opponent.active.pokemons.cards.length > 0 || opponent.bench.some(slot => slot.pokemons.cards.length > 0);
  if (!hasTarget) {
    throw new GameError(GameMessage.CANNOT_USE_POWER);
  }

  let source = null as any;
  yield store.prompt(
    state,
    new ChoosePokemonPrompt(
      player.id,
      GameMessage.MOVE_DAMAGE,
      PlayerType.BOTTOM_PLAYER,
      [SlotType.ACTIVE, SlotType.BENCH],
      { min: 1, max: 1, allowCancel: true, blocked: blockedSource }
    ),
    selected => {
      const chosen = selected || [];
      source = chosen[0];
      next();
    }
  );

  if (source === null) {
    return state;
  }

  let target = null as any;
  yield store.prompt(
    state,
    new ChoosePokemonPrompt(
      player.id,
      GameMessage.MOVE_DAMAGE,
      PlayerType.TOP_PLAYER,
      [SlotType.ACTIVE, SlotType.BENCH],
      { min: 1, max: 1, allowCancel: true }
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

  const maxCounters = Math.min(3, Math.floor(source.damage / 10));
  if (maxCounters <= 0) {
    throw new GameError(GameMessage.CANNOT_USE_POWER);
  }

  let countersToMove = 1;
  if (maxCounters > 1) {
    const options = Array.from({ length: maxCounters }, (_value, index) => String(index + 1));
    yield store.prompt(
      state,
      new SelectPrompt(player.id, GameMessage.CHOOSE_OPTION, options, { allowCancel: false }),
      result => {
        countersToMove = (result ?? 0) + 1;
        next();
      }
    );
  }

  source.damage -= countersToMove * 10;
  target.damage += countersToMove * 10;
  player.marker.addMarker(self.FRENZIED_MIND_MARKER, self);

  return state;
}

export class Annihilape extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 17900,
      name: '愿增猿',
      yorenCode: 'P1015',
      cardType: '1',
      commodityCode: 'CSV8C',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '094/207',
        rarityLabel: 'R★★',
        cardTypeLabel: '宝可梦',
        attributeLabel: '超',
        trainerTypeLabel: null,
        energyTypeLabel: null,
        pokemonTypeLabel: null,
        specialCardLabel: null,
        hp: 110,
        evolveText: '基础',
        weakness: '恶 ×2',
        resistance: '斗 -30',
        retreatCost: 1,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/259.png',
      ruleLines: [],
      attacks: [
        {
          id: 673,
          name: '精神幻觉',
          text: '令对手的战斗宝可梦陷入【混乱】状态。',
          cost: ['超', '无色'],
          damage: '60',
        },
      ],
      features: [
        {
          id: 106,
          name: '亢奋脑力',
          text: '如果这只宝可梦身上附着了【恶】能量的话，则在自己的回合可以使用1次。选择自己场上1只宝可梦身上放置的最多3个伤害指示物，转放于对手场上1只宝可梦身上。',
        },
      ],
      illustratorNames: ['kodama'],
      pokemonCategory: '随从宝可梦',
      pokedexCode: '1015',
      pokedexText: '会从安全的地方释放出能引起强烈头晕的念力，将敌人玩弄于股掌之间。',
      height: 1,
      weight: 12.2,
      deckRuleLimit: null,
    },
    collection: {
      id: 458,
      commodityCode: 'CSV8C',
      name: '补充包 璀璨诡幻',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/259.png',
  };

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.PSYCHIC];

  public hp: number = 110;

  public weakness = [{ type: CardType.DARK }];

  public resistance = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [CardType.COLORLESS];

  public powers = [
    {
      name: '亢奋脑力',
      useWhenInPlay: true,
      powerType: PowerType.ABILITY,
      text:
        '如果这只宝可梦身上附着了【恶】能量的话，则在自己的回合可以使用1次。选择自己场上1只宝可梦身上放置的最多3个伤害指示物，转放于对手场上1只宝可梦身上。',
    },
  ];

  public attacks = [
    {
      name: '精神幻觉',
      cost: [CardType.PSYCHIC, CardType.COLORLESS],
      damage: '60',
      text: '令对手的战斗宝可梦陷入【混乱】状态。',
    },
  ];

  public set: string = 'set_h';

  public name: string = '愿增猿';

  public fullName: string = '愿增猿 CSV8C';

  public readonly FRENZIED_MIND_MARKER = 'FRENZIED_MIND_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const generator = useFrenziedMind(() => generator.next(), store, state, this, effect);
      return generator.next().value;
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const specialConditionEffect = new AddSpecialConditionsEffect(effect, [SpecialCondition.CONFUSED]);
      store.reduceEffect(state, specialConditionEffect);
      return state;
    }

    if (effect instanceof EndTurnEffect) {
      effect.player.marker.removeMarker(this.FRENZIED_MIND_MARKER, this);
      return state;
    }

    return state;
  }
}
