import {
  CardTag,
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
  TrainerType,
  UseStadiumEffect,
} from '@ptcg/common';

function hasRuleBox(card: PokemonCard): boolean {
  return card.tags.includes(CardTag.POKEMON_EX)
    || card.tags.includes(CardTag.POKEMON_V)
    || card.tags.includes(CardTag.POKEMON_VSTAR)
    || card.tags.includes(CardTag.POKEMON_GX)
    || card.tags.includes(CardTag.POKEMON_LV_X)
    || card.tags.includes(CardTag.RADIANT);
}

function* useArtazon(next: Function, store: StoreLike, state: State, effect: UseStadiumEffect): IterableIterator<State> {
  const player = effect.player;
  const slots: PokemonSlot[] = player.bench.filter(slot => slot.pokemons.cards.length === 0);

  if (slots.length === 0) {
    throw new GameError(GameMessage.CANNOT_USE_STADIUM);
  }

  const blocked: number[] = [];
  let available = 0;
  player.deck.cards.forEach((card, index) => {
    if (!(card instanceof PokemonCard) || card.stage !== Stage.BASIC || hasRuleBox(card)) {
      blocked.push(index);
      return;
    }
    available += 1;
  });

  if (available === 0) {
    throw new GameError(GameMessage.CANNOT_USE_STADIUM);
  }

  let selected: PokemonCard[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_PUT_ONTO_BENCH,
      player.deck,
      { superType: SuperType.POKEMON, stage: Stage.BASIC },
      { min: 0, max: 1, allowCancel: true, blocked }
    ),
    cards => {
      selected = (cards || []) as PokemonCard[];
      next();
    }
  );

  if (selected.length > 0) {
    player.deck.moveCardTo(selected[0], slots[0].pokemons);
    slots[0].pokemonPlayedTurn = state.turn;
  }

  return store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
    player.deck.applyOrder(order);
  });
}

export class Artazon extends TrainerCard {
  public trainerType: TrainerType = TrainerType.STADIUM;
  public useWhenInPlay = true;
  public set = 'set_g';
  public name = '深钵镇';
  public fullName = '深钵镇 set_g';
  public text = '双方玩家，每次在自己的回合有1次机会，可选择自己牌库中的1张【基础】宝可梦（除「拥有规则的宝可梦」外），放于备战区。并重洗牌库。';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof UseStadiumEffect && effect.stadium === this) {
      const generator = useArtazon(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}
