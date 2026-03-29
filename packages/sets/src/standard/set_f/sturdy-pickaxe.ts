import {
  Card,
  CardList,
  CardTarget,
  ChoosePokemonPrompt,
  Effect,
  EnergyCard,
  GameError,
  GameMessage,
  PlayerType,
  PokemonSlot,
  ShowCardsPrompt,
  State,
  StateUtils,
  StoreLike,
  CardType,
  TrainerEffect,
  SlotType,
  EnergyType,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function isFightingEnergy(card: Card): card is EnergyCard {
  return card instanceof EnergyCard && card.energyType === EnergyType.BASIC && card.provides.includes(CardType.FIGHTING);
}

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);

  if (player.deck.cards.length === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  effect.preventDefault = true;

  const revealedCards = new CardList();
  revealedCards.cards = player.deck.cards.splice(0, 1);
  const revealedCard = revealedCards.cards[0];

  if (revealedCard === undefined) {
    player.hand.moveCardTo(effect.trainerCard, player.discard);
    return state;
  }

  yield store.prompt(
    state,
    new ShowCardsPrompt(opponent.id, GameMessage.CARDS_SHOWED_BY_THE_OPPONENT, [revealedCard]),
    () => next()
  );

  if (isFightingEnergy(revealedCard)) {
    const blocked: CardTarget[] = [];
    let hasBench = false;
    player.bench.forEach((bench, index) => {
      if (bench.pokemons.cards.length === 0) {
        blocked.push({ player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index });
        return;
      }
      hasBench = true;
    });

    if (!hasBench) {
      throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
    }

    let targets: PokemonSlot[] = [];
    yield store.prompt(
      state,
      new ChoosePokemonPrompt(
        player.id,
        GameMessage.CHOOSE_POKEMON_TO_ATTACH_CARDS,
        PlayerType.BOTTOM_PLAYER,
        [SlotType.BENCH],
        { allowCancel: false, blocked }
      ),
      result => {
        targets = result || [];
        next();
      }
    );

    if (targets.length > 0) {
      player.hand.moveCardTo(effect.trainerCard, player.discard);
      revealedCards.moveCardTo(revealedCard, targets[0].energies);
    }
    return state;
  }

  player.hand.moveCardTo(effect.trainerCard, player.discard);
  revealedCards.moveCardTo(revealedCard, player.hand);
  return state;
}

export class SturdyPickaxe extends VariantTrainerCard {
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
