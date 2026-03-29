import {
  Card,
  AfterDamageEffect,
  CheckHpEffect,
  ChooseCardsPrompt,
  ChoosePokemonPrompt,
  Effect,
  EnergyCard,
  EnergyType,
  GameMessage,
  PlayerType,
  PokemonSlot,
  SlotType,
  State,
  StateUtils,
  StoreLike,
  SuperType,
  TrainerType,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function isBasicEnergy(card: Card): card is EnergyCard {
  return card instanceof EnergyCard && card.energyType === EnergyType.BASIC;
}

function hasBenchPokemon(player: any): boolean {
  return player.bench.some((slot: PokemonSlot) => slot.pokemons.cards.length > 0);
}

function* moveEnergy(
  next: Function,
  store: StoreLike,
  state: State,
  effect: AfterDamageEffect,
  self: ChenZhongJieLiBang
): IterableIterator<State> {
  const owner = StateUtils.findOwner(state, effect.target);
  const target = effect.target;

  if (owner === undefined || !target.trainers.cards.includes(self)) {
    return state;
  }

  if (target !== owner.active) {
    return state;
  }

  const pokemonCard = target.getPokemonCard();
  if (pokemonCard === undefined || pokemonCard.retreat.length !== 4 || !hasBenchPokemon(owner)) {
    return state;
  }

  if (effect.attackEffect.player === owner) {
    return state;
  }

  const checkHpEffect = new CheckHpEffect(owner, target);
  store.reduceEffect(state, checkHpEffect);
  if (target.damage < checkHpEffect.hp) {
    return state;
  }

  const basicEnergyIndexes: number[] = [];
  target.energies.cards.forEach((card, index) => {
    if (isBasicEnergy(card)) {
      basicEnergyIndexes.push(index);
    }
  });

  if (basicEnergyIndexes.length === 0) {
    return state;
  }

  let selectedCards: Card[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      owner.id,
      GameMessage.CHOOSE_CARD_TO_HAND,
      target.energies,
      { superType: SuperType.ENERGY },
      {
        min: 0,
        max: Math.min(3, basicEnergyIndexes.length),
        allowCancel: true,
        blocked: target.energies.cards
          .map((card, index) => (isBasicEnergy(card) ? undefined : index))
          .filter((index): index is number => index !== undefined),
      }
    ),
    cards => {
      selectedCards = cards || [];
      next();
    }
  );

  if (selectedCards.length === 0) {
    return state;
  }

  for (const energyCard of selectedCards as EnergyCard[]) {
    const blockedTargets = owner.bench
      .map((slot, index) => (slot.pokemons.cards.length === 0
        ? { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index }
        : undefined))
      .filter((item): item is { player: PlayerType; slot: SlotType; index: number } => item !== undefined);

    let targets: PokemonSlot[] = [];
    yield store.prompt(
      state,
      new ChoosePokemonPrompt(
        owner.id,
        GameMessage.CHOOSE_POKEMON_TO_ATTACH_CARDS,
        PlayerType.BOTTOM_PLAYER,
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

    target.energies.moveCardTo(energyCard, targets[0].energies);
  }

  return state;
}

export class ChenZhongJieLiBang extends VariantTrainerCard {
  public trainerType: TrainerType = TrainerType.TOOL;

  constructor(seed: VariantTrainerSeed) {
    super(seed);
    this.trainerType = TrainerType.TOOL;
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AfterDamageEffect && effect.target.trainers.cards.includes(this)) {
      const generator = moveEnergy(() => generator.next(), store, state, effect, this);
      return generator.next().value;
    }

    return state;
  }
}
