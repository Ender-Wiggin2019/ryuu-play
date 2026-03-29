import {
  CardType,
  Effect,
  GameError,
  GameMessage,
  PokemonSlot,
  State,
  StoreLike,
  TrainerType,
  UseTrainerInPlayEffect,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';
import { discardTmAtEndTurn, ensureTmActiveUse, finishTmUse, prepareTmAttack } from './tm-tool-utils';

const attack = {
  name: '退化',
  cost: [CardType.COLORLESS],
  damage: '',
  text: '将对手每只进化宝可梦上面放置的1张进化卡牌加入对手手牌。',
};

function* useCard(
  next: Function,
  store: StoreLike,
  state: State,
  effect: UseTrainerInPlayEffect
): IterableIterator<State> {
  ensureTmActiveUse(effect);
  const prepared = prepareTmAttack(store, state, effect, attack);
  state = prepared.state;

  const opponent = prepared.opponent;
  let didAnything = false;

  const slots: PokemonSlot[] = [opponent.active, ...opponent.bench];
  for (const pokemonSlot of slots) {
    if (!pokemonSlot.isEvolved()) {
      continue;
    }

    const cards = pokemonSlot.getPokemons();
    const evolutionCard = cards[cards.length - 1];
    if (evolutionCard === undefined) {
      continue;
    }

    pokemonSlot.pokemons.moveCardTo(evolutionCard, opponent.hand);
    didAnything = true;
  }

  if (!didAnything) {
    throw new GameError(GameMessage.CANNOT_USE_POWER);
  }

  return finishTmUse(store, state, effect.player, effect.trainerCard);
}

export class TuiHua extends VariantTrainerCard {
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
