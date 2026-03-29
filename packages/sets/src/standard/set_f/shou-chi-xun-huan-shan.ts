import {
  Card,
  ChooseCardsPrompt,
  ChoosePokemonPrompt,
  Effect,
  AfterDamageEffect,
  GameMessage,
  EnergyCard,
  PlayerType,
  PokemonSlot,
  SlotType,
  State,
  StateUtils,
  StoreLike,
  TrainerType,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function* playCard(
  next: Function,
  store: StoreLike,
  state: State,
  effect: AfterDamageEffect
): IterableIterator<State> {
  const owner = StateUtils.findOwner(state, effect.target);
  const source = effect.attackEffect.player.active;
  const opponent = StateUtils.getOpponent(state, owner);

  const sourceEnergyCount = source.energies.cards.length;
  const hasBench = opponent.bench.some(bench => bench.pokemons.cards.length > 0);
  if (effect.player === owner || sourceEnergyCount === 0 || !hasBench) {
    return state;
  }

  const blocked: { player: number; slot: SlotType; index: number }[] = [];
  opponent.bench.forEach((bench, index) => {
    if (bench.pokemons.cards.length === 0) {
      blocked.push({ player: PlayerType.TOP_PLAYER, slot: SlotType.BENCH, index });
    }
  });

  let sourceCards: Card[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      owner.id,
      GameMessage.CHOOSE_CARD_TO_ATTACH,
      source.energies,
      {},
      { min: 1, max: 1, allowCancel: false }
    ),
    cards => {
      sourceCards = cards || [];
      next();
    }
  );

  if (sourceCards.length === 0) {
    return state;
  }

  let targets: PokemonSlot[] = [];
  yield store.prompt(
    state,
    new ChoosePokemonPrompt(
      owner.id,
      GameMessage.CHOOSE_POKEMON_TO_ATTACH_CARDS,
      PlayerType.TOP_PLAYER,
      [SlotType.BENCH],
      { allowCancel: false, blocked }
    ),
    result => {
      targets = result || [];
      next();
    }
  );

  if (targets.length === 0) {
    return state;
  }

  source.energies.moveCardTo(sourceCards[0] as EnergyCard, targets[0].energies);
  return state;
}

export class ShouChiXunHuanShan extends VariantTrainerCard {
  public trainerType: TrainerType = TrainerType.TOOL;

  constructor(seed: VariantTrainerSeed) {
    super(seed);
    this.trainerType = TrainerType.TOOL;
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AfterDamageEffect && effect.target.trainers.cards.includes(this)) {
      const generator = playCard(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}
