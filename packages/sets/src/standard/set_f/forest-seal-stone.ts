import {
  CardTag,
  ChooseCardsPrompt,
  Effect,
  GameError,
  GameMessage,
  ShowCardsPrompt,
  ShuffleDeckPrompt,
  State,
  StateUtils,
  StoreLike,
  TrainerType,
  UseTrainerInPlayEffect,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

const VSTAR_POWER_USED_MARKER = 'VSTAR_POWER_USED_MARKER';

function* useTrainer(
  next: Function,
  store: StoreLike,
  state: State,
  self: ForestSealStone,
  effect: UseTrainerInPlayEffect
): IterableIterator<State> {
  const player = effect.player;
  const pokemon = effect.target.getPokemonCard();
  const opponent = StateUtils.getOpponent(state, player);

  if (pokemon === undefined || !pokemon.tags.includes(CardTag.POKEMON_V)) {
    throw new GameError(GameMessage.CANNOT_USE_POWER);
  }

  if (player.marker.hasMarker(VSTAR_POWER_USED_MARKER)) {
    throw new GameError(GameMessage.POWER_ALREADY_USED);
  }

  let selected = [] as any[];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_HAND,
      player.deck,
      {},
      { min: 1, max: 1, allowCancel: true }
    ),
    cards => {
      selected = cards || [];
      next();
    }
  );

  if (selected.length === 0) {
    return state;
  }

  player.deck.moveCardsTo(selected, player.hand);
  player.marker.addMarker(VSTAR_POWER_USED_MARKER, self);

  yield store.prompt(state, new ShowCardsPrompt(opponent.id, GameMessage.CARDS_SHOWED_BY_THE_OPPONENT, selected), () => next());

  return store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
    player.deck.applyOrder(order);
  });
}

export class ForestSealStone extends VariantTrainerCard {
  public useWhenInPlay = true;
  public trainerType: TrainerType = TrainerType.TOOL;

  constructor(seed: VariantTrainerSeed) {
    super(seed);
    this.useWhenInPlay = true;
    this.trainerType = TrainerType.TOOL;
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof UseTrainerInPlayEffect && effect.trainerCard === this) {
      const generator = useTrainer(() => generator.next(), store, state, this, effect);
      return generator.next().value;
    }

    return state;
  }
}
