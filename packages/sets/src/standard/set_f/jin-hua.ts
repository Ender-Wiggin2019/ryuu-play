import {
  Card,
  CardTarget,
  CardType,
  ChooseCardsPrompt,
  ChoosePokemonPrompt,
  Effect,
  EvolveEffect,
  GameError,
  GameMessage,
  PlayerType,
  PokemonCard,
  PokemonSlot,
  ShuffleDeckPrompt,
  SlotType,
  State,
  StoreLike,
  SuperType,
  TrainerType,
  UseTrainerInPlayEffect,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';
import { discardTmAtEndTurn, ensureTmActiveUse, finishTmUse, prepareTmAttack } from './tm-tool-utils';

const attack = {
  name: '进化',
  cost: [CardType.COLORLESS],
  damage: '',
  text: '选择自己的备战宝可梦最多2只，各从自己的牌库选择1张可以进化到那只宝可梦的卡牌，让它进化，然后重洗牌库。',
};

function hasEvolutionInDeck(deckCards: Card[], pokemon: PokemonCard): boolean {
  return deckCards.some(card => card instanceof PokemonCard && card.evolvesFrom === pokemon.name);
}

function* useCard(
  next: Function,
  store: StoreLike,
  state: State,
  effect: UseTrainerInPlayEffect
): IterableIterator<State> {
  ensureTmActiveUse(effect);
  const prepared = prepareTmAttack(store, state, effect, attack);
  state = prepared.state;
  const player = prepared.player;

  if (!player.bench.some(slot => slot.pokemons.cards.length > 0 && hasEvolutionInDeck(player.deck.cards, slot.getPokemonCard() as PokemonCard))) {
    throw new GameError(GameMessage.CANNOT_USE_POWER);
  }

  const chosenTargets: PokemonSlot[] = [];

  while (chosenTargets.length < 2) {
    const blocked: CardTarget[] = [];
    let hasTarget = false;
    player.bench.forEach((slot, index) => {
      const pokemon = slot.getPokemonCard();
      const target = { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index };
      if (pokemon === undefined || chosenTargets.includes(slot) || hasEvolutionInDeck(player.deck.cards, pokemon) === false) {
        blocked.push(target);
        return;
      }
      hasTarget = true;
    });

    if (!hasTarget) {
      break;
    }

    let targets: PokemonSlot[] = [];
    yield store.prompt(
      state,
      new ChoosePokemonPrompt(
        player.id,
        GameMessage.CHOOSE_POKEMON_TO_EVOLVE,
        PlayerType.BOTTOM_PLAYER,
        [SlotType.BENCH],
        { allowCancel: true, blocked }
      ),
      result => {
        targets = result || [];
        next();
      }
    );

    if (targets.length === 0) {
      break;
    }

    const target = targets[0];
    const targetPokemon = target.getPokemonCard();
    if (targetPokemon === undefined) {
      continue;
    }

    const blockedCardIndexes: number[] = [];
    player.deck.cards.forEach((card, index) => {
      if (!(card instanceof PokemonCard) || card.evolvesFrom !== targetPokemon.name) {
        blockedCardIndexes.push(index);
      }
    });

    let selectedCards: Card[] = [];
    yield store.prompt(
      state,
      new ChooseCardsPrompt(
        player.id,
        GameMessage.CHOOSE_CARD_TO_HAND,
        player.deck,
        { superType: SuperType.POKEMON },
        { min: 1, max: 1, allowCancel: false, blocked: blockedCardIndexes }
      ),
      cards => {
        selectedCards = cards || [];
        next();
      }
    );

    if (selectedCards.length === 0) {
      break;
    }

    const evolutionCard = selectedCards[0] as PokemonCard;
    player.deck.moveCardTo(evolutionCard, player.hand);
    state = store.reduceEffect(state, new EvolveEffect(player, target, evolutionCard));
    chosenTargets.push(target);
  }

  if (chosenTargets.length === 0) {
    return state;
  }

  yield store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
    player.deck.applyOrder(order);
    next();
  });

  return finishTmUse(store, state, player, effect.trainerCard);
}

export class JinHua extends VariantTrainerCard {
  public trainerType: TrainerType = TrainerType.TOOL;
  public useWhenInPlay = true;
  public attacks = [attack];

  constructor(seed: VariantTrainerSeed) {
    super(seed);
    this.trainerType = TrainerType.TOOL;
    this.useWhenInPlay = true;
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof UseTrainerInPlayEffect && effect.trainerCard === this) {
      const generator = useCard(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return discardTmAtEndTurn(state, effect, this);
  }
}
