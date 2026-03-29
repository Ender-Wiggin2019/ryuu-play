import {
  AttachEnergyPrompt,
  Card,
  CardTarget,
  Effect,
  EnergyCard,
  EnergyType,
  GameError,
  GameMessage,
  PlayerType,
  SlotType,
  State,
  StateUtils,
  StoreLike,
  SuperType,
  TrainerEffect,
  TrainerType,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;

  const hasBasicEnergyInDiscard = player.discard.cards.some(card =>
    card instanceof EnergyCard && card.energyType === EnergyType.BASIC
  );
  if (!hasBasicEnergyInDiscard) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  const blockedTo: CardTarget[] = [];
  let hasBenchPokemon = false;
  player.bench.forEach((bench, index) => {
    if (bench.pokemons.cards.length === 0) {
      blockedTo.push({ player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index });
      return;
    }
    hasBenchPokemon = true;
  });

  if (!hasBenchPokemon) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  let transfers: { to: CardTarget; card: Card }[] = [];
  yield store.prompt(
    state,
    new AttachEnergyPrompt(
      player.id,
      GameMessage.ATTACH_ENERGY_TO_BENCH,
      player.discard,
      PlayerType.BOTTOM_PLAYER,
      [SlotType.BENCH],
      { superType: SuperType.ENERGY, energyType: EnergyType.BASIC },
      { allowCancel: false, min: 1, max: 1, blockedTo }
    ),
    result => {
      transfers = result || [];
      next();
    }
  );

  for (const transfer of transfers) {
    const target = StateUtils.getTarget(state, player, transfer.to);
    player.discard.moveCardTo(transfer.card, target.energies);
  }

  return state;
}

export class MarniesPride extends VariantTrainerCard {
  public trainerType: TrainerType = TrainerType.SUPPORTER;

  constructor(seed: VariantTrainerSeed) {
    super(seed);
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}
