import {
  Card,
  ChooseCardsPrompt,
  Effect,
  GameError,
  GameMessage,
  PokemonCard,
  PokemonSlot,
  ShuffleDeckPrompt,
  Stage,
  State,
  StoreLike,
  SuperType,
  TrainerCard,
  TrainerEffect,
  TrainerType,
} from '@ptcg/common';

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;
  const slots: PokemonSlot[] = player.bench.filter(b => b.pokemons.cards.length === 0);
  const max = Math.min(slots.length, 2);

  if (max === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  const blocked: number[] = [];
  let available = 0;
  player.deck.cards.forEach((card, index) => {
    if (card instanceof PokemonCard && card.stage === Stage.BASIC && card.hp <= 70) {
      available += 1;
      return;
    }
    blocked.push(index);
  });

  if (available === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  let cards: Card[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_PUT_ONTO_BENCH,
      player.deck,
      { superType: SuperType.POKEMON, stage: Stage.BASIC },
      { min: 1, max, allowCancel: true, blocked }
    ),
    selected => {
      cards = selected || [];
      next();
    }
  );

  if (cards.length > slots.length) {
    cards.length = slots.length;
  }

  cards.forEach((card, index) => {
    player.deck.moveCardTo(card, slots[index].pokemons);
    slots[index].pokemonPlayedTurn = state.turn;
  });

  return store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
    player.deck.applyOrder(order);
  });
}

export class BuddyBuddyPoffin extends TrainerCard {
  public rawData = {
    raw_card: {
      id: 16752,
      yorenCode: 'Y1403',
      name: '友好宝芬',
      cardType: '2',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '177/204',
      },
      image: 'img\\324\\484.png',
      hash: '804825349b8e54ff0399b970d3ce7e9d',
    },
    collection: {
      id: 324,
      name: '补充包 利刃猛醒',
      commodityCode: 'CSV7C',
      salesDate: '2026-01-16',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/484.png',
  };

  public trainerType: TrainerType = TrainerType.ITEM;

  public set: string = 'set_h';

  public name: string = '友好宝芬';

  public fullName: string = '友好宝芬 CSV7C';

  public text: string =
    '选择自己牌库中，最多2张HP在「70」及以下的【基础】宝可梦，放于备战区。并重洗牌库。';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}
