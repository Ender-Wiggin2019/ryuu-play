import {
  ChooseCardsPrompt,
  CoinFlipPrompt,
  Effect,
  GameMessage,
  PokemonCard,
  ShuffleDeckPrompt,
  State,
  StoreLike,
  SuperType,
  TrainerCard,
  TrainerType,
  UseStadiumEffect,
} from '@ptcg/common';

function* useMesagoza(next: Function, store: StoreLike, state: State, effect: UseStadiumEffect): IterableIterator<State> {
  const player = effect.player;

  let coinFlip = false;
  yield store.prompt(state, new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP), result => {
    coinFlip = !!result;
    next();
  });

  if (!coinFlip) {
    return state;
  }

  let selected: PokemonCard[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_HAND,
      player.deck,
      { superType: SuperType.POKEMON },
      { min: 0, max: 1, allowCancel: true }
    ),
    cards => {
      selected = (cards || []) as PokemonCard[];
      next();
    }
  );

  if (selected.length > 0) {
    player.deck.moveCardsTo(selected, player.hand);
  }

  return store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
    player.deck.applyOrder(order);
  });
}

export class Mesagoza extends TrainerCard {
  public trainerType: TrainerType = TrainerType.STADIUM;
  public useWhenInPlay = true;
  public set = 'set_g';
  public name = '桌台市';
  public fullName = '桌台市 set_g';
  public text = '双方玩家，每次在自己的回合有1次机会，可抛掷1次硬币。如果为正面，则选择自己牌库中的1张宝可梦，在给对手看过之后，加入手牌。并重洗牌库。';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof UseStadiumEffect && effect.stadium === this) {
      const generator = useMesagoza(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}
