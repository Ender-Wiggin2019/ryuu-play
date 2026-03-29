import {
  Card,
  CardTarget,
  CardTag,
  ChooseCardsPrompt,
  ChoosePokemonPrompt,
  Effect,
  GameError,
  GameMessage,
  PlayerType,
  SelectPrompt,
  SlotType,
  PokemonSlot,
  State,
  StateUtils,
  StoreLike,
  TrainerEffect,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);

  const handOptionAvailable = player.hand.cards.length > 0;
  const vTargets: CardTarget[] = opponent.bench
    .map((slot, index) => {
      const pokemon = slot.getPokemonCard();
      if (pokemon === undefined || !pokemon.tags.includes(CardTag.POKEMON_V)) {
        return { player: PlayerType.TOP_PLAYER, slot: SlotType.BENCH, index };
      }
      return null;
    })
    .filter((target): target is { player: PlayerType; slot: SlotType; index: number } => target !== null);

  if (!handOptionAvailable && vTargets.length === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  let choice = 0;
  if (handOptionAvailable && vTargets.length > 0) {
    yield store.prompt(
      state,
      new SelectPrompt(player.id, GameMessage.CHOOSE_OPTION, ['弃置手牌抽牌', '交换对手战斗宝可梦'], { allowCancel: false }),
      result => {
        choice = result ?? 0;
        next();
      }
    );
  }

  if (choice === 0 && handOptionAvailable) {
    let cards: Card[] = [];
    yield store.prompt(
      state,
      new ChooseCardsPrompt(
        player.id,
        GameMessage.CHOOSE_CARD_TO_DISCARD,
        player.hand,
        {},
        { min: 1, max: 3, allowCancel: false }
      ),
      selected => {
        cards = selected || [];
        next();
      }
    );

    if (cards.length === 0) {
      return state;
    }

    player.hand.moveCardsTo(cards, player.discard);
    const drawCount = Math.max(0, 5 - player.hand.cards.length);
    player.deck.moveTo(player.hand, Math.min(drawCount, player.deck.cards.length));
    return state;
  }

  if (vTargets.length === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  let targets: PokemonSlot[] = [];
  yield store.prompt(
    state,
    new ChoosePokemonPrompt(
      player.id,
      GameMessage.CHOOSE_POKEMON_TO_SWITCH,
      PlayerType.TOP_PLAYER,
      [SlotType.BENCH],
      { allowCancel: false, blocked: vTargets }
    ),
    result => {
      targets = result || [];
      next();
    }
  );

  if (targets.length === 0) {
    return state;
  }

  opponent.switchPokemon(targets[0]);
  return state;
}

export class ShaLiNa extends VariantTrainerCard {
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
