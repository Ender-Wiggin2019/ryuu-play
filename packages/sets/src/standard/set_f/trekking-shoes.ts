import {
  Card,
  CardList,
  Effect,
  GameError,
  GameMessage,
  SelectPrompt,
  ShowCardsPrompt,
  State,
  StoreLike,
  TrainerEffect,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;

  if (player.deck.cards.length === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  const topCard = player.deck.cards.shift() as Card;
  const revealed = new CardList();
  revealed.cards = [topCard];

  yield store.prompt(
    state,
    new ShowCardsPrompt(player.id, GameMessage.CARDS_SHOWED_BY_THE_OPPONENT, [topCard]),
    () => next()
  );

  let choice = 0;
  yield store.prompt(
    state,
    new SelectPrompt(player.id, GameMessage.CHOOSE_OPTION, ['加入手牌', '放入弃牌区并抽1张牌'], { allowCancel: false }),
    result => {
      choice = result ?? 0;
      next();
    }
  );

  if (choice === 0) {
    revealed.moveTo(player.hand);
    return state;
  }

  revealed.moveTo(player.discard);
  player.deck.moveTo(player.hand, 1);
  return state;
}

export class TrekkingShoes extends VariantTrainerCard {
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
