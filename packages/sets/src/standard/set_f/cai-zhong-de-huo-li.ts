import {
  AttachEnergyPrompt,
  CardTarget,
  CardType,
  Effect,
  EnergyCard,
  EnergyType,
  GameMessage,
  PlayerType,
  SlotType,
  State,
  StateUtils,
  StoreLike,
  SuperType,
  TrainerEffect,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;

  player.deck.moveTo(player.hand, Math.min(2, player.deck.cards.length));

  const blockedTo: CardTarget[] = [];
  let hasBenchPokemon = false;
  let hasGrassEnergy = false;

  player.bench.forEach((bench, index) => {
    if (bench.pokemons.cards.length === 0) {
      blockedTo.push({ player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index });
      return;
    }
    hasBenchPokemon = true;
  });

  hasGrassEnergy = player.hand.cards.some(card => {
    return card instanceof EnergyCard
      && card.energyType === EnergyType.BASIC
      && card.provides.includes(CardType.GRASS);
  });

  if (!hasBenchPokemon || !hasGrassEnergy) {
    return state;
  }

  let transfers: { to: CardTarget; card: EnergyCard }[] = [];
  yield store.prompt(
    state,
    new AttachEnergyPrompt(
      player.id,
      GameMessage.ATTACH_ENERGY_TO_BENCH,
      player.hand,
      PlayerType.BOTTOM_PLAYER,
      [SlotType.BENCH],
      { superType: SuperType.ENERGY, energyType: EnergyType.BASIC, provides: [CardType.GRASS] },
      { allowCancel: true, min: 0, max: 2, blockedTo }
    ),
    result => {
      transfers = (result || []) as { to: CardTarget; card: EnergyCard }[];
      next();
    }
  );

  for (const transfer of transfers) {
    const target = StateUtils.getTarget(state, player, transfer.to);
    player.hand.moveCardTo(transfer.card, target.energies);
  }

  return state;
}

export class CaiZhongDeHuoLi extends VariantTrainerCard {
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
