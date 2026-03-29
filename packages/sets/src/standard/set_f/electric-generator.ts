import {
  AttachEnergyPrompt,
  Card,
  CardList,
  CardTarget,
  CardType,
  CheckPokemonTypeEffect,
  Effect,
  EnergyType,
  GameError,
  GameMessage,
  PlayerType,
  ShuffleDeckPrompt,
  SlotType,
  State,
  StateUtils,
  StoreLike,
  SuperType,
  TrainerEffect,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function* playCard(
  next: Function,
  store: StoreLike,
  state: State,
  effect: TrainerEffect
): IterableIterator<State> {
  const player = effect.player;

  if (player.deck.cards.length === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  const blockedTo: CardTarget[] = [];
  let hasLightningBenchPokemon = false;
  player.bench.forEach((bench, index) => {
    if (bench.pokemons.cards.length === 0) {
      blockedTo.push({ player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index });
      return;
    }

    const checkPokemonTypeEffect = new CheckPokemonTypeEffect(bench);
    store.reduceEffect(state, checkPokemonTypeEffect);

    if (checkPokemonTypeEffect.cardTypes.includes(CardType.LIGHTNING)) {
      hasLightningBenchPokemon = true;
    } else {
      blockedTo.push({ player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index });
    }
  });

  if (!hasLightningBenchPokemon) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  const cards = player.deck.cards.splice(0, Math.min(5, player.deck.cards.length));
  const topCards = new CardList();
  topCards.cards = cards;

  let transfers: { to: CardTarget; card: Card }[] = [];
  yield store.prompt(
    state,
    new AttachEnergyPrompt(
      player.id,
      GameMessage.ATTACH_ENERGY_TO_BENCH,
      topCards,
      PlayerType.BOTTOM_PLAYER,
      [SlotType.BENCH],
      { superType: SuperType.ENERGY, energyType: EnergyType.BASIC, provides: [CardType.LIGHTNING] },
      { allowCancel: true, min: 0, max: 2, blockedTo }
    ),
    result => {
      transfers = result || [];
      next();
    }
  );

  for (const transfer of transfers) {
    const target = StateUtils.getTarget(state, player, transfer.to);
    topCards.moveCardTo(transfer.card, target.energies);
  }

  topCards.moveTo(player.deck);
  return store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
    player.deck.applyOrder(order);
  });
}

export class ElectricGenerator extends VariantTrainerCard {
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
