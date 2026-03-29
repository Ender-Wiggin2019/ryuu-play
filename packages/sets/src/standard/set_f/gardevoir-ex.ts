import {
  AttachEnergyPrompt,
  AttackEffect,
  CardTarget,
  CardTag,
  CardType,
  Effect,
  EnergyCard,
  EnergyType,
  GameError,
  GameMessage,
  CheckHpEffect,
  PlayerType,
  PokemonCard,
  PowerEffect,
  PowerType,
  RemoveSpecialConditionsEffect,
  SlotType,
  Stage,
  State,
  StateUtils,
  StoreLike,
  SuperType,
} from '@ptcg/common';

function* usePsychoEmbrace(
  next: Function,
  store: StoreLike,
  state: State,
  self: GardevoirEx,
  effect: PowerEffect
): IterableIterator<State> {
  const player = effect.player;
  const pokemonSlot = StateUtils.findPokemonSlot(state, self);

  if (!pokemonSlot) {
    throw new GameError(GameMessage.CANNOT_USE_POWER);
  }

  const hasBasicPsychicEnergyInDiscard = player.discard.cards.some(card =>
    card instanceof EnergyCard
    && card.energyType === EnergyType.BASIC
    && card.provides.includes(CardType.PSYCHIC)
  );

  if (!hasBasicPsychicEnergyInDiscard) {
    throw new GameError(GameMessage.CANNOT_USE_POWER);
  }

  const blockedTo: CardTarget[] = [];
  let hasValidTarget = false;
  player.forEachPokemon(PlayerType.BOTTOM_PLAYER, (_slot, pokemonCard, target) => {
    if (pokemonCard === undefined) {
      blockedTo.push(target);
      return;
    }

    const hpEffect = new CheckHpEffect(player, _slot);
    store.reduceEffect(state, hpEffect);
    const maxHp = hpEffect.hp;

    if (!pokemonCard.cardTypes.includes(CardType.PSYCHIC) || _slot.damage + 20 >= maxHp) {
      blockedTo.push(target);
      return;
    }

    hasValidTarget = true;
  });

  if (!hasValidTarget) {
    throw new GameError(GameMessage.CANNOT_USE_POWER);
  }

  let transfers: { to: CardTarget; card: EnergyCard }[] = [];
  yield store.prompt(
    state,
    new AttachEnergyPrompt(
      player.id,
      GameMessage.ATTACH_ENERGY_TO_ACTIVE,
      player.discard,
      PlayerType.BOTTOM_PLAYER,
      [SlotType.ACTIVE, SlotType.BENCH],
      { superType: SuperType.ENERGY, energyType: EnergyType.BASIC, provides: [CardType.PSYCHIC] },
      { allowCancel: true, min: 1, max: 1, blockedTo }
    ),
    result => {
      transfers = (result || []) as { to: CardTarget; card: EnergyCard }[];
      next();
    }
  );

  if (transfers.length === 0) {
    return state;
  }

  for (const transfer of transfers) {
    const target = StateUtils.getTarget(state, player, transfer.to);
    player.discard.moveCardTo(transfer.card, target.energies);
    target.damage += 20;
  }

  return state;
}

export class GardevoirEx extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 12813,
      name: '沙奈朵ex',
      yorenCode: 'Y1249',
      cardType: '1',
      commodityCode: 'CSV2C',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '155/128',
        rarityLabel: 'SAR',
        cardTypeLabel: '宝可梦',
        attributeLabel: '超',
        trainerTypeLabel: null,
        energyTypeLabel: null,
        pokemonTypeLabel: '宝可梦ex',
        specialCardLabel: null,
        hp: 310,
        evolveText: '2阶进化',
        weakness: '恶 ×2',
        resistance: '斗 -30',
        retreatCost: 2,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/253/384.png',
      ruleLines: ['当宝可梦ex【昏厥】时，对手将拿取2张奖赏卡。'],
      attacks: [
        {
          id: 6908,
          name: '奇迹之力',
          text: '将这只宝可梦的特殊状态，全部恢复。',
          cost: ['超', '超', '无色'],
          damage: '190',
        },
      ],
      features: [
        {
          id: 929,
          name: '精神拥抱',
          text:
            '在自己的回合可以使用任意次。选择自己弃牌区中的1张「基本【超】能量」，附着于自己的【超】宝可梦身上。然后，在被附着的宝可梦身上放置2个伤害指示物。（对会被【昏厥】的宝可梦，无法使用这个特性。）',
        },
      ],
      illustratorNames: ['Jiro Sasumo'],
      pokemonCategory: null,
      pokedexCode: null,
      pokedexText: '',
      height: null,
      weight: null,
      deckRuleLimit: null,
    },
    collection: {
      id: 253,
      commodityCode: 'CSV2C',
      name: '补充包 奇迹启程',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/253/384.png',
  };

  public tags = [CardTag.POKEMON_EX];

  public stage: Stage = Stage.STAGE_2;

  public evolvesFrom = '奇鲁莉安';

  public cardTypes: CardType[] = [CardType.PSYCHIC];

  public hp: number = 310;

  public weakness = [{ type: CardType.DARK }];

  public resistance = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public powers = [
    {
      name: '精神拥抱',
      useWhenInPlay: true,
      powerType: PowerType.ABILITY,
      text:
        '在自己的回合可以使用任意次。选择自己弃牌区中的1张「基本【超】能量」，附着于自己的【超】宝可梦身上。然后，在被附着的宝可梦身上放置2个伤害指示物。（对会被【昏厥】的宝可梦，无法使用这个特性。）',
    },
  ];

  public attacks = [
    {
      name: '奇迹之力',
      cost: [CardType.PSYCHIC, CardType.PSYCHIC, CardType.COLORLESS],
      damage: '190',
      text: '将这只宝可梦的特殊状态，全部恢复。',
    },
  ];

  public set: string = 'set_g';

  public name: string = '沙奈朵ex';

  public fullName: string = '沙奈朵ex CSV2C';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const generator = usePsychoEmbrace(() => generator.next(), store, state, this, effect);
      return generator.next().value;
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      effect.damage = 190;
      const player = effect.player;
      const removeSpecialConditionsEffect = new RemoveSpecialConditionsEffect(effect, undefined);
      removeSpecialConditionsEffect.target = player.active;
      store.reduceEffect(state, removeSpecialConditionsEffect);
      return state;
    }

    return state;
  }
}
