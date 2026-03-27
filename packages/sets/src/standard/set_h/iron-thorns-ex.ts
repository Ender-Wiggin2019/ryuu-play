import {
  AttackEffect,
  CardTag,
  CardType,
  ChooseCardsPrompt,
  ChoosePokemonPrompt,
  Effect,
  EnergyCard,
  GameError,
  GameMessage,
  PlayerType,
  PokemonCard,
  PowerEffect,
  PowerType,
  SlotType,
  Stage,
  State,
  StateUtils,
  StoreLike,
  SuperType,
} from '@ptcg/common';

function hasLabel(card: PokemonCard | undefined, label: string): boolean {
  if (card === undefined) {
    return false;
  }

  const rawData = card as any;
  const labels = [
    rawData.rawData?.raw_card?.details?.specialCardLabel,
    rawData.rawData?.api_card?.specialCardLabel,
  ];

  return labels.some((item: unknown) => item === label);
}

function isFuturePokemon(card: PokemonCard | undefined): boolean {
  return hasLabel(card, '未来');
}

function isRuleBoxPokemon(card: PokemonCard | undefined): boolean {
  if (card === undefined) {
    return false;
  }

  if (
    card.tags.includes(CardTag.POKEMON_EX)
    || card.tags.includes(CardTag.POKEMON_V)
    || card.tags.includes(CardTag.POKEMON_VSTAR)
    || card.tags.includes(CardTag.POKEMON_GX)
    || card.tags.includes(CardTag.POKEMON_LV_X)
    || card.tags.includes(CardTag.RADIANT)
  ) {
    return true;
  }

  const rawData = card as any;
  const labels = [
    rawData.rawData?.raw_card?.details?.pokemonTypeLabel,
    rawData.rawData?.api_card?.pokemonTypeLabel,
  ];

  return labels.some((label: unknown) => {
    if (typeof label !== 'string') {
      return false;
    }
    return label.includes('宝可梦ex')
      || label.includes('宝可梦VSTAR')
      || label.includes('宝可梦V')
      || label.includes('宝可梦GX')
      || label.includes('宝可梦LV.X')
      || label.includes('宝可梦VMAX');
  });
}

export class IronThornsEx extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 16385,
      name: '铁荆棘ex',
      yorenCode: 'Y1392',
      cardType: '1',
      commodityCode: 'CSV7C',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '219/204',
        rarityLabel: 'SR',
        cardTypeLabel: '宝可梦',
        attributeLabel: '雷',
        pokemonTypeLabel: '宝可梦ex',
        specialCardLabel: '未来',
        hp: 230,
        evolveText: '基础',
        weakness: '斗 ×2',
        resistance: '斗 -30',
        retreatCost: 4,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/564.png',
      ruleLines: ['当宝可梦ex【昏厥】时，对手将拿取2张奖赏卡。'],
      attacks: [
        {
          id: 1741,
          name: '伏特旋风',
          text: '选择这只宝可梦身上附着的1个能量，转附于备战宝可梦身上。',
          cost: ['雷', '无色', '无色'],
          damage: '140',
        },
      ],
      features: [
        {
          id: 236,
          name: '初始化',
          text: '只要这只宝可梦在战斗场上，双方场上的「拥有规则的宝可梦」（除「未来」宝可梦外）的特性，全部消除。',
        },
      ],
      illustratorNames: ['PLANETA Mochizuki'],
      pokemonCategory: null,
      pokedexCode: null,
      pokedexText: null,
      height: null,
      weight: null,
      deckRuleLimit: null,
    },
    collection: {
      id: 324,
      commodityCode: 'CSV7C',
      name: '补充包 利刃猛醒',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/564.png',
  };

  public tags = [CardTag.POKEMON_EX];

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.LIGHTNING];

  public hp: number = 230;

  public weakness = [{ type: CardType.FIGHTING }];

  public resistance = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [
    CardType.COLORLESS,
    CardType.COLORLESS,
    CardType.COLORLESS,
    CardType.COLORLESS,
  ];

  public powers = [
    {
      name: '初始化',
      powerType: PowerType.ABILITY,
      text:
        '只要这只宝可梦在战斗场上，双方场上的「拥有规则的宝可梦」（除「未来」宝可梦外）的特性，全部消除。',
    },
  ];

  public attacks = [
    {
      name: '伏特旋风',
      cost: [CardType.LIGHTNING, CardType.COLORLESS, CardType.COLORLESS],
      damage: '140',
      text: '选择这只宝可梦身上附着的1个能量，转附于备战宝可梦身上。',
    },
  ];

  public set: string = 'set_h';

  public name: string = '铁荆棘ex';

  public fullName: string = '铁荆棘ex CSV7C';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PowerEffect && effect.power.powerType === PowerType.ABILITY) {
      const pokemonSlot = StateUtils.findPokemonSlot(state, this);
      if (pokemonSlot === undefined) {
        return state;
      }

      const owner = StateUtils.findOwner(state, pokemonSlot);
      if (pokemonSlot !== owner.active) {
        return state;
      }

      if (effect.card === this || isFuturePokemon(effect.card)) {
        return state;
      }

      if (isRuleBoxPokemon(effect.card)) {
        throw new GameError(GameMessage.BLOCKED_BY_ABILITY);
      }
    }

    if (effect instanceof AttackEffect && (effect.attack === this.attacks[0] || effect.attack.name === this.attacks[0].name)) {
      const player = effect.player;
      const benchTargets = player.bench
        .map((slot, index) => {
          if (slot.pokemons.cards.length === 0) {
            return null;
          }
          return { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index };
        })
        .filter((target): target is { player: PlayerType; slot: SlotType; index: number } => target !== null);

      if (player.active.energies.cards.length === 0 || benchTargets.length === 0) {
        return state;
      }

      let selectedEnergy: EnergyCard | null = null;
      return store.prompt(
        state,
        new ChooseCardsPrompt(
          player.id,
          GameMessage.CHOOSE_CARD_TO_DISCARD,
          player.active.energies,
          { superType: SuperType.ENERGY },
          { min: 1, max: 1, allowCancel: false }
        ),
        cards => {
          selectedEnergy = (cards || [])[0] as EnergyCard | null;
          if (selectedEnergy === null || selectedEnergy === undefined) {
            return;
          }

          store.prompt(
            state,
            new ChoosePokemonPrompt(
              player.id,
              GameMessage.CHOOSE_POKEMON_TO_SWITCH,
              PlayerType.BOTTOM_PLAYER,
              [SlotType.BENCH],
              { allowCancel: false }
            ),
            targets => {
              if (targets === null || targets.length === 0) {
                return;
              }

              player.active.energies.moveCardTo(selectedEnergy as EnergyCard, targets[0].energies);
            }
          );
        }
      );
    }

    return state;
  }
}
