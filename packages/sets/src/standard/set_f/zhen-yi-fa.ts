import {
  AttackEffect,
  CardTag,
  CardType,
  ChoosePokemonPrompt,
  DealDamageEffect,
  Effect,
  GameError,
  GameMessage,
  PlayerType,
  PokemonCard,
  PowerEffect,
  PowerType,
  PutDamageEffect,
  SlotType,
  Stage,
  State,
  StateUtils,
  StoreLike,
} from '@ptcg/common';

export class ZhenYiFa extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 17266,
      name: '振翼发',
      yorenCode: 'P0987',
      cardType: '1',
      commodityCode: 'CBB4C',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '28 07/07',
        rarityLabel: '★★★',
        cardTypeLabel: '宝可梦',
        attributeLabel: '超',
        trainerTypeLabel: null,
        energyTypeLabel: null,
        pokemonTypeLabel: null,
        specialCardLabel: '古代',
        hp: 90,
        evolveText: '基础',
        weakness: '钢 ×2',
        resistance: null,
        retreatCost: 1,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/339/195.png',
      ruleLines: [],
      attacks: [
        {
          id: 1207,
          name: '飞来横祸',
          text: '将2个伤害指示物，以任意方式放置于对手的备战宝可梦身上。',
          cost: ['无色', '无色', '无色'],
          damage: '90',
        },
      ],
      features: [
        {
          id: 163,
          name: '暗夜振翼',
          text: '只要这只宝可梦在战斗场上，对手战斗宝可梦的特性（除「暗夜振翼」外），全部消除。',
        },
      ],
      illustratorNames: ['Takumi Wada'],
      pokemonCategory: '悖谬宝可梦',
      pokedexCode: '0987',
      pokedexText: '这只宝可梦与某本书中出现的一种叫振翼发的生物有着相似的特征。',
      height: 1.4,
      weight: 4,
      deckRuleLimit: null,
    },
    collection: {
      id: 339,
      commodityCode: 'CBB4C',
      name: '宝石包 VOL.4',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/339/195.png',
  };

  public tags = [CardTag.TERA];

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.PSYCHIC];

  public hp: number = 90;

  public weakness = [{ type: CardType.METAL }];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: '飞来横祸',
      cost: [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS],
      damage: '90',
      text: '将2个伤害指示物，以任意方式放置于对手的备战宝可梦身上。',
    },
  ];

  public powers = [
    {
      name: '暗夜振翼',
      powerType: PowerType.ABILITY,
      text: '只要这只宝可梦在战斗场上，对手战斗宝可梦的特性（除「暗夜振翼」外），全部消除。',
    },
  ];

  public set: string = 'set_h';

  public name: string = '振翼发';

  public fullName: string = '振翼发 28 07/07#17266';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PowerEffect && effect.power.powerType === PowerType.ABILITY) {
      const ownerSlot = StateUtils.findPokemonSlot(state, this);
      if (!ownerSlot) {
        return state;
      }

      const owner = StateUtils.findOwner(state, ownerSlot);
      if (ownerSlot !== owner.active) {
        return state;
      }

      if (effect.card === this) {
        return state;
      }

      if (effect.card !== owner.active.getPokemonCard()) {
        return state;
      }

      throw new GameError(GameMessage.BLOCKED_BY_ABILITY);
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      effect.damage = 90;
      const opponent = effect.opponent;

      const benchTargets = opponent.bench
        .map((slot, index) => (slot.pokemons.cards.length > 0 ? { player: PlayerType.TOP_PLAYER, slot: SlotType.BENCH, index } : null))
        .filter((target): target is { player: PlayerType; slot: SlotType; index: number } => target !== null);

      if (benchTargets.length === 0) {
        return state;
      }

      return store.prompt(
        state,
        new ChoosePokemonPrompt(
          effect.player.id,
          GameMessage.CHOOSE_POKEMON_TO_DAMAGE,
          PlayerType.TOP_PLAYER,
          [SlotType.BENCH],
          { allowCancel: false, min: 1, max: Math.min(2, benchTargets.length) }
        ),
        targets => {
          const selected = targets || [];
          if (selected.length === 0) {
            return;
          }

          const damagePerTarget = selected.length === 1 ? 20 : 10;
          selected.forEach(target => {
            if (target === opponent.active) {
              const activeDamage = new DealDamageEffect(effect, damagePerTarget);
              activeDamage.target = target;
              store.reduceEffect(state, activeDamage);
              return;
            }
            const benchDamage = new PutDamageEffect(effect, damagePerTarget);
            benchDamage.target = target;
            store.reduceEffect(state, benchDamage);
          });
        }
      );
    }

    return state;
  }
}
