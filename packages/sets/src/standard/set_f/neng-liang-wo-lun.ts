import {
  Card,
  CardType,
  ChooseCardsPrompt,
  ChoosePokemonPrompt,
  Effect,
  EnergyCard,
  EnergyType,
  GameError,
  GameMessage,
  PlayerType,
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
  name: '能量涡轮',
  cost: [CardType.COLORLESS],
  damage: '',
  text: '从自己的牌库选择最多2张基本能量，任意附于自己的备战宝可梦身上，然后重洗牌库。',
};

function isBasicEnergy(card: Card): card is EnergyCard {
  return card instanceof EnergyCard && card.energyType === EnergyType.BASIC;
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

  const basicEnergyCount = player.deck.cards.filter(isBasicEnergy).length;
  const openBenchedPokemons = player.bench.some(slot => slot.pokemons.cards.length > 0);
  if (basicEnergyCount === 0 || !openBenchedPokemons) {
    throw new GameError(GameMessage.CANNOT_USE_POWER);
  }

  const blockedEnergyIndexes: number[] = [];
  player.deck.cards.forEach((card, index) => {
    if (!isBasicEnergy(card)) {
      blockedEnergyIndexes.push(index);
    }
  });

  let selectedCards: Card[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_HAND,
      player.deck,
      { superType: SuperType.ENERGY },
      { min: 0, max: Math.min(2, basicEnergyCount), allowCancel: true, blocked: blockedEnergyIndexes }
    ),
    cards => {
      selectedCards = cards || [];
      next();
    }
  );

  if (selectedCards.length === 0) {
    return state;
  }

  for (const energyCard of selectedCards as EnergyCard[]) {
    const blockedTargets = player.bench
      .map((slot, index) => (slot.pokemons.cards.length === 0
        ? { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index }
        : undefined))
      .filter((item): item is { player: PlayerType; slot: SlotType; index: number } => item !== undefined);

    let targets: PokemonSlot[] = [];
    yield store.prompt(
      state,
      new ChoosePokemonPrompt(
        player.id,
        GameMessage.CHOOSE_POKEMON_TO_ATTACH_CARDS,
        PlayerType.BOTTOM_PLAYER,
        [SlotType.BENCH],
        { allowCancel: false, blocked: blockedTargets }
      ),
      result => {
        targets = result || [];
        next();
      }
    );

    if (targets.length === 0) {
      return state;
    }

    player.deck.moveCardTo(energyCard, targets[0].energies);
  }

  yield store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
    player.deck.applyOrder(order);
    next();
  });

  return finishTmUse(store, state, player, effect.trainerCard);
}

export class NengLiangWoLun extends VariantTrainerCard {
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
