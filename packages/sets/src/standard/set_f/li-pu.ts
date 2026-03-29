import {
  Card,
  CardType,
  ChooseCardsPrompt,
  Effect,
  EnergyCard,
  EnergyType,
  GameMessage,
  PokemonCard,
  ShowCardsPrompt,
  State,
  StateUtils,
  StoreLike,
  TrainerEffect,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function getBlocked(cards: Card[]): { blocked: number[]; available: number } {
  const blocked: number[] = [];
  let available = 0;

  cards.forEach((card, index) => {
    const matches =
      (card instanceof PokemonCard && card.cardTypes.includes(CardType.PSYCHIC)) ||
      (card instanceof EnergyCard && card.energyType === EnergyType.BASIC && card.provides.includes(CardType.PSYCHIC));

    if (matches) {
      available += 1;
      return;
    }

    blocked.push(index);
  });

  return { blocked, available };
}

function* playCard(
  next: Function,
  store: StoreLike,
  state: State,
  effect: TrainerEffect,
): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);
  const { blocked, available } = getBlocked(player.discard.cards);

  if (available === 0) {
    return state;
  }

  let selected: Card[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_HAND,
      player.discard,
      {},
      { min: 0, max: Math.min(4, available), allowCancel: false, blocked },
    ),
    cards => {
      selected = cards || [];
      next();
    },
  );

  if (selected.length > 0) {
    player.discard.moveCardsTo(selected, player.hand);
    yield store.prompt(
      state,
      new ShowCardsPrompt(opponent.id, GameMessage.CARDS_SHOWED_BY_THE_OPPONENT, selected),
      () => next(),
    );
  }

  return state;
}

export class LiPu extends VariantTrainerCard {
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
