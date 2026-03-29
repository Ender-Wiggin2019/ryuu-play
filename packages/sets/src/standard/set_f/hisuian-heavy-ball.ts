import {
  Card,
  CardList,
  ChooseCardsPrompt,
  Effect,
  GameMessage,
  PokemonCard,
  ShowCardsPrompt,
  Stage,
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
  self: HisuianHeavyBall,
  effect: TrainerEffect
): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);
  effect.preventDefault = true;

  const prizeState = player.prizes.map(prize => ({
    prize,
    isPublic: prize.isPublic,
    isSecret: prize.isSecret
  }));

  const restorePrizes = () => {
    prizeState.forEach(({ prize, isPublic, isSecret }) => {
      prize.isPublic = isPublic;
      prize.isSecret = isSecret;
    });
  };

  prizeState.forEach(({ prize }) => {
    prize.isPublic = true;
    prize.isSecret = false;
  });

  const basicPrizeCards = new CardList();
  player.prizes.forEach(prize => {
    prize.cards.forEach(card => basicPrizeCards.cards.push(card));
  });

  let selected: Card[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_HAND,
      basicPrizeCards,
      { superType: SuperType.POKEMON, stage: Stage.BASIC },
      { min: 0, max: 1, allowCancel: true }
    ),
    cards => {
      selected = cards || [];
      next();
    }
  );

  if (selected.length === 0) {
    restorePrizes();
    player.hand.moveCardTo(self, player.discard);
    return state;
  }

  const selectedCard = selected[0];
  const targetPrize = player.prizes.find(prize => prize.cards.includes(selectedCard));
  if (targetPrize === undefined || !(selectedCard instanceof PokemonCard) || selectedCard.stage !== Stage.BASIC) {
    restorePrizes();
    player.hand.moveCardTo(self, player.discard);
    return state;
  }

  yield store.prompt(
    state,
    new ShowCardsPrompt(opponent.id, GameMessage.CARDS_SHOWED_BY_THE_OPPONENT, [selectedCard]),
    () => next()
  );

  targetPrize.moveCardTo(selectedCard, player.hand);
  player.hand.moveCardTo(self, targetPrize);
  restorePrizes();

  return state;
}

export class HisuianHeavyBall extends VariantTrainerCard {
  constructor(seed: VariantTrainerSeed) {
    super(seed);
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, this, effect);
      return generator.next().value;
    }

    return state;
  }
}
