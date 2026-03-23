import {
  AddSpecialConditionsEffect,
  AttackEffect,
  CardTarget,
  CardType,
  CheckHpEffect,
  DamageMap,
  CheckProvidedEnergyEffect,
  ChoosePokemonPrompt,
  Effect,
  EndTurnEffect,
  GameError,
  GameMessage,
  MoveDamagePrompt,
  PlayerType,
  PokemonCard,
  PokemonSlot,
  PowerEffect,
  PowerType,
  SlotType,
  SpecialCondition,
  Stage,
  State,
  StateUtils,
  StoreLike,
} from '@ptcg/common';

export class Munkidori extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 17471,
      name: '愿增猿',
      yorenCode: 'P1015',
      cardType: '1',
      nameSamePokemonId: 2911,
      commodityCode: 'CSV8C',
      details: {
        id: 17471,
        evolveText: '基础',
        cardName: '愿增猿',
        regulationMarkText: 'H',
        collectionNumber: '094/207',
        commodityCode: 'CSV8C',
        rarity: '3',
        rarityText: 'R',
        hp: 110,
        attribute: '5',
        yorenCode: 'P1015',
        cardType: '1',
        cardTypeText: '宝可梦',
        featureFlag: '1',
        cardFeatureItemList: [
          {
            featureName: '亢奋脑力',
            featureDesc: '如果这只宝可梦身上附着了【恶】能量的话，则在自己的回合可以使用1次。选择自己场上1只宝可梦身上放置的最多3个伤害指示物，转放于对手场上1只宝可梦身上。',
          },
        ],
        abilityItemList: [
          {
            abilityName: '精神幻觉',
            abilityText: '令对手的战斗宝可梦陷入【混乱】状态。',
            abilityCost: '5,11',
            abilityDamage: '60',
          },
        ],
        pokemonCategory: '随从宝可梦',
        weaknessType: '7',
        weaknessFormula: '×2',
        resistanceType: '6',
        resistanceFormula: '-30',
        retreatCost: 1,
        pokedexCode: '1015',
        pokedexText: '会从安全的地方释放出能引起强烈头晕的念力，将敌人玩弄于股掌之间。',
        height: 1.0,
        weight: 12.2,
        illustratorName: ['kodama'],
        commodityList: [
          {
            commodityName: '补充包 璀璨诡幻',
            commodityCode: 'CSV8C',
          },
        ],
        collectionFlag: 0,
        special_shiny_type: 0,
      },
      image: 'img/458/257.png',
      hash: '31464554a3cefac631b36c609f600494',
    },
    collection: {
      id: 458,
      commodityCode: 'CSV8C',
      name: '补充包 璀璨诡幻',
      salesDate: '2026-03-13',
      series: '3',
      seriesText: '朱&紫',
      goodsType: '1',
      linkType: 0,
      image: 'img/458/cover.png',
    },
    image_url: 'https://raw.githubusercontent.com/duanxr/PTCG-CHS-Datasets/main/img/458/257.png',
  };

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.PSYCHIC];

  public hp: number = 110;

  public weakness = [{ type: CardType.DARK }];

  public resistance = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [CardType.COLORLESS];

  public powers = [
    {
      name: 'Adrena-Brain',
      useWhenInPlay: true,
      powerType: PowerType.ABILITY,
      text:
        'Once during your turn, if this Pokemon has any Darkness Energy attached, ' +
        'you may move up to 3 damage counters from 1 of your Pokemon to 1 of your opponent\'s Pokemon.',
    },
  ];

  public attacks = [
    {
      name: 'Mind Bend',
      cost: [CardType.PSYCHIC, CardType.COLORLESS],
      damage: '60',
      text: 'Your opponent\'s Active Pokemon is now Confused.',
    },
  ];

  public set: string = 'set_h';

  public name: string = 'Munkidori';

  public fullName: string = 'Munkidori CSV8C';

  public readonly ADRENA_BRAIN_MARKER = 'ADRENA_BRAIN_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const player = effect.player;
      const pokemonSlot = StateUtils.findPokemonSlot(state, this);

      if (!pokemonSlot || !pokemonSlot.pokemons.cards.includes(this)) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      if (player.marker.hasMarker(this.ADRENA_BRAIN_MARKER, this)) {
        throw new GameError(GameMessage.POWER_ALREADY_USED);
      }

      const checkProvidedEnergy = new CheckProvidedEnergyEffect(player, pokemonSlot);
      state = store.reduceEffect(state, checkProvidedEnergy);
      if (!StateUtils.checkEnoughEnergy(checkProvidedEnergy.energyMap, [CardType.DARK])) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      const blockedFrom: CardTarget[] = [];
      let sourceCount = 0;
      player.forEachPokemon(PlayerType.BOTTOM_PLAYER, (slot, _card, target) => {
        sourceCount += 1;
        if (slot.damage < 10) {
          blockedFrom.push(target);
        }
      });

      if (blockedFrom.length === sourceCount) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      let sourceTargets: PokemonSlot[] = [];
      return store.prompt(
        state,
        new ChoosePokemonPrompt(
          player.id,
          GameMessage.CHOOSE_POKEMON_TO_DAMAGE,
          PlayerType.BOTTOM_PLAYER,
          [SlotType.ACTIVE, SlotType.BENCH],
          { allowCancel: true, min: 1, max: 1, blocked: blockedFrom }
        ),
        results => {
          sourceTargets = results || [];
          if (sourceTargets.length === 0) {
            return;
          }

          const source = sourceTargets[0];
          store.prompt(
            state,
            new ChoosePokemonPrompt(
              player.id,
              GameMessage.CHOOSE_POKEMON_TO_DAMAGE,
              PlayerType.TOP_PLAYER,
              [SlotType.ACTIVE, SlotType.BENCH],
              { allowCancel: false, min: 1, max: 1 }
            ),
            targetResults => {
              const target = (targetResults || [])[0];
              if (!target) {
                return;
              }

              const sourceCounterLimit = Math.min(3, Math.floor(source.damage / 10));
              const checkHpEffect = new CheckHpEffect(StateUtils.getOpponent(state, player), target);
              state = store.reduceEffect(state, checkHpEffect);
              const remainingHp = checkHpEffect.hp - target.damage;
              const targetCounterLimit = Math.floor(remainingHp / 10);
              const maxCountersToMove = Math.min(sourceCounterLimit, targetCounterLimit);
              if (maxCountersToMove <= 0) {
                return;
              }

              const maxAllowedDamage: DamageMap[] = [];
              const blockedTo: CardTarget[] = [];

              player.forEachPokemon(PlayerType.BOTTOM_PLAYER, (slot, _card, t) => {
                blockedTo.push(t);
                maxAllowedDamage.push({ target: t, damage: slot.damage });
              });
              const opponent = StateUtils.getOpponent(state, player);
              opponent.forEachPokemon(PlayerType.TOP_PLAYER, (slot, _card, t) => {
                maxAllowedDamage.push({ target: t, damage: slot.damage });
              });

              const getCardTargetBySlot = (
                owner: typeof player,
                slot: PokemonSlot,
                targetPlayer: PlayerType
              ): CardTarget | undefined => {
                if (owner.active === slot) {
                  return { player: targetPlayer, slot: SlotType.ACTIVE, index: 0 };
                }
                const benchIndex = owner.bench.findIndex(item => item === slot);
                if (benchIndex !== -1) {
                  return { player: targetPlayer, slot: SlotType.BENCH, index: benchIndex };
                }
                return undefined;
              };

              const sourceTarget = getCardTargetBySlot(player, source, PlayerType.BOTTOM_PLAYER);
              const destinationTarget = getCardTargetBySlot(StateUtils.getOpponent(state, player), target, PlayerType.TOP_PLAYER);
              if (!sourceTarget || !destinationTarget) {
                return;
              }

              for (const item of maxAllowedDamage) {
                if (
                  item.target.player === destinationTarget.player
                  && item.target.slot === destinationTarget.slot
                  && item.target.index === destinationTarget.index
                ) {
                  item.damage = item.damage + maxCountersToMove * 10;
                }
              }

              const moveBlockedFrom = blockedFrom.filter(item => {
                return !(
                  item.player === sourceTarget.player
                  && item.slot === sourceTarget.slot
                  && item.index === sourceTarget.index
                );
              });

              const moveBlockedTo = blockedTo.filter(item => {
                return !(
                  item.player === destinationTarget.player
                  && item.slot === destinationTarget.slot
                  && item.index === destinationTarget.index
                );
              });

              store.prompt(
                state,
                new MoveDamagePrompt(
                  player.id,
                  GameMessage.MOVE_DAMAGE,
                  PlayerType.ANY,
                  [SlotType.ACTIVE, SlotType.BENCH],
                  maxAllowedDamage,
                  {
                    allowCancel: true,
                    min: 1,
                    max: maxCountersToMove,
                    blockedFrom: moveBlockedFrom,
                    blockedTo: moveBlockedTo,
                  }
                ),
                transfers => {
                  if (transfers === null || transfers.length === 0) {
                    return;
                  }

                  for (const transfer of transfers) {
                    const transferSource = StateUtils.getTarget(state, player, transfer.from);
                    const transferTarget = StateUtils.getTarget(state, player, transfer.to);
                    if (transferSource.damage >= 10) {
                      transferSource.damage -= 10;
                      transferTarget.damage += 10;
                    }
                  }

                  player.marker.addMarker(this.ADRENA_BRAIN_MARKER, this);
                }
              );
            }
          );
        }
      );
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const confusedEffect = new AddSpecialConditionsEffect(effect, [SpecialCondition.CONFUSED]);
      store.reduceEffect(state, confusedEffect);
      return state;
    }

    if (effect instanceof EndTurnEffect) {
      effect.player.marker.removeMarker(this.ADRENA_BRAIN_MARKER, this);
      return state;
    }

    return state;
  }
}
