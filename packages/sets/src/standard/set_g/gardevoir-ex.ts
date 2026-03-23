import {
  AttachEnergyPrompt,
  AttackEffect,
  CardTag,
  CardTarget,
  CardType,
  CheckHpEffect,
  Effect,
  EnergyCard,
  EnergyType,
  GameError,
  GameMessage,
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

export class GardevoirEx extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 16904,
      yorenCode: 'Y1249',
      cardType: '1',
      pokemonType: '11',
      nameSamePokemonId: 2644,
      details: {
        id: 16904,
        evolveText: '2阶进化',
        cardName: '沙奈朵ex',
        regulationMarkText: 'G',
        collectionNumber: '007/033',
        rarity: '10',
        rarityText: '无标记',
        hp: 310,
        attribute: '5',
        yorenCode: 'Y1249',
        cardType: '1',
        cardTypeText: '宝可梦',
        featureFlag: '1',
        cardFeatureItemList: [
          {
            featureName: '精神拥抱',
            featureDesc:
              '在自己的回合可以使用任意次。选择自己弃牌区中的1张「基本【超】能量」，附着于自己的【超】宝可梦身上。然后，在被附着的宝可梦身上放置2个伤害指示物。（对会被【昏厥】的宝可梦，无法使用这个特性。）',
          },
        ],
        abilityItemList: [
          {
            abilityName: '奇迹之力',
            abilityText: '将这只宝可梦的特殊状态，全部恢复。',
            abilityCost: '5,5,11',
            abilityDamage: '190',
          },
        ],
        ruleText: '当宝可梦ex【昏厥】时，对手将拿取2张奖赏卡。',
        weaknessType: '7',
        weaknessFormula: '×2',
        resistanceType: '6',
        resistanceFormula: '-30',
        retreatCost: 2,
        illustratorName: ['N-DESIGN Inc.'],
        commodityList: [
          {
            commodityName: '大师战略卡组构筑套装 沙奈朵ex',
            commodityCode: 'CSVM1bC',
          },
        ],
        pokemonType: '11',
        collectionFlag: 0,
        special_shiny_type: 0,
      },
      name: '沙奈朵ex',
      image: 'img\\329\\6.png',
      hash: 'dfe0c566115c985fbb3c576721ddf8e0',
    },
    collection: {},
    image_url: 'https://raw.githubusercontent.com/duanxr/PTCG-CHS-Datasets/main/img/329/6.png',
  };

  public tags = [CardTag.POKEMON_EX];

  public stage: Stage = Stage.STAGE_2;

  public evolvesFrom = 'Kirlia';

  public cardTypes: CardType[] = [CardType.PSYCHIC];

  public hp: number = 310;

  public weakness = [{ type: CardType.DARK }];

  public resistance = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public powers = [
    {
      name: 'Psychic Embrace',
      useWhenInPlay: true,
      powerType: PowerType.ABILITY,
      text:
        'As often as you like during your turn, you may attach a Basic Psychic Energy card from your discard pile ' +
        'to 1 of your Psychic Pokemon. If you attached Energy to a Pokemon in this way, put 2 damage counters on that Pokemon. ' +
        '(You can\'t use this Ability on a Pokemon that would be Knocked Out.)',
    },
  ];

  public attacks = [
    {
      name: 'Miracle Force',
      cost: [CardType.PSYCHIC, CardType.PSYCHIC, CardType.COLORLESS],
      damage: '190',
      text: 'Heal all Special Conditions from this Pokemon.',
    },
  ];

  public set: string = 'set_g';

  public name: string = 'Gardevoir ex';

  public fullName: string = 'Gardevoir ex CSVM1bC';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const player = effect.player;

      const hasEnergyInDiscard = player.discard.cards.some(c => {
        return c instanceof EnergyCard && c.energyType === EnergyType.BASIC && c.provides.includes(CardType.PSYCHIC);
      });
      if (!hasEnergyInDiscard) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      const blockedTo: CardTarget[] = [];
      let targetCount = 0;

      player.forEachPokemon(PlayerType.BOTTOM_PLAYER, (pokemonSlot, card, target) => {
        targetCount += 1;
        if (!card.cardTypes.includes(CardType.PSYCHIC)) {
          blockedTo.push(target);
          return;
        }

        const checkHpEffect = new CheckHpEffect(player, pokemonSlot);
        store.reduceEffect(state, checkHpEffect);
        const remainingHp = checkHpEffect.hp - pokemonSlot.damage;
        if (remainingHp <= 20) {
          blockedTo.push(target);
        }
      });

      if (blockedTo.length === targetCount) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      return store.prompt(
        state,
        new AttachEnergyPrompt(
          player.id,
          GameMessage.ATTACH_ENERGY_CARDS,
          player.discard,
          PlayerType.BOTTOM_PLAYER,
          [SlotType.ACTIVE, SlotType.BENCH],
          {
            superType: SuperType.ENERGY,
            energyType: EnergyType.BASIC,
            name: 'Psychic Energy',
          },
          { allowCancel: true, min: 1, max: 1, blockedTo }
        ),
        transfers => {
          transfers = transfers || [];
          if (transfers.length === 0) {
            return;
          }

          for (const transfer of transfers) {
            const target = StateUtils.getTarget(state, player, transfer.to);
            player.discard.moveCardTo(transfer.card, target.energies);
            target.damage += 20;
          }
        }
      );
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const removeSpecialCondition = new RemoveSpecialConditionsEffect(effect, undefined);
      removeSpecialCondition.target = effect.player.active;
      state = store.reduceEffect(state, removeSpecialCondition);
      return state;
    }

    return state;
  }
}
