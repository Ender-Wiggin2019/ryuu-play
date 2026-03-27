import {
  Card,
  ChooseCardsPrompt,
  Effect,
  EnergyCard,
  EnergyType,
  GameError,
  GameMessage,
  ShowCardsPrompt,
  State,
  StateUtils,
  StoreLike,
  SuperType,
  TrainerCard,
  TrainerEffect,
  TrainerType,
} from '@ptcg/common';

function* playCard(
  next: Function,
  store: StoreLike,
  state: State,
  self: NightStretcher,
  effect: TrainerEffect,
): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);

  let recoverableCards = 0;
  const blocked: number[] = [];

  player.discard.cards.forEach((card, index) => {
    const isPokemon = card.superType === SuperType.POKEMON;
    const isBasicEnergy = card instanceof EnergyCard && card.energyType === EnergyType.BASIC;

    if (isPokemon || isBasicEnergy) {
      recoverableCards += 1;
    } else {
      blocked.push(index);
    }
  });

  if (recoverableCards === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  // We will discard this card after prompt confirmation.
  effect.preventDefault = true;

  let selected: Card[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_HAND,
      player.discard,
      {},
      { min: 1, max: 1, allowCancel: true, blocked }
    ),
    cards => {
      selected = cards || [];
      next();
    }
  );

  if (selected.length === 0) {
    return state;
  }

  player.hand.moveCardTo(self, player.discard);
  player.discard.moveCardsTo(selected, player.hand);

  return store.prompt(
    state,
    new ShowCardsPrompt(opponent.id, GameMessage.CARDS_SHOWED_BY_THE_OPPONENT, selected),
    () => next()
  );
}

export class NightStretcher extends TrainerCard {
  public rawData = {
    raw_card: {
      id: 17560,
      name: '夜间担架',
      yorenCode: 'Y1472',
      cardType: '2',
      commodityCode: 'CSV8C',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '183/207',
      },
      image: 'img/458/492.png',
      hash: '2b3068486972d8f0ea00a3df3a0f7e5f',
    },
    collection: {
      id: 458,
      commodityCode: 'CSV8C',
      name: '补充包 璀璨诡幻',
      salesDate: '2026-03-13',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/492.png',
  };

  public trainerType: TrainerType = TrainerType.ITEM;

  public set: string = 'set_h';

  public name: string = 'Night Stretcher';

  public fullName: string = 'Night Stretcher CSV8C';

  public text: string =
    'Put a Pokemon or a Basic Energy card from your discard pile into your hand. ' +
    'Reveal that card to your opponent.';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, this, effect);
      return generator.next().value;
    }

    return state;
  }
}
