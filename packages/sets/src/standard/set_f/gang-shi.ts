import {
  Card,
  CardType,
  ChooseCardsPrompt,
  Effect,
  EnergyCard,
  EnergyType,
  GameError,
  GameMessage,
  ShuffleDeckPrompt,
  State,
  StoreLike,
  SuperType,
  TrainerEffect,
  TrainerType,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;
  const steelEnergies = player.hand.cards.filter(card =>
    card instanceof EnergyCard && card.energyType === EnergyType.BASIC && card.provides.includes(CardType.METAL)
  );

  if (steelEnergies.length < 2) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  let discarded: Card[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_DISCARD,
      player.hand,
      { superType: SuperType.ENERGY, energyType: EnergyType.BASIC, provides: [CardType.METAL] },
      { min: 2, max: 2, allowCancel: false }
    ),
    cards => {
      discarded = cards || [];
      next();
    }
  );

  player.hand.moveCardsTo(discarded, player.discard);

  if (player.deck.cards.length > 0) {
    let selected: any[] = [];
    yield store.prompt(
      state,
      new ChooseCardsPrompt(
        player.id,
        GameMessage.CHOOSE_CARD_TO_HAND,
        player.deck,
        {},
        { min: 0, max: Math.min(2, player.deck.cards.length), allowCancel: false }
      ),
      cards => {
        selected = cards || [];
        next();
      }
    );

    player.deck.moveCardsTo(selected, player.hand);
  }

  return store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
    player.deck.applyOrder(order);
  });
}

export class GangShi extends VariantTrainerCard {
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
